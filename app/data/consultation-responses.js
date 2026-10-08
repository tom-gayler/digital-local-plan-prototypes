//
// Static content for the "Managing consultation responses" prototype
// (/consultations/managing-responses). Nothing here is mutated: what an officer changes —
// templates, assignments, statuses, uploads, inspector comments — lives in session data, seeded
// by startingState() below and read through getConsultationResponses in app/routes.js.
//
// Policy references are the City Plan 2040's own (the same ones app/data/policies.js uses).
// Consultees, representations and responses are invented for the prototype. Most
// representations are generated from short per-theme pools so the counts feel like a real
// consultation; the worked examples on the side-by-side views (REP-1048 and the three after it)
// are written out in full in KEY_REPRESENTATIONS.
//

const CURRENT_CONSULTATION = {
  id: 'proposed-plan',
  title: 'City Plan 2040 — Consultation on the proposed local plan',
  dates: '25 January – 22 March 2026'
}

// Every round, oldest first, named as in the new plan-making system: scoping (before the
// 30-month clock, at least 21 days), proposed plan content and evidence (after Gateway 1, at
// least 6 weeks) and the proposed local plan (after Gateway 2, at least 8 weeks). A consultee's
// history on the consultee page is drawn from these.
const CONSULTATIONS = [
  { id: 'scoping', title: 'Scoping consultation', month: 'January 2023', date: '2023-01-12', fileSuffix: 'Scoping_Response' },
  { id: 'plan-content', title: 'Consultation on proposed plan content and evidence', month: 'May 2024', date: '2024-05-12', fileSuffix: 'Plan_Content_Response' },
  { id: 'proposed-plan', title: 'Consultation on the proposed local plan', month: 'March 2026', date: null, fileSuffix: 'Proposed_Plan_Response' }
]

// How many people responded to the consultation in total. Themes count respondents against
// this. Most are members of the public counted from the import, which is why it is far more
// than the named consultees modelled below.
const TOTAL_RESPONDENTS = 267

const CURRENT_OFFICER = 'Priya Shah'
const OFFICERS = ['Priya Shah', 'Daniel Wu', 'Marcus Reed', 'Amina Yusuf']
const INSPECTOR = 'Inspector A. Rahman'

const RESPONDENT_TYPES = [
  'Statutory consultee',
  'Developer',
  'Planning consultant',
  'Community organisation',
  'Member of the public'
]

const COMMENT_TYPES = ['Support', 'Objection', 'Neutral']

const POLICIES = [
  { ref: 'S3', title: 'Housing' },
  { ref: 'HS1', title: 'Location of New Housing' },
  { ref: 'S4', title: 'Offices' },
  { ref: 'HL2', title: 'Air quality' },
  { ref: 'HL3', title: 'Noise' },
  { ref: 'HL5', title: 'Location and protection of social and community facilities' },
  { ref: 'VT1', title: 'The Impacts of Development on Transport' },
  { ref: 'AT1', title: 'Pedestrian Movement, Permeability and Wayfinding' },
  { ref: 'AT2', title: 'Active Travel including Cycling' },
  { ref: 'HE1', title: 'Managing Change to the Historic Environment' },
  { ref: 'HE3', title: 'Setting of the Tower of London World Heritage Site' },
  { ref: 'S12', title: 'Tall Buildings' },
  { ref: 'S13', title: 'Protected Views' },
  { ref: 'OS1', title: 'Protection and provision of open spaces' },
  { ref: 'OS2', title: 'Urban Greening' },
  { ref: 'CR2', title: 'Flood Risk' }
]

function getPolicy (ref) {
  return POLICIES.find(policy => policy.ref === ref) || { ref, title: ref }
}

