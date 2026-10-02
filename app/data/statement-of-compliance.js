//
// Content for the Statement of compliance prototype.
//
// Regulation numbers and titles are genuine — The Town and Country Planning (Local Planning)
// (England) Regulations 2026 (SI 2026/186), Part 4 (Local Plans). Descriptions are this
// prototype's plain-English explanation of what each regulation requires, not quoted legal
// text. The audit log history, dates, officers and planned activities are entirely invented
// illustrative content for a fictional plan.
//
// A requirement's status is DERIVED from how much of its full history has happened yet in the
// draft snapshot (draftEntryCount), rather than stored separately — so "Partially met" always
// means "some but not all of this requirement's history has happened", not a second,
// independently-set signal that could disagree with the audit log shown underneath it. The
// "completed" variant always shows the full history and "Fully met" for every requirement.
//

const REQUIREMENTS = [
  {
    ref: 'Regulation 19',
    title: 'Notice of intention to commence local plan preparation',
    description: 'The authority must publish a notice setting out its intention to begin preparing a new local plan, before scoping consultation starts.'
  },
  {
    ref: 'Regulation 20',
    title: 'Scoping consultation: local plan',
    description: 'The authority must consult prescribed bodies and the public on the scope of the new local plan before settling its content.'
  },
  {
    ref: 'Regulation 21',
    title: 'Gateway 1: self-assessment of readiness for local plan preparation',
    description: 'The authority must complete and publish a self-assessment confirming it is ready to begin preparing the local plan, covering resourcing, evidence and governance.'
  },
  {
    ref: 'Regulation 22',
    title: 'Publication of summary of scoping consultation',
    description: 'The authority must publish a summary of the responses received during scoping consultation and how they have been taken into account.'
  },
  {
    ref: 'Regulation 23',
    title: 'Consultation on proposed local plan content and evidence',
    description: 'The authority must consult on the proposed content of the local plan and the evidence that supports it.'
  },
  {
    ref: 'Regulation 24',
    title: 'Publication of summary of consultation on proposed local plan content and evidence',
    description: 'The authority must publish a summary of responses to the consultation on proposed content and evidence, and how they have been taken into account.'
  },
  {
    ref: 'Regulation 25',
    title: 'Map of proposed local plan policies',
    description: "The authority must prepare and publish a map showing the geographic application of the plan's proposed policies."
  },
  {
    ref: 'Regulation 26',
    title: 'Gateway 2: observations and advice from an appointed person',
    description: 'An appointed person must review the proposed local plan at this stage and provide observations and advice before consultation on the full proposed plan begins.'
  },
  {
    ref: 'Regulation 27',
    title: 'Consultation on the proposed local plan',
    description: 'The authority must consult on the full proposed local plan, including its policies and supporting evidence, before submission.'
  },
  {
    ref: 'Regulation 28',
    title: 'Conformity with operative spatial development strategy',
    description: 'The authority must demonstrate that the proposed local plan is in general conformity with the operative spatial development strategy for its area.'
  },
  {
    ref: 'Regulation 30',
    title: 'Publication of summary of consultation on the proposed local plan',
    description: 'The authority must publish a summary of responses to consultation on the proposed local plan and how they have been taken into account.'
  },
  {
    ref: 'Regulation 34',
    title: 'Submission of documents and information to the Secretary of State',
    description: 'The authority must submit the proposed local plan and supporting documents and information to the Secretary of State for independent examination.'
  },
  {
    ref: 'Regulation 35',
    title: 'Independent examination: local plans',
    description: 'The proposed local plan must be independently examined to assess whether it is sound and has been prepared in accordance with legal and procedural requirements.'
  },
  {
    ref: 'Regulation 39',
    title: 'Adoption of a local plan',
    description: "The authority may adopt the local plan once the independent examiner's recommendations have been published and any required main modifications made."
  }
]

