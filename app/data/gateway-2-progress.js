//
// Illustrative progress status for the Gateway 2 progress check prototype.
//
// Neither the chapters (policies.js's policy areas) nor the evidence base (documents.js) carry
// a status of their own, so this file adds one on top of each, the same way plan-paragraphs.js
// adds paragraph content on top of policies.js for the Examination - inspector view prototype.
// ALL STATUS, OFFICER, BRIEF AND AUDIT LOG CONTENT HERE IS INVENTED ILLUSTRATIVE CONTENT.
//

// Keyed by the same policy area strings as routes.js's POLICY_AREAS. One of:
// 'Not started' | 'Brief prepared' | 'In progress' | 'Drafted' | 'Complete'
const CHAPTER_PROGRESS = {
  'Health, inclusion and safety': 'Complete',
  Housing: 'Drafted',
  Infrastructure: 'In progress',
  Design: 'In progress',
  Offices: 'Drafted',
  Retail: 'Brief prepared',
  'Culture and visitors': 'Brief prepared',
  'Heritage and Tall Buildings': 'Not started',
  'Open Spaces and Green Infrastructure': 'Not started',
  'Climate Resilience': 'In progress',
  Transport: 'Drafted'
}

// Keyed by the same document names as documents.js's DOCUMENTS. One of:
// 'Not yet procured' | 'In procurement' | 'Draft received' | 'Accepted version'
const EVIDENCE_PROGRESS = {
  'Local Housing Needs Assessment': 'Accepted version',
  'Heritage and Conservation Study': 'Draft received',
  'Green Belt Assessment': 'In procurement',
  'Stakeholder feedback': 'Accepted version',
  'Scoping Consultation 2024': 'Draft received'
}

// One or two officer names per chapter — a chapter with nobody assigned yet (the two "Not
// started" chapters) is left out rather than given a placeholder, so the page can show "Not
// assigned" the same way policy-writing/topics/index.html does for an unassigned topic.
const CHAPTER_OFFICERS = {
  'Health, inclusion and safety': ['Pauline Perrot'],
  Housing: ['Jomo Adeyemi', 'Pauline Perrot'],
  Infrastructure: ['Femi Okonkwo'],
  Design: ['Alys Whitfield'],
  Offices: ['Daniel Osei'],
  Retail: ['Marta Nowak'],
  'Culture and visitors': ['Alys Whitfield'],
  'Climate Resilience': ['Femi Okonkwo'],
  Transport: ['Daniel Osei', 'Marta Nowak']
}

