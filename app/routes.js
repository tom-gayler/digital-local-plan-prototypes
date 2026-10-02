//
// For guidance on how to create routes see:
// https://prototype-kit.service.gov.uk/docs/create-routes
//

const govukPrototypeKit = require('govuk-prototype-kit')
const router = govukPrototypeKit.requests.setupRouter()
const appConfig = require('./config.json')
const sessionDataDefaults = require('./data/session-data-defaults.js')

// --- Site-wide service header ---
//
// setupRouter() mounts this router at "/", ahead of the kit's own auto-view-rendering
// fallback (see node_modules/govuk-prototype-kit/server.js), so this middleware runs for every
// request — including pages with no custom route below, like the plain app/views/*/index.html
// prototype landing pages. That makes res.locals.activeSection/organisationName available to
// every template via layouts/main.html's `header` block, with no per-page wiring needed.
router.use((req, res, next) => {
  res.locals.organisationName = appConfig.organisationName
  if (req.path.startsWith('/project-management')) {
    res.locals.activeSection = 'project-management'
  } else if (req.path.startsWith('/policy-writing')) {
    res.locals.activeSection = 'policy-writing'
  } else if (req.path.startsWith('/evidence')) {
    res.locals.activeSection = 'evidence'
  } else if (req.path.startsWith('/user-stories')) {
    res.locals.activeSection = 'user-stories'
  } else if (req.path.startsWith('/statement-of-compliance')) {
    res.locals.activeSection = 'statement-of-compliance'
  }
  next()
})

const {
  DOCUMENT_SOURCE,
  DOCUMENT_CHAPTER,
  DOCUMENT_PARAGRAPHS,
  DOCUMENTS,
  getDocument
} = require('./data/documents.js')

const {
  POLICIES,
  getSearchTerms,
  getPoliciesForArea,
  getPolicy,
  getPolicyRefsForSource
} = require('./data/policies.js')
const { EVIDENCE_EXCERPTS } = require('./data/evidence-excerpts.js')
const { USER_STORY_THEMES, getUserStoryCount, getUserStoryThemeGroups, getUserStories } = require('./data/user-stories.js')
const { getParagraphsForPolicy, NATIONAL_POLICY_REFERENCES } = require('./data/plan-paragraphs.js')
const { POLICY_TEMPLATES, getPolicyTemplate } = require('./data/policy-templates.js')
const { getEvidenceDocument } = require('./data/evidence-documents.js')
const {
  getChapterStatus,
  getEvidenceStatus,
  getChapterOfficers,
  getChapterBrief,
  getChapterAuditLog,
  getStageStatuses,
  getPolicyStatus,
  getSourceOfficerNote,
  getEvidenceOfficerNote
} = require('./data/gateway-2-progress.js')
const {
  getRequirements,
  getRequirement,
  getStatus: getRequirementStatus,
  getHistory: getRequirementHistory,
  getPlannedActivity,
  isKnownDocument
} = require('./data/statement-of-compliance.js')

// --- Evidence prototype (E2US3 / E2US4) ---
//
// Session-backed evidence tagging flow:
//   /evidence                    - index of the evidence prototypes
//   /evidence/library            - evidence library, policy areas, filters
//   /evidence/document-tagging   - document viewing, passage and note tagging
//   /evidence/review             - review a document: details, tag it by hand
//                                  or from an AI summary, and take notes
//   /evidence/document-view      - read-only, PDF-style document preview
//   /evidence/results            - filtered results and export confirmation
//
// Evidence items are stored in req.session.data.evidenceItems. Search and
// filter state is stored in session too (evidenceSearch, evidenceTagFilter,
// evidencePolicyAreaFilter, evidencePolicyReferenceFilter) so it persists as
// a user moves between the library, the document and the results screen.
//
// Note the kit's session middleware auto-stores both req.body and req.query
// into req.session.data, and skips any field whose name starts with "_" —
// which is why transient control fields here are named _returnTo.

const SUGGESTED_TAGS = [
  'Need', 'Capacity', 'Heritage', 'Conservation', 'Green Belt',
  'AONB', 'SSSI', 'Article 4', 'Flood Risk', 'Site Allocations', 'Office'
]

// Maps each suggested tag to a govuk-tag colour modifier (blank = default blue)
const TAG_COLOURS = {
  'Need': '',
  'Capacity': 'grey',
  'Heritage': 'purple',
  'Conservation': 'turquoise',
  'Green Belt': 'green',
  'AONB': 'teal',
  'SSSI': 'magenta',
  'Article 4': 'orange',
  'Flood Risk': 'red',
  'Site Allocations': 'yellow',
  'Office': 'pink'
}

const POLICY_AREAS = [
  'Health, inclusion and safety',
  'Housing',
  'Infrastructure',
  'Design',
  'Offices',
  'Retail',
  'Culture and visitors',
  'Heritage and Tall Buildings',
  'Open Spaces and Green Infrastructure',
  'Climate Resilience',
  'Transport'
]

// Pre-encoded so the sidebar's nav links don't depend on a urlencode filter
// being available in Nunjucks.
const POLICY_AREA_LINKS = POLICY_AREAS.map(area => ({
  label: area,
  encoded: encodeURIComponent(area)
}))

// The Local Plan's paragraphs, flattened into plan order (chapter, then policy, then
// paragraph within that policy) for the Examination - inspector view prototype. Computed once
// at startup since none of this is session data — array order *is* plan order, so moving to
// the previous/next paragraph is just stepping to the neighbouring array index.
const PLAN_PARAGRAPHS = POLICY_AREAS.flatMap(area =>
  getPoliciesForArea(area).flatMap(policy =>
    getParagraphsForPolicy(policy).map((paragraph, index) => ({
      id: policy.ref.toLowerCase() + '-' + (index + 1),
      policyRef: policy.ref,
      policyTitle: policy.title,
      policyArea: area,
      isStrategic: policy.isStrategic,
      sectionTitle: paragraph.sectionTitle,
      text: paragraph.text
    }))
  )
)

const POLICY_REFERENCES = [
  'H1', 'H2', 'H3', 'T1', 'T2', 'EN1', 'EN2',
  'HE1', 'HE2', 'GB1', 'SA1', 'SA2', 'EMP1', 'OFF1'
]

// An evidence item's sourceType decides its display header:
//   document                     -> "<source> / <chapter>"
//   note                         -> "Note"
//   scoping-consultation-response -> "Scoping consultation response"
//   consultation-response        -> "Consultation response"
const NOTE_SOURCE_TYPES = [
  { value: 'note', label: 'Note' },
  { value: 'scoping-consultation-response', label: 'Scoping consultation response' },
  { value: 'consultation-response', label: 'Consultation response' }
]

// The prototype kit merges session-data-defaults.js into a brand new
// session with a shallow Object.assign, so a fresh session's evidenceItems
// starts out as the *same array object* as the seed data. Deep-clone it on
// first touch so pushing a new item never mutates the shared seed data
// (which would otherwise leak added evidence into every future session).
function getEvidenceItems (req) {
  if (!req.session.data.evidenceItemsOwned) {
    req.session.data.evidenceItems = JSON.parse(JSON.stringify(req.session.data.evidenceItems || []))
    req.session.data.evidenceItemsOwned = true
  }
  return req.session.data.evidenceItems
}

function asArray (value) {
  if (!value) return []
  return Array.isArray(value) ? value : [value]
}

// Date.now() alone collides when several items are created in the same
// millisecond (accepting several AI suggestions in one go does exactly
// that), and duplicate ids would make remove-tag strip a tag off the wrong
// item.
let evidenceIdCounter = 0
function nextEvidenceId () {
  evidenceIdCounter += 1
  return 'evidence-' + Date.now() + '-' + evidenceIdCounter
}

// Only ever redirect back to somewhere inside this prototype.
function safeReturn (value, fallback) {
  return typeof value === 'string' && value.indexOf('/evidence') === 0 ? value : fallback
}

// Builds an evidence item from a submitted tagging form. Tag lozenge
// selections arrive as a single comma-joined field; anything that isn't a
// recognised suggested tag is treated as a custom tag. Returns null when
// there is nothing worth saving.
function buildEvidenceItem (body, doc) {
  const submittedTags = parseTagList(body.tags)
  const tags = submittedTags.filter(tag => SUGGESTED_TAGS.includes(tag))
  const customTags = submittedTags.filter(tag => !SUGGESTED_TAGS.includes(tag))
  const policyAreas = parseTagList(body.policyAreas)

  if (!tags.length && !customTags.length && !policyAreas.length) return null

  const isNote = body.entryType === 'note'
  const text = (isNote ? body.noteText : body.selectedText || '').trim()
  if (!text) return null

  const sourceType = isNote
    ? (NOTE_SOURCE_TYPES.some(candidate => candidate.value === body.sourceType) ? body.sourceType : 'note')
    : 'document'

  return {
    id: nextEvidenceId(),
    type: isNote ? 'note' : 'passage',
    sourceType,
    text,
    source: doc.source,
    chapter: doc.chapter,
    tags,
    customTags,
    policyAreas,
    policyReference: body.policyReference || ''
  }
}