// history is each requirement's full, eventual audit trail (shown as-is for the "completed"
// variant). draftEntryCount is how many of those entries have happened yet in the "draft"
// snapshot — 0 entries means "Not yet met", some-but-not-all means "Partially met", all of
// them means "Fully met" (see getStatus). plannedActivity is shown only on the draft variant,
// for whatever hasn't happened yet.
const REQUIREMENT_DATA = {
  'Regulation 19': {
    history: [
      { type: 'Notice prepared', description: 'Notice of intention to commence local plan preparation drafted and approved by committee.', date: '28 April 2026', actor: 'Pauline Perrot', status: 'Done' },
      { type: 'Notice published', description: 'Notice of intention published on the council website and in the local press.', date: '5 May 2026', actor: 'Pauline Perrot', status: 'Done', document: 'Notice of intention to commence local plan preparation' }
    ],
    draftEntryCount: 2,
    plannedActivity: null
  },
  'Regulation 20': {
    history: [
      { type: 'Consultation launched', description: 'Scoping consultation opened, inviting views from prescribed bodies and the public on the scope of the new plan.', date: '2 June 2026', actor: 'Jomo Adeyemi', status: 'Done', document: 'Scoping consultation document' },
      { type: 'Consultation closed', description: 'Scoping consultation closed after six weeks.', date: '14 July 2026', actor: 'Jomo Adeyemi', status: 'Done' }
    ],
    draftEntryCount: 2,
    plannedActivity: null
  },
  'Regulation 21': {
    history: [
      { type: 'Self-assessment completed', description: 'Gateway 1 self-assessment of readiness completed, covering resourcing, evidence and governance.', date: '24 July 2026', actor: 'Pauline Perrot', status: 'Done' },
      { type: 'Self-assessment published', description: 'Gateway 1 self-assessment published alongside the committee report.', date: '28 July 2026', actor: 'Pauline Perrot', status: 'Done', document: 'Gateway 1 self-assessment of readiness' }
    ],
    draftEntryCount: 2,
    plannedActivity: null
  },
  'Regulation 22': {
    history: [
      { type: 'Summary drafted', description: 'Summary of scoping consultation responses drafted, setting out how they have been taken into account.', date: '4 August 2026', actor: 'Jomo Adeyemi', status: 'Done' },
      { type: 'Summary published', description: 'Summary of scoping consultation published on the council website.', date: '11 August 2026', actor: 'Jomo Adeyemi', status: 'Done', document: 'Summary of scoping consultation responses' }
    ],
    draftEntryCount: 2,
    plannedActivity: null
  },
  'Regulation 23': {
    history: [
      { type: 'Consultation launched', description: 'Consultation opened on the proposed content of the local plan and its supporting evidence.', date: '1 September 2026', actor: 'Femi Okonkwo', status: 'Done', document: 'Proposed local plan content and evidence consultation document' },
      { type: 'Consultation closed', description: 'Consultation on proposed content and evidence closed after six weeks.', date: '13 October 2026', actor: 'Femi Okonkwo', status: 'Done' }
    ],
    draftEntryCount: 2,
    plannedActivity: null
  },
  'Regulation 24': {
    history: [
      { type: 'Summary drafted', description: 'Summary of consultation responses on proposed content and evidence drafted.', date: '20 October 2026', actor: 'Femi Okonkwo', status: 'Done' },
      { type: 'Summary published', description: 'Summary of consultation on proposed content and evidence published.', date: '27 October 2026', actor: 'Femi Okonkwo', status: 'Done', document: 'Summary of consultation on proposed content and evidence' }
    ],
    draftEntryCount: 2,
    plannedActivity: null
  },
  'Regulation 25': {
    history: [
      { type: 'Map drafted', description: 'Draft policies map prepared, covering the majority of proposed allocation sites.', date: '3 November 2026', actor: 'Alys Whitfield', status: 'Done' },
      { type: 'Map finalised', description: 'Policies map finalised for all proposed allocation sites and published alongside the proposed plan.', date: '24 November 2026', actor: 'Alys Whitfield', status: 'Done', document: 'Policies map' }
    ],
    draftEntryCount: 1,
    plannedActivity: 'Finalise the policies map for all proposed allocation sites, planned for 24 November 2026.'
  },
  'Regulation 26': {
    history: [
      { type: 'Submitted for Gateway 2', description: 'Proposed local plan submitted for Gateway 2 review by an appointed person.', date: '17 November 2026', actor: 'Pauline Perrot', status: 'Done' },
      { type: 'Observations received', description: "Appointed person's observations and advice received and reported to committee.", date: '15 December 2026', actor: 'Pauline Perrot', status: 'Done', document: 'Gateway 2 observations and advice' }
    ],
    draftEntryCount: 1,
    plannedActivity: "Awaiting the appointed person's observations and advice on the Gateway 2 submission, expected by 15 December 2026."
  },
  'Regulation 27': {
    history: [
      { type: 'Consultation launched', description: 'Consultation opened on the full proposed local plan, incorporating Gateway 2 advice.', date: '12 January 2027', actor: 'Jomo Adeyemi', status: 'Done', document: 'Proposed local plan consultation document' },
      { type: 'Consultation closed', description: 'Consultation on the proposed local plan closed after six weeks.', date: '23 February 2027', actor: 'Jomo Adeyemi', status: 'Done' }
    ],
    draftEntryCount: 0,
    plannedActivity: 'Launch consultation on the full proposed local plan once Gateway 2 advice has been addressed, planned for January 2027.'
  },
  'Regulation 28': {
    history: [
      { type: 'Conformity statement prepared', description: 'Statement demonstrating general conformity of the proposed local plan with the operative spatial development strategy prepared.', date: '12 January 2027', actor: 'Daniel Osei', status: 'Done', document: 'Statement of conformity with the spatial development strategy' }
    ],
    draftEntryCount: 0,
    plannedActivity: 'Prepare the conformity statement against the operative spatial development strategy alongside the Regulation 27 consultation, planned for January 2027.'
  },
  'Regulation 30': {
    history: [
      { type: 'Summary drafted', description: 'Summary of consultation responses on the proposed local plan drafted.', date: '2 March 2027', actor: 'Jomo Adeyemi', status: 'Done' },
      { type: 'Summary published', description: 'Summary of consultation on the proposed local plan published.', date: '9 March 2027', actor: 'Jomo Adeyemi', status: 'Done', document: 'Summary of consultation on the proposed local plan' }
    ],
    draftEntryCount: 0,
    plannedActivity: 'Publish the summary of consultation on the proposed local plan following close of the Regulation 27 consultation, planned for March 2027.'
  },
  'Regulation 34': {
    history: [
      { type: 'Documents submitted', description: 'Proposed local plan and supporting documents and information submitted to the Secretary of State.', date: '23 March 2027', actor: 'Pauline Perrot', status: 'Done', document: 'Submission documents and information' }
    ],
    draftEntryCount: 0,
    plannedActivity: 'Submit the plan and supporting documents to the Secretary of State once consultation responses have been considered, planned for March 2027.'
  },
  'Regulation 35': {
    history: [
      { type: 'Examination opened', description: 'Independent examination opened, with hearing sessions held over six weeks.', date: '18 May 2027', actor: 'Pauline Perrot', status: 'Done' },
      { type: "Examiner's report published", description: "Examiner's recommendations and reasons published, confirming the plan is sound subject to main modifications.", date: '20 September 2027', actor: 'Pauline Perrot', status: 'Done', document: "Examiner's report and recommendations" }
    ],
    draftEntryCount: 0,
    plannedActivity: 'Independent examination hearing sessions anticipated to begin May 2027.'
  },
  'Regulation 39': {
    history: [
      { type: 'Main modifications consulted on', description: "Consultation held on the examiner's recommended main modifications.", date: '4 October 2027', actor: 'Marta Nowak', status: 'Done' },
      { type: 'Plan adopted', description: 'Local plan adopted by full council.', date: '8 December 2027', actor: 'Marta Nowak', status: 'Done', document: 'Adopted local plan' }
    ],
    draftEntryCount: 0,
    plannedActivity: "Adopt the plan following receipt of the examiner's report and any main modifications, planned for winter 2027."
  }
}

