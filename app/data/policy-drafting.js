//
// Static reference data for the "Policy drafting with starting points" prototype
// (/policy-writing-drafting). Nothing here is mutated by a route — what the user changes lives in
// req.session.data.policyDrafting, seeded from session-data-defaults.js.
//
// Content follows the Figma designs for this journey. Officers, the evidence library, the
// consultation summary and the document extracts are invented prototype content.
//
// The national requirements are real: paragraph references are to the National Planning Policy
// Framework published in August 2026 (policy code, then paragraph number within that policy, so
// "HO1.2" is policy HO1, paragraph 2). The substance is accurate but the wording is summarised
// for the prototype rather than quoted — keep that caveat on any new entry.
//

const { POLICIES, getPoliciesForArea } = require('./policies.js')

const OFFICERS = [
  { id: 'sarah-jenkins', name: 'Sarah Jenkins', role: 'Principal Policy Officer' },
  { id: 'james-chen', name: 'James Chen', role: 'Senior Planning Officer' },
  { id: 'priya-sharma', name: 'Priya Sharma', role: 'Planning Policy Officer' },
  { id: 'tom-okafor', name: 'Tom Okafor', role: 'Planning Policy Officer' },
  { id: 'helen-marsh', name: 'Helen Marsh', role: 'Policy Team Leader' },
  { id: 'daniel-reyes', name: 'Daniel Reyes', role: 'Graduate Planner' }
]

// Shown beside the brief and the explanatory text, for the drafter to cut and paste from.
// See the note at the top of this file: real NPPF references, summarised wording.
const NPPF_URL = 'https://assets.publishing.service.gov.uk/media/6aabe97844ec1aa417346c0b/National_Planning_Policy_Framework.pdf'