function removeTagFromItem (items, itemId, tag) {
  const item = items.find(candidate => candidate.id === itemId)
  if (!item) return

  item.tags = item.tags.filter(candidate => candidate !== tag)
  item.customTags = item.customTags.filter(candidate => candidate !== tag)
  item.policyAreas = item.policyAreas.filter(candidate => candidate !== tag)
}

// Splits a comma-joined string (built client-side from lozenge selections)
// into a clean list of tag names.
function parseTagList (value) {
  if (!value) return []
  return value.split(',').map(tag => tag.trim()).filter(Boolean)
}

function getFilters (req) {
  const policyArea = req.session.data.evidencePolicyAreaFilter || ''
  return {
    search: req.session.data.evidenceSearch || '',
    tags: asArray(req.session.data.evidenceTagFilter),
    policyArea,
    policyAreaEncoded: encodeURIComponent(policyArea),
    policyReference: req.session.data.evidencePolicyReferenceFilter || ''
  }
}

function filterEvidenceItems (items, filters) {
  const search = filters.search.trim().toLowerCase()
  const policyReference = filters.policyReference.trim().toLowerCase()

  return items.filter(item => {
    const allTags = item.tags.concat(item.customTags)

    if (search) {
      const haystack = [item.text, item.source, item.policyReference]
        .concat(allTags)
        .concat(item.policyAreas)
        .join(' ')
        .toLowerCase()
      if (!haystack.includes(search)) return false
    }

    if (filters.tags.length && !filters.tags.some(tag => allTags.includes(tag))) {
      return false
    }

    if (filters.policyArea && !item.policyAreas.includes(filters.policyArea)) {
      return false
    }

    if (policyReference && !item.policyReference.toLowerCase().includes(policyReference)) {
      return false
    }

    return true
  })
}

// Everything a tag search can match: the suggested tags plus the policy
// references, tagged with their kind so the list can label them.
const TAG_SEARCH_OPTIONS = SUGGESTED_TAGS
  .map(tag => ({ value: tag, kind: 'tag' }))
  .concat(POLICY_REFERENCES.map(reference => ({ value: reference, kind: 'reference' })))

const evidenceViewData = {
  suggestedTags: SUGGESTED_TAGS,
  tagSearchOptionsJson: JSON.stringify(TAG_SEARCH_OPTIONS),
  tagColours: TAG_COLOURS,
  policyAreas: POLICY_AREAS,
  policyAreaLinks: POLICY_AREA_LINKS,
  policyReferences: POLICY_REFERENCES,
  noteSourceTypes: NOTE_SOURCE_TYPES
}

// --- Compatibility redirects for earlier prototype URLs ---

router.get('/evidence/selected-evidence', (req, res) => {
  res.redirect('/evidence/library')
})

router.get('/evidence/tag-insight', (req, res) => {
  res.redirect('/evidence/document-tagging')
})

// --- Document viewing, highlight-to-tag and note tagging ---

router.get('/evidence/document-tagging', (req, res) => {
  const items = getEvidenceItems(req)
  const savedPassages = items.filter(item => item.source === DOCUMENT_SOURCE && item.type === 'passage')

  res.render('evidence/document-tagging/index', Object.assign({}, evidenceViewData, {
    documentSource: DOCUMENT_SOURCE,
    documentSourceEncoded: encodeURIComponent(DOCUMENT_SOURCE),
    documentChapter: DOCUMENT_CHAPTER,
    documentParagraphs: DOCUMENT_PARAGRAPHS,
    savedItems: items.filter(item => item.source === DOCUMENT_SOURCE).slice().reverse(),
    savedPassagesJson: JSON.stringify(savedPassages)
  }))
})

router.post('/evidence/document-tagging', (req, res) => {
  const items = getEvidenceItems(req)
  const item = buildEvidenceItem(req.body, getDocument(DOCUMENT_SOURCE))

  if (item) items.push(item)

  res.redirect('/evidence/document-tagging')
})

// Removes a single tag (suggested or custom) from a saved item, clicked
// directly on its chip within the document view.
router.post('/evidence/document-tagging/remove-tag', (req, res) => {
  removeTagFromItem(getEvidenceItems(req), req.body.itemId, req.body.tag)
  res.redirect('/evidence/document-tagging')
})

// --- Review evidence: document details, manual tagging or an AI summary ---

function getReviewReturn (source, fragment) {
  return '/evidence/review?source=' + encodeURIComponent(source) + (fragment || '')
}

router.get('/evidence/review', (req, res) => {
  const items = getEvidenceItems(req)
  const source = req.query.source || DOCUMENT_SOURCE
  const doc = getDocument(source)
  const fromThisDocument = items.filter(item => item.source === source)

  // Whether a suggestion has been accepted is derived from the saved items
  // rather than stored separately, so the summary's "added" state and the
  // document's highlights can never disagree.
  const savedTexts = fromThisDocument.map(item => item.text)
  const dismissed = asArray(req.session.data.evidenceDismissedSuggestions)
  const summaryGenerated = asArray(req.session.data.evidenceSummariesGenerated).includes(source)

  const summarySections = (doc.summary ? doc.summary.sections : [])
    .filter(section => !dismissed.includes(section.id))
    .map(section => Object.assign({}, section, { saved: savedTexts.includes(section.quote) }))

  res.render('evidence/review/index', Object.assign({}, evidenceViewData, {
    doc,
    sourceEncoded: encodeURIComponent(source),
    returnTo: getReviewReturn(source),
    summaryGenerated,
    summarySections,
    notes: fromThisDocument.filter(item => item.type === 'note').slice().reverse(),
    passages: fromThisDocument.filter(item => item.type === 'passage').slice().reverse(),
    savedPassagesJson: JSON.stringify(fromThisDocument.filter(item => item.type === 'passage')),
    documentParagraphsJson: JSON.stringify(doc.paragraphs)
  }))
})

router.post('/evidence/review', (req, res) => {
  const items = getEvidenceItems(req)
  const doc = getDocument(req.body.source || DOCUMENT_SOURCE)
  const item = buildEvidenceItem(req.body, doc)

  if (item) items.push(item)

  res.redirect(safeReturn(req.body._returnTo, getReviewReturn(doc.source)))
})

router.post('/evidence/review/remove-tag', (req, res) => {
  removeTagFromItem(getEvidenceItems(req), req.body.itemId, req.body.tag)
  res.redirect(safeReturn(req.body._returnTo, '/evidence/review'))
})

router.post('/evidence/review/generate-summary', (req, res) => {
  const source = req.body.source || DOCUMENT_SOURCE
  const generated = asArray(req.session.data.evidenceSummariesGenerated)

  if (!generated.includes(source)) {
    req.session.data.evidenceSummariesGenerated = generated.concat(source)
  }

  res.redirect(safeReturn(req.body._returnTo, getReviewReturn(source, '#auto-summarise')))
})

// Accepts an AI suggestion, turning that section into a real tagged evidence
// item. The verbatim quote is saved (not the paraphrase) so the passage
// still matches when the document view draws its highlights.
router.post('/evidence/review/accept-suggestion', (req, res) => {
  const items = getEvidenceItems(req)
  const source = req.body.source || DOCUMENT_SOURCE
  const doc = getDocument(source)
  const section = (doc.summary ? doc.summary.sections : [])
    .find(candidate => candidate.id === req.body.sectionId)

  if (section && !items.some(item => item.source === source && item.text === section.quote)) {
    items.push(buildEvidenceItem({
      entryType: 'passage',
      selectedText: section.quote,
      tags: section.suggestedTags.join(','),
      policyAreas: section.suggestedPolicyAreas.join(','),
      policyReference: section.suggestedPolicyReference
    }, doc))
  }

  res.redirect(safeReturn(req.body._returnTo, getReviewReturn(source, '#auto-summarise')))
})

router.post('/evidence/review/dismiss-suggestion', (req, res) => {
  const source = req.body.source || DOCUMENT_SOURCE
  const dismissed = asArray(req.session.data.evidenceDismissedSuggestions)

  if (req.body.sectionId && !dismissed.includes(req.body.sectionId)) {
    req.session.data.evidenceDismissedSuggestions = dismissed.concat(req.body.sectionId)
  }

  res.redirect(safeReturn(req.body._returnTo, getReviewReturn(source, '#auto-summarise')))
})