// Each theme carries:
//   comments  - the pool generated representations draw their wording from
//   previous  - what a respondent said on the theme in the consultation on proposed plan content and
//               evidence, and how the LPA replied
//   ownResponse - wording for a seeded response written for one representation, not a template
//   template  - the seeded standard response, where the theme has one
const THEMES = [
  {
    id: 'building-heights',
    title: 'Building heights',
    respondents: 47,
    policies: ['S12', 'S13'],
    summary: 'Concerns about tall buildings impacting skyline views and overshadowing neighbouring properties. Support for height limits in conservation areas.',
    overview: 'Respondents expressed concerns about tall buildings impacting the skyline views and overshadowing neighbouring properties. There was strong support for height limits in conservation areas and around heritage assets. Several respondents noted that while they accept the need for higher density, building heights should be proportionate to the surrounding context and step down towards residential areas.',
    keyConcerns: [
      'Overshadowing of neighbouring residential properties, particularly to the south of proposed tall building clusters',
      'Loss of protected views across the City skyline, including views from the Thames Path',
      'Wind tunnelling effects at street level caused by clusters of tall buildings',
      'Lack of a clear maximum height policy in the draft plan, leaving decisions open to negotiation',
      'Impact on the setting of St Paul\'s Cathedral and other Grade I listed buildings'
    ],
    comments: [
      { type: 'Objection', text: 'The tall building areas are drawn too widely. The policy should set maximum heights for each area so that proposals are tested against a clear limit rather than negotiated case by case.' },
      { type: 'Objection', text: 'Clusters of tall buildings already cause uncomfortable wind conditions at street level. The policy should require wind microclimate testing at pre-application stage, not only at submission.' },
      { type: 'Support', text: 'We support the identification of the City Cluster as the focus for tall buildings, which protects the more sensitive edges of the City from incremental height.' },
      { type: 'Neutral', text: 'The supporting text should explain how cumulative effects will be assessed where several consented schemes in the same area have not yet been built.' }
    ],
    previous: {
      type: 'Neutral',
      text: 'The draft plan should say more about how the height of new buildings will relate to their surroundings, and how overshadowing of homes and open spaces will be assessed.',
      lpaResponse: 'The tall buildings policy has been revised to define the areas where tall buildings may be appropriate and to require daylight, sunlight and microclimate assessments for all tall building proposals.'
    },
    ownResponse: 'The Council has considered this representation. Policy S12 identifies the areas where tall buildings may be appropriate, and its supporting text has been amended to explain how cumulative effects of consented schemes will be assessed.',
    template: {
      status: 'draft',
      updated: '2026-10-02',
      text: 'The Council notes the concerns raised regarding building heights in the City. The draft Local Plan includes Policy S12, which sets out a framework for assessing tall building proposals, including requirements for microclimate assessments and consideration of impacts on heritage assets and protected views. The Council considers that this approach strikes the right balance between accommodating growth and protecting the City\'s character, and no change to the policy is proposed.'
    }
  },
  {
    id: 'facilities',
    title: 'Access to facilities',
    respondents: 89,
    policies: ['HL5'],
    summary: 'Strong demand for improved access to healthcare, schools and community centres in new developments. Requests for co-located services.',
    overview: 'Respondents asked for new development to bring healthcare, education and community space with it, particularly where new homes are planned. Many supported co-locating services in shared buildings, and several asked for the plan to protect existing community facilities from conversion to other uses.',
    keyConcerns: [
      'Shortage of GP and primary healthcare capacity close to new homes',
      'Loss of community space to commercial conversion',
      'No clear mechanism for securing new facilities through development',
      'Facilities not accessible to disabled people and older residents',
      'Opening hours of facilities in office buildings that close at weekends'
    ],
    comments: [
      { type: 'Objection', text: 'The policy protects existing facilities but does not require new ones. Large residential schemes should be required to provide or fund community space on site.' },
      { type: 'Support', text: 'We welcome the protection given to existing social and community facilities and the requirement for marketing evidence before any loss is accepted.' },
      { type: 'Neutral', text: 'Healthcare commissioners should be consulted on major schemes so that primary care capacity can be planned alongside new homes.' },
      { type: 'Objection', text: 'Facilities provided in office buildings are often closed in the evenings and at weekends. The policy should require community uses to be open when residents can use them.' }
    ],
    previous: {
      type: 'Support',
      text: 'We support the principle of protecting community facilities, but the plan should also identify where new facilities are needed.',
      lpaResponse: 'The plan now refers to the Infrastructure Delivery Plan, which identifies where new social and community infrastructure is needed over the plan period.'
    },
    ownResponse: 'The Council welcomes this representation. Policy HL5 has been amended to require the provision of community floorspace in large residential schemes where a need is identified in the Infrastructure Delivery Plan.',
    template: null
  },
  {
    id: 'noise-air',
    title: 'Noise and air quality',
    respondents: 63,
    policies: ['HL2', 'HL3'],
    summary: 'Residents raised concerns about construction noise, traffic pollution, and the need for green buffers between residential and commercial areas.',
    overview: 'Respondents were concerned about construction noise and dust, traffic pollution on the busiest streets, and late-night noise near homes. Many asked for green buffers between residential and commercial areas and for air quality to be monitored throughout construction.',
    keyConcerns: [
      'Construction noise and dust from several schemes at once',
      'Air pollution on the busiest streets, including Upper Thames Street',
      'Late-night servicing and deliveries near homes',
      'Noise from roof plant and terraces',
      'Lack of continuous air quality monitoring during construction'
    ],
    comments: [
      { type: 'Objection', text: 'Construction of several large schemes at once has a cumulative effect on residents that is not captured by assessing each scheme on its own. The policy should require cumulative construction impact assessments.' },
      { type: 'Support', text: 'We support the requirement for development to be air quality positive, and the expectation that major schemes will monitor air quality during construction.' },
      { type: 'Neutral', text: 'The policy should set out hours for servicing and deliveries near residential buildings, rather than leaving these to conditions on each permission.' },
      { type: 'Objection', text: 'Roof terraces and plant are a growing source of noise. The policy should require noise assessments for any new terrace close to homes.' }
    ],
    previous: {
      type: 'Objection',
      text: 'The draft plan does not do enough to protect residents from construction noise and pollution.',
      lpaResponse: 'Policy HL3 now requires a construction management plan for all major schemes, including noise and dust controls and air quality monitoring.'
    },
    ownResponse: 'The Council has considered this representation. Policies HL2 and HL3 require air quality and noise assessments for major development, and a construction management plan covering cumulative effects where several schemes are under construction nearby.',
    template: {
      status: 'final',
      updated: '2026-09-24',
      text: 'Environmental quality policies have been strengthened to require air quality positive development and noise assessments for major schemes, together with construction management plans that address noise, dust and air quality monitoring. The Council considers that these policies respond to the concerns raised and no further change is proposed.'
    }
  },
  {
    id: 'green',
    title: 'Green spaces',
    respondents: 112,
    policies: ['OS1', 'OS2', 'CR2'],
    summary: 'Widespread support for protecting existing parks and creating new green corridors. Requests for allotments and community gardens in larger schemes.',
    overview: 'There was widespread support for protecting the City\'s gardens and churchyards and for creating new green corridors. Respondents asked for urban greening targets to be ambitious, for allotments and community gardens in larger schemes, and for green infrastructure to help manage surface water flooding.',
    keyConcerns: [
      'Loss of existing open space to development',
      'Urban greening targets not ambitious enough',
      'Few opportunities for food growing and community gardens',
      'Surface water flooding in parts of the City',
      'Public access to new roof gardens'
    ],
    comments: [
      { type: 'Support', text: 'We strongly support the protection of existing open spaces and the urban greening factor requirement for major development.' },
      { type: 'Objection', text: 'Roof gardens should only count towards open space provision where they are free and open to the public during reasonable hours.' },
      { type: 'Neutral', text: 'Projected surface water runoff increases in the City Cluster mean green infrastructure should be designed to hold water, not just to look green.' },
      { type: 'Support', text: 'We welcome the encouragement of food growing and community gardens in larger residential schemes.' }
    ],
    previous: {
      type: 'Support',
      text: 'We support the protection of open space and would like to see more trees and planting on City streets.',
      lpaResponse: 'The plan now includes an urban greening factor target for major development and a policy on the protection and planting of trees.'
    },
    ownResponse: 'The Council welcomes this representation. Policy OS2 sets an urban greening factor target for major development, and the supporting text has been amended to encourage greening that also attenuates surface water.',
    template: {
      status: 'final',
      updated: '2026-09-22',
      text: 'The Local Plan includes strengthened policies for the protection of existing open spaces and the provision of new ones, including an urban greening factor target for major development and requirements for public access to new publicly accessible roof gardens. The Council welcomes the support for these policies and no change is proposed.'
    }
  },
  {
    id: 'transport',
    title: 'Transport and connectivity',
    respondents: 95,
    policies: ['VT1', 'AT1', 'AT2'],
    summary: 'Calls for better public transport links, improved cycling infrastructure, and reduced car dependency in new developments.',
    overview: 'Respondents called for better public transport links, safer and more continuous cycle routes, and wider pavements on the busiest streets. Several asked for freight consolidation to reduce delivery traffic, and for the plan to go further in reducing car use.',
    keyConcerns: [
      'Crowded pavements on the busiest walking routes',
      'Gaps in the cycle network and lack of secure cycle parking',
      'Delivery and servicing traffic at peak times',
      'Step-free access to stations',
      'Construction traffic routing'
    ],
    comments: [
      { type: 'Support', text: 'We support the priority given to walking and cycling and the expectation that development will contribute to improvements on the busiest routes.' },
      { type: 'Objection', text: 'The policy should require freight consolidation for all major schemes, not only encourage it, to reduce delivery traffic at peak times.' },
      { type: 'Neutral', text: 'Pedestrian comfort levels on the routes from the main stations should be assessed for every major scheme, using the Pedestrian Comfort Guidance.' },
      { type: 'Objection', text: 'Cycle parking standards should be higher than the London Plan minimum given the share of journeys to the City made by bicycle.' }
    ],
    previous: {
      type: 'Neutral',
      text: 'The draft plan should do more to manage delivery and servicing traffic.',
      lpaResponse: 'Policy VT2 now requires delivery and servicing plans for major development, including the use of consolidation where it is practicable.'
    },
    ownResponse: 'The Council has considered this representation. Policy VT1 requires transport assessments for major development, including pedestrian comfort assessments on the routes from the nearest stations.',
    template: {
      status: 'draft',
      updated: '2026-10-01',
      text: 'The Council acknowledges the need for improved public transport, walking and cycling connections. The draft Local Plan prioritises walking and cycling, requires transport assessments for major development and expects development to contribute to improvements on the busiest routes. The Council considers that these policies address the concerns raised.'
    }
  },
  {
    id: 'affordable-housing',
    title: 'Affordable housing',
    respondents: 134,
    policies: ['S3', 'HS1'],
    summary: 'Strong support for increasing affordable housing provision. Concerns about viability assessments reducing obligations on developers.',
    overview: 'There was strong support for increasing affordable housing provision. Many respondents were concerned that viability assessments are used to reduce affordable housing obligations, and asked for the plan to require on-site provision wherever possible.',
    keyConcerns: [
      'Viability assessments used to reduce affordable housing',
      'Off-site payments in place of on-site homes',
      'Tenure mix not reflecting local need',
      'Few family-sized affordable homes',
      'Delivery of housing on constrained sites'
    ],
    comments: [
      { type: 'Support', text: 'We support the affordable housing target and the expectation that it will be delivered on site wherever possible.' },
      { type: 'Objection', text: 'The plan should require viability assessments to be published in full, so that residents can see how affordable housing obligations have been reduced.' },
      { type: 'Objection', text: 'The affordable housing requirement will make some schemes on constrained sites unviable. The policy should allow more flexibility where site constraints are demonstrated.' },
      { type: 'Neutral', text: 'The tenure split should be reviewed against the latest housing needs evidence before the plan is submitted.' }
    ],
    previous: {
      type: 'Support',
      text: 'We support more affordable housing in the City but are concerned that targets are not met in practice.',
      lpaResponse: 'The plan now sets an affordable housing target and requires viability assessments to be independently reviewed and published.'
    },
    ownResponse: 'The Council has considered this representation. Policy S3 sets an affordable housing target to be delivered on site wherever possible, and viability assessments will be independently reviewed and published.',
    template: {
      status: 'final',
      updated: '2026-09-25',
      text: 'The Council is committed to maximising affordable housing delivery. Policy S3 sets a target for affordable housing to be delivered on site wherever possible, and viability assessments submitted to justify a lower contribution will be independently reviewed and published. The Council considers that this approach is consistent with the London Plan and no change is proposed.'
    }
  },
  {
    id: 'heritage',
    title: 'Heritage and conservation',
    respondents: 38,
    policies: ['HE1', 'HE3'],
    summary: 'Support for stronger protections of listed buildings and conservation areas. Concerns about insensitive modern development adjacent to historic assets.',
    overview: 'Respondents supported stronger protection for listed buildings and conservation areas. There were concerns about modern development next to historic assets, and requests for a clearer test of how the setting of heritage assets will be assessed.',
    keyConcerns: [
      'Effect of tall buildings on the setting of listed buildings',
      'No clear test for heritage impact in the policy itself',
      'Setting of the Tower of London World Heritage Site',
      'Loss of historic shopfronts and street patterns',
      'Archaeology on redevelopment sites'
    ],
    comments: [
      { type: 'Objection', text: 'The policy should set out a clear test for development that affects the setting of designated heritage assets, rather than leaving this to the supporting text.' },
      { type: 'Support', text: 'We support the strengthened protection for conservation areas and the expectation that development will enhance their character.' },
      { type: 'Neutral', text: 'The supporting text should identify the views and settings that contribute most to the significance of the Tower of London World Heritage Site.' },
      { type: 'Objection', text: 'Modern additions to historic buildings are too often approved without a proper assessment of their effect on significance.' }
    ],
    previous: {
      type: 'Neutral',
      text: 'The plan should give more detail on how the setting of listed buildings and conservation areas will be assessed.',
      lpaResponse: 'The policy has been amended to require heritage impact assessments where development may affect a designated asset or its setting.'
    },
    ownResponse: 'The Council has considered this representation. Policy HE1 has been amended to require proposals that may affect the setting of a designated heritage asset to be accompanied by a proportionate heritage impact assessment.',
    template: {
      status: 'draft',
      updated: '2026-10-03',
      text: 'The Council recognises the importance of protecting heritage assets and their settings. Policy HE1 requires development to conserve and enhance the significance of heritage assets, and its supporting text explains how heritage impact assessments and verified views will be used to assess proposals that may affect a designated asset or its setting.'
    }
  },
  {
    id: 'employment',
    title: 'Employment and economy',
    respondents: 56,
    policies: ['S4'],
    summary: 'Requests for mixed-use developments that provide local employment. Concerns about loss of small business premises to residential conversion.',
    overview: 'Respondents asked for mixed-use development that provides local jobs and space for small businesses. There were concerns about the loss of small and affordable workspace, and about the amount of new office floorspace the plan expects.',
    keyConcerns: [
      'Loss of small business premises to residential conversion',
      'Too little affordable workspace',
      'Uncertainty about future office demand',
      'Ground floor uses that do not serve the public',
      'Local employment and training during construction'
    ],
    comments: [
      { type: 'Support', text: 'We support the plan\'s commitment to new office floorspace, which is essential to the City\'s role as a global business centre.' },
      { type: 'Objection', text: 'The office floorspace target is too high given changes in working patterns since 2020. The policy should allow more flexibility for other uses.' },
      { type: 'Neutral', text: 'Major schemes should provide affordable workspace for small businesses, secured through planning obligations.' },
      { type: 'Objection', text: 'The loss of small business premises to residential conversion should be resisted unless there is evidence that the space is no longer needed.' }
    ],
    previous: {
      type: 'Support',
      text: 'We support the protection of office floorspace but would like more space for small businesses.',
      lpaResponse: 'The plan now encourages the provision of affordable workspace in major office schemes.'
    },
    ownResponse: 'The Council has considered this representation. Policy S4 is based on the latest employment land evidence, and its supporting text has been amended to encourage affordable workspace in major office schemes.',
    template: null
  }
]