const NATIONAL_REQUIREMENTS = [
  {
    ref: 'PM2.1',
    title: 'Local plans',
    text: 'Local plans should set out a positive vision, supported by no more than ten measurable outcomes, and a spatial strategy with allocations and designations covering at least 10 years from adoption. Other policies should be included only where they support specific allocated sites or address particular local issues.',
    chapters: ['*']
  },
  {
    ref: 'HO1.2',
    title: 'Assessing the need for homes',
    text: 'Development plans should take into account an assessment of the size, type and tenure of housing needed for different groups, including those who need affordable housing (including Social Rent), older people, disabled people, people who rent and families with children.',
    chapters: ['Housing']
  },
  {
    ref: 'HO5.1',
    title: 'Meeting the needs of different groups',
    text: 'The development plan should set out policies for the housing needs of different groups, including requirements for the type and mix of affordable housing and the minimum proportion of Social Rent homes required as part of major development.',
    chapters: ['Housing']
  },
  {
    ref: 'PM12.3',
    title: 'Developer contributions',
    text: 'Policy requirements should include the levels and types of affordable housing and other infrastructure required, be set so that planned development remains deliverable, and express affordable housing requirements as a single figure rather than a range.',
    chapters: ['Housing', 'Infrastructure']
  },
  {
    ref: 'W1.1',
    title: 'Planning for energy and water',
    text: 'The development plan should be informed by early engagement with utility providers, regulators and network operators, so there is a clear understanding of energy, water, drainage and wastewater capacity and any additional infrastructure needed.',
    chapters: ['Infrastructure', 'Climate Resilience']
  },
  {
    ref: 'HC1.1',
    title: 'Planning for healthy communities',
    text: 'Development plans should be informed by existing deficits in community facilities and public service infrastructure, local health needs and opportunities to reduce inequalities; set out the facilities and contributions expected from development; and set local standards for recreational land and facilities.',
    chapters: ['Health, inclusion and safety', 'Open Spaces and Green Infrastructure']
  },
  {
    ref: 'P5.1',
    title: 'Maintaining public safety and security',
    text: 'Development proposals should anticipate and address malicious threats and other hazards, for their occupiers and users (especially groups vulnerable to crime or the fear of crime, such as women and girls) and in places where large numbers of people gather, such as transport hubs and night-time economy venues.',
    chapters: ['Health, inclusion and safety', 'Design']
  },
  {
    ref: 'DP1.1',
    title: 'A strategy for design',
    text: 'Development plans should set clear design expectations: a vision reflecting the desired design and placemaking outcomes, informed by the area\'s existing character and by engagement, and identifying where design guides, codes and masterplans are needed.',
    chapters: ['Design', 'Heritage and Tall buildings']
  },
  {
    ref: 'DP3.1',
    title: 'Key principles for well-designed places',
    text: 'Development proposals should respond to their context so that they integrate with and enhance their surroundings. This should not preclude innovation or change, especially where an increased scale or density of development is justified.',
    chapters: ['Heritage and Tall buildings']
  },
  {
    ref: 'HE1.1',
    title: 'Planning for the historic environment',
    text: 'Development plans should set a positive strategy for the historic environment: identify heritage assets, including those most at risk, be informed by a proportionate heritage assessment, and take opportunities to draw on the historic environment through allocations, design guides and codes.',
    chapters: ['Heritage and Tall buildings', 'Culture and visitors']
  },
  {
    ref: 'E1.1',
    title: 'Providing the conditions for long-term economic growth',
    text: 'Development plans should set out a clear economic vision and strategy that takes a positive, proactive and realistic approach to sustainable economic growth, having regard to the Industrial Strategy, local business needs and market signals.',
    chapters: ['Offices', 'Culture and visitors']
  },
  {
    ref: 'TC1.1',
    title: 'Planning for town centres',
    text: 'Development plans should be informed by a strategy for town centres, considering the scope for additional floorspace, a broader mix of uses (including residential), markets, bringing vacant premises back into use and changes to town centre boundaries.',
    chapters: ['Retail', 'Culture and visitors']
  },
  {
    ref: 'CC1.1',
    title: 'Planning for climate change',
    text: 'Development plans should take a proactive approach to mitigating climate change and supporting the transition to net zero, and to adapting to it, taking into account extreme weather and long-term trends including overheating, drought, flood risk and water supply.',
    chapters: ['Climate Resilience']
  },
  {
    ref: 'F1.1',
    title: 'Assessing flood risk for plan-making',
    text: 'Development plans should be informed by an up-to-date strategic flood risk assessment that considers current and future flood risk from all sources, including cumulative impacts.',
    chapters: ['Climate Resilience']
  },
  {
    ref: 'N1.1',
    title: 'Identifying environmental opportunities and safeguards',
    text: 'Development plans should safeguard and enhance the natural environment, using Local Nature Recovery Strategies and other evidence to set out the hierarchy of designated sites and identify other features that need particular consideration.',
    chapters: ['Open Spaces and Green Infrastructure']
  },
  {
    ref: 'TR1.1',
    title: 'Vision-led approach to planning for transport',
    text: 'Sustainable transport should be considered from the earliest stages of plan-making, through early engagement with communities, transport authorities, providers and operators, and by aligning land use policies with Local Transport Plans and cycling and walking plans.',
    chapters: ['Transport', 'New Thames Crossings']
  },
  {
    ref: 'GB3.2',
    title: 'Altering existing Green Belt boundaries',
    text: 'Exceptional circumstances for altering Green Belt boundaries include an authority being unable to meet its identified need in full, having examined all other reasonable options, such as making as much use as possible of previously developed and underutilised land.',
    chapters: ['Grey belt release']
  }
]

function getRequirementsForChapter (chapterName) {
  return NATIONAL_REQUIREMENTS.filter(item =>
    item.chapters.includes('*') || item.chapters.includes(chapterName)
  )
}

// Evidence library statuses, each with the govuk-tag colour it renders in.
const LIBRARY_STATUS_COLOURS = {
  'Accepted version': 'green',
  'Draft received': 'blue',
  'In procurement': 'light-blue',
  'Not started': 'grey'
}

const SOURCE_TYPES = [
  'Evidence report',
  'Local evidence',
  'Guidance document',
  'National policy',
  'Research paper',
  'Local policy',
  'Consultation'
]

const PLANNING_DESIGNATIONS = ['Conservation area', 'Opportunity area', 'Central Activities Zone', 'Flood zone']