// A read-only, print/PDF-styled view of a document, opened in a new window
// by "Open in new window" actions. The prototype only holds the full body
// text for the interactive document (DOCUMENT_SOURCE) — for any other
// source, it falls back to showing the extracts already tagged from it.
router.get('/evidence/document-view', (req, res) => {
  const items = getEvidenceItems(req)
  const source = req.query.source || DOCUMENT_SOURCE
  const isInteractiveDocument = source === DOCUMENT_SOURCE

  res.render('evidence/document-view/index', {
    source,
    chapter: isInteractiveDocument ? DOCUMENT_CHAPTER : '',
    paragraphs: isInteractiveDocument ? DOCUMENT_PARAGRAPHS : [],
    extracts: isInteractiveDocument ? [] : items.filter(item => item.source === source).map(item => item.text)
  })
})

// --- Evidence library: policy area navigation, search, filter, browse ---

// The documents relating to the selected policy area (or all documents, if
// no area is selected) — one row per distinct source, regardless of how
// many tagged evidence items came from it.
function getDocumentsForPolicyArea (items, policyArea) {
  const inScope = policyArea
    ? items.filter(item => item.policyAreas.includes(policyArea))
    : items

  const documents = []
  inScope.forEach(item => {
    let document = documents.find(candidate => candidate.source === item.source)
    if (!document) {
      document = { source: item.source, chapter: item.chapter || '', count: 0, encoded: encodeURIComponent(item.source) }
      documents.push(document)
    }
    document.count += 1
  })

  return documents
}

router.get('/evidence/library', (req, res) => {
  const items = getEvidenceItems(req)
  const filters = getFilters(req)
  const documents = getDocumentsForPolicyArea(items, filters.policyArea)

  // The filtered evidence list only appears once the user has hit Apply on
  // the horizontal filter bar — browsing a policy area shows its documents
  // first, matching the "open a document" vs "filter for evidence" choice.
  const filtersApplied = req.query.applied === '1'
  const filteredItems = filtersApplied ? filterEvidenceItems(items, filters) : []

  res.render('evidence/library/index', Object.assign({}, evidenceViewData, {
    documents,
    items: filteredItems.slice().reverse(),
    resultCount: filteredItems.length,
    filtersApplied,
    filters
  }))
})

// --- User stories from the value proposition framework ---

router.get('/user-stories', (req, res) => {
  res.render('user-stories/index', {
    themes: getUserStoryThemeGroups(),
    storyCount: getUserStoryCount()
  })
})

// --- Policy: view a policy summary ---

// Everything the policy screen's keyword search looks through: the excerpts
// held against the evidence base, the evidence a user has tagged, and the body
// text of the documents that evidence came from. Results are shown as
// excerpts, so each passage carries where it came from (`source`/`ref`) and
// the policies it relates to (`policyRefs`), which the modal shows against it.
//
// Excerpts state their own policy refs; for the other two, the refs are the
// policies that cite the document, capped so a widely cited document doesn't
// swamp the result with refs.
const MAX_DERIVED_POLICY_REFS = 3

function getSearchableEvidence (items) {
  const passages = EVIDENCE_EXCERPTS.map(excerpt => ({
    text: excerpt.text,
    source: excerpt.source,
    ref: excerpt.ref,
    policyRefs: excerpt.policyRefs,
    tagged: false
  }))

  // A tagged item's own policyReference is deliberately not used here: the
  // Evidence prototype tags against its own reference set (H1, T2, EN1), not
  // the City Plan refs the policy screen shows, and mixing the two vocabularies
  // in one result list would be misleading.
  items.forEach(item => {
    if (passages.some(passage => passage.text === item.text)) return
    passages.push({
      text: item.text,
      source: item.source,
      ref: item.chapter || '',
      policyRefs: getPolicyRefsForSource(item.source).slice(0, MAX_DERIVED_POLICY_REFS),
      tagged: true
    })
  })

  Object.keys(DOCUMENTS).forEach(source => {
    const derivedRefs = getPolicyRefsForSource(source).slice(0, MAX_DERIVED_POLICY_REFS)

    DOCUMENTS[source].paragraphs.forEach(paragraph => {
      // A tagged extract is usually a sentence lifted out of a paragraph that
      // is also in the corpus, which would otherwise show up as two near
      // identical results. Keep one: the full paragraph, because it reads
      // better as an excerpt, still marked as tagged.
      const tagged = passages.find(passage => {
        return passage.tagged && passage.source === source && paragraph.indexOf(passage.text) !== -1
      })

      if (tagged) {
        tagged.text = paragraph
        return
      }

      if (passages.some(passage => passage.text === paragraph)) return

      passages.push({
        text: paragraph,
        source,
        ref: DOCUMENTS[source].chapter || '',
        policyRefs: derivedRefs,
        tagged: false
      })
    })
  })

  return passages
}

router.get('/policy-writing/policy-summary', (req, res) => {
  const items = getEvidenceItems(req)
  const policyArea = req.query.policyArea || ''
  const policies = getPoliciesForArea(policyArea)
  const policy = req.query.ref ? getPolicy(req.query.ref) : null

  res.render('policy-writing/policy-summary/index', {
    policyAreaLinks: POLICY_AREA_LINKS,
    tagColours: TAG_COLOURS,
    policyArea,
    policyAreaEncoded: encodeURIComponent(policyArea),
    policies,
    policy,
    searchableEvidenceJson: JSON.stringify(getSearchableEvidence(items)),
    searchTermsJson: JSON.stringify(getSearchTerms())
  })
})

// --- Filtered results and export confirmation ---

router.get('/evidence/results', (req, res) => {
  const items = getEvidenceItems(req)
  const filters = getFilters(req)
  const filteredItems = filterEvidenceItems(items, filters)

  res.render('evidence/results/index', Object.assign({}, evidenceViewData, {
    items: filteredItems.slice().reverse(),
    resultCount: filteredItems.length,
    filters,
    exportSummary: req.query.exported ? req.session.data.evidenceExportSummary : null
  }))
})

router.post('/evidence/results', (req, res) => {
  const items = getEvidenceItems(req)
  const filters = getFilters(req)
  const filteredItems = filterEvidenceItems(items, filters)

  req.session.data.evidenceExportSummary = {
    count: filteredItems.length,
    filters
  }

  res.redirect('/evidence/results?exported=1')
})

// --- Policy writing prototype ---
//
// Session-backed, three-phase journey, in two independent variants (see PW_VARIANTS) so a user
// can experience either starting from realistic example data ("prefilled") or from a blank
// slate ("blank") — /policy-writing links to both. Every route below is namespaced under
// /policy-writing/:variant/... so the two never share state:
//   /policy-writing/:variant/starting-points/:step   - 7-step "starting points" wizard
//   /policy-writing/:variant/topics/...              - aggregate view + create/review topics
//   /policy-writing/:variant/write/:topicId          - policy writer drafting workspace
//
// Starting point items are stored in req.session.data.policyStartingPointItems[variant], an
// object keyed by step slug. Topics are stored in req.session.data.policyTopics[variant]. The
// Sources panel in the writer workspace uses static seed data in
// req.session.data.policyWriterSources — shared across both variants since it's read-only
// reference data, never mutated by any route, so there's nothing for the two variants to leak
// into each other. The starting-point-items and topics accessors follow the same
// lazy-deep-clone-on-first-touch pattern as getEvidenceItems above (one clone per variant,
// tracked by a per-variant flag), since the kit merges session-data-defaults.js into a new
// session with a shallow Object.assign.

const PW_VARIANTS = ['prefilled', 'blank']

// Runs before any /policy-writing/:variant/... route, so a mistyped or old-bookmarked variant
// segment falls back to the prototype's landing page rather than 404ing or reading undefined
// session data.
router.param('variant', (req, res, next, variant) => {
  if (!PW_VARIANTS.includes(variant)) return res.redirect('/policy-writing')
  next()
})

const STARTING_POINT_STEPS = [
  {
    slug: 'adopted-plan-chapters',
    group: 'now',
    navLabel: 'Add adopted plan chapters',
    hint: 'Enter in the chapters in your currently adopted plan, these might be called themes or sections. You do not need to enter in each policy now, this will happen later.',
    itemLabel: 'Adopted plan chapter',
    sourceLabel: 'Adopted plan'
  },
  {
    slug: 'existing-data-sources',
    group: 'now',
    navLabel: 'Add existing data sources',
    hint: 'Enter the data sources you currently hold that are relevant to this plan.',
    itemLabel: 'Data source',
    sourceLabel: 'Existing data source'
  },
  {
    slug: 'current-trends',
    group: 'now',
    navLabel: 'Add current trends',
    hint: 'Enter emerging trends you have identified that may need a new policy response.',
    itemLabel: 'Trend',
    sourceLabel: 'New need'
  },
  {
    slug: 'scoping-consultation-themes',
    group: 'next',
    navLabel: 'Add scoping consultation themes',
    hint: 'Enter the themes raised in your scoping consultation.',
    itemLabel: 'Scoping consultation theme',
    sourceLabel: 'Scoping consultation theme'
  },
  {
    slug: 'political-priorities',
    group: 'next',
    navLabel: 'Add political priorities',
    hint: 'Enter the political priorities relevant to this plan.',
    itemLabel: 'Political priority',
    sourceLabel: 'Political priority'
  },
  {
    slug: 'other-plans-policies-strategies',
    group: 'next',
    navLabel: 'Add other plans, policies or strategies',
    hint: 'Enter other plans, policies or strategies this plan needs to align with.',
    itemLabel: 'Plan, policy or strategy',
    sourceLabel: 'Other plan, policy or strategy'
  },
  {
    slug: 'nppf-sds-requirements',
    group: 'next',
    navLabel: 'Add NPPF and SDS requirements',
    hint: 'Enter the NPPF and Spatial Development Strategy requirements relevant to this plan.',
    itemLabel: 'NPPF or SDS requirement',
    sourceLabel: 'NPPF/SDS'
  }
]