function getRequirements () {
  return REQUIREMENTS
}

function getRequirement (ref) {
  return REQUIREMENTS.find(requirement => requirement.ref === ref) || null
}

function getStatus (ref, variant) {
  if (variant === 'completed') return 'Fully met'

  const data = REQUIREMENT_DATA[ref]
  if (!data || data.draftEntryCount === 0) return 'Not yet met'
  if (data.draftEntryCount < data.history.length) return 'Partially met'
  return 'Fully met'
}

// Hrefs are pre-encoded here rather than in the template, same reason as elsewhere in this
// project (POLICY_AREA_LINKS, Gateway 2's evidence links) — a document's title can contain
// spaces and punctuation that need encoding for the URL.
function getHistory (ref, variant) {
  const data = REQUIREMENT_DATA[ref]
  if (!data) return []

  const entries = variant === 'completed' ? data.history : data.history.slice(0, data.draftEntryCount)

  return entries.map(entry => Object.assign({}, entry, {
    documentHref: entry.document ? '/statement-of-compliance/documents/' + encodeURIComponent(entry.document) : null
  }))
}

function getPlannedActivity (ref, variant) {
  if (variant !== 'draft') return null

  const data = REQUIREMENT_DATA[ref]
  return data ? data.plannedActivity : null
}

// Every document referenced anywhere in REQUIREMENT_DATA's history, regardless of variant —
// used to validate the document viewer route rather than rendering a page for any arbitrary
// title typed into the URL.
const DOCUMENT_TITLES = Array.from(new Set(
  Object.values(REQUIREMENT_DATA)
    .flatMap(data => data.history)
    .map(entry => entry.document)
    .filter(Boolean)
))

function isKnownDocument (title) {
  return DOCUMENT_TITLES.includes(title)
}

module.exports = {
  REQUIREMENTS,
  DOCUMENT_TITLES,
  getRequirements,
  getRequirement,
  getStatus,
  getHistory,
  getPlannedActivity,
  isKnownDocument
}