const SITES = ['Liverpool Street', 'Smithfield', 'Fleet Street', 'Aldgate', 'Barbican']

// The evidence library the "Add sources" search runs over. The first ten housing entries are
// the Figma search results, in the same order.
const EVIDENCE_LIBRARY = [
  { id: 'shma', name: 'Strategic Housing Market Assessment 2023 (SHMA)', type: 'Evidence report', status: 'Accepted version', areas: ['Housing'], keywords: 'housing need demand affordable market' },
  { id: 'nppf-housing', name: 'NPPF Housing requirements', type: 'National policy', status: 'Accepted version', areas: ['Housing'], keywords: 'housing supply national policy' },
  { id: 'consultation-g1', name: 'G1 Consultation responses', type: 'Consultation', status: 'Accepted version', areas: ['Housing', 'Health, inclusion and safety'], keywords: 'consultation responses housing policy' },
  { id: 'lhna-2025', name: 'Local Housing Needs Assessment 2025', type: 'Local evidence', status: 'Accepted version', areas: ['Housing'], keywords: 'housing policy need assessment' },
  { id: 'affordable-spd', name: 'Affordable Housing Supplementary Planning Document', type: 'Guidance document', status: 'Draft received', areas: ['Housing'], keywords: 'housing policy affordable guidance' },
  { id: 'brownfield-register', name: 'Brownfield Land Register and Capacity Study', type: 'Local evidence', status: 'In procurement', areas: ['Housing', 'Infrastructure'], designation: 'Opportunity area', keywords: 'housing policy brownfield capacity land' },
  { id: 'nppf-chapter-5', name: 'NPPF Chapter 6: Delivering a sufficient supply of homes', type: 'National policy', status: 'Draft received', areas: ['Housing'], keywords: 'housing policy supply homes national' },
  { id: 'hdt-action-plan', name: 'Housing Delivery Test (HDT) Action Plan', type: 'Evidence report', status: 'Not started', areas: ['Housing'], keywords: 'housing policy delivery test' },
  { id: 'gtaa', name: 'Gypsy and Traveller Accommodation Assessment (GTAA)', type: 'Evidence report', status: 'Draft received', areas: ['Housing', 'Health, inclusion and safety'], keywords: 'housing policy accommodation traveller' },
  { id: 'btr-viability', name: 'Build to Rent Market Analysis & Viability Report', type: 'Research paper', status: 'Accepted version', areas: ['Housing'], keywords: 'housing policy build to rent viability' },
  { id: 'inclusionary-zoning', name: 'Inclusionary Zoning and Affordable Housing Delivery', type: 'Research paper', status: 'Not started', areas: ['Housing'], keywords: 'housing policy affordable zoning' },
  { id: 's106-guide', name: 'Section 106 Affordable Housing Contributions Guide', type: 'Guidance document', status: 'Draft received', areas: ['Housing', 'Infrastructure'], keywords: 'housing policy section 106 contributions' },
  { id: 'draft-h1', name: 'Draft Local Plan Policy H1: Affordable Housing', type: 'Local policy', status: 'Not started', areas: ['Housing'], keywords: 'housing policy draft affordable' },
  { id: 'older-persons-study', name: 'Older Persons Housing Needs Study', type: 'Research paper', status: 'In procurement', areas: ['Housing', 'Health, inclusion and safety'], keywords: 'housing policy older people specialist' },
  { id: 'student-accommodation', name: 'Student Accommodation Demand Study', type: 'Evidence report', status: 'Draft received', areas: ['Housing'], site: 'Aldgate', keywords: 'housing policy student hostels' },
  { id: 'short-let-monitoring', name: 'Short-term Letting Monitoring Report', type: 'Local evidence', status: 'Accepted version', areas: ['Housing'], keywords: 'housing policy short term letting' },
  { id: 'residential-amenity', name: 'Residential Amenity and Noise Study', type: 'Research paper', status: 'Not started', areas: ['Housing', 'Design'], designation: 'Central Activities Zone', keywords: 'housing policy residential environment noise' },
  { id: 'housing-design-guide', name: 'Housing Design Standards Guide', type: 'Guidance document', status: 'Accepted version', areas: ['Housing', 'Design'], keywords: 'housing policy quality standards design' },
  { id: 'self-build-register', name: 'Self and Custom Build Register Annual Return', type: 'Local evidence', status: 'Accepted version', areas: ['Housing'], keywords: 'housing policy self build custom' },
  { id: 'housing-topic-paper', name: 'Housing Topic Paper', type: 'Evidence report', status: 'Draft received', areas: ['Housing'], keywords: 'housing policy supply deliverability' },
  { id: 'viability-assessment', name: 'Local Plan Viability Assessment', type: 'Evidence report', status: 'In procurement', areas: ['Housing', 'Infrastructure'], keywords: 'housing policy viability' },
  { id: 'smithfield-capacity', name: 'Smithfield Area Capacity Study', type: 'Local evidence', status: 'Not started', areas: ['Housing', 'Culture and visitors'], site: 'Smithfield', designation: 'Conservation area', keywords: 'housing policy capacity site' },
  { id: 'liverpool-street-framework', name: 'Liverpool Street Area Framework', type: 'Local policy', status: 'Draft received', areas: ['Housing', 'Offices', 'Transport'], site: 'Liverpool Street', designation: 'Opportunity area', keywords: 'housing policy area framework' },
  { id: 'housing-register-analysis', name: 'Housing Register Analysis 2025', type: 'Local evidence', status: 'Accepted version', areas: ['Housing'], keywords: 'housing policy register waiting list' },
  { id: 'hia-framework', name: 'Health Impact Assessment Framework', type: 'Guidance document', status: 'Accepted version', areas: ['Health, inclusion and safety'], keywords: 'health impact assessment wellbeing' },
  { id: 'transport-capacity', name: 'Transport Capacity Study', type: 'Evidence report', status: 'Accepted version', areas: ['Transport', 'Infrastructure'], keywords: 'transport capacity network' },
  { id: 'employment-land-review', name: 'Employment Land Review', type: 'Evidence report', status: 'Accepted version', areas: ['Offices'], keywords: 'offices employment floorspace' },
  { id: 'town-centre-health-check', name: 'Town Centre Health Check 2024', type: 'Local evidence', status: 'Accepted version', areas: ['Retail'], keywords: 'retail vacancy town centre' },
  { id: 'sfra', name: 'Strategic Flood Risk Assessment', type: 'Evidence report', status: 'Draft received', areas: ['Climate Resilience'], designation: 'Flood zone', keywords: 'flood risk climate' },
  { id: 'urban-greening', name: 'Biodiversity and Urban Greening Study', type: 'Research paper', status: 'In procurement', areas: ['Open Spaces and Green Infrastructure'], keywords: 'greening biodiversity open space' },
  { id: 'tall-buildings', name: 'Tall Buildings and Views Study', type: 'Evidence report', status: 'Not started', areas: ['Heritage and Tall buildings', 'Design'], designation: 'Conservation area', keywords: 'heritage tall buildings views' }
]