function getTheme (id) {
  return THEMES.find(theme => theme.id === id)
}

// Named consultees, in the order the "By consultee" list shows them. `issues` is how many
// representations are generated for them, spread round-robin across `themes`. `earlier` lists
// the earlier rounds they responded to (members of the public responded only this time).
const CONSULTEES = [
  { id: 'environment-agency', name: 'Environment Agency', abbr: 'EA', type: 'Statutory consultee', contact: 'planning@environment-agency.gov.uk', issues: 15, themes: ['green', 'noise-air', 'building-heights', 'transport'] },
  { id: 'historic-england', name: 'Historic England', abbr: 'HE', type: 'Statutory consultee', contact: 'london@historicengland.org.uk', issues: 7, themes: ['heritage', 'building-heights'] },
  { id: 'transport-for-london', name: 'Transport for London', abbr: 'TfL', type: 'Statutory consultee', contact: 'boroughplanning@tfl.gov.uk', issues: 15, themes: ['transport', 'noise-air', 'facilities'] },
  { id: 'natural-england', name: 'Natural England', abbr: 'NE', type: 'Statutory consultee', contact: 'consultations@naturalengland.org.uk', issues: 6, themes: ['green', 'noise-air'] },
  { id: 'greater-london-authority', name: 'Greater London Authority', abbr: 'GLA', type: 'Statutory consultee', contact: 'localplans@london.gov.uk', issues: 10, themes: ['affordable-housing', 'building-heights', 'employment', 'transport'] },
  { id: 'barratt-london', name: 'Barratt London', abbr: 'Barratt', type: 'Developer', contact: 'planning@barrattlondon.example', issues: 9, themes: ['affordable-housing', 'building-heights', 'facilities'] },
  { id: 'berkeley-group', name: 'Berkeley Group', abbr: 'Berkeley', type: 'Developer', contact: 'planning@berkeleygroup.example', issues: 7, themes: ['affordable-housing', 'green', 'building-heights'] },
  { id: 'canary-wharf-group', name: 'Canary Wharf Group', abbr: 'CWG', type: 'Developer', contact: 'planning@canarywharf.example', issues: 12, themes: ['employment', 'building-heights', 'transport', 'heritage'] },
  { id: 'city-residents-association', name: 'City of London Residents Association', abbr: 'CoLRA', type: 'Community organisation', contact: 'secretary@cityresidents.example', issues: 5, themes: ['noise-air', 'building-heights', 'facilities', 'green'] },
  { id: 'barbican-association', name: 'Barbican Association', abbr: 'BA', type: 'Community organisation', contact: 'planning@barbicanassociation.example', issues: 3, themes: ['heritage', 'noise-air'] },
  { id: 'thames-water', name: 'Thames Water', abbr: 'TW', type: 'Statutory consultee', contact: 'devcon.team@thameswater.example', issues: 4, themes: ['facilities', 'green'] },
  { id: 'sport-england', name: 'Sport England', abbr: 'SE', type: 'Statutory consultee', contact: 'planning.london@sportengland.example', issues: 3, themes: ['facilities', 'green'] },
  { id: 'nhs-north-east-london', name: 'NHS North East London', abbr: 'NHS', type: 'Statutory consultee', contact: 'estates@nhsnel.example', issues: 4, themes: ['facilities'] },
  { id: 'southwark-council', name: 'London Borough of Southwark', abbr: 'LBS', type: 'Statutory consultee', contact: 'planningpolicy@southwark.example', issues: 3, themes: ['building-heights', 'heritage'] },
  { id: 'city-property-forum', name: 'City Property Forum', abbr: 'CPF', type: 'Developer', contact: 'policy@cityproperty.example', issues: 6, themes: ['employment', 'affordable-housing', 'building-heights'] },
  { id: 'aldgate-estates', name: 'Aldgate Estates', abbr: 'AE', type: 'Developer', contact: 'planning@aldgateestates.example', issues: 5, themes: ['employment', 'green', 'building-heights'] },
  { id: 'moorgate-property', name: 'Moorgate Property Partners', abbr: 'MPP', type: 'Developer', contact: 'info@moorgateproperty.example', issues: 4, themes: ['employment', 'transport'] },
  { id: 'civic-planning', name: 'Civic Planning Ltd', abbr: 'CPL', type: 'Planning consultant', contact: 'office@civicplanning.example', issues: 4, themes: ['heritage', 'building-heights', 'affordable-housing'] },
  { id: 'urban-futures', name: 'Urban Futures Ltd', abbr: 'UF', type: 'Planning consultant', contact: 'hello@urbanfutures.example', issues: 4, themes: ['transport', 'employment'] },
  { id: 'city-quarter', name: 'City Quarter Developments', abbr: 'CQD', type: 'Developer', contact: 'planning@cityquarter.example', issues: 3, themes: ['affordable-housing', 'building-heights'] },
  { id: 'ludgate-planning', name: 'Ludgate Planning LLP', abbr: 'LP', type: 'Planning consultant', contact: 'planning@ludgate.example', issues: 3, themes: ['heritage', 'employment'] },
  { id: 'cycling-campaign', name: 'City Cycling Campaign', abbr: 'CCC', type: 'Community organisation', contact: 'campaigns@citycycling.example', issues: 4, themes: ['transport', 'noise-air'] },
  { id: 'city-heritage-society', name: 'City Heritage Society', abbr: 'CHS', type: 'Community organisation', contact: 'secretary@cityheritage.example', issues: 5, themes: ['heritage', 'building-heights'] },
  { id: 'golden-lane-residents', name: 'Golden Lane Estate Residents Association', abbr: 'GLERA', type: 'Community organisation', contact: 'residents@goldenlane.example', issues: 3, themes: ['facilities', 'noise-air', 'green'] },
  { id: 'friends-of-city-gardens', name: 'Friends of City Gardens', abbr: 'FCG', type: 'Community organisation', contact: 'friends@citygardens.example', issues: 3, themes: ['green'] },
  { id: 'smithfield-traders', name: 'Smithfield Traders Association', abbr: 'STA', type: 'Community organisation', contact: 'office@smithfieldtraders.example', issues: 3, themes: ['employment', 'transport'] },
  { id: 'a-bennett', name: 'A. Bennett', type: 'Member of the public', contact: 'a.bennett@example.com', issues: 1, themes: ['green'] },
  { id: 'jane-smith', name: 'Jane Smith', type: 'Member of the public', contact: 'jane.smith@example.com', issues: 2, themes: ['affordable-housing', 'facilities'] },
  { id: 'r-okafor', name: 'R. Okafor', type: 'Member of the public', contact: 'r.okafor@example.com', issues: 2, themes: ['transport', 'noise-air'] },
  { id: 'm-chen', name: 'M. Chen', type: 'Member of the public', contact: 'm.chen@example.com', issues: 1, themes: ['building-heights'] },
  { id: 's-patel', name: 'S. Patel', type: 'Member of the public', contact: 's.patel@example.com', issues: 2, themes: ['green', 'facilities'] },
  { id: 'd-lewis', name: 'D. Lewis', type: 'Member of the public', contact: 'd.lewis@example.com', issues: 1, themes: ['heritage'] },
  { id: 'k-oconnor', name: 'K. O\'Connor', type: 'Member of the public', contact: 'k.oconnor@example.com', issues: 2, themes: ['noise-air', 'transport'] },
  { id: 'l-novak', name: 'L. Novak', type: 'Member of the public', contact: 'l.novak@example.com', issues: 1, themes: ['affordable-housing'] }
].map(consultee => Object.assign({
  abbr: consultee.name.replace(/[^A-Za-z ]/g, '').split(' ').map(word => word[0]).join(''),
  earlier: consultee.type === 'Member of the public' ? [] : ['scoping', 'plan-content']
}, consultee))