const EXISTING_DOCUMENTS = [
  'SHLAA 2025', 'Brownfield register v2.0', 'Housing needs assessment study',
  'Strategic Flood Risk Assessment', 'Employment Land Review'
]

function findStartingPointStep (slug) {
  return STARTING_POINT_STEPS.find(step => step.slug === slug)
}

// The kit merges session-data-defaults.js under any *existing* session data
// (Object.assign({}, sessionDataDefaults, req.session.data)), so a browser session that started
// before the policy-writing prototype had prefilled/blank variants still has
// policyStartingPointItems/policyTopics in the old flat (non-variant) shape — the top-level key
// already exists, so the fresh nested defaults never get merged in. Detect that legacy/malformed
// shape here and reseed from the current defaults, rather than silently reading `undefined` off
// the old shape (which otherwise renders as "no content" for every variant).
// A structural presence check (e.g. "does .prefilled exist?") isn't reliable here: an earlier,
// narrower version of this repair could itself leave behind a *truthy but empty* .prefilled/
// .blank object (e.g. `{}`, added onto an old flat-shaped session by code that blindly did
// `current[variant] || {}`), which then passes any "does it exist" check forever without ever
// containing real seed data. An explicit schema version sidesteps that whole class of bug:
// anything not stamped with the current version is fully reseeded, no structural guessing.
const POLICY_WRITING_SESSION_SCHEMA_VERSION = 2

function ensureStartingPointItemsShape (req) {
  if (req.session.data.policyStartingPointItemsSchemaVersion !== POLICY_WRITING_SESSION_SCHEMA_VERSION) {
    req.session.data.policyStartingPointItems = JSON.parse(JSON.stringify(sessionDataDefaults.policyStartingPointItems))
    req.session.data.policyStartingPointItemsOwned = { prefilled: true, blank: true }
    req.session.data.policyStartingPointItemsSchemaVersion = POLICY_WRITING_SESSION_SCHEMA_VERSION
  }
}

function ensurePolicyTopicsShape (req) {
  if (req.session.data.policyTopicsSchemaVersion !== POLICY_WRITING_SESSION_SCHEMA_VERSION) {
    req.session.data.policyTopics = JSON.parse(JSON.stringify(sessionDataDefaults.policyTopics))
    req.session.data.policyTopicsOwned = { prefilled: true, blank: true }
    req.session.data.policyTopicsSchemaVersion = POLICY_WRITING_SESSION_SCHEMA_VERSION
  }
}

function getStartingPointItems (req, variant, stepSlug) {
  ensureStartingPointItemsShape(req)
  if (!req.session.data.policyStartingPointItemsOwned) {
    req.session.data.policyStartingPointItemsOwned = {}
  }
  if (!req.session.data.policyStartingPointItemsOwned[variant]) {
    req.session.data.policyStartingPointItems[variant] = JSON.parse(JSON.stringify(req.session.data.policyStartingPointItems[variant] || {}))
    req.session.data.policyStartingPointItemsOwned[variant] = true
  }
  if (!req.session.data.policyStartingPointItems[variant][stepSlug]) {
    req.session.data.policyStartingPointItems[variant][stepSlug] = []
  }
  return req.session.data.policyStartingPointItems[variant][stepSlug]
}

function getPolicyTopics (req, variant) {
  ensurePolicyTopicsShape(req)
  if (!req.session.data.policyTopicsOwned) {
    req.session.data.policyTopicsOwned = {}
  }
  if (!req.session.data.policyTopicsOwned[variant]) {
    req.session.data.policyTopics[variant] = JSON.parse(JSON.stringify(req.session.data.policyTopics[variant] || []))
    req.session.data.policyTopicsOwned[variant] = true
  }
  return req.session.data.policyTopics[variant]
}

function getTopic (req, variant, topicId) {
  return getPolicyTopics(req, variant).find(topic => topic.id === topicId)
}

function getPolicyWriterSources (req) {
  if (!req.session.data.policyWriterSourcesOwned) {
    req.session.data.policyWriterSources = JSON.parse(JSON.stringify(req.session.data.policyWriterSources || []))
    req.session.data.policyWriterSourcesOwned = true
  }
  return req.session.data.policyWriterSources
}

// Builds the three-group sidebar (shared status vocabulary: Completed/In progress/Not started,
// shown via the status icons in partials/icons/status-icon.html) for every page across the
// starting-points and create-topics phases.
function buildStartingPointsSidebar (req, variant, activeHref) {
  const base = '/policy-writing/' + variant

  const stepNavItem = step => {
    const href = base + '/starting-points/' + step.slug
    const complete = getStartingPointItems(req, variant, step.slug).length > 0
    return {
      text: step.navLabel,
      href,
      active: href === activeHref,
      status: complete ? 'Completed' : 'Not started'
    }
  }

  return [
    {
      heading: 'Policy starting points - now',
      items: STARTING_POINT_STEPS.filter(step => step.group === 'now').map(stepNavItem)
    },
    {
      heading: 'Policy starting points - next',
      items: STARTING_POINT_STEPS.filter(step => step.group === 'next').map(stepNavItem)
    },
    {
      heading: 'Create topics',
      items: [
        { text: 'Review starting points', href: base + '/topics/review-starting-points', active: activeHref === base + '/topics/review-starting-points' },
        { text: 'Create topics', href: base + '/topics/new', active: activeHref === base + '/topics/new' },
        { text: 'Review topics', href: base + '/topics', active: activeHref === base + '/topics' }
      ]
    }
  ]
}

// --- Starting points wizard: one shared route pair for all 7 steps ---

router.get('/policy-writing/:variant/starting-points/:step', (req, res) => {
  const { variant } = req.params
  const step = findStartingPointStep(req.params.step)
  if (!step) return res.redirect('/policy-writing/' + variant + '/starting-points/' + STARTING_POINT_STEPS[0].slug)

  const items = getStartingPointItems(req, variant, step.slug)
  const editItem = req.query.edit ? items.find(item => item.id === req.query.edit) : null

  res.render('policy-writing/starting-points/step', {
    variant,
    step,
    items,
    editItem,
    sidebarSections: buildStartingPointsSidebar(req, variant, '/policy-writing/' + variant + '/starting-points/' + step.slug)
  })
})

router.post('/policy-writing/:variant/starting-points/:step', (req, res) => {
  const { variant } = req.params
  const step = findStartingPointStep(req.params.step)
  if (!step) return res.redirect('/policy-writing/' + variant + '/starting-points/' + STARTING_POINT_STEPS[0].slug)

  const items = getStartingPointItems(req, variant, step.slug)
  const text = (req.body.itemText || '').trim()

  if (text) {
    if (req.body.itemId) {
      const existing = items.find(item => item.id === req.body.itemId)
      if (existing) existing.text = text
    } else {
      items.push({ id: 'psp-' + Date.now(), text })
    }
  }

  res.redirect('/policy-writing/' + variant + '/starting-points/' + step.slug)
})

router.post('/policy-writing/:variant/starting-points/:step/:itemId/remove', (req, res) => {
  const { variant } = req.params
  const step = findStartingPointStep(req.params.step)
  if (step) {
    const items = getStartingPointItems(req, variant, step.slug)
    const index = items.findIndex(item => item.id === req.params.itemId)
    if (index !== -1) items.splice(index, 1)
  }
  res.redirect('/policy-writing/' + variant + '/starting-points/' + req.params.step)
})

// --- Review starting points: aggregate table across all 7 steps ---

router.get('/policy-writing/:variant/topics/review-starting-points', (req, res) => {
  const { variant } = req.params
  const rows = []
  STARTING_POINT_STEPS.forEach(step => {
    getStartingPointItems(req, variant, step.slug).forEach(item => {
      rows.push({
        id: item.id,
        text: item.text,
        stepSlug: step.slug,
        sourceLabel: step.sourceLabel,
        status: 'Not started'
      })
    })
  })

  res.render('policy-writing/topics/review-starting-points', {
    variant,
    rows,
    sidebarSections: buildStartingPointsSidebar(req, variant, '/policy-writing/' + variant + '/topics/review-starting-points')
  })
})