function getLibrarySource (id) {
  return EVIDENCE_LIBRARY.find(source => source.id === id)
}

// A plain AND-of-words search over name and keywords, with the four filters from the design.
function searchLibrary ({ query, type, area, designation, site }) {
  const words = String(query || '').toLowerCase().split(/\s+/).filter(Boolean)

  return EVIDENCE_LIBRARY.filter(source => {
    const haystack = (source.name + ' ' + source.keywords).toLowerCase()
    if (!words.every(word => haystack.includes(word))) return false
    if (type && source.type !== type) return false
    if (area && !source.areas.includes(area)) return false
    if (designation && source.designation !== designation) return false
    if (site && source.site !== site) return false
    return true
  })
}

// The type-ahead's suggestions on the Add sources page: every topic word used to describe the
// library, then every source by name, each with how many sources a search for it returns. Only
// terms that return something are offered, so a suggestion never leads to an empty page.
// Built once on first use — the library is static.
let librarySearchTerms = null

function getLibrarySearchTerms () {
  if (librarySearchTerms) return librarySearchTerms

  const stopWords = ['and', 'the', 'for', 'with', 'of', 'to', 'in', 'on', 'a', 'term', 'test']
  const words = new Set()
  EVIDENCE_LIBRARY.forEach(source => {
    source.keywords.split(/\s+/).forEach(word => {
      if (word.length > 2 && !stopWords.includes(word)) words.add(word)
    })
  })

  const topics = [...words].sort().map(word => ({
    term: word,
    kind: 'Topic',
    count: searchLibrary({ query: word }).length
  }))
  const sources = EVIDENCE_LIBRARY.map(source => ({ term: source.name, kind: 'Source', count: 1 }))

  librarySearchTerms = topics.concat(sources).filter(option => option.count > 0)
  return librarySearchTerms
}