function getConsultee (id) {
  return CONSULTEES.find(consultee => consultee.id === id)
}

// The worked examples shown first on the side-by-side views, written out in full.
const KEY_REPRESENTATIONS = [
  {
    id: 'REP-1048',
    consulteeId: 'historic-england',
    date: '2026-03-18',
    themeId: 'heritage',
    policyRef: 'HE1',
    commentType: 'Objection',
    text: 'Historic England supports the policy\'s strategic direction, but objects to the absence of a clear test for development affecting the setting of designated heritage assets. The policy should require proposals for tall buildings to demonstrate, through verified views and a heritage impact assessment, that significance and setting are conserved.',
    changeNote: 'Change since 2024: the objection now focuses on tall-building settings and requests a defined heritage impact test.',
    previous: {
      id: 'REP-0782',
      date: '2024-05-12',
      commentType: 'Neutral',
      policyRef: 'HE1',
      policyTitle: 'Historic environment',
      text: 'Historic England welcomes the stronger recognition of the City\'s historic environment. Further detail should explain how the setting of listed buildings and conservation areas will be assessed where proposals introduce substantial new height or massing.',
      lpaResponse: {
        text: 'The policy has been amended to require heritage impact assessments where development may affect a designated asset or its setting. Supporting text now identifies verified views and townscape analysis as proportionate evidence.',
        published: '2024-09-30',
        officer: 'M. Shah'
      }
    }
  },
  {
    id: 'REP-1044',
    consulteeId: 'barbican-association',
    date: '2026-03-16',
    themeId: 'heritage',
    policyRef: 'HE1',
    commentType: 'Neutral',
    text: 'The Association asks that the supporting text recognise the Barbican and Golden Lane estates as heritage assets in their own right, and explain how the setting of the estates will be considered when development is proposed nearby.',
    previous: {
      id: 'REP-0745',
      date: '2024-05-09',
      commentType: 'Objection',
      policyRef: 'HE1',
      policyTitle: 'Historic environment',
      text: 'The draft plan does not mention the post-war listed estates. Development around the Barbican has already harmed views from the estate.',
      lpaResponse: {
        text: 'The supporting text now refers to the Barbican and Golden Lane Conservation Area and its listed buildings, and to the need to consider their setting.',
        published: '2024-09-30',
        officer: 'M. Shah'
      }
    }
  },
  {
    id: 'REP-1031',
    consulteeId: 'a-bennett',
    date: '2026-03-12',
    themeId: 'heritage',
    policyRef: 'HE1',
    commentType: 'Support',
    text: 'I support the stronger protection for the City\'s historic buildings and churches. They are what make the City feel like a place rather than just offices.'
  },
  {
    id: 'REP-1026',
    consulteeId: 'civic-planning',
    date: '2026-03-10',
    themeId: 'heritage',
    policyRef: 'HE1',
    commentType: 'Objection',
    text: 'On behalf of our client, we object to the requirement for verified views on all proposals affecting the setting of a heritage asset. This should be proportionate to the scale of the proposal and the significance of the asset.'
  }
]