router.post('/policy-writing/:variant/topics/review-starting-points/:sourceStep/:itemId/remove', (req, res) => {
  const { variant } = req.params
  const step = findStartingPointStep(req.params.sourceStep)
  if (step) {
    const items = getStartingPointItems(req, variant, step.slug)
    const index = items.findIndex(item => item.id === req.params.itemId)
    if (index !== -1) items.splice(index, 1)
  }
  res.redirect('/policy-writing/' + variant + '/topics/review-starting-points')
})

// --- Topics list ---

router.get('/policy-writing/:variant/topics', (req, res) => {
  const { variant } = req.params
  res.render('policy-writing/topics/index', {
    variant,
    topics: getPolicyTopics(req, variant),
    sidebarSections: buildStartingPointsSidebar(req, variant, '/policy-writing/' + variant + '/topics')
  })
})

// --- Create topics ---

router.get('/policy-writing/:variant/topics/new', (req, res) => {
  const { variant } = req.params
  res.render('policy-writing/topics/new', {
    variant,
    startingPointGroups: STARTING_POINT_STEPS.map(step => ({
      step,
      items: getStartingPointItems(req, variant, step.slug)
    })),
    sidebarSections: buildStartingPointsSidebar(req, variant, '/policy-writing/' + variant + '/topics/new')
  })
})

router.post('/policy-writing/:variant/topics/new', (req, res) => {
  const { variant } = req.params
  const topics = getPolicyTopics(req, variant)
  const name = (req.body.topicName || '').trim()

  if (name) {
    const selectedRefs = asArray(req.body.startingPoints)
    const sources = selectedRefs.map(ref => {
      const [stepSlug, itemId] = ref.split('::')
      const step = findStartingPointStep(stepSlug)
      const item = step && getStartingPointItems(req, variant, stepSlug).find(candidate => candidate.id === itemId)
      if (!step || !item) return null
      return { id: 'src-' + Date.now() + '-' + Math.random().toString(36).slice(2, 6), label: item.text + ' (' + step.sourceLabel + ')' }
    }).filter(Boolean)

    topics.push({
      id: 'topic-' + Date.now(),
      name,
      assignedTo: '',
      brief: (req.body.brief || '').trim(),
      desiredImpact: '',
      sources,
      examplePolicies: [],
      evidenceNotes: '',
      linkedEvidence: [],
      additionalEvidenceNeeds: '',
      chapterTitle: '',
      explanatoryText: '',
      policyBlocks: [],
      policyHistory: [],
      latestNote: null
    })
  }

  res.redirect('/policy-writing/' + variant + (req.body.action === 'add-another' ? '/topics/new' : '/topics'))
})

// --- Review topics: single-topic detail ---

router.get('/policy-writing/:variant/topics/:topicId', (req, res) => {
  const { variant } = req.params
  const topic = getTopic(req, variant, req.params.topicId)
  if (!topic) return res.redirect('/policy-writing/' + variant + '/topics')

  res.render('policy-writing/topics/show', {
    variant,
    topic,
    existingDocuments: EXISTING_DOCUMENTS,
    sidebarSections: buildStartingPointsSidebar(req, variant, '/policy-writing/' + variant + '/topics')
  })
})

router.post('/policy-writing/:variant/topics/:topicId', (req, res) => {
  const { variant } = req.params
  const topic = getTopic(req, variant, req.params.topicId)
  if (topic) {
    topic.name = (req.body.topicName || topic.name).trim()
    topic.brief = req.body.brief || ''
    topic.desiredImpact = req.body.desiredImpact || ''
    topic.evidenceNotes = req.body.evidenceNotes || ''
    topic.additionalEvidenceNeeds = req.body.additionalEvidenceNeeds || ''
  }
  res.redirect('/policy-writing/' + variant + '/topics/' + req.params.topicId)
})

router.get('/policy-writing/:variant/topics/:topicId/assigned-to', (req, res) => {
  const { variant } = req.params
  const topic = getTopic(req, variant, req.params.topicId)
  if (!topic) return res.redirect('/policy-writing/' + variant + '/topics')
  res.render('policy-writing/topics/assigned-to', { variant, topic })
})

router.post('/policy-writing/:variant/topics/:topicId/assigned-to', (req, res) => {
  const { variant } = req.params
  const topic = getTopic(req, variant, req.params.topicId)
  if (topic) topic.assignedTo = (req.body.assignedTo || '').trim()
  res.redirect('/policy-writing/' + variant + '/topics/' + req.params.topicId)
})

router.post('/policy-writing/:variant/topics/:topicId/sources', (req, res) => {
  const { variant } = req.params
  const topic = getTopic(req, variant, req.params.topicId)
  const label = (req.body.sourceLabel || '').trim()
  if (topic && label) {
    topic.sources.push({ id: 'src-' + Date.now(), label })
  }
  res.redirect('/policy-writing/' + variant + '/topics/' + req.params.topicId)
})

router.post('/policy-writing/:variant/topics/:topicId/sources/:sourceId/remove', (req, res) => {
  const { variant } = req.params
  const topic = getTopic(req, variant, req.params.topicId)
  if (topic) {
    topic.sources = topic.sources.filter(source => source.id !== req.params.sourceId)
  }
  res.redirect('/policy-writing/' + variant + '/topics/' + req.params.topicId)
})

router.post('/policy-writing/:variant/topics/:topicId/example-policies', (req, res) => {
  const { variant } = req.params
  const topic = getTopic(req, variant, req.params.topicId)
  const label = (req.body.examplePolicyLabel || '').trim()
  if (topic && label) {
    topic.examplePolicies.push({ id: 'ep-' + Date.now(), label })
  }
  res.redirect('/policy-writing/' + variant + '/topics/' + req.params.topicId)
})

router.post('/policy-writing/:variant/topics/:topicId/example-policies/:policyId/remove', (req, res) => {
  const { variant } = req.params
  const topic = getTopic(req, variant, req.params.topicId)
  if (topic) {
    topic.examplePolicies = topic.examplePolicies.filter(policy => policy.id !== req.params.policyId)
  }
  res.redirect('/policy-writing/' + variant + '/topics/' + req.params.topicId)
})

// Evidence can be linked either by picking an existing document from the dropdown, or by
// choosing a file to upload. The prototype kit's default body parser doesn't process file
// uploads, so — consistent with the "Policy writer" workspace's decorative rich-text toolbar —
// the file input is present but not wired up; only the "link to existing document" path
// actually records a linked-evidence entry.
router.post('/policy-writing/:variant/topics/:topicId/linked-evidence', (req, res) => {
  const { variant } = req.params
  const topic = getTopic(req, variant, req.params.topicId)
  const label = (req.body.existingDocument || '').trim()
  if (topic && label) {
    topic.linkedEvidence.push({ id: 'le-' + Date.now(), label })
  }
  res.redirect('/policy-writing/' + variant + '/topics/' + req.params.topicId)
})

// --- Policy writer workspace ---

router.get('/policy-writing/:variant/write/:topicId', (req, res) => {
  const { variant } = req.params
  const topic = getTopic(req, variant, req.params.topicId)
  if (!topic) return res.redirect('/policy-writing/' + variant + '/topics')

  const sources = getPolicyWriterSources(req)
  const requestedKinds = asArray(req.query.sourceType)
  const activeKinds = requestedKinds.length ? requestedKinds : ['policy', 'evidence', 'comment']

  res.render('policy-writing/write/index', {
    variant,
    topic,
    sources: sources.filter(source => activeKinds.includes(source.kind)),
    totalSourceCount: sources.length,
    activeKinds
  })
})

// Shared by both routes below so that clicking "Add policy block" (a submit button with its
// own formaction, inside the same form) saves whatever the user has already typed before
// appending a new block, rather than discarding it.
function saveWorkspaceFields (topic, body) {
  topic.chapterTitle = body.chapterTitle || ''
  topic.explanatoryText = body.explanatoryText || ''

  const submittedBlocks = body.policyBlocks || {}
  topic.policyBlocks.forEach((block, index) => {
    const submitted = submittedBlocks[index]
    if (submitted) {
      block.title = submitted.title || ''
      block.detail = submitted.detail || ''
    }
  })
}

router.post('/policy-writing/:variant/write/:topicId', (req, res) => {
  const { variant } = req.params
  const topic = getTopic(req, variant, req.params.topicId)
  if (topic) saveWorkspaceFields(topic, req.body)
  res.redirect('/policy-writing/' + variant + '/write/' + req.params.topicId)
})