// What the evidence viewer shows on the draft policy page, keyed by library id. Either a
// document extract ("document") or a consultation summary ("consultation"). Sources without an
// entry show a short "no extract" message rather than failing.
const VIEWER_CONTENT = {
  // An abridged extract of the City of London's real Strategic Housing Market Assessment (City
  // Plan 2040, September 2023). Figures, table data and paragraph numbers are as published; the
  // paragraphs are shortened for the prototype, and the viewer says so. Blocks are numbered
  // paragraphs, section headings ({ heading }) or tables ({ table }).
  shma: {
    kind: 'document',
    title: 'City Plan 2040: Strategic Housing Market Assessment',
    section: 'City of London Corporation, Department of the Built Environment — September 2023',
    sourceUrl: 'https://www.cityoflondon.gov.uk/assets/Services-Environment/housing-needs-assessment-2023-city-plan-2040.pdf',
    blocks: [
      { heading: '2 Introduction and context' },
      { number: '2.2', text: 'The London Plan 2021 sets out ten-year targets for net housing completions that each local authority should plan to deliver. It treats London as a single housing market area, so boroughs are no longer required to carry out their own needs assessment but must plan for and seek to deliver the targets set for them. The London Plan’s ten-year target for the City of London is 1,460 new homes between 2019/20 and 2028/29 (146 annually).' },
      { number: '2.3', text: 'Although London authorities are not required to undertake individual housing needs assessments, the City Corporation has assessed need using the national standard methodology to provide context for the London Plan target. Through this method need has been assessed as 102 new homes annually. As this is lower than the London Plan target, the target for the City is set at 146 annually until further review by the GLA or DLUHC.' },
      { number: '2.4', text: 'The population of the City of London was around 8,600 in the 2021 Census, up from around 7,400 in 2011 — an increase of 16.6% against an England figure of 6.6%. Table 2 shows the projected change in households from 2023 to 2043.' },
      {
        table: {
          caption: 'Table 2: Projected changes in City of London household population and size 2023–43',
          head: ['Year', 'Number of households', 'Household population', 'Average household size'],
          rows: [
            ['2023', '4,328', '8,712', '2.01'],
            ['2033', '4,586', '9,094', '1.98'],
            ['2043', '4,848', '9,367', '1.93']
          ],
          source: 'Source: ONS – 2018 household projections'
        }
      },
      { number: '2.5', text: 'Some 98% of homes in the City are not conventional houses: 87% are flats or maisonettes, with the remainder shared dwellings, conversions or homes tied to commercial premises. Over half of residential properties have one or two bedrooms.' },
      { heading: '4 Affordable housing conclusion' },
      {
        table: {
          caption: 'Table 17: Estimated net housing need after adjustments and relet supply deductions (per annum)',
          head: ['Need or supply', 'Homes per year'],
          rows: [
            ['Current need (homeless or in temporary accommodation)', '26'],
            ['Existing households falling into need', '91'],
            ['Emerging need', '117'],
            ['Relet supply', '−131'],
            ['Net need', '103']
          ],
          source: 'Source: CoL Housing, projection modelling and affordability analysis'
        }
      },
      { number: '4.1', text: 'The standard methodology gives an initial figure of 102 homes a year, and this assessment estimates that all of those homes ideally need to be affordable, creating opportunity for social rent or private rent with supplement. The previous 2016 assessment estimated 104 homes a year, 69 of them affordable. The GLA target of 146 a year is currently being exceeded, so there is some scope for market housing.' },
      { number: '4.2', text: 'The City Corporation has 1,860 social rented properties, but only 451 (24%) are within the City itself, concentrated in the Golden Lane and Middlesex Street Estates. New out-of-area schemes in Islington (33 units) and Lewisham (55 units) will help address a waiting list of 920 households (May 2023).' }
    ],
    caveat: 'Abridged extract. Figures and tables are as published; paragraph wording is shortened for this prototype.'
  },
  'nppf-housing': {
    kind: 'document',
    title: 'NPPF Housing requirements',
    section: 'Chapter 6: Delivering a sufficient supply of homes',
    blocks: [
      { number: 'HO1.1', text: 'Spatial development strategies, and local plans where there is no spatial development strategy, should be based on a housing need assessment that establishes the minimum number of homes needed over the plan period using the standard method, an assessment of travellers\' accommodation needs, and an understanding of needs that cannot be met in neighbouring areas.' },
      { number: 'HO1.2', text: 'Development plans should also take into account the size, type and tenure of housing needed for different groups, including those who need affordable housing, older people, disabled people, people who rent and families with children.' },
      { number: 'HO5.1', text: 'The development plan should set requirements for the type and mix of affordable housing needed locally, including the minimum proportion of Social Rent homes in major development.' }
    ],
    caveat: 'Summarised for this prototype from the National Planning Policy Framework (August 2026), not quoted.'
  },
  'consultation-g1': {
    kind: 'consultation',
    chapters: ['Housing'],
    title: 'Consultation responses summary',
    section: 'Housing chapter',
    total: 650,
    summary: 'Respondents were concerned about the location of new housing developments and their proximity to existing services. There was strong support for affordable housing provision, with many highlighting the need for social rent and key worker accommodation. Several respondents raised issues around building heights and the impact on the historic character of the area.',
    themes: [
      { name: 'Location of new housing', count: 271 },
      { name: 'Affordable housing provision', count: 342 },
      { name: 'Density and building heights', count: 223 },
      { name: 'Access to facilities and services', count: 198 }
    ]
  }
}