// One short brief per chapter, same shape as Policy writer v2's chapter.brief (intro + a list of
// items) but without that shape's `refs` — those aren't real links in the v2 precedent either.
const CHAPTER_BRIEFS = {
  'Health, inclusion and safety': {
    intro: 'This chapter needs to:',
    items: [
      { text: 'Set an inclusive design standard that goes beyond the national minimum' },
      { text: 'Address air quality impacts from construction and operational phases' },
      { text: 'Reflect the findings of the Inclusive Design Access Audit' }
    ]
  },
  Housing: {
    intro: 'This chapter needs to:',
    items: [
      { text: "Direct new housing to locations that protect the area's business function" },
      { text: 'Balance household growth projections against brownfield land constraints' },
      { text: 'Set out clear expectations for residential amenity in a dense mixed-use environment' }
    ]
  },
  Infrastructure: {
    intro: 'This chapter needs to:',
    items: [
      { text: 'Require utility connections to be designed in from the outset' },
      { text: 'Set out how developments demonstrate available infrastructure capacity' },
      { text: 'Reflect engagement already had with utility providers' }
    ]
  },
  Design: {
    intro: 'This chapter needs to:',
    items: [
      { text: 'Establish a retrofit-first approach to major development' },
      { text: 'Require whole life-cycle carbon assessments on qualifying schemes' },
      { text: 'Set a proportionate threshold so smaller schemes are not over-burdened' }
    ]
  },
  Offices: {
    intro: 'This chapter needs to:',
    items: [
      { text: "Support modernisation of the borough's office stock" },
      { text: "Protect the area's primary business function" },
      { text: 'Allow flexibility where office space is genuinely no longer viable' }
    ]
  },
  Retail: {
    intro: 'This chapter needs to:',
    items: [
      { text: 'Protect the principal shopping centres as the focus for retail activity' },
      { text: 'Resist changes of use that would undermine town centre vitality' },
      { text: 'Consider flexibility for upper floors where retail demand has fallen' }
    ]
  },
  'Culture and visitors': {
    intro: 'This chapter needs to:',
    items: [
      { text: 'Resist the loss of existing cultural and leisure facilities' },
      { text: 'Define what counts as an acceptable replacement of equivalent quality' },
      { text: "Reflect the cultural infrastructure audit's findings on venue loss" }
    ]
  },
  'Heritage and Tall Buildings': {
    intro: 'This chapter needs to:',
    items: [
      { text: 'Set a positive strategy for the historic environment' },
      { text: 'Protect historic routes, spaces and roofscapes, not just individual buildings' },
      { text: 'Clarify how this policy interacts with the tall buildings policy' }
    ]
  },
  'Open Spaces and Green Infrastructure': {
    intro: 'This chapter needs to:',
    items: [
      { text: 'Protect existing open space and require new provision where pressure increases' },
      { text: 'Treat green infrastructure as a network rather than isolated sites' },
      { text: "Reflect the open space assessment's findings on local deficiency" }
    ]
  },
  'Climate Resilience': {
    intro: 'This chapter needs to:',
    items: [
      { text: 'Require development to follow the cooling hierarchy' },
      { text: 'Address overheating risk and the urban heat island effect' },
      { text: 'Reflect climate risk modelling for the plan period' }
    ]
  },
  Transport: {
    intro: 'This chapter needs to:',
    items: [
      { text: 'Require transport assessments addressing pedestrian comfort and servicing' },
      { text: 'Balance servicing needs against the capacity of the surrounding network' },
      { text: 'Encourage consolidation rather than blanket restriction' }
    ]
  }
}