router.post('/policy-writing/:variant/write/:topicId/policy-blocks', (req, res) => {
  const { variant } = req.params
  const topic = getTopic(req, variant, req.params.topicId)
  if (topic) {
    saveWorkspaceFields(topic, req.body)
    topic.policyBlocks.push({ id: 'block-' + Date.now(), title: '', detail: '' })
  }
  res.redirect('/policy-writing/' + variant + '/write/' + req.params.topicId)
})

// --- Examination - inspector view prototype ---
//
// An external (non-LPA-staff) view of the submitted Local Plan for an independent planning
// inspector: a sidebar showing the plan's chapters (policy areas) and policies, and a
// paragraph-by-paragraph viewer for each policy's text with its related evidence, consultation
// representations and NPPF/SDS policy references. See app/data/plan-paragraphs.js for the
// paragraph and NPPF/SDS content this prototype adds on top of policies.js and
// evidence-excerpts.js.

// One sidebar section per chapter (policy area), each policy in it linking to its first
// paragraph. activePolicyRef highlights whichever policy the current page belongs to.
function buildLocalPlanSidebarSections (activePolicyRef) {
  return POLICY_AREAS.map(area => ({
    heading: area,
    items: getPoliciesForArea(area).map(policy => ({
      text: policy.ref + ' ' + policy.title,
      href: '/examination-inspector-view/paragraphs/' + policy.ref.toLowerCase() + '-1',
      active: policy.ref === activePolicyRef
    }))
  }))
}

// Related evidence, consultation representations and NPPF/SDS references for a policy,
// normalised into one shape so the right-hand resource panel doesn't need to know which kind
// it's showing. Content is at policy level, not paragraph level, since none of the underlying
// data (evidence-excerpts.js, policies.js's consultationResponses, plan-paragraphs.js) is
// broken down any finer than that. Returned as separate lists (rather than one flat list the
// template would need to group by kind) plus "all" for the resource panel, which doesn't care
// which kind an item is.
function buildRelatedResources (policy, paragraphId) {
  // officerComment reuses the same commentary Gateway 2 progress check shows under a source/
  // evidence item (app/data/gateway-2-progress.js) — one officer's read of an evidence item
  // shouldn't read differently depending which prototype it's viewed from. Only evidence has
  // one today; representations and NPPF/SDS references fall back to "No officer comment" in
  // the template.
  const evidence = EVIDENCE_EXCERPTS
    .filter(excerpt => excerpt.policyRefs.includes(policy.ref))
    .map((excerpt, index) => ({
      id: 'evidence-' + index,
      title: excerpt.source,
      meta: excerpt.ref,
      text: excerpt.text,
      officerComment: getEvidenceOfficerNote(excerpt)
    }))

  // Grouped by theme rather than shown as individual representations — each theme carries the
  // total representations count (policies.js's themeCount) plus the individual comments sample
  // for it, shown when the theme is opened in the resource viewer.
  const responsesByTheme = new Map()
  ;(policy.consultationResponses || []).forEach(response => {
    if (!responsesByTheme.has(response.theme)) {
      responsesByTheme.set(response.theme, { theme: response.theme, count: response.themeCount, responses: [] })
    }
    responsesByTheme.get(response.theme).responses.push(response)
  })

  const representations = Array.from(responsesByTheme.values()).map((group, index) => {
    const id = 'representation-' + index
    return {
      id,
      title: group.theme,
      meta: group.count + (group.count === 1 ? ' representation' : ' representations'),
      responses: group.responses,
      href: '/examination-inspector-view/paragraphs/' + paragraphId + '/representations/' + id
    }
  })

  const nationalPolicy = NATIONAL_POLICY_REFERENCES
    .filter(reference => reference.policyRefs.includes(policy.ref))
    .map((reference, index) => ({
      id: 'national-policy-' + index,
      title: reference.source,
      meta: reference.ref,
      text: reference.text
    }))

  return {
    evidence,
    representations,
    nationalPolicy,
    all: evidence.concat(representations, nationalPolicy)
  }
}

router.get('/examination-inspector-view', (req, res) => {
  res.render('examination-inspector-view/index.html', {
    sidebarSections: buildLocalPlanSidebarSections()
  })
})

router.get('/examination-inspector-view/paragraphs/:id', (req, res) => {
  const index = PLAN_PARAGRAPHS.findIndex(paragraph => paragraph.id === req.params.id)
  if (index === -1) return res.redirect('/examination-inspector-view')

  const paragraph = PLAN_PARAGRAPHS[index]
  const policy = POLICIES.find(policy => policy.ref === paragraph.policyRef)

  res.render('examination-inspector-view/paragraphs/show.html', {
    paragraph,
    previousParagraph: PLAN_PARAGRAPHS[index - 1] || null,
    nextParagraph: PLAN_PARAGRAPHS[index + 1] || null,
    relatedResources: buildRelatedResources(policy, paragraph.id),
    sidebarSections: buildLocalPlanSidebarSections(paragraph.policyRef)
  })
})

// A theme's full representations list — reached via "See all representations" from the
// paragraph's resource viewer. Representations are policy-level data (like the rest of
// buildRelatedResources), but the route is nested under the paragraph the user came from so
// the back link returns them to exactly where they were reading.
router.get('/examination-inspector-view/paragraphs/:id/representations/:themeId', (req, res) => {
  const index = PLAN_PARAGRAPHS.findIndex(paragraph => paragraph.id === req.params.id)
  if (index === -1) return res.redirect('/examination-inspector-view')

  const paragraph = PLAN_PARAGRAPHS[index]
  const policy = POLICIES.find(policy => policy.ref === paragraph.policyRef)
  const theme = buildRelatedResources(policy, paragraph.id).representations
    .find(representation => representation.id === req.params.themeId)

  if (!theme) return res.redirect('/examination-inspector-view/paragraphs/' + paragraph.id)

  res.render('examination-inspector-view/representations/show.html', {
    paragraph,
    theme,
    sidebarSections: buildLocalPlanSidebarSections(paragraph.policyRef)
  })
})

// The v2 landing page would otherwise be file-routed. It needs a route only so the user
// stories can be read from app/data/user-stories.js rather than copied into the template.
router.get('/policy-writing-v2', (req, res) => {
  res.render('policy-writing-v2/index', {
    userStories: getUserStories(['POUS3', 'POUS4', 'POUS5'])
  })
})

// --- Policy writer v2 ---
//
// A second take on the drafting workspace: evidence and the policy draft side by side on a
// wider page, with a draggable divider between them. See CLAUDE.md.
//
// Slug note: this lives at /policy-writing-v2, NOT nested under /policy-writing/. Nested, the
// "v2" segment would be captured by router.param('variant', ...) above and bounced back to the
// policy-writing landing page. As a sibling path it is still caught by the activeSection
// middleware's startsWith('/policy-writing') branch at the top of this file, which is what we
// want — v2 sits under "Policy writing" in the nav rather than adding a fifth nav item.

const POLICY_WRITER_V2_SCHEMA_VERSION = 6

// Same reasoning as ensurePolicyTopicsShape above: the kit merges session-data-defaults.js into
// a session with a shallow Object.assign, so an existing session whose top-level key is already
// present never picks up changes to the nested seed. The version stamp repairs those sessions
// outright rather than trying to patch them field by field.
function ensurePolicyWriterV2Shape (req) {
  if (req.session.data.policyWriterV2SchemaVersion !== POLICY_WRITER_V2_SCHEMA_VERSION) {
    req.session.data.policyWriterV2Chapter =
      JSON.parse(JSON.stringify(sessionDataDefaults.policyWriterV2Chapter))
    req.session.data.policyWriterV2ChapterOwned = true
    req.session.data.policyWriterV2SchemaVersion = POLICY_WRITER_V2_SCHEMA_VERSION
  }
}

// Deep-clone-on-first-touch, as everywhere else in this file. The sentinel is a plain boolean
// rather than the per-variant object getPolicyTopics uses, because v2 has no blank/prefilled
// split — there is only one journey.
function getV2Chapter (req) {
  ensurePolicyWriterV2Shape(req)
  if (!req.session.data.policyWriterV2ChapterOwned) {
    req.session.data.policyWriterV2Chapter =
      JSON.parse(JSON.stringify(req.session.data.policyWriterV2Chapter || {}))
    req.session.data.policyWriterV2ChapterOwned = true
  }
  return req.session.data.policyWriterV2Chapter
}

function getV2Policies (req) {
  return getV2Chapter(req).policies || []
}

function getV2Policy (req, policyId) {
  return getV2Policies(req).find(policy => policy.id === policyId)
}

const v2PolicyUrl = policyId => '/policy-writing-v2/chapter/' + policyId

