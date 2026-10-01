// Static reference content for the Managing commissioned evidence prototype
// (/evidence/commissioned). Everything the user changes lives in session data instead, as
// `commissionedEvidence`, seeded in session-data-defaults.js.

// In the order the design lays them out, read across its two columns row by row.
const THEMES = [
  'Health, inclusion and safety',
  'Heritage and Tall Buildings',
  'Housing',
  'Design',
  'Infrastructure',
  'Open Spaces',
  'Offices',
  'Transport',
  'Retail',
  'Climate Resilience',
  'Culture and Visitors',
  'Spatial Strategy',
  'Strategic policy'
]

// The two people the prototype is seen as. The officer commissions the work; the consultant is
// external and only ever sees the submit-report screen.
const OFFICER = {
  name: 'Danny Dyer',
  role: 'Planning Policy Principal',
  email: 'danny.dyer@council.gov.uk'
}

const ASSIGNED_OFFICER = 'Sarah Mitchell'

const PREVIOUS_CONSULTANTS = [
  { id: 'elena-waters', name: 'Elena Waters', organisation: 'Waters Consultancy', email: 'elena@waters.co.uk' },
  { id: 'marcus-hale', name: 'Marcus Hale', organisation: 'Hale Planning Associates', email: 'marcus@haleplanning.co.uk' },
  { id: 'priya-nair', name: 'Priya Nair', organisation: 'Urban Insight Consulting', email: 'priya.nair@urbaninsight.co.uk' }
]

function getPreviousConsultant (id) {
  return PREVIOUS_CONSULTANTS.find(consultant => consultant.id === id)
}

// The themes ticked in the design's Create brief frame. "Start from the beginning" begins
// with these, so a tester isn't confronted with an empty form.
const DEFAULT_BRIEF_THEMES = [
  'Health, inclusion and safety',
  'Heritage and Tall Buildings',
  'Infrastructure',
  'Open Spaces',
  'Retail',
  'Climate Resilience',
  'Strategic policy'
]

// "Start from the beginning": nothing sent yet.
function startingCommission () {
  return {
    stage: 'not-started',
    status: 'draft',
    brief: {
      title: '',
      text: '',
      link: '',
      file: '',
      themes: DEFAULT_BRIEF_THEMES.slice(),
      consultant: null,
      consultantMode: 'previous',
      consultantId: '',
      newConsultant: { name: '', organisation: '', email: '' },
      assignedOfficer: ASSIGNED_OFFICER,
      sentBy: OFFICER.email,
      commencedOn: null
    },
    report: emptyReport(),
    summary: null,
    comments: [],
    notes: [],
    history: [],
    tags: [],
    acceptedOn: null
  }
}

function emptyReport () {
  return { title: '', content: '', paragraphs: [], links: [], files: [], file: null, submittedAt: null }
}

module.exports = {
  THEMES,
  OFFICER,
  ASSIGNED_OFFICER,
  PREVIOUS_CONSULTANTS,
  getPreviousConsultant,
  startingCommission,
  emptyReport
}