// --- Generated representations ---------------------------------------------------------------

function isoDate (date) {
  return date.toISOString().slice(0, 10)
}

// Spread over the consultation period, 8 February to 22 March 2026 (43 days).
function consultationDate (n) {
  const date = new Date(Date.UTC(2026, 0, 25))
  date.setUTCDate(date.getUTCDate() + ((n * 7) % 57))
  return isoDate(date)
}

let representations = null

// Built on first use and then cached; it is static content.
function getRepresentations () {
  if (representations) return representations
  const reps = []
  let n = 0
  CONSULTEES.forEach(consultee => {
    for (let i = 0; i < consultee.issues; i++) {
      const theme = getTheme(consultee.themes[i % consultee.themes.length])
      const round = Math.floor(i / consultee.themes.length)
      const comment = theme.comments[(n + round) % theme.comments.length]
      const rep = {
        id: 'REP-' + (1101 + n),
        consulteeId: consultee.id,
        date: consultationDate(n),
        themeId: theme.id,
        policyRef: theme.policies[(n + i) % theme.policies.length],
        commentType: comment.type,
        text: comment.text
      }
      // Organisations that responded on the proposed plan content get their earlier
      // representation on the theme, the first time they raise it, so the side-by-side view has something to compare.
      if (round === 0 && consultee.earlier.includes('plan-content') && n % 2 === 0) {
        rep.previous = {
          id: 'REP-0' + (600 + n),
          date: '2024-05-' + String(1 + (n % 20)).padStart(2, '0'),
          commentType: theme.previous.type,
          policyRef: rep.policyRef,
          policyTitle: getPolicy(rep.policyRef).title,
          text: theme.previous.text,
          lpaResponse: { text: theme.previous.lpaResponse, published: '2024-09-30', officer: 'M. Shah' }
        }
      }
      reps.push(rep)
      n++
    }
  })
  representations = KEY_REPRESENTATIONS.concat(reps).map(rep => {
    const consultee = getConsultee(rep.consulteeId)
    const policy = getPolicy(rep.policyRef)
    return Object.assign({
      consulteeName: consultee.name,
      respondentType: consultee.type,
      policyTitle: policy.title,
      themeTitle: getTheme(rep.themeId).title
    }, rep)
  })
  return representations
}