// Same shape as Policy writer v2's chapter.history: {type, description, date, actor, status?}.
// A chapter's trail is written to be consistent with its CHAPTER_PROGRESS status above — further
// along chapters have a longer trail ending in a "Done" milestone, "Not started" chapters have
// none yet. Oldest first; appTimeline's caller reverses for newest-first display.
const CHAPTER_AUDIT_LOG = {
  'Health, inclusion and safety': [
    { type: 'Chapter created', description: 'Chapter created and HL1 Inclusive Buildings and Spaces drafted', date: '3 January 2024', actor: 'Pauline Perrot', status: 'Done' },
    { type: 'Evidence linked', description: 'Inclusive Design Access Audit and Public Realm and Wayfinding Study linked to HL1', date: '22 January 2024', actor: 'Pauline Perrot', status: 'Done' },
    { type: 'Consultation closed', description: 'Consultation responses reviewed and reflected in HL1 and HL2', date: '14 March 2024', actor: 'Pauline Perrot', status: 'Done' },
    { type: 'Chapter approved', description: 'Chapter signed off ready for submission', date: '2 April 2024', actor: 'Pauline Perrot', status: 'Done' }
  ],
  Housing: [
    { type: 'Chapter created', description: 'Chapter created and HS1 Location of New Housing drafted', date: '10 January 2024', actor: 'Jomo Adeyemi', status: 'Done' },
    { type: 'Evidence linked', description: 'Local Housing Needs Assessment linked to HS1', date: '2 February 2024', actor: 'Pauline Perrot', status: 'Done' },
    { type: 'Draft', description: 'Remaining housing policies drafted, awaiting review', date: '18 March 2024', actor: 'Jomo Adeyemi', status: '' }
  ],
  Infrastructure: [
    { type: 'Chapter created', description: 'Chapter created and IN1 Infrastructure provision and connection drafted', date: '20 February 2024', actor: 'Femi Okonkwo', status: 'Done' },
    { type: 'Draft', description: 'IN2 Infrastructure Capacity started', date: '18 March 2024', actor: 'Femi Okonkwo', status: '' }
  ],
  Design: [
    { type: 'Chapter created', description: 'Chapter created and DE1 Sustainable Design drafted', date: '25 February 2024', actor: 'Alys Whitfield', status: 'Done' },
    { type: 'Comment', description: 'Retrofit threshold queried by development industry, under review', date: '19 March 2024', actor: 'Alys Whitfield', status: '' }
  ],
  Offices: [
    { type: 'Chapter created', description: 'Chapter created and OF1 Office Development drafted', date: '15 January 2024', actor: 'Daniel Osei', status: 'Done' },
    { type: 'Evidence linked', description: 'Employment evidence linked to OF1', date: '9 February 2024', actor: 'Daniel Osei', status: 'Done' },
    { type: 'Draft', description: 'Chapter drafted, awaiting consultation summary', date: '20 March 2024', actor: 'Daniel Osei', status: '' }
  ],
  Retail: [
    { type: 'Brief agreed', description: 'Chapter brief agreed with policy lead', date: '12 March 2024', actor: 'Marta Nowak', status: 'Done' }
  ],
  'Culture and visitors': [
    { type: 'Brief agreed', description: 'Chapter brief agreed with policy lead', date: '14 March 2024', actor: 'Alys Whitfield', status: 'Done' }
  ],
  'Heritage and Tall Buildings': [],
  'Open Spaces and Green Infrastructure': [],
  'Climate Resilience': [
    { type: 'Chapter created', description: 'Chapter created and CR1 Overheating and Urban Heat Island Effect drafted', date: '1 March 2024', actor: 'Femi Okonkwo', status: 'Done' },
    { type: 'Draft', description: 'Cooling hierarchy wording under review', date: '21 March 2024', actor: 'Femi Okonkwo', status: '' }
  ],
  Transport: [
    { type: 'Chapter created', description: 'Chapter created and VT1 The Impacts of Development on Transport drafted', date: '5 February 2024', actor: 'Daniel Osei', status: 'Done' },
    { type: 'Evidence linked', description: 'Transport evidence linked to VT1', date: '27 February 2024', actor: 'Marta Nowak', status: 'Done' },
    { type: 'Draft', description: 'Chapter drafted, awaiting sign off', date: '25 March 2024', actor: 'Daniel Osei', status: '' }
  ]
}

// A chapter's five item statuses are derived from its overall CHAPTER_PROGRESS status rather
// than authored separately, so the detail table on the chapter page always agrees with the
// status already shown for that chapter on the Plan Progress page.
const STAGE_STATUS_BY_CHAPTER_STATUS = {
  'Not started': { brief: 'Not started', sources: 'Not started', evidence: 'Not started', representations: 'Not started', policyText: 'Not started' },
  'Brief prepared': { brief: 'Completed', sources: 'Not started', evidence: 'Not started', representations: 'Not started', policyText: 'Not started' },
  'In progress': { brief: 'Completed', sources: 'Completed', evidence: 'In progress', representations: 'In progress', policyText: 'In progress' },
  Drafted: { brief: 'Completed', sources: 'Completed', evidence: 'Completed', representations: 'Completed', policyText: 'In progress' },
  Complete: { brief: 'Completed', sources: 'Completed', evidence: 'Completed', representations: 'Completed', policyText: 'Completed' }
}

// A policy's own status (shown against each policy in the chapter page's Policy Text section)
// is derived from its chapter's overall status and whether it's one of the "full summary" worked
// examples (policy.hasSummary, computed by policies.js's getPoliciesForArea) — that policy
// already has evidence/consultation content behind it, so it's treated as ahead of the chapter's
// other policies rather than needing 82 independently authored statuses. Uses the same
// vocabulary as CHAPTER_PROGRESS ('Complete', not 'Completed'), so app/routes.js's
// CHAPTER_STATUS_COLOURS map already covers it.
const POLICY_STATUS_BY_CHAPTER_STATUS = {
  'Not started': { full: 'Not started', partial: 'Not started' },
  'Brief prepared': { full: 'Not started', partial: 'Not started' },
  'In progress': { full: 'In progress', partial: 'Not started' },
  Drafted: { full: 'Complete', partial: 'Drafted' },
  Complete: { full: 'Complete', partial: 'Complete' }
}