function getViewerContent (sourceId) {
  const content = VIEWER_CONTENT[sourceId]
  if (!content || content.kind !== 'consultation') return content || null
  // Worked out here so the template only has to print numbers.
  return Object.assign({}, content, {
    themes: content.themes.map(theme => Object.assign({}, theme, {
      percent: Math.round((theme.count / content.total) * 100)
    }))
  })
}

// Consultation summaries that cover a chapter, as library ids. The evidence viewer offers these
// alongside the chapter's own sources.
function getConsultationsForChapter (chapterName) {
  return Object.keys(VIEWER_CONTENT).filter(id =>
    VIEWER_CONTENT[id].kind === 'consultation' && VIEWER_CONTENT[id].chapters.includes(chapterName)
  )
}

// Suggested policy areas for a chapter, from the plan's contents in policies.js. Strategic
// policies (S1, S3 …) are left out; a drafter can add one with "+ Add policy" and mark it
// strategic on the draft page. Matched case-insensitively because the starting point names in the design capitalise
// differently from the policy areas ("Heritage and Tall buildings").
function getSuggestedPolicyAreas (chapterName) {
  const name = String(chapterName || '').toLowerCase()
  const area = [...new Set(POLICIES.map(policy => policy.policyArea))]
    .find(candidate => candidate.toLowerCase() === name)

  return getPoliciesForArea(area)
    .filter(policy => !/^S\d/.test(policy.ref))
    .map(policy => ({ ref: policy.ref, name: policy.title }))
}

module.exports = {
  OFFICERS,
  NPPF_URL,
  getRequirementsForChapter,
  LIBRARY_STATUS_COLOURS,
  SOURCE_TYPES,
  PLANNING_DESIGNATIONS,
  SITES,
  EVIDENCE_LIBRARY,
  getLibrarySource,
  searchLibrary,
  getLibrarySearchTerms,
  getViewerContent,
  getConsultationsForChapter,
  getSuggestedPolicyAreas
}