function getRepresentation (id) {
  return getRepresentations().find(rep => rep.id === id)
}

// --- Consultee documents -----------------------------------------------------------------------

// The Environment Agency's submission on the proposed local plan is written out; every other document is
// built from the consultee's representations, so what the viewer shows always matches them.
const DOCUMENT_INTROS = {
  'environment-agency': {
    intro: 'The Environment Agency welcomes the opportunity to comment on the City of London Proposed Local Plan. This response focuses on policies relating to building heights, flood risk, wind microclimate, and urban heat island effects.',
    figure: {
      caption: 'Figure 1: Projected surface water runoff increase by zone (%)',
      bars: [
        { label: 'Zone A (Liverpool St)', value: 31 },
        { label: 'Zone B (Aldgate)', value: 24 },
        { label: 'Zone C (City Cluster)', value: 38 }
      ]
    }
  }
}

function consulteeDocument (consultee, consultationId) {
  const consultation = CONSULTATIONS.find(candidate => candidate.id === consultationId)
  const isCurrent = consultationId === CURRENT_CONSULTATION.id
  const custom = isCurrent ? DOCUMENT_INTROS[consultee.id] : null
  const sections = []
  if (isCurrent) {
    getRepresentations().filter(rep => rep.consulteeId === consultee.id).forEach(rep => {
      sections.push({ heading: 'Policy ' + rep.policyRef + ': ' + rep.policyTitle, text: rep.text, ref: rep.id })
    })
  } else {
    consultee.themes.forEach(themeId => {
      const theme = getTheme(themeId)
      sections.push({ heading: theme.title, text: theme.previous.text })
    })
  }
  return {
    fileName: consultee.abbr + '_' + consultation.fileSuffix + '.pdf',
    title: consultee.name + ' response to City of London ' + (consultationId === 'scoping' ? 'Local Plan scoping consultation' : isCurrent ? 'Proposed Local Plan consultation' : 'consultation on proposed plan content and evidence'),
    subtitle: consultation.title + ' — ' + consultation.month,
    intro: custom ? custom.intro : consultee.name + ' welcomes the opportunity to comment on the City of London ' + (consultationId === 'scoping' ? 'Local Plan at scoping stage' : isCurrent ? 'Proposed Local Plan' : 'proposed plan content and evidence') + '. Our comments are set out below by ' + (isCurrent ? 'policy' : 'topic') + '.',
    figure: custom ? custom.figure : null,
    sections
  }
}