// The chapter's policies as a sidebar, using the shared side navigation component so status
// icons and the active-item treatment match the other prototypes (see CLAUDE.md).
function buildV2Sidebar (req, activePolicyId) {
  const chapter = getV2Chapter(req)

  return [
    {
      heading: 'Policies in this chapter',
      items: (chapter.policies || []).map(policy => ({
        text: (policy.ref ? policy.ref + ' ' : '') + (policy.title || 'Untitled policy'),
        href: v2PolicyUrl(policy.id),
        active: policy.id === activePolicyId,
        status: policy.status
      }))
    }
  ]
}

// Shared by every POST submitted from the draft form, so that "Add a policy block" and
// "Insert template" don't silently discard whatever the user has just typed — same reason
// saveWorkspaceFields exists for v1. The typeof guards mean a future button can submit a
// subset of the fields without blanking the rest.
function saveV2DraftFields (policy, body) {
  if (typeof body.policyRef === 'string') policy.ref = body.policyRef.trim()
  if (typeof body.policyTitle === 'string') policy.title = body.policyTitle.trim()
  if (typeof body.draftText === 'string') policy.draft = body.draftText
  if (policy.draft && policy.draft.trim() && policy.status === 'Not started') {
    policy.status = 'In progress'
  }
}

router.get('/policy-writing-v2/chapter', (req, res) => {
  const policies = getV2Policies(req)
  if (!policies.length) return res.render('policy-writing-v2/chapter/index', { chapter: getV2Chapter(req), policy: null })
  res.redirect(v2PolicyUrl(policies[0].id))
})

// Declared before /chapter/:policyId would ever see it — but it's a sibling path, not a child,
// so it could never be captured by that route anyway.
router.get('/policy-writing-v2/chapter-preview', (req, res) => {
  const chapter = getV2Chapter(req)
  const policies = chapter.policies || []
  res.render('policy-writing-v2/chapter-preview/index', {
    chapter,
    draftedCount: policies.filter(policy => policy.draft && policy.draft.trim()).length,
    sourceCount: policies.reduce((total, policy) => total + (policy.sources || []).length, 0)
  })
})

router.get('/policy-writing-v2/chapter/:policyId', (req, res) => {
  const chapter = getV2Chapter(req)
  const policy = getV2Policy(req, req.params.policyId)
  if (!policy) return res.redirect('/policy-writing-v2/chapter')

  const sources = policy.sources || []
  // Which source the middle pane is showing. Read from the query string so each row in the
  // sources rail can be a plain link, and so the choice survives a POST-redirect-GET.
  const selectedSource =
    sources.find(source => source.id === req.query.source) || sources[0] || null

  res.render('policy-writing-v2/chapter/index', {
    chapter,
    policy,
    selectedSource,
    selectedDocument: getEvidenceDocument(selectedSource),
    // The drag-to-view path renders client-side, so it needs the extracts too — attached here
    // rather than in the session, which holds only what the user actually owns.
    sourcesJson: JSON.stringify(sources.map(source => Object.assign({}, source, {
      document: getEvidenceDocument(source)
    }))),
    sidebarSections: buildV2Sidebar(req, policy.id),
    templates: POLICY_TEMPLATES,
    draftedCount: (chapter.policies || []).filter(item => item.draft && item.draft.trim()).length,
    // Serialised once and shared by both the search modal and the draft check — it's the
    // largest thing on the page, so don't emit it twice. Note getSearchableEvidence folds in
    // whatever the user has tagged in the evidence prototype, so this corpus varies with that
    // prototype's session state.
    searchableEvidenceJson: JSON.stringify(getSearchableEvidence(getEvidenceItems(req))),
    searchTermsJson: JSON.stringify(getSearchTerms())
  })
})

router.post('/policy-writing-v2/chapter/:policyId/details', (req, res) => {
  const chapter = getV2Chapter(req)
  chapter.title = req.body.chapterTitleV2 || ''
  chapter.explanatoryText = req.body.explanatoryTextV2 || ''
  res.redirect(v2PolicyUrl(req.params.policyId))
})

router.post('/policy-writing-v2/chapter/:policyId/draft', (req, res) => {
  const policy = getV2Policy(req, req.params.policyId)
  if (policy) saveV2DraftFields(policy, req.body)
  res.redirect(v2PolicyUrl(req.params.policyId))
})

router.post('/policy-writing-v2/chapter/:policyId/policies', (req, res) => {
  const policy = getV2Policy(req, req.params.policyId)
  if (policy) saveV2DraftFields(policy, req.body)

  const newPolicy = {
    id: 'pw2-policy-' + Date.now(),
    ref: '',
    title: '',
    status: 'Not started',
    draft: '',
    sources: [],
    notes: []
  }
  getV2Policies(req).push(newPolicy)
  res.redirect(v2PolicyUrl(newPolicy.id))
})

router.post('/policy-writing-v2/chapter/:policyId/template', (req, res) => {
  const policy = getV2Policy(req, req.params.policyId)
  const template = getPolicyTemplate(req.body.templateId)
  if (policy && template) {
    saveV2DraftFields(policy, req.body)
    policy.draft = policy.draft && policy.draft.trim()
      ? policy.draft.replace(/\s+$/, '') + '\n\n' + template.text
      : template.text
    if (policy.status === 'Not started') policy.status = 'In progress'
  }
  res.redirect(v2PolicyUrl(req.params.policyId))
})

// Handles both ways a source can arrive: the search modal's multi-select payload, and a single
// manual add. The modal's fields are named _selected[...] because the kit's session middleware
// skips anything starting with "_" — so a payload of full evidence excerpts never ends up
// duplicated into req.session.data, while Express still parses it into req.body.
router.post('/policy-writing-v2/chapter/:policyId/sources', (req, res) => {
  const policy = getV2Policy(req, req.params.policyId)
  if (policy) {
    if (!policy.sources) policy.sources = []
    const incoming = []

    const selected = req.body._selected
    if (selected) {
      Object.keys(selected).forEach(key => {
        const entry = selected[key] || {}
        if (entry.text) {
          incoming.push({
            text: entry.text,
            source: entry.source || '',
            ref: entry.ref || '',
            policyRefs: (entry.policyRefs || '').split(',').map(ref => ref.trim()).filter(Boolean)
          })
        }
      })
    }

    if ((req.body.sourceText || '').trim()) {
      incoming.push({
        text: req.body.sourceText.trim(),
        source: (req.body.sourceTitle || '').trim(),
        ref: (req.body.sourceRef || '').trim(),
        policyRefs: []
      })
    }

    incoming.forEach((entry, index) => {
      // De-duplicate on the excerpt text, which is what identifies a passage across the
      // corpus — the same paragraph can arrive with different ids from different routes.
      const alreadyAdded = policy.sources.some(source => source.text === entry.text)
      if (!alreadyAdded) {
        policy.sources.push(Object.assign({ id: 'pw2-src-' + Date.now() + '-' + index }, entry))
      }
    })
  }
  res.redirect(v2PolicyUrl(req.params.policyId))
})

router.post('/policy-writing-v2/chapter/:policyId/sources/:sourceId/remove', (req, res) => {
  const policy = getV2Policy(req, req.params.policyId)
  if (policy && policy.sources) {
    policy.sources = policy.sources.filter(source => source.id !== req.params.sourceId)
  }
  res.redirect(v2PolicyUrl(req.params.policyId))
})

router.post('/policy-writing-v2/chapter/:policyId/notes', (req, res) => {
  const policy = getV2Policy(req, req.params.policyId)
  const text = (req.body.noteText || '').trim()
  if (policy && text) {
    if (!policy.notes) policy.notes = []
    policy.notes.push({
      id: 'pw2-note-' + Date.now(),
      author: 'You',
      date: 'Just now',
      text
    })
  }
  res.redirect(v2PolicyUrl(req.params.policyId))
})

router.post('/policy-writing-v2/chapter/:policyId/notes/:noteId/remove', (req, res) => {
  const policy = getV2Policy(req, req.params.policyId)
  if (policy && policy.notes) {
    policy.notes = policy.notes.filter(note => note.id !== req.params.noteId)
  }
  res.redirect(v2PolicyUrl(req.params.policyId))
})


// A single evidence excerpt on its own page, for reading alongside the workspace in a second
// window. A GET at /source/ (singular) so it can't collide with the /sources/ POST routes.
router.get('/policy-writing-v2/chapter/:policyId/source/:sourceId', (req, res) => {
  const chapter = getV2Chapter(req)
  const policy = getV2Policy(req, req.params.policyId)
  if (!policy) return res.redirect('/policy-writing-v2/chapter')

  const source = (policy.sources || []).find(item => item.id === req.params.sourceId)
  if (!source) return res.redirect(v2PolicyUrl(policy.id))

  res.render('policy-writing-v2/source/index', {
    chapter,
    policy,
    source,
    document: getEvidenceDocument(source)
  })
})

