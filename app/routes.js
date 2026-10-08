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
  } else if (req.path.startsWith('/consultations')) {
    // Includes the inspector's screen, which overrides the header block to leave this nav out
    // (see consultations/managing-responses/partials/inspector-layout.html).
    res.locals.activeSection = 'consultations'
  } else if (req.path.startsWith('/pins-view')) {
    // Only the PINS hub page. The prototypes it links to are seen by inspectors, so they keep
    // their own external header with no internal nav (see partials/external-header).
    res.locals.activeSection = 'pins-view'
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
  getPlanTimeline,
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

// --- Managing commissioned evidence ---
//
// An officer briefs an external consultant, the consultant submits a report, and the officer
// reviews, comments, adds notes and accepts it into the evidence library:
//   /evidence/commissioned                       - landing page, with a reset per entry point
//   /evidence/commissioned/create-brief          - write and send the brief
//   /evidence/commissioned/brief(-sent)          - the sent brief, and its confirmation
//   /evidence/commissioned/consultant/...        - the consultant's screens (an external user)
//   /evidence/commissioned/review                - the report, with comments beside it
//   /evidence/commissioned/notes                 - notes, sent to the consultant or internal
//   /evidence/commissioned/accept                - tag and accept the report
//   /evidence/commissioned/source                - the accepted source in the library
//
// The consultant's screens wouldn't be reachable from the officer's journey in a real service.
// Testers get to them through "Prototype only" handoff panels (commissioned/partials/handoff.html)
// and from the landing page, and they use their own header without the internal nav.
//
// Everything is one object, req.session.data.commissionedEvidence, read only through
// getCommission. Free-text fields are named `_…` so the kit doesn't copy them into session data.

const CE = '/evidence/commissioned'
const COMMISSIONED_EVIDENCE_SCHEMA_VERSION = 1

const {
  THEMES: CE_THEMES,
  OFFICER: CE_OFFICER,
  PREVIOUS_CONSULTANTS,
  getPreviousConsultant,
  startingCommission,
  emptyReport
} = require('./data/commissioned-evidence.js')

function getCommission (req) {
  if (req.session.data.commissionedEvidenceSchemaVersion !== COMMISSIONED_EVIDENCE_SCHEMA_VERSION) {
    req.session.data.commissionedEvidence = JSON.parse(JSON.stringify(sessionDataDefaults.commissionedEvidence))
    req.session.data.commissionedEvidenceOwned = true
    req.session.data.commissionedEvidenceSchemaVersion = COMMISSIONED_EVIDENCE_SCHEMA_VERSION
  }
  if (!req.session.data.commissionedEvidenceOwned) {
    req.session.data.commissionedEvidence = JSON.parse(JSON.stringify(req.session.data.commissionedEvidence))
    req.session.data.commissionedEvidenceOwned = true
  }
  return req.session.data.commissionedEvidence
}

// The seed with the report taken out: the brief has gone to the consultant and nothing has come
// back yet. This is where "See the consultant's view" starts.
function briefSentCommission () {
  const commission = JSON.parse(JSON.stringify(sessionDataDefaults.commissionedEvidence))
  commission.stage = 'brief-sent'
  commission.report = emptyReport()
  commission.summary = null
  commission.comments = []
  commission.notes = []
  commission.history = commission.history.slice(0, 1)
  return commission
}

const CE_STARTS = {
  start: { build: startingCommission, redirect: CE + '/create-brief' },
  consultant: { build: briefSentCommission, redirect: CE + '/consultant/submit-report' },
  review: { build: () => JSON.parse(JSON.stringify(sessionDataDefaults.commissionedEvidence)), redirect: CE + '/review' }
}

function ceTimeZoneFormat (options) {
  return new Date().toLocaleString('en-GB', Object.assign({ timeZone: 'Europe/London' }, options))
}

function ceNow () {
  return ceTimeZoneFormat({ day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
}

function ceToday () {
  return ceTimeZoneFormat({ day: 'numeric', month: 'long', year: 'numeric' })
}

function ceLog (commission, actor, action, link) {
  commission.history.push({ at: ceNow(), actor, action, link: link || null })
}

function ceText (value) {
  return typeof value === 'string' ? value.trim() : ''
}

function ceThemes (value) {
  return [].concat(value || []).filter(theme => CE_THEMES.includes(theme))
}

function ceNextId (prefix, items) {
  return prefix + Date.now().toString(36) + items.length
}

// Errors survive the redirect in session data, and are cleared as soon as they're shown.
function ceSetErrors (req, errors) {
  req.session.data.commissionedEvidenceErrors = errors
}

function ceTakeErrors (req) {
  const errors = req.session.data.commissionedEvidenceErrors || {}
  delete req.session.data.commissionedEvidenceErrors
  return errors
}

function ceErrorList (errors) {
  return Object.keys(errors).map(id => ({ text: errors[id], href: '#' + id }))
}

function ceCommentLabel (comment) {
  return comment.section || 'General comment'
}

// Sidebar statuses follow from where the commission has got to. Only three states here, by
// design: Not started, In progress (the page you're on) and Completed. A step that can't be
// done yet reads as Not started rather than showing a lock; its page redirects back anyway.
function buildCommissionSidebar (commission, active) {
  const briefSent = commission.stage !== 'not-started'
  const accepted = commission.status === 'accepted'
  const steps = [
    { key: 'brief', text: 'Create brief', href: briefSent ? CE + '/brief' : CE + '/create-brief', done: briefSent },
    { key: 'review', text: 'Review and comment', href: CE + '/review', done: accepted },
    { key: 'accept', text: 'Accept and save', href: CE + '/accept', done: accepted },
    { key: 'source', text: 'Manage source', href: CE + '/source', done: false }
  ]
  return [{
    items: steps.map(step => {
      const isActive = step.key === active
      let status = 'Not started'
      if (step.done) status = 'Completed'
      else if (isActive) status = 'In progress'
      return { text: step.text, href: step.href, active: isActive, status }
    })
  }]
}

// Numbers each comment that is anchored to a paragraph, in reading order, so the [n] beside a
// paragraph and the [n] on its comment match.
function numberCommission (commission) {
  const paragraphs = commission.report.paragraphs.map((paragraph, index) => ({
    id: paragraph.id,
    text: paragraph.text,
    position: index + 1,
    comments: []
  }))
  const numbers = {}
  let next = 1
  paragraphs.forEach(paragraph => {
    commission.comments.filter(comment => comment.anchor === paragraph.id).forEach(comment => {
      numbers[comment.id] = next++
      paragraph.comments.push({ id: comment.id, number: numbers[comment.id], resolved: comment.resolved })
    })
    paragraph.highlighted = paragraph.comments.some(comment => !comment.resolved)
  })
  const comments = commission.comments.map(comment => Object.assign({}, comment, { number: numbers[comment.id] || null }))
  return { paragraphs, comments }
}

function renderCommissionPage (req, res, view, active, locals) {
  const commission = getCommission(req)
  const errors = ceTakeErrors(req)
  res.render('evidence/commissioned/' + view, Object.assign({
    commission,
    themes: CE_THEMES,
    officer: CE_OFFICER,
    viewer: CE_OFFICER.name,
    errors,
    errorList: ceErrorList(errors),
    sidebarSections: buildCommissionSidebar(commission, active)
  }, locals))
}

router.get(CE, (req, res) => {
  res.render('evidence/commissioned/index')
})

router.post(CE + '/reset', (req, res) => {
  const start = CE_STARTS[req.body._stage] || CE_STARTS.start
  getCommission(req)
  req.session.data.commissionedEvidence = start.build()
  req.session.data.commissionedEvidenceOwned = true
  delete req.session.data.commissionedEvidenceErrors
  res.redirect(start.redirect)
})

// --- Create brief ---

router.get(CE + '/create-brief', (req, res) => {
  if (getCommission(req).stage !== 'not-started') return res.redirect(CE + '/brief')
  renderCommissionPage(req, res, 'create-brief', 'brief', { consultants: PREVIOUS_CONSULTANTS })
})

router.post(CE + '/create-brief', (req, res) => {
  const commission = getCommission(req)
  if (commission.stage !== 'not-started') return res.redirect(CE + '/brief')
  const brief = commission.brief
  const body = req.body

  // Keep what was typed, so a validation error doesn't lose it.
  brief.title = ceText(body._title)
  brief.text = ceText(body._brief)
  brief.link = ceText(body._link)
  if (ceText(body._file)) brief.file = ceText(body._file)
  brief.themes = ceThemes(body._themes)
  brief.consultantMode = body._consultantMode === 'new' ? 'new' : 'previous'
  brief.consultantId = ceText(body._consultantId)
  brief.newConsultant = {
    name: ceText(body._consultantName),
    organisation: ceText(body._consultantOrganisation),
    email: ceText(body._consultantEmail)
  }

  const errors = {}
  if (!brief.title) errors.title = 'Enter a title for the brief'
  if (!brief.text) errors.brief = 'Describe what the consultant needs to investigate or report on'
  let consultant = null
  if (brief.consultantMode === 'previous') {
    consultant = getPreviousConsultant(brief.consultantId)
    if (!consultant) errors.consultantId = 'Select a consultant'
  } else {
    if (!brief.newConsultant.name) errors.consultantName = 'Enter the consultant\'s full name'
    if (!brief.newConsultant.email) errors.consultantEmail = 'Enter the consultant\'s email address'
    consultant = brief.newConsultant
  }
  if (Object.keys(errors).length) {
    ceSetErrors(req, errors)
    return res.redirect(CE + '/create-brief')
  }

  brief.consultant = {
    name: consultant.name,
    organisation: consultant.organisation,
    email: consultant.email
  }
  brief.commencedOn = ceToday()
  commission.stage = 'brief-sent'
  commission.status = 'draft'
  commission.report = emptyReport()
  commission.summary = null
  commission.comments = []
  commission.notes = []
  commission.history = []
  commission.tags = []
  commission.acceptedOn = null
  ceLog(commission, CE_OFFICER.name, 'Created brief and assigned it to ' + brief.consultant.name,
    { text: 'View brief', href: CE + '/brief' })
  res.redirect(CE + '/brief-sent')
})

router.get(CE + '/brief-sent', (req, res) => {
  if (getCommission(req).stage === 'not-started') return res.redirect(CE + '/create-brief')
  renderCommissionPage(req, res, 'brief-sent', 'brief')
})

router.get(CE + '/brief', (req, res) => {
  if (getCommission(req).stage === 'not-started') return res.redirect(CE + '/create-brief')
  renderCommissionPage(req, res, 'brief', 'brief')
})

// --- The consultant's screens (external user) ---

function renderConsultantPage (req, res, view, locals) {
  const commission = getCommission(req)
  const errors = ceTakeErrors(req)
  const report = commission.report
  res.render('evidence/commissioned/consultant/' + view, Object.assign({
    commission,
    viewer: commission.brief.consultant ? commission.brief.consultant.name : 'the consultant',
    errors,
    errorList: ceErrorList(errors),
    // The seed holds the report as paragraphs only, so rebuild the text box's contents from them.
    reportContent: report.content || report.paragraphs.map(paragraph => paragraph.text).join('\n\n'),
    notesFromCouncil: commission.notes.filter(note => note.sentToConsultant).slice().reverse()
  }, locals))
}

router.get(CE + '/consultant/submit-report', (req, res) => {
  renderConsultantPage(req, res, 'submit-report')
})

router.post(CE + '/consultant/submit-report', (req, res) => {
  const commission = getCommission(req)
  if (commission.stage === 'not-started' || commission.status === 'accepted') {
    return res.redirect(CE + '/consultant/submit-report')
  }
  const report = commission.report
  report.title = ceText(req.body._reportTitle)
  report.content = typeof req.body._reportContent === 'string' ? req.body._reportContent.trim() : ''
  const file = ceText(req.body._file)
  if (file && !report.files.includes(file)) report.files.push(file)

  if (req.body._action === 'add-link') {
    const link = ceText(req.body._linkUrl)
    if (!link) {
      ceSetErrors(req, { linkUrl: 'Enter a URL to add' })
    } else if (!report.links.includes(link)) {
      report.links.push(link)
    }
    return res.redirect(CE + '/consultant/submit-report#add-links')
  }

  const errors = {}
  if (!report.title) errors.reportTitle = 'Enter a title for your report'
  if (!report.content) errors.reportContent = 'Enter your report content'
  if (Object.keys(errors).length) {
    ceSetErrors(req, errors)
    return res.redirect(CE + '/consultant/submit-report')
  }

  // A blank line starts a new paragraph. Comments keep their paragraph by position, and any
  // whose paragraph has gone become general comments.
  report.paragraphs = report.content.split(/\n\s*\n/)
    .map(text => text.replace(/\s+/g, ' ').trim())
    .filter(Boolean)
    .map((text, index) => ({ id: 'p' + (index + 1), text }))
  const ids = report.paragraphs.map(paragraph => paragraph.id)
  commission.comments.forEach(comment => {
    if (comment.anchor && !ids.includes(comment.anchor)) comment.anchor = null
  })
  const revised = Boolean(report.submittedAt)
  report.submittedAt = ceNow()
  commission.stage = 'submitted'
  ceLog(commission, commission.brief.consultant.name, revised ? 'Submitted revised draft report' : 'Submitted draft report',
    { text: 'View version', href: CE + '/review' })
  res.redirect(CE + '/consultant/submitted')
})

router.get(CE + '/consultant/submitted', (req, res) => {
  if (getCommission(req).stage !== 'submitted') return res.redirect(CE + '/consultant/submit-report')
  renderConsultantPage(req, res, 'submitted')
})

// --- Review and comment ---

router.get(CE + '/review', (req, res) => {
  const commission = getCommission(req)
  if (commission.stage === 'not-started') return res.redirect(CE + '/create-brief')
  const numbered = numberCommission(commission)
  renderCommissionPage(req, res, 'review', 'review', {
    paragraphs: numbered.paragraphs,
    comments: numbered.comments,
    openCount: commission.comments.filter(comment => !comment.resolved).length,
    history: commission.history.slice().reverse()
  })
})

router.post(CE + '/review/comments', (req, res) => {
  const commission = getCommission(req)
  const text = ceText(req.body._comment)
  if (!text) {
    ceSetErrors(req, { comment: 'Enter a comment' })
    return res.redirect(CE + '/review#add-comment')
  }
  const index = commission.report.paragraphs.findIndex(paragraph => paragraph.id === req.body._anchor)
  const comment = {
    id: ceNextId('c', commission.comments),
    author: CE_OFFICER.name,
    at: ceNow(),
    anchor: index >= 0 ? commission.report.paragraphs[index].id : null,
    section: index >= 0 ? 'Paragraph ' + (index + 1) : 'General comment',
    text,
    replies: [],
    resolved: false
  }
  commission.comments.push(comment)
  ceLog(commission, CE_OFFICER.name,
    index >= 0 ? 'Added comment on Paragraph ' + (index + 1) : 'Added general comment',
    { text: 'View comment', href: CE + '/review#comment-' + comment.id })
  res.redirect(CE + '/review#comment-' + comment.id)
})

router.post(CE + '/review/comments/:commentId/reply', (req, res) => {
  const commission = getCommission(req)
  const comment = commission.comments.find(candidate => candidate.id === req.params.commentId)
  if (!comment) return res.redirect(CE + '/review')
  const text = ceText(req.body._reply)
  if (!text) {
    ceSetErrors(req, { ['reply-' + comment.id]: 'Enter a reply' })
    return res.redirect(CE + '/review#comment-' + comment.id)
  }
  comment.replies.push({ author: CE_OFFICER.name, at: ceNow(), text })
  ceLog(commission, CE_OFFICER.name, 'Replied to comment on ' + ceCommentLabel(comment),
    { text: 'View comment', href: CE + '/review#comment-' + comment.id })
  res.redirect(CE + '/review#comment-' + comment.id)
})

// Resolving is offered on both Review and Manage source, so it goes back to wherever it came from.
router.post(CE + '/comments/:commentId/resolve', (req, res) => {
  const commission = getCommission(req)
  const comment = commission.comments.find(candidate => candidate.id === req.params.commentId)
  const back = req.body._returnTo === 'source' ? CE + '/source' : CE + '/review'
  if (comment && !comment.resolved) {
    comment.resolved = true
    ceLog(commission, CE_OFFICER.name, 'Resolved comment on ' + ceCommentLabel(comment),
      { text: 'View comment', href: CE + '/review#comment-' + comment.id })
  }
  res.redirect(back + (comment ? '#comment-' + comment.id : ''))
})

router.post(CE + '/review/resolve-all', (req, res) => {
  const commission = getCommission(req)
  const open = commission.comments.filter(comment => !comment.resolved)
  if (open.length) {
    open.forEach(comment => { comment.resolved = true })
    ceLog(commission, CE_OFFICER.name, 'Resolved all comments (' + open.length + ')')
  }
  res.redirect(CE + '/review')
})

// --- Notes ---

router.get(CE + '/notes', (req, res) => {
  const commission = getCommission(req)
  if (commission.stage === 'not-started') return res.redirect(CE + '/create-brief')
  renderCommissionPage(req, res, 'notes', 'review', { notes: commission.notes.slice().reverse() })
})

router.post(CE + '/notes', (req, res) => {
  const commission = getCommission(req)
  const text = ceText(req.body._note)
  if (!text) {
    ceSetErrors(req, { note: 'Enter a note' })
    return res.redirect(CE + '/notes')
  }
  const sentToConsultant = req.body._send === 'consultant'
  commission.notes.push({
    id: ceNextId('n', commission.notes),
    text,
    date: ceTimeZoneFormat({ day: 'numeric', month: 'short', year: 'numeric' }),
    time: ceTimeZoneFormat({ hour: '2-digit', minute: '2-digit' }),
    by: CE_OFFICER.name,
    sentToConsultant
  })
  ceLog(commission, CE_OFFICER.name,
    sentToConsultant ? 'Sent a note to ' + commission.brief.consultant.name : 'Added an internal note',
    { text: 'View notes', href: CE + '/notes' })
  res.redirect(CE + '/notes')
})

// --- Accept and save ---

router.get(CE + '/accept', (req, res) => {
  const commission = getCommission(req)
  if (commission.stage !== 'submitted') return res.redirect(CE + '/review')
  // Until someone has chosen tags, start from the themes the brief asked about.
  const selectedTags = commission.status === 'accepted' || commission.tags.length
    ? commission.tags
    : commission.brief.themes
  renderCommissionPage(req, res, 'accept', 'accept', {
    selectedTags,
    openCount: commission.comments.filter(comment => !comment.resolved).length
  })
})

router.post(CE + '/accept', (req, res) => {
  const commission = getCommission(req)
  if (commission.stage !== 'submitted') return res.redirect(CE + '/review')
  commission.tags = ceThemes(req.body._tags)
  if (commission.status === 'accepted') {
    ceLog(commission, CE_OFFICER.name, 'Updated tags')
  } else {
    commission.status = 'accepted'
    commission.acceptedOn = ceToday()
    ceLog(commission, CE_OFFICER.name, 'Accepted document and added it to the evidence library',
      { text: 'View version', href: CE + '/review' })
  }
  res.redirect(CE + '/source')
})

// --- Manage source ---

router.get(CE + '/source', (req, res) => {
  const commission = getCommission(req)
  if (commission.status !== 'accepted') return res.redirect(CE + '/accept')
  const numbered = numberCommission(commission)
  const report = commission.report
  const slug = (report.title || commission.brief.title).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
  renderCommissionPage(req, res, 'source', 'source', {
    comments: numbered.comments,
    openCount: commission.comments.filter(comment => !comment.resolved).length,
    history: commission.history.slice().reverse(),
    file: report.file || { name: (slug || 'report') + '.pdf', meta: 'Generated from the submitted report' },
    summary: commission.summary || (report.paragraphs[0] && report.paragraphs[0].text) || ''
  })
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
    evidenceStatusColours: EVIDENCE_STATUS_COLOURS,
    planTimeline: getPlanTimeline()
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
// --- Policy drafting with starting points ---
//
// Built from the Figma designs for this journey (see CLAUDE.md). Two phases:
//   /policy-writing-drafting/starting-points      - review starting points (include/remove)
//   /policy-writing-drafting/chapters             - chapters made from them, and their briefs
//   /policy-writing-drafting/chapters/:id/<step>  - per-chapter steps, in CHAPTER_STEPS order
//
// Slug note: a sibling of /policy-writing rather than nested in it, for the same reason as
// policy-writing-v2 — nested, the segment would be caught by router.param('variant', ...).
//
// Everything the user changes is in req.session.data.policyDrafting, read only through
// getPolicyDrafting. Static reference content (officers, evidence library, viewer extracts) is in
// app/data/policy-drafting.js. Form fields holding free text are named with a leading "_" so
// the kit's session middleware doesn't copy them into the top level of session data as well.

const {
  OFFICERS,
  NPPF_URL,
  getRequirementsForChapter,
  LIBRARY_STATUS_COLOURS,
  SOURCE_TYPES,
  PLANNING_DESIGNATIONS,
  SITES,
  getLibrarySource,
  searchLibrary,
  getLibrarySearchTerms,
  getViewerContent,
  getConsultationsForChapter,
  getSuggestedPolicyAreas
} = require('./data/policy-drafting.js')

const PD = '/policy-writing-drafting'
const POLICY_DRAFTING_SCHEMA_VERSION = 2
const PD_RESULTS_PER_PAGE = 10

function ensurePolicyDraftingShape (req) {
  if (req.session.data.policyDraftingSchemaVersion !== POLICY_DRAFTING_SCHEMA_VERSION) {
    req.session.data.policyDrafting = JSON.parse(JSON.stringify(sessionDataDefaults.policyDrafting))
    req.session.data.policyDraftingOwned = true
    req.session.data.policyDraftingSchemaVersion = POLICY_DRAFTING_SCHEMA_VERSION
  }
}

function getPolicyDrafting (req) {
  ensurePolicyDraftingShape(req)
  if (!req.session.data.policyDraftingOwned) {
    req.session.data.policyDrafting = JSON.parse(JSON.stringify(req.session.data.policyDrafting))
    req.session.data.policyDraftingOwned = true
  }
  return req.session.data.policyDrafting
}

// The per-chapter steps, in sidebar order. `done` decides the step's status icon, and together
// they decide the chapter's status on the chapters list.
const CHAPTER_STEPS = [
  { slug: 'officers', label: 'Assign officers', done: chapter => chapter.officers.length > 0 },
  { slug: 'explanatory-text', label: 'Add explanatory text', done: chapter => Boolean(chapter.explanatoryText.trim()) },
  { slug: 'sources', label: 'Add sources', done: chapter => chapter.sources.length > 0 },
  { slug: 'policies', label: 'Manage policies', done: chapter => Boolean(chapter.policiesConfirmed) },
  { slug: 'draft', label: 'Draft policy', done: chapter => Object.keys(chapter.drafts).length > 0 },
  { slug: 'export', label: 'Share and publish', done: chapter => chapter.exports.length > 0 }
]

const pdChapterUrl = (chapter, step) => PD + '/chapters/' + chapter.id + '/' + step

function chapterStatus (chapter) {
  const done = CHAPTER_STEPS.filter(step => step.done(chapter)).length
  if (done === 0) return 'Not started'
  return done === CHAPTER_STEPS.length ? 'Completed' : 'In progress'
}

function newChapter (id, name, startingPointIds) {
  return {
    id,
    name,
    startingPointIds,
    brief: '',
    officers: [],
    explanatoryText: '',
    sources: [],
    policyAreas: null,
    drafts: {},
    exports: []
  }
}

function uniqueChapterId (data, base) {
  const slug = String(base).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'chapter'
  let id = slug
  let n = 2
  while (data.chapters.some(chapter => chapter.id === id)) id = slug + '-' + n++
  return id
}

// Keeps the chapters in step with the starting points once they're reviewed: an included
// starting point with no chapter gets one, and a chapter left with none of its starting points
// is removed — unless work has started on it, which is never thrown away. Chapters added by hand
// (never had a starting point) are left alone.
function syncChaptersWithStartingPoints (data) {
  const included = data.startingPoints.filter(point => point.included)
  const includedIds = included.map(point => point.id)

  data.chapters = data.chapters.filter(chapter => {
    const hadStartingPoints = chapter.startingPointIds.length > 0
    chapter.startingPointIds = chapter.startingPointIds.filter(id => includedIds.includes(id))
    const orphaned = hadStartingPoints && chapter.startingPointIds.length === 0
    return !(orphaned && chapterStatus(chapter) === 'Not started' && !chapter.brief)
  })

  included.forEach(point => {
    const covered = data.chapters.some(chapter => chapter.startingPointIds.includes(point.id))
    if (!covered) data.chapters.push(newChapter(uniqueChapterId(data, point.name), point.name, [point.id]))
  })
}

// Materialises the suggested policy areas the first time a chapter's policies are touched, so
// editing or adding one has a list to change.
function ensurePolicyAreas (chapter) {
  if (!Array.isArray(chapter.policyAreas)) {
    chapter.policyAreas = getSuggestedPolicyAreas(chapter.name).map(area => ({
      id: area.ref.toLowerCase(),
      ref: area.ref,
      name: area.name,
      selected: true
    }))
  }
  return chapter.policyAreas
}

function selectedPolicyAreas (chapter) {
  return (chapter.policyAreas || []).filter(area => area.selected)
}

function pdTimestamp () {
  return new Date().toLocaleString('en-GB', { dateStyle: 'short', timeStyle: 'short', timeZone: 'Europe/London' })
}

// Sidebar: the starting points phase, then every chapter, with the current chapter's steps
// nested under it (the shared side navigation's `children`).
//
// The chapters only appear once "Manage chapters" is complete — until then there are no
// settled chapters to list. The exception is a page inside a chapter (reached from the landing
// page's shortcut, say), which still needs its own steps to navigate by.
function buildDraftingSidebar (data, active) {
  const everyChapterHasBrief = data.chapters.length > 0 && data.chapters.every(chapter => chapter.brief.trim())
  const firstWithoutBrief = data.chapters.find(chapter => !chapter.brief.trim())

  const phaseItem = (key, text, href, done) => ({
    text,
    href,
    active: active.page === key,
    status: done ? 'Completed' : (active.page === key ? 'In progress' : 'Not started')
  })

  const sections = [
    {
      heading: 'Starting points',
      items: [
        phaseItem('review', 'Review starting points', PD + '/starting-points', data.reviewed),
        phaseItem('chapters', 'Manage chapters', PD + '/chapters', data.chaptersConfirmed),
        phaseItem('briefs', 'Add briefs',
          firstWithoutBrief ? pdChapterUrl(firstWithoutBrief, 'brief') : PD + '/chapters',
          everyChapterHasBrief)
      ]
    }
  ]

  if (!data.chaptersConfirmed && !active.chapterId) return sections

  sections.push({
    heading: 'Chapters',
    items: data.chapters.map(chapter => {
      const item = { text: chapter.name, href: pdChapterUrl(chapter, CHAPTER_STEPS[0].slug) }
      if (chapter.id === active.chapterId) {
        item.children = CHAPTER_STEPS.map(step => {
          const isActive = step.slug === active.step
          return {
            text: step.label,
            href: pdChapterUrl(chapter, step.slug),
            active: isActive,
            status: step.done(chapter) ? 'Completed' : (isActive ? 'In progress' : 'Not started')
          }
        })
      }
      return item
    })
  })
  return sections
}

// Every chapter page needs the chapter, the sidebar and the breadcrumb root.
function renderChapterPage (req, res, view, step, locals) {
  const data = getPolicyDrafting(req)
  const chapter = req.pdChapter
  res.render('policy-writing-drafting/' + view, Object.assign({
    chapter,
    sidebarSections: buildDraftingSidebar(data, { chapterId: chapter.id, step, page: step === 'brief' ? 'briefs' : null })
  }, locals))
}

// Loads the chapter for every /chapters/:pdChapterId/... route, and sends anything stale
// (a merged or removed chapter) back to the list.
router.param('pdChapterId', (req, res, next, id) => {
  const chapter = getPolicyDrafting(req).chapters.find(candidate => candidate.id === id)
  if (!chapter) return res.redirect(PD + '/chapters')
  req.pdChapter = chapter
  next()
})

router.get(PD, (req, res) => {
  res.render('policy-writing-drafting/index', {
    userStories: getUserStories(['POUS1', 'POUS3', 'POUS4'])
  })
})

// --- Starting points ---

router.get(PD + '/starting-points', (req, res) => {
  const data = getPolicyDrafting(req)
  res.render('policy-writing-drafting/starting-points/index', {
    startingPoints: data.startingPoints,
    sidebarSections: buildDraftingSidebar(data, { page: 'review' })
  })
})

router.post(PD + '/starting-points', (req, res) => {
  const data = getPolicyDrafting(req)
  data.reviewed = true
  syncChaptersWithStartingPoints(data)
  res.redirect(PD + '/chapters')
})

router.post(PD + '/starting-points/:pointId/toggle', (req, res) => {
  const point = getPolicyDrafting(req).startingPoints.find(candidate => candidate.id === req.params.pointId)
  if (point) point.included = !point.included
  res.redirect(PD + '/starting-points')
})

const STARTING_POINT_SOURCES = ['Adopted plan', 'New need', 'NPPF/SDS']

router.get(PD + '/starting-points/new', (req, res) => {
  const data = getPolicyDrafting(req)
  res.render('policy-writing-drafting/starting-points/new', {
    sources: STARTING_POINT_SOURCES,
    sidebarSections: buildDraftingSidebar(data, { page: 'review' })
  })
})

router.post(PD + '/starting-points/new', (req, res) => {
  const data = getPolicyDrafting(req)
  const name = (req.body._startingPointName || '').trim()
  if (name) {
    data.startingPoints.push({
      id: 'sp-' + Date.now(),
      name,
      source: STARTING_POINT_SOURCES.includes(req.body._startingPointSource) ? req.body._startingPointSource : 'New need',
      included: true
    })
  }
  res.redirect(PD + '/starting-points')
})

// --- Chapters and briefs ---

router.get(PD + '/chapters', (req, res) => {
  const data = getPolicyDrafting(req)
  res.render('policy-writing-drafting/chapters/index', {
    chapters: data.chapters.map(chapter => Object.assign({ status: chapterStatus(chapter) }, chapter)),
    sidebarSections: buildDraftingSidebar(data, { page: 'chapters' })
  })
})

router.post(PD + '/chapters', (req, res) => {
  const data = getPolicyDrafting(req)
  data.chaptersConfirmed = true
  const next = data.chapters.find(chapter => !chapter.brief.trim()) || data.chapters[0]
  res.redirect(next ? pdChapterUrl(next, 'brief') : PD + '/chapters')
})

router.get(PD + '/chapters/new', (req, res) => {
  const data = getPolicyDrafting(req)
  res.render('policy-writing-drafting/chapters/new', {
    sidebarSections: buildDraftingSidebar(data, { page: 'chapters' })
  })
})

router.post(PD + '/chapters/new', (req, res) => {
  const data = getPolicyDrafting(req)
  const name = (req.body._chapterName || '').trim()
  if (name) data.chapters.push(newChapter(uniqueChapterId(data, name), name, []))
  res.redirect(PD + '/chapters')
})

router.get(PD + '/chapters/:pdChapterId/brief', (req, res) => {
  const data = getPolicyDrafting(req)
  renderChapterPage(req, res, 'chapters/brief', 'brief', {
    chapters: data.chapters,
    requirements: getRequirementsForChapter(req.pdChapter.name),
    nppfUrl: NPPF_URL
  })
})

// Saving the brief can also move the chapter into another one ("Assign to chapter"): its
// starting points and brief go to the target, and this chapter is removed.
router.post(PD + '/chapters/:pdChapterId/brief', (req, res) => {
  const data = getPolicyDrafting(req)
  const chapter = req.pdChapter
  chapter.brief = (req.body._brief || '').trim().slice(0, 500)

  const target = data.chapters.find(candidate => candidate.id === req.body._assignTo)
  if (target && target !== chapter) {
    target.startingPointIds = target.startingPointIds.concat(chapter.startingPointIds)
    if (chapter.brief) target.brief = [target.brief, chapter.brief].filter(Boolean).join('\n\n').slice(0, 500)
    data.chapters = data.chapters.filter(candidate => candidate !== chapter)
  }
  res.redirect(PD + '/chapters')
})

// --- Chapter steps ---

router.get(PD + '/chapters/:pdChapterId/officers', (req, res) => {
  const chapter = req.pdChapter
  renderChapterPage(req, res, 'chapter/officers', 'officers', {
    assigned: chapter.officers.map(id => OFFICERS.find(officer => officer.id === id)).filter(Boolean),
    available: OFFICERS.filter(officer => !chapter.officers.includes(officer.id))
  })
})

router.post(PD + '/chapters/:pdChapterId/officers', (req, res) => {
  const chapter = req.pdChapter
  if (req.body._action === 'continue') return res.redirect(pdChapterUrl(chapter, 'explanatory-text'))

  const officer = OFFICERS.find(candidate => candidate.id === req.body._officer)
  if (officer && !chapter.officers.includes(officer.id)) chapter.officers.push(officer.id)
  res.redirect(pdChapterUrl(chapter, 'officers'))
})

router.post(PD + '/chapters/:pdChapterId/officers/:officerId/remove', (req, res) => {
  const chapter = req.pdChapter
  chapter.officers = chapter.officers.filter(id => id !== req.params.officerId)
  res.redirect(pdChapterUrl(chapter, 'officers'))
})

router.get(PD + '/chapters/:pdChapterId/explanatory-text', (req, res) => {
  renderChapterPage(req, res, 'chapter/explanatory-text', 'explanatory-text', {
    requirements: getRequirementsForChapter(req.pdChapter.name),
    nppfUrl: NPPF_URL
  })
})

router.post(PD + '/chapters/:pdChapterId/explanatory-text', (req, res) => {
  const chapter = req.pdChapter
  chapter.explanatoryText = (req.body._explanatoryText || '').trim()
  res.redirect(pdChapterUrl(chapter, 'sources'))
})

// Search and filters are sticky in session (the kit stores req.query there), named pd* so they
// can't collide with the evidence library's own evidenceSearch filter. The page number is
// "_page" so it isn't sticky: a new search should start from the first page.
router.get(PD + '/chapters/:pdChapterId/sources', (req, res) => {
  const chapter = req.pdChapter
  const session = req.session.data
  const filters = {
    query: session.pdSearch || '',
    type: session.pdSourceType || '',
    area: session.pdPolicyArea || '',
    designation: session.pdDesignation || '',
    site: session.pdSite || ''
  }
  const searched = Object.values(filters).some(Boolean)
  const results = searched ? searchLibrary(filters) : []
  const pageCount = Math.max(1, Math.ceil(results.length / PD_RESULTS_PER_PAGE))
  const page = Math.min(pageCount, Math.max(1, parseInt(req.query._page, 10) || 1))
  const start = (page - 1) * PD_RESULTS_PER_PAGE

  renderChapterPage(req, res, 'chapter/sources', 'sources', {
    chapterSources: chapter.sources.map(getLibrarySource).filter(Boolean),
    filters,
    searched,
    results: results.slice(start, start + PD_RESULTS_PER_PAGE),
    resultCount: results.length,
    firstResult: results.length ? start + 1 : 0,
    lastResult: Math.min(start + PD_RESULTS_PER_PAGE, results.length),
    page,
    pageCount,
    statusColours: LIBRARY_STATUS_COLOURS,
    searchTermsJson: JSON.stringify(getLibrarySearchTerms()),
    // Set after "Add selected sources", for the confirmation banner.
    addedCount: parseInt(req.query._added, 10) || 0,
    sourceTypes: SOURCE_TYPES,
    policyAreas: POLICY_AREAS,
    designations: PLANNING_DESIGNATIONS,
    sites: SITES
  })
})

// Adding or removing keeps the user on the page of results they were on.
function sourcesReturnUrl (chapter, page, extra) {
  const params = []
  const pageNumber = parseInt(page, 10)
  if (pageNumber > 1) params.push('_page=' + pageNumber)
  if (extra) params.push(extra)
  return pdChapterUrl(chapter, 'sources') + (params.length ? '?' + params.join('&') : '')
}

// "Add selected sources": every ticked result in one go. Anything already on the chapter is
// skipped, so the banner's count is what was actually added.
router.post(PD + '/chapters/:pdChapterId/sources/add', (req, res) => {
  const chapter = req.pdChapter
  const incoming = asArray(req.body._sourceIds)
    .filter(id => getLibrarySource(id) && !chapter.sources.includes(id))
    .filter((id, index, all) => all.indexOf(id) === index)
  chapter.sources.push(...incoming)
  res.redirect(sourcesReturnUrl(chapter, req.body._page, incoming.length ? '_added=' + incoming.length : ''))
})

router.post(PD + '/chapters/:pdChapterId/sources/:sourceId/remove', (req, res) => {
  const chapter = req.pdChapter
  chapter.sources = chapter.sources.filter(id => id !== req.params.sourceId)
  res.redirect(sourcesReturnUrl(chapter, req.body._page))
})

router.get(PD + '/chapters/:pdChapterId/policies', (req, res) => {
  renderChapterPage(req, res, 'chapter/policies', 'policies', {
    policyAreas: ensurePolicyAreas(req.pdChapter)
  })
})

router.post(PD + '/chapters/:pdChapterId/policies', (req, res) => {
  const chapter = req.pdChapter
  const selected = asArray(req.body._policyAreas)
  ensurePolicyAreas(chapter).forEach(area => { area.selected = selected.includes(area.id) })
  chapter.policiesConfirmed = true
  res.redirect(pdChapterUrl(chapter, 'draft'))
})

// One form for both editing a policy area and adding a policy.
router.get(PD + '/chapters/:pdChapterId/policies/new', (req, res) => {
  renderChapterPage(req, res, 'chapter/policy-area', 'policies', { policyArea: null })
})

router.get(PD + '/chapters/:pdChapterId/policies/:areaId/edit', (req, res) => {
  const policyArea = ensurePolicyAreas(req.pdChapter).find(area => area.id === req.params.areaId)
  if (!policyArea) return res.redirect(pdChapterUrl(req.pdChapter, 'policies'))
  renderChapterPage(req, res, 'chapter/policy-area', 'policies', { policyArea })
})

router.post(PD + '/chapters/:pdChapterId/policies/new', (req, res) => {
  const chapter = req.pdChapter
  const ref = (req.body._policyRef || '').trim()
  const name = (req.body._policyName || '').trim()
  if (name) {
    ensurePolicyAreas(chapter).push({
      id: 'pa-' + Date.now(),
      ref,
      name,
      selected: true
    })
  }
  res.redirect(pdChapterUrl(chapter, 'policies'))
})

router.post(PD + '/chapters/:pdChapterId/policies/:areaId/edit', (req, res) => {
  const chapter = req.pdChapter
  const policyArea = ensurePolicyAreas(chapter).find(area => area.id === req.params.areaId)
  if (policyArea) {
    policyArea.ref = (req.body._policyRef || '').trim() || policyArea.ref
    policyArea.name = (req.body._policyName || '').trim() || policyArea.name
  }
  res.redirect(pdChapterUrl(chapter, 'policies'))
})

// The sources the evidence viewer can show: the chapter's own, plus any consultation summary
// that covers this chapter.
function viewerSourcesFor (chapter) {
  return chapter.sources
    .concat(getConsultationsForChapter(chapter.name))
    .filter((id, index, all) => all.indexOf(id) === index)
    .map(getLibrarySource)
    .filter(Boolean)
}

function viewerLocals (chapter, sourceId) {
  const viewerSources = viewerSourcesFor(chapter)
  const viewerSource = viewerSources.find(source => source.id === sourceId) || viewerSources[0] || null
  return {
    viewerSources,
    viewerSource,
    viewerContent: viewerSource ? getViewerContent(viewerSource.id) : null
  }
}

router.get(PD + '/chapters/:pdChapterId/draft', (req, res) => {
  const chapter = req.pdChapter
  const areas = selectedPolicyAreas(chapter)
  const policyArea = areas.find(area => area.id === req.query._policy) || areas[0] || null

  renderChapterPage(req, res, 'chapter/draft', 'draft', Object.assign({
    policyAreas: areas,
    policyArea,
    draft: (policyArea && chapter.drafts[policyArea.id]) || {}
  }, viewerLocals(chapter, req.query._source)))
})

router.post(PD + '/chapters/:pdChapterId/draft/:areaId', (req, res) => {
  const chapter = req.pdChapter
  const policyArea = selectedPolicyAreas(chapter).find(area => area.id === req.params.areaId)
  if (policyArea) {
    chapter.drafts[policyArea.id] = {
      title: (req.body._policyTitle || '').trim(),
      context: (req.body._policyContext || '').trim(),
      detail: (req.body._policyDetail || '').trim(),
      strategic: req.body._strategic === 'yes',
      savedAt: pdTimestamp()
    }
  }
  const query = '?_policy=' + encodeURIComponent(req.params.areaId) +
    (req.body._source ? '&_source=' + encodeURIComponent(req.body._source) : '')
  res.redirect(pdChapterUrl(chapter, 'draft') + query)
})

// The evidence viewer on a page of its own, for "Open in new window".
router.get(PD + '/chapters/:pdChapterId/viewer', (req, res) => {
  res.render('policy-writing-drafting/chapter/viewer', Object.assign({
    chapter: req.pdChapter
  }, viewerLocals(req.pdChapter, req.query._source)))
})

// What can be viewed or exported: each drafted-for policy in this chapter, the chapter, or the
// whole plan. Values are "<scope>:<id>" so one select or radio can carry both.
function exportOptions (data, chapter) {
  return selectedPolicyAreas(chapter).map(area => ({
    value: 'policy:' + chapter.id + ':' + area.id,
    text: area.ref + ': ' + area.name
  })).concat([
    { value: 'chapter:' + chapter.id, text: chapter.name + ' (full chapter)' },
    { value: 'plan', text: 'The whole draft plan' }
  ])
}

router.get(PD + '/chapters/:pdChapterId/export', (req, res) => {
  const data = getPolicyDrafting(req)
  const chapter = req.pdChapter
  renderChapterPage(req, res, 'chapter/export', 'export', {
    chapters: data.chapters,
    policyAreas: selectedPolicyAreas(chapter),
    exportOptions: exportOptions(data, chapter),
    exported: req.query._exported ? chapter.exports[chapter.exports.length - 1] : null
  })
})

// The content a view or an export covers, as plain copies, so an export's snapshot stays as it
// was when later drafting changes the chapter. scope is 'policy', 'chapter' or 'plan'.
function buildDraftContent (data, scope, chapterId, policyId) {
  const chapter = data.chapters.find(candidate => candidate.id === chapterId)
  const chapters = scope !== 'plan' && chapter ? [chapter] : data.chapters

  return JSON.parse(JSON.stringify({
    scope,
    chapters: chapters.map(item => ({
      chapter: { name: item.name, explanatoryText: item.explanatoryText },
      policyAreas: selectedPolicyAreas(item)
        .filter(area => scope !== 'policy' || area.id === policyId)
        .map(area => ({
          ref: area.ref,
          name: area.name,
          strategic: Boolean(area.strategic),
          draft: item.drafts[area.id] || null
        }))
    }))
  }))
}

// Export option values are "policy:<chapter>:<policy area>", "chapter:<chapter>" or "plan".
function parseExportOption (value) {
  const [scope, chapterId, policyId] = String(value).split(':')
  return { scope, chapterId, policyId }
}

// No file is produced — the prototype records the export in the chapter's audit log, with a
// snapshot of what was exported so that version can be viewed later.
router.post(PD + '/chapters/:pdChapterId/export', (req, res) => {
  const data = getPolicyDrafting(req)
  const chapter = req.pdChapter
  const option = exportOptions(data, chapter).find(candidate => candidate.value === req.body._what)
  const format = req.body._format === 'word' ? 'Word' : 'PDF'
  if (option) {
    const { scope, chapterId, policyId } = parseExportOption(option.value)
    chapter.exports.push({
      id: 'export-' + Date.now(),
      what: option.text,
      format,
      at: pdTimestamp(),
      by: 'You',
      snapshot: buildDraftContent(data, scope, chapterId, policyId)
    })
    return res.redirect(pdChapterUrl(chapter, 'export') + '?_exported=1')
  }
  res.redirect(pdChapterUrl(chapter, 'export'))
})

// One exported version from the audit log, opened in a new window.
router.get(PD + '/chapters/:pdChapterId/export/:exportId', (req, res) => {
  const chapter = req.pdChapter
  const entry = chapter.exports.find(candidate => candidate.id === req.params.exportId)
  if (!entry || !entry.snapshot) return res.redirect(pdChapterUrl(chapter, 'export'))
  res.render('policy-writing-drafting/preview', Object.assign({ version: entry }, entry.snapshot))
})

// The read-only draft, opened in a new window from "View in new window". _scope is policy,
// chapter or plan.
router.get(PD + '/preview', (req, res) => {
  const data = getPolicyDrafting(req)
  const scope = ['policy', 'chapter', 'plan'].includes(req.query._scope) ? req.query._scope : 'plan'
  res.render('policy-writing-drafting/preview',
    buildDraftContent(data, scope, req.query._chapter, req.query._policy))
})

// --- Managing consultation responses ---
//
// An officer imports a consultation's representations, responds to them — in bulk by theme, or
// one by one — and sends the finished responses for review:
//   /consultations/managing-responses                  - landing page, one link per pathway
//   .../import                                          - upload a CSV (only the name is kept)
//   .../view, .../view/themes                           - View and respond, by consultee or theme
//   .../themes/:crThemeId                               - a theme, and its standard response
//   .../consultees/:crConsulteeId                       - a consultee's representations over time
//   .../templates                                       - every standard response
//   .../check                                           - filter, mark ready and send for review
//   .../review                                          - placeholder: no design yet
// The alternative pathway compares a representation with the same respondent's earlier one:
//   .../officer                                         - the policy officer drafts a response
//   .../inspector                                       - the inspector comments (external user)
//
// Representations themselves are static (app/data/consultation-responses.js). Session data holds
// only what changes, in one object read through getConsultationResponses: uploads, the standard
// response for each theme, and each representation's officer, status and response. A response is
// either { templateId } — so editing a standard response changes every representation it's
// assigned to, as the templates page promises — or { text } written for that one representation.

const CR = '/consultations/managing-responses'
const CONSULTATION_RESPONSES_SCHEMA_VERSION = 2
const CR_PAGE_SIZE = 10
const CR_SIDE_BY_SIDE_PAGE_SIZE = 4

const {
  CURRENT_CONSULTATION: CR_CONSULTATION,
  CONSULTATIONS: CR_CONSULTATIONS,
  TOTAL_RESPONDENTS: CR_TOTAL_RESPONDENTS,
  CURRENT_OFFICER: CR_OFFICER,
  INSPECTOR: CR_INSPECTOR,
  RESPONDENT_TYPES: CR_RESPONDENT_TYPES,
  COMMENT_TYPES: CR_COMMENT_TYPES,
  POLICIES: CR_POLICIES,
  THEMES: CR_THEMES,
  CONSULTEES: CR_CONSULTEES,
  getTheme: getCrTheme,
  getConsultee: getCrConsultee,
  getRepresentations: getCrRepresentations,
  getRepresentation: getCrRepresentation,
  consulteeDocument: crConsulteeDocument,
  startingState: crStartingState
} = require('./data/consultation-responses.js')

function getConsultationResponses (req) {
  if (req.session.data.consultationResponsesSchemaVersion !== CONSULTATION_RESPONSES_SCHEMA_VERSION) {
    req.session.data.consultationResponses = JSON.parse(JSON.stringify(sessionDataDefaults.consultationResponses))
    req.session.data.consultationResponsesOwned = true
    req.session.data.consultationResponsesSchemaVersion = CONSULTATION_RESPONSES_SCHEMA_VERSION
  }
  if (!req.session.data.consultationResponsesOwned) {
    req.session.data.consultationResponses = JSON.parse(JSON.stringify(req.session.data.consultationResponses))
    req.session.data.consultationResponsesOwned = true
  }
  return req.session.data.consultationResponses
}

const CR_MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
const CR_LONG_MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August',
  'September', 'October', 'November', 'December']

// '2026-03-18' -> '18 Mar 2026', or '18 March 2026' with long.
function crDate (iso, long) {
  if (!iso) return ''
  const [year, month, day] = iso.split('-').map(Number)
  return day + ' ' + (long ? CR_LONG_MONTHS : CR_MONTHS)[month - 1] + ' ' + year
}

function crToday () {
  return new Date().toLocaleDateString('en-CA', { timeZone: 'Europe/London' })
}

function crText (value) {
  return typeof value === 'string' ? value.trim() : ''
}

function crPick (value, allowed) {
  return allowed.includes(value) ? value : ''
}

function crPageNumber (value, pageCount) {
  const page = parseInt(value, 10)
  if (!page || page < 1) return 1
  return Math.min(page, Math.max(pageCount, 1))
}

// Messages and errors survive the redirect in session data and are cleared once shown.
function crFlash (req, text) {
  req.session.data.consultationResponsesFlash = text
}

function crSetErrors (req, errors, values) {
  req.session.data.consultationResponsesErrors = { errors, values: values || {} }
}

function crTake (req, key) {
  const value = req.session.data[key]
  delete req.session.data[key]
  return value
}

// How a response status reads on screen. A representation with no response yet is a draft
// with a note saying what's missing, as in the check-and-send design.
const CR_STATUS = {
  draft: { label: 'Draft', colour: 'grey' },
  ready: { label: 'Ready for review', colour: 'green' },
  changes: { label: 'Needs changes', colour: 'orange' },
  'in-review': { label: 'In review', colour: 'blue' }
}

const CR_COMMENT_COLOURS = { Support: 'green', Objection: 'red', Neutral: 'blue' }

// One representation, static content and session state together, ready to render.
function crRepView (data, rep) {
  const state = data.reps[rep.id]
  const template = state.response && state.response.templateId ? data.templates[state.response.templateId] : null
  let responseText = ''
  if (template) responseText = template.text
  else if (state.response && state.response.text) responseText = state.response.text
  const hasResponse = Boolean(responseText)

  const missing = []
  if (!state.officer) missing.push('Officer')
  if (!hasResponse) missing.push('response')
  let missingNote = ''
  if (missing.length === 2) missingNote = 'Officer and response required'
  else if (missing.length) missingNote = missing[0].charAt(0).toUpperCase() + missing[0].slice(1) + ' required'

  const status = hasResponse ? state.status : 'draft'
  return Object.assign({}, rep, {
    officer: state.officer,
    status,
    statusLabel: CR_STATUS[status].label,
    statusColour: CR_STATUS[status].colour,
    commentColour: CR_COMMENT_COLOURS[rep.commentType],
    hasResponse,
    responseText,
    responseSource: template ? 'template' : (hasResponse ? 'own' : null),
    templateId: template ? state.response.templateId : null,
    missingNote,
    // Ready to send means ready and nothing missing; anything else that isn't already with the
    // reviewers is outstanding and won't be sent.
    outstanding: status !== 'in-review' && !(status === 'ready' && state.officer),
    updated: state.updated,
    inspectorReviewed: state.inspectorReviewed,
    inspectorComments: state.inspectorComments
  })
}

function crRepViews (data) {
  return getCrRepresentations().map(rep => crRepView(data, rep))
}

function crNewestFirst (a, b) {
  if (a.date !== b.date) return a.date < b.date ? 1 : -1
  return a.id < b.id ? 1 : -1
}

function crReadiness (views) {
  const total = views.length
  const ready = views.filter(view => view.status === 'ready' && view.officer).length
  const inReview = views.filter(view => view.status === 'in-review').length
  const changes = views.filter(view => view.status === 'changes').length
  const incomplete = views.filter(view => view.status === 'draft').length
  const unassigned = views.filter(view => !view.officer && view.status !== 'in-review').length
  const outstanding = views.filter(view => view.outstanding).length
  return {
    total,
    ready,
    inReview,
    changes,
    incomplete,
    unassigned,
    outstanding,
    done: ready + inReview,
    percent: total ? Math.round((ready + inReview) / total * 100) : 0
  }
}

// Sidebar statuses follow from the data, using the shared status vocabulary.
function buildCrSidebar (data, active, options) {
  const views = crRepViews(data)
  const total = views.length
  const withResponse = views.filter(view => view.hasResponse).length
  const templates = Object.values(data.templates)
  const finals = templates.filter(template => template.status === 'final').length
  const inReview = views.filter(view => view.status === 'in-review').length
  const started = views.filter(view => ['ready', 'in-review'].includes(view.status)).length

  function progress (done, any, all) {
    if (done === all) return 'Completed'
    return any ? 'In progress' : 'Not started'
  }

  const steps = [
    { key: 'import', text: 'Import consultation', href: CR + '/import', status: data.uploads.length ? 'Completed' : 'Not started' },
    { key: 'view', text: 'View and respond', href: (options && options.viewHref) || CR + '/view', status: progress(withResponse, withResponse, total) },
    { key: 'templates', text: 'Manage response templates', href: CR + '/templates', status: progress(finals, templates.length, CR_THEMES.length) },
    { key: 'check', text: 'Check and send for review', href: CR + '/check', status: progress(inReview, started, total) },
    { key: 'review', text: 'Review responses', href: CR + '/review', status: inReview ? 'Not started' : 'Cannot start' }
  ]
  return [{
    items: steps.map(step => ({ text: step.text, href: step.href, status: step.status, active: step.key === active }))
  }]
}

function renderCr (req, res, view, active, locals) {
  const data = getConsultationResponses(req)
  const failed = crTake(req, 'consultationResponsesErrors') || { errors: {}, values: {} }
  res.render('consultations/managing-responses/' + view, Object.assign({
    data,
    consultation: CR_CONSULTATION,
    crDate,
    flash: crTake(req, 'consultationResponsesFlash'),
    errors: failed.errors,
    values: failed.values,
    errorList: Object.keys(failed.errors).map(id => ({ text: failed.errors[id], href: '#' + id })),
    sidebarSections: buildCrSidebar(data, active, locals && locals.sidebarOptions)
  }, locals))
}

function crConsulteesInTheme (views, themeId) {
  const ids = new Set(views.filter(view => view.themeId === themeId).map(view => view.consulteeId))
  return CR_CONSULTEES.filter(consultee => ids.has(consultee.id))
}

router.post(CR + '/reset', (req, res) => {
  getConsultationResponses(req)
  req.session.data.consultationResponses = crStartingState()
  req.session.data.crTheme = 'heritage'
  req.session.data.crPolicy = 'HE1'
  req.session.data.crRespondentType = ''
  req.session.data.crCommentType = ''
  res.redirect(CR + (req.body._to === 'import' ? '/import' : ''))
})

// --- Import consultation ---

router.get(CR + '/import', (req, res) => {
  renderCr(req, res, 'import', 'import')
})

// The form isn't multipart, so the browser sends only the file's name. That's all we keep.
router.post(CR + '/import', (req, res) => {
  const data = getConsultationResponses(req)
  const fileName = crText(req.body._file).split(/[\\/]/).pop()
  if (!fileName) {
    crSetErrors(req, { file: 'Select a CSV file to upload' })
  } else if (!/\.csv$/i.test(fileName)) {
    crSetErrors(req, { file: 'The selected file must be a CSV' })
  } else {
    data.uploads.unshift({
      id: 'upload-' + Date.now().toString(36),
      title: fileName.replace(/\.csv$/i, ''),
      size: (0.5 + (fileName.length % 30) / 10).toFixed(1) + ' MB',
      date: crToday()
    })
    crFlash(req, fileName + ' has been uploaded')
  }
  res.redirect(CR + '/import')
})

router.post(CR + '/import/:uploadId/remove', (req, res) => {
  const data = getConsultationResponses(req)
  const upload = data.uploads.find(candidate => candidate.id === req.params.uploadId)
  if (upload) {
    data.uploads = data.uploads.filter(candidate => candidate !== upload)
    crFlash(req, upload.title + ' has been removed')
  }
  res.redirect(CR + '/import')
})

// --- View and respond ---

router.get(CR + '/view', (req, res) => {
  const data = getConsultationResponses(req)
  const views = crRepViews(data)
  const search = crText(req.session.data.crConsulteeSearch)
  const rows = CR_CONSULTEES
    .filter(consultee => !search || consultee.name.toLowerCase().includes(search.toLowerCase()))
    .map(consultee => {
      const reps = views.filter(view => view.consulteeId === consultee.id)
      return { consultee, total: reps.length, assigned: reps.filter(view => view.hasResponse).length }
    })
  const pageCount = Math.ceil(rows.length / CR_PAGE_SIZE)
  const page = crPageNumber(req.query._page, pageCount)
  renderCr(req, res, 'view-consultees', 'view', {
    search,
    rows: rows.slice((page - 1) * CR_PAGE_SIZE, page * CR_PAGE_SIZE),
    resultCount: rows.length,
    page,
    pageCount
  })
})

router.get(CR + '/view/themes', (req, res) => {
  renderCr(req, res, 'view-themes', 'view', { themes: CR_THEMES, totalRespondents: CR_TOTAL_RESPONDENTS })
})

router.param('crThemeId', (req, res, next, id) => {
  req.crTheme = getCrTheme(id)
  if (!req.crTheme) return res.redirect(CR + '/view/themes')
  next()
})

router.get(CR + '/themes/:crThemeId', (req, res) => {
  const data = getConsultationResponses(req)
  const theme = req.crTheme
  const views = crRepViews(data).filter(view => view.themeId === theme.id)
  renderCr(req, res, 'theme', 'view', {
    theme,
    template: data.templates[theme.id] || null,
    consultees: crConsulteesInTheme(views, theme.id),
    totalRespondents: CR_TOTAL_RESPONDENTS,
    percent: (theme.respondents / CR_TOTAL_RESPONDENTS * 100).toFixed(1),
    repCount: views.length,
    assignedCount: views.filter(view => view.responseSource === 'template').length,
    ownCount: views.filter(view => view.responseSource === 'own').length,
    unassignedCount: views.filter(view => !view.hasResponse).length
  })
})

// "Assign this response to theme" is the bulk response: the standard response becomes final
// and is assigned to every representation on the theme that doesn't have a response yet.
// Representations with a response written for them keep it.
router.post(CR + '/themes/:crThemeId', (req, res) => {
  const data = getConsultationResponses(req)
  const theme = req.crTheme
  const text = crText(req.body._response)
  const back = CR + '/themes/' + theme.id + '#standard-response'
  if (!text) {
    crSetErrors(req, { response: 'Enter a standard response for this theme' })
    return res.redirect(back)
  }
  const existing = data.templates[theme.id]
  const today = crToday()

  if (req.body._action === 'assign') {
    data.templates[theme.id] = { text, status: 'final', updated: today }
    let count = 0
    const consultees = new Set()
    getCrRepresentations().filter(rep => rep.themeId === theme.id).forEach(rep => {
      const state = data.reps[rep.id]
      if (state.response) return
      state.response = { templateId: theme.id }
      state.status = 'draft'
      state.officer = state.officer || CR_OFFICER
      state.updated = today
      consultees.add(rep.consulteeId)
      count++
    })
    crFlash(req, count
      ? 'Standard response assigned to ' + count + ' representation' + (count === 1 ? '' : 's') + ' from ' + consultees.size + ' consultee' + (consultees.size === 1 ? '' : 's')
      : 'Standard response saved. Every representation on this theme already had a response, so nothing new was assigned')
  } else {
    data.templates[theme.id] = { text, status: existing ? existing.status : 'draft', updated: today }
    crFlash(req, existing && existing.status === 'final' ? 'Standard response updated for every representation it is assigned to' : 'Draft standard response saved')
  }
  res.redirect(back)
})

router.param('crConsulteeId', (req, res, next, id) => {
  req.crConsultee = getCrConsultee(id)
  if (!req.crConsultee) return res.redirect(CR + '/view')
  next()
})

router.get(CR + '/consultees/:crConsulteeId', (req, res) => {
  const data = getConsultationResponses(req)
  const consultee = req.crConsultee
  const reps = crRepViews(data).filter(view => view.consulteeId === consultee.id).sort(crNewestFirst)
  const allInReview = reps.length && reps.every(view => view.status === 'in-review')
  const rounds = CR_CONSULTATIONS
    .filter(round => round.id === CR_CONSULTATION.id || consultee.earlier.includes(round.id))
    .map(round => {
      const current = round.id === CR_CONSULTATION.id
      return {
        id: round.id,
        title: round.title,
        date: current ? reps[0].date : round.date,
        fileName: crConsulteeDocument(consultee, round.id).fileName,
        current,
        statusLabel: current ? (allInReview ? 'In review' : 'Pending response') : 'Response sent',
        statusClass: current ? (allInReview ? 'dlp-cr-status--blue' : 'dlp-cr-status--orange') : 'dlp-cr-status--green'
      }
    })
    .reverse()
  const showResponses = req.query._view === 'responses'
  const selected = rounds.find(round => round.id === req.query._doc) || rounds[0]
  renderCr(req, res, 'consultee', 'view', {
    consultee,
    rounds,
    selected,
    document: crConsulteeDocument(consultee, selected.id),
    showResponses,
    reps
  })
})

// --- Manage response templates ---

router.get(CR + '/templates', (req, res) => {
  const data = getConsultationResponses(req)
  const views = crRepViews(data)
  const rows = []
  const missing = []
  CR_THEMES.forEach(theme => {
    const template = data.templates[theme.id]
    if (!template) return missing.push(theme)
    const themeViews = views.filter(view => view.themeId === theme.id)
    const consultees = crConsulteesInTheme(themeViews, theme.id)
    const assigned = consultees.filter(consultee =>
      themeViews.some(view => view.consulteeId === consultee.id && view.templateId === theme.id))
    rows.push({ theme, template, assigned: assigned.length, consultees: consultees.length })
  })
  renderCr(req, res, 'templates', 'templates', { rows, missing })
})

// --- Check and send for review ---

const CR_CHECK_STATUSES = [
  { value: 'outstanding', text: 'Not ready to send' },
  { value: 'draft', text: 'Draft' },
  { value: 'ready', text: 'Ready for review' },
  { value: 'changes', text: 'Needs changes' },
  { value: 'in-review', text: 'In review' }
]
const CR_REVIEW_STATUSES = [
  { value: 'not-sent', text: 'Not sent for review' },
  { value: 'sent', text: 'Sent for review' }
]
const CR_SORTS = [
  { value: 'updated', text: 'Recently updated' },
  { value: 'respondent', text: 'Respondent (A to Z)' },
  { value: 'policy', text: 'Policy' }
]

function crCheckFilters (sessionData) {
  return {
    search: crText(sessionData.crcSearch),
    theme: crPick(sessionData.crcTheme, CR_THEMES.map(theme => theme.id)),
    policy: crPick(sessionData.crcPolicy, CR_POLICIES.map(policy => policy.ref)),
    respondentType: crPick(sessionData.crcRespondentType, CR_RESPONDENT_TYPES),
    commentType: crPick(sessionData.crcCommentType, CR_COMMENT_TYPES),
    status: crPick(sessionData.crcStatus, CR_CHECK_STATUSES.map(status => status.value)),
    review: crPick(sessionData.crcReview, CR_REVIEW_STATUSES.map(status => status.value)),
    sort: crPick(sessionData.crcSort, CR_SORTS.map(sort => sort.value)) || 'updated'
  }
}

function crMatchesCheck (view, filters) {
  if (filters.theme && view.themeId !== filters.theme) return false
  if (filters.policy && view.policyRef !== filters.policy) return false
  if (filters.respondentType && view.respondentType !== filters.respondentType) return false
  if (filters.commentType && view.commentType !== filters.commentType) return false
  if (filters.status === 'outstanding' && !view.outstanding) return false
  if (filters.status && filters.status !== 'outstanding' && view.status !== filters.status) return false
  if (filters.review === 'sent' && view.status !== 'in-review') return false
  if (filters.review === 'not-sent' && view.status === 'in-review') return false
  if (filters.search) {
    const haystack = [view.consulteeName, view.id, view.text, view.responseText].join(' ').toLowerCase()
    if (!haystack.includes(filters.search.toLowerCase())) return false
  }
  return true
}

const CR_SORTERS = {
  updated: (a, b) => (a.updated === b.updated ? (a.id < b.id ? -1 : 1) : (a.updated < b.updated ? 1 : -1)),
  respondent: (a, b) => a.consulteeName.localeCompare(b.consulteeName) || (a.id < b.id ? -1 : 1),
  policy: (a, b) => a.policyRef.localeCompare(b.policyRef, 'en', { numeric: true }) || (a.id < b.id ? -1 : 1)
}

router.get(CR + '/check', (req, res) => {
  const data = getConsultationResponses(req)
  const views = crRepViews(data)
  const filters = crCheckFilters(req.session.data)
  const byTheme = req.query._view === 'themes'
  const matching = views.filter(view => crMatchesCheck(view, filters)).sort(CR_SORTERS[filters.sort])
  const pageCount = Math.ceil(matching.length / CR_PAGE_SIZE)
  const page = crPageNumber(req.query._page, pageCount)
  const themeRows = CR_THEMES.map(theme => {
    const readiness = crReadiness(views.filter(view => view.themeId === theme.id))
    return Object.assign({ theme }, readiness)
  })
  renderCr(req, res, 'check', 'check', {
    filters,
    byTheme,
    readiness: crReadiness(views),
    themeCount: CR_THEMES.length,
    themeRows,
    results: matching.slice((page - 1) * CR_PAGE_SIZE, page * CR_PAGE_SIZE),
    resultCount: matching.length,
    page,
    pageCount,
    options: crFilterOptions(),
    statuses: CR_CHECK_STATUSES,
    reviewStatuses: CR_REVIEW_STATUSES,
    sorts: CR_SORTS,
    lastUpdated: crDate(crToday(), true)
  })
})

// Marks the ticked responses ready. Only a response with an officer and some wording can be;
// the rest are left alone and the message says how many and why.
router.post(CR + '/check/mark-ready', (req, res) => {
  const data = getConsultationResponses(req)
  const ids = [].concat(req.body._repIds || [])
  let marked = 0
  let skipped = 0
  ids.forEach(id => {
    const rep = getCrRepresentation(id)
    if (!rep) return
    const view = crRepView(data, rep)
    if (view.status === 'in-review') return
    if (!view.hasResponse || !view.officer) { skipped++; return }
    data.reps[id].status = 'ready'
    data.reps[id].updated = crToday()
    marked++
  })
  let message = marked + ' response' + (marked === 1 ? '' : 's') + ' marked ready for review'
  if (skipped) message += '. ' + skipped + ' could not be marked because ' + (skipped === 1 ? 'it has' : 'they have') + ' no officer or no response yet'
  crFlash(req, message)
  res.redirect(CR + '/check' + (req.body._page ? '?_page=' + encodeURIComponent(req.body._page) : ''))
})

router.post(CR + '/check/send', (req, res) => {
  const data = getConsultationResponses(req)
  let sent = 0
  crRepViews(data).forEach(view => {
    if (view.status === 'ready' && view.officer) {
      data.reps[view.id].status = 'in-review'
      data.reps[view.id].updated = crToday()
      sent++
    }
  })
  crFlash(req, sent
    ? sent + ' response' + (sent === 1 ? '' : 's') + ' sent to the Planning Policy review team'
    : 'There were no ready responses to send')
  res.redirect(CR + '/check')
})

router.get(CR + '/review', (req, res) => {
  renderCr(req, res, 'review', 'review')
})

// --- Side-by-side views (alternative pathway) ---
//
// Both list the representations matching four sticky filters (crTheme, crPolicy,
// crRespondentType, crCommentType — the kit stores them from the query string) and show the
// selected one beside the same respondent's earlier representation and the LPA's published
// reply to it. The officer drafts a response; the inspector comments.

// Select options for the filters, as { value, text }.
function crFilterOptions () {
  return {
    themes: CR_THEMES.map(theme => ({ value: theme.id, text: theme.title })),
    policies: CR_POLICIES.map(policy => ({ value: policy.ref, text: policy.ref + ' — ' + policy.title })),
    respondentTypes: CR_RESPONDENT_TYPES.map(type => ({ value: type, text: type })),
    commentTypes: CR_COMMENT_TYPES.map(type => ({ value: type, text: type }))
  }
}

function crSideBySideFilters (sessionData) {
  return {
    theme: crPick(sessionData.crTheme, CR_THEMES.map(theme => theme.id)),
    policy: crPick(sessionData.crPolicy, CR_POLICIES.map(policy => policy.ref)),
    respondentType: crPick(sessionData.crRespondentType, CR_RESPONDENT_TYPES),
    commentType: crPick(sessionData.crCommentType, CR_COMMENT_TYPES)
  }
}

function crSideBySide (req, data) {
  const filters = crSideBySideFilters(req.session.data)
  const matching = crRepViews(data).filter(view => crMatchesCheck(view, filters)).sort(crNewestFirst)
  const pageCount = Math.ceil(matching.length / CR_SIDE_BY_SIDE_PAGE_SIZE)
  let selected = matching.find(view => view.id === req.query._rep) || null
  // A representation linked to directly is shown even if the filters have moved on since.
  if (!selected && req.query._rep) {
    const rep = getCrRepresentation(req.query._rep)
    if (rep) selected = crRepView(data, rep)
  }
  const selectedIndex = selected ? matching.findIndex(view => view.id === selected.id) : -1
  const page = req.query._page
    ? crPageNumber(req.query._page, pageCount)
    : (selectedIndex >= 0 ? Math.floor(selectedIndex / CR_SIDE_BY_SIDE_PAGE_SIZE) + 1 : 1)
  const pageItems = matching.slice((page - 1) * CR_SIDE_BY_SIDE_PAGE_SIZE, page * CR_SIDE_BY_SIDE_PAGE_SIZE)
  if (!selected) selected = pageItems[0] || null

  const theme = getCrTheme(filters.theme)
  const policy = CR_POLICIES.find(candidate => candidate.ref === filters.policy)
  const summary = [theme ? theme.title : 'All themes', policy ? policy.ref + ' — ' + policy.title : 'All policies']
  return {
    filters,
    filterSummary: summary.join(' · '),
    matching,
    pageItems,
    page,
    pageCount,
    firstItem: matching.length ? (page - 1) * CR_SIDE_BY_SIDE_PAGE_SIZE + 1 : 0,
    lastItem: (page - 1) * CR_SIDE_BY_SIDE_PAGE_SIZE + pageItems.length,
    selected,
    options: crFilterOptions()
  }
}

router.get(CR + '/officer', (req, res) => {
  const data = getConsultationResponses(req)
  const view = crSideBySide(req, data)
  const templateOptions = CR_THEMES
    .filter(theme => data.templates[theme.id])
    .map(theme => ({ id: theme.id, title: theme.title, text: data.templates[theme.id].text, status: data.templates[theme.id].status }))
  renderCr(req, res, 'officer', 'view', Object.assign(view, {
    templateOptions,
    preview: req.query._preview === '1',
    sidebarOptions: { viewHref: CR + '/officer' }
  }))
})

// Save, mark ready or preview. A response whose wording is still exactly the chosen template's is
// stored as that template, so it keeps following edits to it; anything changed is the officer's own.
router.post(CR + '/officer/:repId', (req, res) => {
  const data = getConsultationResponses(req)
  const rep = getCrRepresentation(req.params.repId)
  if (!rep) return res.redirect(CR + '/officer')
  const state = data.reps[rep.id]
  const templateId = crPick(req.body._template, Object.keys(data.templates))
  const template = templateId ? data.templates[templateId] : null
  let text = crText(req.body._response)
  if (!text && template) text = template.text
  const action = ['save', 'ready', 'preview'].includes(req.body._action) ? req.body._action : 'save'
  const back = CR + '/officer?_rep=' + rep.id + (req.body._page ? '&_page=' + encodeURIComponent(req.body._page) : '')

  if (!text) {
    crSetErrors(req, { response: 'Enter an LPA response, or choose a template to start from' }, { template: templateId })
    return res.redirect(back + '#lpa-response')
  }
  state.response = template && text === template.text ? { templateId } : { text }
  state.officer = state.officer || CR_OFFICER
  state.updated = crToday()
  if (action === 'ready') {
    state.status = 'ready'
    crFlash(req, 'Response to ' + rep.id + ' marked ready for review')
  } else {
    state.status = 'draft'
    crFlash(req, action === 'preview' ? '' : 'Draft response to ' + rep.id + ' saved')
  }
  res.redirect(back + (action === 'preview' ? '&_preview=1#preview' : ''))
})

router.get(CR + '/inspector', (req, res) => {
  const data = getConsultationResponses(req)
  const view = crSideBySide(req, data)
  renderCr(req, res, 'inspector', 'inspector', Object.assign(view, {
    reviewedCount: view.matching.filter(rep => rep.inspectorReviewed).length,
    inspector: CR_INSPECTOR
  }))
})

router.post(CR + '/inspector/:repId', (req, res) => {
  const data = getConsultationResponses(req)
  const rep = getCrRepresentation(req.params.repId)
  if (!rep) return res.redirect(CR + '/inspector')
  const state = data.reps[rep.id]
  const back = CR + '/inspector?_rep=' + rep.id + (req.body._page ? '&_page=' + encodeURIComponent(req.body._page) : '')
  const text = crText(req.body._comment)

  if (req.body._action === 'reviewed') {
    state.inspectorReviewed = !state.inspectorReviewed
    if (text) state.inspectorComments.push({ author: CR_INSPECTOR, date: crToday(), text })
    crFlash(req, rep.id + (state.inspectorReviewed ? ' marked as reviewed' : ' marked as not reviewed'))
    return res.redirect(back)
  }
  if (!text) {
    crSetErrors(req, { comment: 'Enter a comment' })
    return res.redirect(back + '#inspector-comment')
  }
  state.inspectorComments.push({ author: CR_INSPECTOR, date: crToday(), text })
  crFlash(req, 'Comment saved on ' + rep.id)
  res.redirect(back + '#inspector-comments')
})