function getPolicyStatus (chapterStatus, hasSummary) {
  const statuses = POLICY_STATUS_BY_CHAPTER_STATUS[chapterStatus] || POLICY_STATUS_BY_CHAPTER_STATUS['Not started']
  return hasSummary ? statuses.full : statuses.partial
}

// Officer commentary shown under some (not all — illustrative, not exhaustive) Sources and
// Evidence items in the chapter page, in a govuk-inset-text "Officer notes" block. Kept here
// rather than on documents.js/evidence-excerpts.js since those are shared with other
// prototypes (Examination - inspector view, the Evidence prototype) and this commentary is
// specific to a Gateway 2 reviewer's read of the item, not part of the evidence base itself.
//
// Written for an external audience (the inspector reading this page), not as an internal
// note-to-self — each one explains what the evidence shows and how that connects to the policy
// content it supports, rather than flagging internal to-dos or caveats about the evidence base.
const SOURCE_OFFICER_NOTES = {
  'Local Housing Needs Assessment': 'This assessment provides the household growth projections and brownfield land supply analysis that the housing requirement in HS1 and the wider Housing chapter are based on.',
  'Heritage and Conservation Study': 'This study identifies the constraints on the scale and design of new development in and around conservation areas, and the historic routes and roofscapes that HE1 seeks to protect.'
}

// Keyed by "source|ref" since EVIDENCE_EXCERPTS entries (evidence-excerpts.js) have no single
// field that uniquely identifies one on its own.
const EVIDENCE_OFFICER_NOTES = {
  'Inclusive Design Access Audit|Paragraph 4.12': 'This finding — that step-free access and wayfinding are the two barriers raised most often — is the basis for HL1 setting an accessibility requirement above the national minimum.',
  'Air Quality Assessment|Paragraph 4.9': 'This identifies the specific street canyons where air quality objectives are exceeded, which HL2 requires development to address through the air quality neutral standard.',
  'Local Housing Needs Assessment|Chapter 3': 'This sets out the projected household growth over the plan period that the housing requirement figure in HS1 is drawn from.'
}

function getSourceOfficerNote (source) {
  return SOURCE_OFFICER_NOTES[source] || null
}

function getEvidenceOfficerNote (item) {
  return EVIDENCE_OFFICER_NOTES[item.source + '|' + item.ref] || null
}

function getChapterStatus (area) {
  return CHAPTER_PROGRESS[area] || 'Not started'
}

function getEvidenceStatus (source) {
  return EVIDENCE_PROGRESS[source] || 'Not yet procured'
}

function getChapterOfficers (area) {
  return CHAPTER_OFFICERS[area] || []
}

function getChapterBrief (area) {
  return CHAPTER_BRIEFS[area] || null
}

function getChapterAuditLog (area) {
  return CHAPTER_AUDIT_LOG[area] || []
}

function getStageStatuses (chapterStatus) {
  return STAGE_STATUS_BY_CHAPTER_STATUS[chapterStatus] || STAGE_STATUS_BY_CHAPTER_STATUS['Not started']
}

module.exports = {
  CHAPTER_PROGRESS,
  EVIDENCE_PROGRESS,
  CHAPTER_OFFICERS,
  CHAPTER_BRIEFS,
  CHAPTER_AUDIT_LOG,
  STAGE_STATUS_BY_CHAPTER_STATUS,
  POLICY_STATUS_BY_CHAPTER_STATUS,
  SOURCE_OFFICER_NOTES,
  EVIDENCE_OFFICER_NOTES,
  getChapterStatus,
  getEvidenceStatus,
  getChapterOfficers,
  getChapterBrief,
  getChapterAuditLog,
  getStageStatuses,
  getPolicyStatus,
  getSourceOfficerNote,
  getEvidenceOfficerNote
}