// --- Starting state ----------------------------------------------------------------------------

// The mutable half of the prototype, deep-cloned into each session. Assignments and statuses are
// spread deterministically so the screens open on a realistic mix: some themes fully assigned,
// some partly, a few responses returned for changes and a handful already with the reviewers.
function startingState () {
  const templates = {}
  THEMES.forEach(theme => {
    if (theme.template) {
      templates[theme.id] = { text: theme.template.text, status: theme.template.status, updated: theme.template.updated }
    }
  })

  const assignRule = {
    green: () => true,
    'noise-air': () => true,
    'affordable-housing': k => k % 3 !== 0,
    'building-heights': k => k % 2 === 0,
    heritage: k => k % 4 === 0,
    transport: () => false
  }

  const reps = {}
  getRepresentations().forEach((rep, k) => {
    const rule = assignRule[rep.themeId]
    let response = null
    if (rule && rule(k)) response = { templateId: rep.themeId }
    else if (k % 5 === 0) response = { text: getTheme(rep.themeId).ownResponse }

    let status = 'draft'
    if (response) {
      if (k % 9 === 0) status = 'changes'
      else if (k % 7 === 0) status = 'draft'
      else if (k % 13 === 0) status = 'in-review'
      else status = 'ready'
    }

    const updated = new Date(Date.UTC(2026, 9, 4))
    updated.setUTCDate(updated.getUTCDate() - (k % 12))

    reps[rep.id] = {
      officer: k % 11 === 3 ? null : OFFICERS[k % OFFICERS.length],
      status,
      response,
      updated: isoDate(updated),
      // The inspector has been through some of what the authority has finished.
      inspectorReviewed: Boolean(response) && ['ready', 'in-review'].includes(status) && k % 3 !== 0,
      inspectorComments: []
    }
  })

  // The worked examples open in the state the designs show them in.
  reps['REP-1048'] = Object.assign(reps['REP-1048'], { officer: 'Daniel Wu', status: 'draft', response: null, inspectorReviewed: false })
  reps['REP-1044'] = Object.assign(reps['REP-1044'], { officer: 'Priya Shah', status: 'ready', response: { templateId: 'heritage' }, inspectorReviewed: true })
  reps['REP-1026'] = Object.assign(reps['REP-1026'], { officer: 'Marcus Reed', status: 'changes', response: { text: getTheme('heritage').ownResponse } })
  reps['REP-1048'].inspectorComments = [{
    author: INSPECTOR,
    date: '2026-04-04',
    text: 'Ask the Council to identify the precise wording of proposed modification PM-04 and confirm how the heritage impact test applies to cumulative tall-building effects.'
  }]

  return {
    uploads: [
      { id: 'upload-1', title: 'City Plan 2040 - Proposed Local Plan consultation responses', size: '2.4 MB', date: '2026-09-15' },
      { id: 'upload-2', title: 'Heritage and Tall Buildings - Public comments', size: '1.1 MB', date: '2026-09-12' },
      { id: 'upload-3', title: 'Transport Strategy - Stakeholder feedback', size: '3.8 MB', date: '2026-09-10' },
      { id: 'upload-4', title: 'Climate Resilience - Community responses', size: '890 KB', date: '2026-09-08' }
    ],
    templates,
    reps
  }
}

module.exports = {
  CURRENT_CONSULTATION,
  CONSULTATIONS,
  TOTAL_RESPONDENTS,
  CURRENT_OFFICER,
  OFFICERS,
  INSPECTOR,
  RESPONDENT_TYPES,
  COMMENT_TYPES,
  POLICIES,
  THEMES,
  CONSULTEES,
  getPolicy,
  getTheme,
  getConsultee,
  getRepresentations,
  getRepresentation,
  consulteeDocument,
  startingState
}