// --- Gateway 2 progress check prototype ---
//
// A second, standalone view for planning inspectors, alongside Examination - inspector view but
// independent of it: a "Plan Progress" page listing every chapter (policy area) and every
// evidence base document with its current status, each with a "View" link through to a page for
// that item. Reuses the same chapters (policies.js's policy areas) and evidence base
// (documents.js) as Examination - inspector view rather than a second plan structure — status
// values themselves are illustrative content added by gateway-2-progress.js, since neither
// existing data source carries one. Like Examination - inspector view, this has no
// `activeSection` wiring: it's an external-viewer prototype with no standard site nav, just the
// title-only appExternalHeader.

// Verified against GOV.UK Frontend's actual govuk-tag modifiers (grey, green, purple, red,
// orange, teal, magenta, yellow, turquoise, pink, plus default/blue via no modifier) — same
// rendering pattern as the existing tagColours[tag] usage elsewhere (e.g. evidence-card.html).
// 'Completed' (as opposed to 'Complete') is the chapter detail table's standardised-vocabulary
// wording for the same underlying colour, reusing this map rather than adding a second one.
const CHAPTER_STATUS_COLOURS = {
  'Not started': 'grey',
  'Brief prepared': '',
  'In progress': 'turquoise',
  Drafted: 'purple',
  Complete: 'green',
  Completed: 'green'
}
const EVIDENCE_STATUS_COLOURS = {
  'Not yet procured': 'grey',
  'In procurement': '',
  'Draft received': 'turquoise',
  'Accepted version': 'green'
}

// Hrefs are pre-encoded here, not with a Nunjucks urlencode filter, for the same reason
// POLICY_AREA_LINKS is pre-encoded above.
router.get('/gateway-2-progress-check', (req, res) => {
  const chapters = POLICY_AREAS.map(area => ({
    name: area,
    status: getChapterStatus(area),
    href: '/gateway-2-progress-check/chapters/' + encodeURIComponent(area)
  }))

  const evidence = Object.keys(DOCUMENTS).map(source => ({
    name: source,
    status: getEvidenceStatus(source),
    lastUpdated: DOCUMENTS[source].date,
    href: '/gateway-2-progress-check/evidence/' + encodeURIComponent(source)
  }))

  res.render('gateway-2-progress-check/index.html', {
    chapters,
    evidence,
    chapterStatusColours: CHAPTER_STATUS_COLOURS,
    evidenceStatusColours: EVIDENCE_STATUS_COLOURS
  })
})

// The chapter's Sources/Evidence/Responses/Policy Text sections, built entirely from data and
// helpers already used elsewhere in this file rather than a second, chapter-specific corpus.
// Hrefs are pre-encoded/pre-resolved here rather than in the template, same reason as elsewhere
// in this file (POLICY_AREA_LINKS, the index route above) — an evidence excerpt's source isn't
// always one of documents.js's DOCUMENTS, so its href is null when there's nothing to link to.
function buildChapterResources (area) {
  const policies = getPoliciesForArea(area)
  const policyRefs = policies.map(policy => policy.ref)

  const sources = Object.values(DOCUMENTS)
    .filter(doc => doc.policyArea === area)
    .map(doc => Object.assign({
      href: '/gateway-2-progress-check/evidence/' + encodeURIComponent(doc.source),
      officerNote: getSourceOfficerNote(doc.source)
    }, doc))

  const evidence = EVIDENCE_EXCERPTS
    .filter(excerpt => excerpt.policyRefs.some(ref => policyRefs.includes(ref)))
    .map(excerpt => Object.assign({
      href: DOCUMENTS[excerpt.source]
        ? '/gateway-2-progress-check/evidence/' + encodeURIComponent(excerpt.source)
        : null,
      officerNote: getEvidenceOfficerNote(excerpt)
    }, excerpt))

  // Grouped into themes the same way as Examination - inspector view (buildRelatedResources,
  // reused per policy below) rather than a second, independent grouping — a theme should look
  // the same wherever an inspector encounters it. policyRef/policyTitle are added here because
  // this list spans every policy in the chapter, unlike buildRelatedResources's single-policy
  // callers, which don't need to say which policy a theme belongs to.
  const representations = policies.flatMap(policy =>
    buildRelatedResources(policy, policy.ref.toLowerCase() + '-1').representations
      .map(theme => Object.assign({ policyRef: policy.ref, policyTitle: policy.title }, theme)))

  const paragraphs = PLAN_PARAGRAPHS.filter(paragraph => paragraph.policyArea === area)

  return { sources, evidence, representations, paragraphs }
}

router.get('/gateway-2-progress-check/chapters/:area', (req, res) => {
  const area = req.params.area
  if (!POLICY_AREAS.includes(area)) return res.redirect('/gateway-2-progress-check')

  const status = getChapterStatus(area)
  const policies = getPoliciesForArea(area)

  const policyStatuses = {}
  policies.forEach(policy => {
    policyStatuses[policy.ref] = getPolicyStatus(status, policy.hasSummary)
  })

  res.render('gateway-2-progress-check/chapters/show.html', {
    area,
    status,
    statusColours: CHAPTER_STATUS_COLOURS,
    policies,
    policyStatuses,
    officers: getChapterOfficers(area),
    brief: getChapterBrief(area),
    auditLog: getChapterAuditLog(area),
    stageStatuses: getStageStatuses(status),
    resources: buildChapterResources(area)
  })
})

router.get('/gateway-2-progress-check/evidence/:source', (req, res) => {
  const source = req.params.source
  if (!DOCUMENTS[source]) return res.redirect('/gateway-2-progress-check')

  res.render('gateway-2-progress-check/evidence/show.html', {
    document: getDocument(source),
    status: getEvidenceStatus(source),
    statusColours: EVIDENCE_STATUS_COLOURS
  })
})

// --- Statement of compliance prototype ---
//
// For the local planning authority (not an external viewer, unlike Examination - inspector
// view and Gateway 2 progress check, so this carries the standard site nav): a checklist of the
// legislative requirements a statement of compliance must evidence, each with a status and a
// link through to that requirement's evidence (an audit log of what's been done, via the
// shared appTimeline partial — see app/data/statement-of-compliance.js for the status/history
// model this prototype shares with Gateway 2's audit logs).
//
// Two variants, same pattern as policy-writing (see CLAUDE.md's "Parallel journey variants"):
// "draft" (not everything met yet, each requirement's page shows Planned activities) and
// "completed" (everything Fully met, no further action required). Deliberately a DIFFERENT
// param name from policy-writing's :variant — router.param registers per parameter name across
// the whole router, not per route, so reusing :variant here would also run PW_VARIANTS'
// ['prefilled', 'blank'] check against 'draft'/'completed' and bounce every request to
// /policy-writing.
const SOC_VARIANTS = ['draft', 'completed']

router.param('socVariant', (req, res, next, socVariant) => {
  if (!SOC_VARIANTS.includes(socVariant)) return res.redirect('/statement-of-compliance')
  next()
})

const STATEMENT_STATUS_COLOURS = {
  'Not yet met': 'grey',
  'Partially met': 'yellow',
  'Fully met': 'green'
}

router.get('/statement-of-compliance', (req, res) => {
  res.render('statement-of-compliance/index.html')
})

router.get('/statement-of-compliance/:socVariant', (req, res) => {
  const variant = req.params.socVariant

  const requirements = getRequirements().map(requirement => ({
    ref: requirement.ref,
    title: requirement.title,
    status: getRequirementStatus(requirement.ref, variant),
    href: '/statement-of-compliance/' + variant + '/requirements/' + encodeURIComponent(requirement.ref)
  }))

  res.render('statement-of-compliance/checklist.html', {
    variant,
    requirements,
    statusColours: STATEMENT_STATUS_COLOURS
  })
})

router.get('/statement-of-compliance/:socVariant/requirements/:ref', (req, res) => {
  const variant = req.params.socVariant
  const requirement = getRequirement(req.params.ref)
  if (!requirement) return res.redirect('/statement-of-compliance/' + variant)

  res.render('statement-of-compliance/requirements/show.html', {
    variant,
    requirement,
    status: getRequirementStatus(requirement.ref, variant),
    statusColours: STATEMENT_STATUS_COLOURS,
    history: getRequirementHistory(requirement.ref, variant),
    plannedActivity: getPlannedActivity(requirement.ref, variant)
  })
})

// A placeholder viewer for the materials linked from the audit log (the notice, a consultation
// summary, the self-assessment, and so on) — there's no real document behind any of them, so
// this renders the title only rather than pretending to show real content.
router.get('/statement-of-compliance/documents/:title', (req, res) => {
  if (!isKnownDocument(req.params.title)) return res.redirect('/statement-of-compliance')

  res.render('statement-of-compliance/documents/show.html', {
    title: req.params.title
  })
})
