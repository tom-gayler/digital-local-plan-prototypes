//
// Example policies for the "View policy summary" prototype.
//
// Policy references and titles are taken from the City of London's City Plan
// 2040 so the examples read like real local plan policies:
// https://www.cityoflondon.gov.uk/services/planning/planning-policy/city-plan-2040
//
// EVERYTHING ELSE HERE IS INVENTED PROTOTYPE CONTENT — the summaries,
// evidence links, consultation figures and notes are illustrative only and
// are not the City of London's material. Don't quote any of it as real.
//
// Policies are listed in the order they appear in the plan's contents, grouped
// by policy area, so choosing a policy area lists its policies in plan order.
// Most entries carry only the ref, title and one-line summary shown in that
// list. The ones that also have evidenceSummary, evidenceSources,
// consultation* and notes are the worked examples with a full summary page
// behind them — hasFullSummary() below is what decides whether a policy in the
// list is a link or plain text.
//

const POLICIES = [
  // --- Health, inclusion and safety ---
  {
    ref: 'S1',
    title: 'Healthy and Inclusive City',
    policyArea: 'Health, inclusion and safety',
    summary: 'Sets the strategic approach to health and inclusion, expecting development to help reduce health inequalities and to be usable by everyone who lives in, works in or visits the area.'
  },
  {
    ref: 'HL1',
    title: 'Inclusive Buildings and Spaces',
    policyArea: 'Health, inclusion and safety',
    summary: 'Requires development to be designed so that everyone can use buildings and public spaces independently and with dignity, going beyond minimum accessibility standards where the evidence supports it.',
    tags: ['Need', 'Capacity', 'Design'],
    evidenceSummary: 'Access audits and engagement with disabled residents and workers consistently found step-free routes and legible wayfinding to be the two biggest barriers. Evidence supports setting a requirement above the national minimum.',
    evidenceSources: [
      { title: 'Inclusive Design Access Audit', ref: 'Paragraph 4.12', summary: 'Step-free access and wayfinding barriers across 40 audited sites' },
      { title: 'Stakeholder feedback', ref: 'Session 3', summary: 'Accessibility panel on independent use of buildings' },
      { title: 'Public Realm and Wayfinding Study', ref: 'Paragraph 2.3', summary: 'Legibility and signage on the busiest pedestrian routes' },
      { title: 'Health Impact and Wellbeing Study', ref: 'Paragraph 3.6', summary: 'Independent access as a determinant of participation' },
      { title: 'Equalities Impact Assessment', ref: 'Paragraph 1.4', summary: 'Groups most affected by inaccessible buildings' },
      { title: 'Transport Capacity Study', ref: 'Paragraph 6.9', summary: 'Step-free interchange between street and station' },
      { title: 'Open Space Assessment', ref: 'Paragraph 4.8', summary: 'Accessible routes into and through public open space' },
      { title: 'Design Review Panel notes', ref: 'Session 11', summary: 'Panel comments on inclusive entrances and thresholds' },
      { title: 'Viability Assessment', ref: 'Paragraph 5.2', summary: 'Cost of accessibility measures above the national minimum' },
      { title: 'Scoping Consultation 2024', ref: 'Response 18', summary: 'Early engagement on inclusive design standards' }
    ],
    consultationSummary: 'Broad support for a stronger inclusive design requirement. Developers questioned how the standard would be evidenced at application stage; access groups asked for wayfinding to be explicitly covered.',
    consultationResponseCount: 46,
    consultationResponses: [
      { respondent: 'Inclusive Access Panel', ref: 'Paragraphs 8, 14', comment: 'Wayfinding should be named in the policy itself, not just the supporting text — signage and legibility are as much a barrier as steps.', theme: 'Wayfinding in the policy', themeCount: 21 },
      { respondent: 'Guide Dogs', ref: 'Paragraph 5', comment: 'Supports going beyond minimum standards, but asks that tactile paving and level thresholds be treated as baseline rather than optional enhancements.', theme: 'Baseline accessibility standards', themeCount: 25 }
    ],
    notes: [
      { author: 'Policy team', date: '3 April 2024', text: 'Access panel asked for wayfinding to be named explicitly in the policy wording, not just the supporting text.' }
    ]
  },
  {
    ref: 'HL2',
    title: 'Air quality',
    policyArea: 'Health, inclusion and safety',
    summary: 'Requires development to be at least air quality neutral, with emissions from construction and operation assessed and mitigated in the areas worst affected.'
  },
  {
    ref: 'HL3',
    title: 'Noise',
    policyArea: 'Health, inclusion and safety',
    summary: 'Manages noise between conflicting uses, expecting new residential development near established late-night and servicing activity to design out disturbance rather than constrain existing businesses.'
  },
  {
    ref: 'HL4',
    title: 'Contaminated land and water quality',
    policyArea: 'Health, inclusion and safety',
    summary: 'Requires contamination and water quality risks to be investigated and remediated before development, in proportion to the risk the site presents.'
  },
  {
    ref: 'HL5',
    title: 'Location and protection of social and community facilities',
    policyArea: 'Health, inclusion and safety',
    summary: 'Resists the loss of social and community facilities and directs new provision to accessible locations where it can serve the communities that need it.'
  },
  {
    ref: 'HL6',
    title: 'Public toilets',
    policyArea: 'Health, inclusion and safety',
    summary: 'Expects major development to provide publicly accessible toilets, including accessible and baby-changing facilities, where it generates significant footfall.'
  },
  {
    ref: 'HL7',
    title: 'Sport and recreation',
    policyArea: 'Health, inclusion and safety',
    summary: 'Protects existing sport and recreation facilities and supports new provision, including shared use of facilities outside their core operating hours.'
  },
  {
    ref: 'HL8',
    title: 'Play areas and facilities',
    policyArea: 'Health, inclusion and safety',
    summary: 'Requires residential development to provide play space appropriate to the number of children expected, with the emphasis on doorstep play in dense locations.'
  },
  {
    ref: 'HL9',
    title: 'Health Impact Assessment (HIA)',
    policyArea: 'Health, inclusion and safety',
    summary: 'Requires a health impact assessment for major development, proportionate to its scale, showing how health effects have shaped the scheme.'
  },
  {
    ref: 'S2',
    title: 'Safe and Secure City',
    policyArea: 'Health, inclusion and safety',
    summary: 'Sets the strategic approach to safety and security, expecting protective measures to be designed into development rather than added afterwards.'
  },
  {
    ref: 'SA1',
    title: 'Publicly accessible locations',
    policyArea: 'Health, inclusion and safety',
    summary: 'Expects development in busy publicly accessible locations to address crowded places risk through layout and design, in consultation with counter-terrorism advisers.'
  },
  {
    ref: 'SA2',
    title: 'Dispersal Routes',
    policyArea: 'Health, inclusion and safety',
    summary: 'Protects the routes people would use to leave an area in an emergency, keeping them legible and unobstructed by new development.'
  },
  {
    ref: 'SA3',
    title: 'Designing in Security',
    policyArea: 'Health, inclusion and safety',
    summary: 'Requires security measures to be integrated into the design of buildings and public spaces so they do not create hostile or unwelcoming environments.'
  },
  // --- Housing ---
  {
    ref: 'S3',
    title: 'Housing',
    policyArea: 'Housing',
    summary: 'Sets the strategic approach to housing delivery over the plan period, including the overall target and the mix of homes needed.'
  },
  {
    ref: 'HS1',
    title: 'Location of New Housing',
    policyArea: 'Housing',
    summary: 'Directs new housing to locations where it will not compromise business functions, with particular regard to residential amenity, noise and servicing in a dense mixed-use environment.',
    tags: ['Need', 'Capacity', 'Site Allocations'],
    evidenceSummary: 'The housing needs evidence shows household growth outpacing supply over the plan period, with delivery constrained by brownfield availability and infrastructure capacity. Demand is concentrated around the best-connected areas.',
    evidenceSources: [
      { title: 'Local Housing Needs Assessment', ref: 'Chapter 3', summary: 'Household growth outpacing existing housing supply' },
      { title: 'Housing Topic Paper', ref: 'Paragraph 2.8', summary: 'Supply and delivery trajectory over the plan period' },
      { title: 'Stakeholder feedback', ref: 'March 2024', summary: 'Residents on infrastructure keeping pace with growth' },
      { title: 'Strategic Housing Market Assessment', ref: 'Paragraph 4.2', summary: 'Tenure and size mix needed over the plan period' },
      { title: 'Noise and Soundscape Study', ref: 'Paragraph 3.5', summary: 'Residential amenity near late-night and servicing uses' },
      { title: 'Infrastructure Delivery Plan 2024', ref: 'Paragraph 6.1', summary: 'Services and utilities supporting new housing' },
      { title: 'Employment Land Review', ref: 'Paragraph 5.4', summary: 'Housing pressure on land in business use' },
      { title: 'Transport Capacity Study', ref: 'Paragraph 2.7', summary: 'Public transport access from proposed housing locations' },
      { title: 'Air Quality Assessment', ref: 'Paragraph 4.9', summary: 'Exposure of new homes on the worst affected streets' },
      { title: 'Viability Assessment', ref: 'Paragraph 3.1', summary: 'Deliverability of housing on constrained sites' }
    ],
    consultationSummary: 'Residents supported more housing but doubted infrastructure would keep pace. Several respondents asked for clearer protection of residential amenity where housing adjoins late-night uses.',
    consultationResponseCount: 132,
    consultationResponses: [
      { respondent: 'Residents\' Association', ref: 'Paragraphs 12, 19', comment: 'Supports more housing but doubts infrastructure will keep pace with the delivery trajectory.', theme: 'Infrastructure delivery', themeCount: 71 },
      { respondent: 'Home Builders Federation', ref: 'Paragraph 31', comment: 'Asks for the amenity requirements to be expressed as clear thresholds so schemes can be designed against them.', theme: 'Residential amenity thresholds', themeCount: 61 }
    ],
    notes: [
      { author: 'Policy team', date: '12 March 2024', text: 'Cross-check the delivery trajectory against the infrastructure evidence before the next draft.' },
      { author: 'Housing team', date: '28 March 2024', text: 'Amenity wording needs to work alongside the noise policy — flagged at the joint session.' }
    ]
  },
  {
    ref: 'HS2',
    title: 'Loss of housing',
    policyArea: 'Housing',
    summary: 'Resists the net loss of existing homes, including through amalgamation, unless replacement provision of at least equivalent quality is made.'
  },
  {
    ref: 'HS3',
    title: 'Residential environment',
    policyArea: 'Housing',
    summary: 'Expects new homes to have a good standard of amenity, with adequate daylight, outlook, privacy and protection from noise.'
  },
  {
    ref: 'HS4',
    title: 'Housing quality standards',
    policyArea: 'Housing',
    summary: 'Applies internal space, accessibility and dual-aspect standards to new homes, with limited scope for departure where the constraints of the site require it.'
  },
  {
    ref: 'HS5',
    title: 'Short term residential letting',
    policyArea: 'Housing',
    summary: 'Manages short-term letting so it does not erode permanent housing stock or the amenity of neighbouring residents.'
  },
  {
    ref: 'HS6',
    title: 'Student accommodation and hostels',
    policyArea: 'Housing',
    summary: 'Supports purpose-built student accommodation and hostels in accessible locations where they do not displace conventional housing.'
  },
  {
    ref: 'HS7',
    title: 'Older persons housing',
    policyArea: 'Housing',
    summary: 'Supports specialist housing for older people, expecting schemes to be accessible, well connected to services and adaptable as needs change.'
  },
  {
    ref: 'HS8',
    title: 'Self and custom housebuilding',
    policyArea: 'Housing',
    summary: 'Supports self and custom build homes where sites are suitable, including plots brought forward as part of larger schemes.'
  },
  // --- Offices ---
  {
    ref: 'S4',
    title: 'Offices',
    policyArea: 'Offices',
    summary: 'Sets the strategic approach to office floorspace, safeguarding the area\'s primary business function while allowing the stock to adapt to changing patterns of work.'
  },
  {
    ref: 'OF1',
    title: 'Office Development',
    policyArea: 'Offices',
    summary: 'Supports the provision and modernisation of office floorspace, protecting the area\'s primary business function while allowing for changing patterns of workplace use.',
    tags: ['Office', 'Need', 'Capacity'],
    evidenceSummary: 'Employment evidence points to sustained demand for high-quality, well-connected office space alongside a surplus of older stock that is difficult to let without substantial upgrade.',
    evidenceSources: [
      { title: 'Employment Land Review', ref: 'Paragraph 3.7', summary: 'Demand for high-quality space against a surplus of older stock' },
      { title: 'Scoping Consultation 2024', ref: 'Response 41', summary: 'Early engagement on flexible office space for small businesses' },
      { title: 'Viability Assessment', ref: 'Paragraph 2.7', summary: 'Returns on refurbishment against new build' },
      { title: 'Whole Life-Cycle Carbon Study', ref: 'Paragraph 8.1', summary: 'Carbon case for upgrading existing offices' },
      { title: 'Transport Capacity Study', ref: 'Paragraph 5.5', summary: 'Peak movement generated by office floorspace' },
      { title: 'Retail and Leisure Needs Study', ref: 'Paragraph 6.2', summary: 'Ground floor uses supporting office occupiers' },
      { title: 'Infrastructure Delivery Plan 2024', ref: 'Paragraph 3.9', summary: 'Utilities demand from new office development' },
      { title: 'Housing Topic Paper', ref: 'Paragraph 5.6', summary: 'Competition between office and residential land uses' },
      { title: 'Stakeholder feedback', ref: 'Business roundtable', summary: 'Occupiers on flexible and affordable workspace' },
      { title: 'National Planning policy', ref: 'Paragraph 85', summary: 'Supporting economic growth and productivity' }
    ],
    consultationSummary: 'Business respondents supported the emphasis on modernisation. A minority argued for greater flexibility to convert surplus older stock to other uses.',
    consultationResponseCount: 74,
    consultationResponses: [
      { respondent: 'London Chamber of Commerce', ref: 'Paragraphs 7, 12', comment: 'Supports the emphasis on modernisation of older stock rather than wholesale redevelopment.', theme: 'Support for modernisation', themeCount: 44 },
      { respondent: 'Small Business Forum', ref: 'Paragraph 21', comment: 'Asks for explicit support for flexible and affordable workspace for smaller occupiers.', theme: 'Flexible workspace provision', themeCount: 30 }
    ],
    notes: [
      { author: 'Policy team', date: '15 February 2024', text: 'Scoping responses flagged demand for flexible office space for small businesses — check this is reflected.' }
    ]
  },
  {
    ref: 'OF2',
    title: 'Protection of Existing Office Floorspace',
    policyArea: 'Offices',
    summary: 'Resists the loss of office floorspace to other uses unless it can be shown the space is no longer needed or capable of meeting modern requirements.'
  },
  {
    ref: 'OF3',
    title: 'Temporary \'Meanwhile\' Uses',
    policyArea: 'Offices',
    summary: 'Supports temporary meanwhile uses in vacant premises where they add activity at street level and do not prejudice the return of the permanent use.'
  },
  // --- Retail ---
  {
    ref: 'S5',
    title: 'Retail and active frontages',
    policyArea: 'Retail',
    summary: 'Sets the strategic approach to retail, concentrating activity in the designated centres and keeping street frontages active.'
  },
  {
    ref: 'RE1',
    title: 'Principal Shopping Centres',
    policyArea: 'Retail',
    summary: 'Protects and enhances the identified principal shopping centres as the focus for retail activity, resisting changes of use that would undermine their retail function.',
    tags: ['Need', 'Capacity'],
    evidenceSummary: 'Retail evidence shows footfall recovering unevenly, with the designated centres performing more strongly than dispersed frontages.',
    evidenceSources: [
      { title: 'Retail and Leisure Needs Study', ref: 'Paragraph 4.3', summary: 'Footfall and vacancy analysis across designated centres' },
      { title: 'Town Centre Health Check 2024', ref: 'Paragraph 2.1', summary: 'Vacancy and occupier mix by centre' },
      { title: 'Retail and Leisure Needs Study', ref: 'Paragraph 7.4', summary: 'Capacity for additional comparison goods floorspace' },
      { title: 'Employment Land Review', ref: 'Paragraph 8.6', summary: 'Retail employment across the designated centres' },
      { title: 'Cultural Infrastructure Audit', ref: 'Paragraph 5.7', summary: 'Leisure and cultural uses drawing footfall to centres' },
      { title: 'Transport Capacity Study', ref: 'Paragraph 7.1', summary: 'Access and servicing in the principal centres' },
      { title: 'Public Realm and Wayfinding Study', ref: 'Paragraph 3.3', summary: 'Pedestrian environment in and between centres' },
      { title: 'Viability Assessment', ref: 'Paragraph 4.8', summary: 'Upper floor viability where retail demand has fallen' },
      { title: 'Stakeholder feedback', ref: 'Centre managers session', summary: 'Managers on protecting the retail function' },
      { title: 'National Planning policy', ref: 'Paragraph 90', summary: 'Supporting the vitality of town centres' }
    ],
    consultationSummary: 'Centre managers supported continued protection. Some landlords asked for more flexibility on upper floors where retail demand has fallen away.',
    consultationResponseCount: 29,
    consultationResponses: [
      { respondent: 'Centre Management', ref: 'Paragraph 5', comment: 'Supports continued protection of the designated centres as the focus for retail activity.', theme: 'Support for centre protection', themeCount: 17 },
      { respondent: 'Retail Property Owners Group', ref: 'Paragraphs 14, 18', comment: 'Requests more flexibility on upper floors where retail demand has fallen away.', theme: 'Upper floor flexibility', themeCount: 12 }
    ],
    notes: []
  },
  {
    ref: 'RE2',
    title: 'Active frontages',
    policyArea: 'Retail',
    summary: 'Requires ground floor frontages on identified streets to be active and open to the public, avoiding blank or inactive elevations.'
  },
  {
    ref: 'RE3',
    title: 'Specialist retail uses and clusters',
    policyArea: 'Retail',
    summary: 'Protects established specialist retail clusters where they contribute to the area\'s character and draw.'
  },
  {
    ref: 'RE4',
    title: 'Markets',
    policyArea: 'Retail',
    summary: 'Protects existing markets and supports new market activity where it adds to the vitality of the surrounding streets.'
  },
  // --- Culture and visitors ---
  {
    ref: 'S6',
    title: 'Culture and Visitors',
    policyArea: 'Culture and visitors',
    summary: 'Sets the strategic approach to culture and visitors, supporting the area\'s cultural offer and managing the pressures that visitor numbers bring.'
  },
  {
    ref: 'CV1',
    title: 'Protection of Existing Cultural Infrastructure, and Leisure, Recreation and Visitor Arts and Cultural Facilities',
    policyArea: 'Culture and visitors',
    summary: 'Resists the loss of existing cultural, leisure and visitor facilities unless replacement provision of equivalent quality is made, recognising their role in the area\'s identity and evening economy.',
    tags: ['Heritage', 'Need'],
    evidenceSummary: 'The cultural infrastructure audit records a net loss of smaller venues over the last decade, with affordability and lease insecurity the most cited causes.',
    evidenceSources: [
      { title: 'Cultural Infrastructure Audit', ref: 'Paragraph 3.2', summary: 'Net loss of smaller venues over the last decade' },
      { title: 'Stakeholder feedback', ref: 'Roundtable 2', summary: 'Cultural sector on affordability and lease insecurity' },
      { title: 'Evening and Night-Time Economy Study', ref: 'Paragraph 3.2', summary: 'Venue closures and the reasons given for them' },
      { title: 'Visitor Economy Study', ref: 'Paragraph 4.6', summary: 'Cultural offer as a driver of visitor numbers' },
      { title: 'Noise and Soundscape Study', ref: 'Paragraph 6.4', summary: 'Agent of change and protection of existing venues' },
      { title: 'Retail and Leisure Needs Study', ref: 'Paragraph 9.1', summary: 'Leisure demand alongside cultural provision' },
      { title: 'Viability Assessment', ref: 'Paragraph 7.3', summary: 'Affordability of cultural space in new development' },
      { title: 'Heritage and Conservation Study', ref: 'Paragraph 8.5', summary: 'Historic buildings in cultural use' },
      { title: 'Health Impact and Wellbeing Study', ref: 'Paragraph 7.9', summary: 'Participation in culture and wellbeing' },
      { title: 'Scoping Consultation 2024', ref: 'Response 63', summary: 'Early views on protecting cultural facilities' }
    ],
    consultationSummary: 'Cultural organisations strongly supported the protection. Questions were raised about what counts as "equivalent quality" replacement provision.',
    consultationResponseCount: 61,
    consultationResponses: [
      { respondent: 'Music Venue Trust', ref: 'Paragraphs 9, 16', comment: 'Strongly supports protection, and asks that \'equivalent quality\' replacement provision be defined in the supporting text.', theme: "Defining 'equivalent quality'", themeCount: 33 },
      { respondent: 'Theatres Trust', ref: 'Paragraph 22', comment: 'Asks that lease insecurity be recognised as a cause of venue loss, not just redevelopment.', theme: 'Causes of venue loss', themeCount: 28 }
    ],
    notes: [
      { author: 'Culture team', date: '9 April 2024', text: 'Define "equivalent quality" in supporting text — raised repeatedly at the roundtable.' }
    ]
  },
  {
    ref: 'CV2',
    title: 'Provision of Arts, Culture and Leisure Facilities',
    policyArea: 'Culture and visitors',
    summary: 'Supports new arts, culture and leisure facilities, expecting major development to contribute to cultural provision where it is viable.'
  },
  {
    ref: 'CV3',
    title: 'Provision of Visitor Facilities',
    policyArea: 'Culture and visitors',
    summary: 'Supports visitor facilities in accessible locations, including seating, toilets and wayfinding along the busiest visitor routes.'
  },
  {
    ref: 'CV4',
    title: 'Hotels',
    policyArea: 'Culture and visitors',
    summary: 'Directs new hotel development to suitable locations, resisting proposals that would harm residential amenity or displace other priority uses.'
  },
  {
    ref: 'CV5',
    title: 'Evening and Night-Time Economy',
    policyArea: 'Culture and visitors',
    summary: 'Supports a diverse evening and night-time economy in identified areas, managing cumulative impacts on residents through design and operating conditions.'
  },
  {
    ref: 'CV6',
    title: 'Public Art',
    policyArea: 'Culture and visitors',
    summary: 'Encourages public art as part of major development, with commissioning and long-term maintenance arrangements agreed at the outset.'
  },
  // --- Infrastructure ---
  {
    ref: 'S7',
    title: 'Infrastructure and Utilities',
    policyArea: 'Infrastructure',
    summary: 'Sets the strategic approach to infrastructure and utilities, expecting provision to be planned and delivered alongside the growth it supports.'
  },
  {
    ref: 'IN1',
    title: 'Infrastructure provision and connection',
    policyArea: 'Infrastructure',
    summary: 'Requires utility infrastructure and connections to be designed into development from the outset and integrated with it, including connections to existing decentralised energy networks where feasible.',
    tags: ['Capacity', 'Infrastructure'],
    evidenceSummary: 'The infrastructure evidence identifies constrained capacity in parts of the network and a pattern of connections being retrofitted late in the development process, at greater cost and disruption.',
    evidenceSources: [
      { title: 'Infrastructure Delivery Plan 2024', ref: 'Paragraph 5.2', summary: 'Capacity and phasing of utility connections' },
      { title: 'Local Housing Needs Assessment', ref: 'Chapter 3', summary: 'Infrastructure delivery as a constraint on supply' },
      { title: 'Utilities Capacity Study', ref: 'Paragraph 2.2', summary: 'Headroom in water, power and telecoms networks' },
      { title: 'Decentralised Energy Network Study', ref: 'Paragraph 4.5', summary: 'Connection opportunities to existing heat networks' },
      { title: 'Transport Capacity Study', ref: 'Paragraph 8.3', summary: 'Street works and disruption from late connections' },
      { title: 'Whole Life-Cycle Carbon Study', ref: 'Paragraph 7.2', summary: 'Carbon cost of retrofitting connections' },
      { title: 'Surface Water Management Plan', ref: 'Paragraph 3.4', summary: 'Drainage connections and network capacity' },
      { title: 'Circular Economy and Waste Study', ref: 'Paragraph 2.9', summary: 'Waste storage and collection built into schemes' },
      { title: 'Stakeholder feedback', ref: 'Utilities roundtable', summary: 'Providers on early engagement before layouts are fixed' },
      { title: 'Scoping Consultation 2024', ref: 'Response 27', summary: 'Early views on infrastructure-first development' }
    ],
    consultationSummary: 'Utility providers welcomed earlier engagement. Developers asked for clarity on what "designed in from the outset" means in practice at each application stage.',
    consultationResponseCount: 38,
    consultationResponses: [
      { respondent: 'Thames Water', ref: 'Paragraphs 6, 11', comment: 'Welcomes earlier engagement, and asks that connection capacity be confirmed before layouts are fixed.', theme: 'Confirming connection capacity', themeCount: 22 },
      { respondent: 'UK Power Networks', ref: 'Paragraph 9', comment: 'Supports integration from the outset; requests clarity on what evidence is expected at each application stage.', theme: 'Clarity at each application stage', themeCount: 16 }
    ],
    notes: [
      { author: 'Infrastructure team', date: '18 April 2024', text: 'Utility providers offered to help draft the supporting text on early engagement.' }
    ]
  },
  {
    ref: 'IN2',
    title: 'Infrastructure Capacity',
    policyArea: 'Infrastructure',
    summary: 'Expects development to demonstrate that sufficient infrastructure capacity exists or will be provided in step with the development it serves.',
    tags: ['Capacity'],
    evidenceSummary: 'Capacity assessments show headroom varies sharply across the area, with the tightest constraints where the most growth is planned.',
    evidenceSources: [
      { title: 'Infrastructure Delivery Plan 2024', ref: 'Appendix B', summary: 'Network headroom assessment by area' },
      { title: 'Utilities Capacity Study', ref: 'Paragraph 5.1', summary: 'Network constraints by sub-area' },
      { title: 'Transport Capacity Study', ref: 'Paragraph 4.6', summary: 'Highway and public transport capacity under growth' },
      { title: 'Surface Water Management Plan', ref: 'Paragraph 6.7', summary: 'Sewer capacity in the areas of highest growth' },
      { title: 'Employment Land Review', ref: 'Paragraph 7.8', summary: 'Floorspace growth and its infrastructure demands' },
      { title: 'Decentralised Energy Network Study', ref: 'Paragraph 2.6', summary: 'Spare capacity in existing energy networks' },
      { title: 'Health Impact and Wellbeing Study', ref: 'Paragraph 5.3', summary: 'Capacity of health and community facilities' },
      { title: 'Housing Topic Paper', ref: 'Paragraph 4.4', summary: 'Phasing of delivery against infrastructure' },
      { title: 'Local Housing Needs Assessment', ref: 'Chapter 3', summary: 'Growth planned against available network capacity' },
      { title: 'Stakeholder feedback', ref: 'Session 7', summary: 'Providers on publishing and refreshing capacity evidence' }
    ],
    consultationSummary: 'Support in principle, with requests for the capacity evidence to be published and kept current so applicants can rely on it.',
    consultationResponseCount: 21,
    consultationResponses: [
      { respondent: 'Thames Water', ref: 'Paragraph 4', comment: 'Asks that the capacity evidence be published and refreshed annually so applicants can rely on it.', theme: 'Publishing capacity evidence', themeCount: 13 },
      { respondent: 'London Borough neighbours', ref: 'Paragraph 17', comment: 'Requests cross-boundary capacity to be considered where growth straddles the boundary.', theme: 'Cross-boundary capacity', themeCount: 8 }
    ],
    notes: []
  },
  {
    ref: 'IN3',
    title: 'Pipe Subways',
    policyArea: 'Infrastructure',
    summary: 'Protects the pipe subway network and requires development above or adjoining it to maintain access for maintenance and future connections.'
  },
  // --- Design ---
  {
    ref: 'S8',
    title: 'Design',
    policyArea: 'Design',
    summary: 'Sets the strategic approach to design, expecting development to be well designed, responsive to its context and to improve the public realm around it.'
  },
  {
    ref: 'DE1',
    title: 'Sustainable Design',
    policyArea: 'Design',
    summary: 'Requires a retrofit-first approach, with options for retention and retrofit explored before redevelopment, and whole life-cycle carbon emissions assessed and minimised on major development.',
    tags: ['Conservation', 'Capacity'],
    evidenceSummary: 'Whole life-cycle carbon assessments show retention and retrofit outperforming redevelopment in most of the cases sampled, though viability varies with building type and condition.',
    evidenceSources: [
      { title: 'Whole Life-Cycle Carbon Study', ref: 'Paragraph 6.4', summary: 'Retrofit outperforming redevelopment across 25 sampled schemes' },
      { title: 'Heritage and Conservation Study', ref: 'Paragraph 2.11', summary: 'Retention of existing fabric in conservation areas' },
      { title: 'Circular Economy and Waste Study', ref: 'Paragraph 3.8', summary: 'Reuse of materials from demolition and strip-out' },
      { title: 'Climate Risk and Overheating Study', ref: 'Paragraph 4.1', summary: 'Passive design measures and fabric performance' },
      { title: 'Viability Assessment', ref: 'Paragraph 6.5', summary: 'Cost of retrofit against redevelopment by building type' },
      { title: 'Tall Buildings Evidence Paper', ref: 'Paragraph 5.9', summary: 'Embodied carbon in tall building structures' },
      { title: 'Daylight and Sunlight Technical Note', ref: 'Paragraph 2.4', summary: 'Retained fabric and daylight to neighbours' },
      { title: 'Employment Land Review', ref: 'Paragraph 6.3', summary: 'Older stock suitable for retrofit rather than replacement' },
      { title: 'National Planning policy', ref: 'Paragraph 157', summary: 'Radically reducing greenhouse gas emissions' },
      { title: 'Scoping Consultation 2024', ref: 'Response 52', summary: 'Early views on a retrofit-first approach' }
    ],
    consultationSummary: 'Strong support from environmental groups. Some developers argued the assessment requirement should be proportionate to scheme size, and questioned the evidence for smaller buildings.',
    consultationResponseCount: 97,
    consultationResponses: [
      { respondent: 'Environment Agency', ref: 'Paragraphs 23, 27', comment: 'Supports the retrofit-first approach and asks that whole life-cycle carbon assessment explicitly account for flood resilience measures.', theme: 'Flood resilience in assessments', themeCount: 52 },
      { respondent: 'British Property Federation', ref: 'Paragraph 35', comment: 'Argues the assessment requirement should be proportionate to scheme size, with a clear threshold for smaller buildings.', theme: 'Proportionate assessment threshold', themeCount: 45 }
    ],
    notes: [
      { author: 'Design team', date: '22 February 2024', text: 'Need a clear threshold for what counts as "major" here — currently inconsistent with the transport policy.' }
    ]
  },
  {
    ref: 'DE2',
    title: 'Design Quality',
    policyArea: 'Design',
    summary: 'Expects a high standard of architecture and materials, with design quality maintained from planning permission through to completion.'
  },
  {
    ref: 'DE3',
    title: 'Public Realm',
    policyArea: 'Design',
    summary: 'Requires development to contribute to a coherent, accessible and well-maintained public realm, including footway widths that work at peak times.'
  },
  {
    ref: 'DE4',
    title: 'Terraces and Elevated Public Spaces',
    policyArea: 'Design',
    summary: 'Supports publicly accessible terraces and elevated spaces where genuine public access, step-free routes and long-term management are secured.'
  },
  {
    ref: 'DE5',
    title: 'Shopfronts',
    policyArea: 'Design',
    summary: 'Expects shopfronts to be well proportioned, accessible and sympathetic to the building and street they sit in.'
  },
  {
    ref: 'DE6',
    title: 'Advertisements',
    policyArea: 'Design',
    summary: 'Manages the scale, location and illumination of advertisements so they do not harm visual amenity or highway safety.'
  },
  {
    ref: 'DE7',
    title: 'Daylight and sunlight',
    policyArea: 'Design',
    summary: 'Requires daylight and sunlight impacts to be assessed against the density and character of the surrounding area, and unacceptable losses avoided.'
  },
  {
    ref: 'DE8',
    title: 'Lighting',
    policyArea: 'Design',
    summary: 'Requires external lighting to be designed to light only what it needs to, limiting glare, spill and effects on biodiversity.'
  },
  // --- Transport ---
  {
    ref: 'S9',
    title: 'Transport and Servicing',
    policyArea: 'Transport',
    summary: 'Sets the strategic approach to transport and servicing, prioritising walking, cycling and public transport over general traffic.'
  },
  {
    ref: 'VT1',
    title: 'The Impacts of Development on Transport',
    policyArea: 'Transport',
    summary: 'Requires development to assess and mitigate its transport impacts, with particular regard to pedestrian comfort, servicing and the capacity of the surrounding network.',
    tags: ['Capacity', 'Need'],
    evidenceSummary: 'Transport evidence shows pedestrian comfort levels already under strain at peak times on several key routes, and identifies servicing as a growing source of conflict.',
    evidenceSources: [
      { title: 'National Planning policy', ref: 'TR3', summary: 'Locating development in sustainable locations' },
      { title: 'Transport Capacity Study', ref: 'Paragraph 3.11', summary: 'Pedestrian comfort levels under strain at peak times' },
      { title: 'Local Housing Needs Assessment', ref: 'Chapter 3', summary: 'Public transport capacity around strategic growth areas' },
      { title: 'Healthy Streets and Active Travel Study', ref: 'Paragraph 4.5', summary: 'Pedestrian comfort levels on the busiest streets' },
      { title: 'Freight and Servicing Study', ref: 'Paragraph 2.8', summary: 'Servicing trips generated by development' },
      { title: 'Air Quality Assessment', ref: 'Paragraph 6.3', summary: 'Emissions from construction and servicing traffic' },
      { title: 'Infrastructure Delivery Plan 2024', ref: 'Paragraph 7.6', summary: 'Transport schemes supporting planned growth' },
      { title: 'Employment Land Review', ref: 'Paragraph 9.4', summary: 'Trips generated by new employment floorspace' },
      { title: 'Public Realm and Wayfinding Study', ref: 'Paragraph 4.9', summary: 'Footway widths at peak times' },
      { title: 'Stakeholder feedback', ref: 'Business transport forum', summary: 'Businesses on servicing restrictions' }
    ],
    consultationSummary: 'Transport bodies supported the approach. Businesses raised concerns about servicing restrictions and asked for consolidation to be encouraged rather than required.',
    consultationResponseCount: 67,
    consultationResponses: [
      { respondent: 'Transport for London', ref: 'Paragraphs 10, 18', comment: 'Supports the approach to pedestrian comfort, and asks that servicing consolidation be encouraged through the policy.', theme: 'Servicing consolidation', themeCount: 67 },
      { respondent: 'City Business Group', ref: 'Paragraph 26', comment: 'Raises concern that servicing restrictions could affect daily operations, and asks for consolidation to be encouraged rather than required.', theme: 'Servicing consolidation', themeCount: 67 }
    ],
    notes: [
      { author: 'Transport team', date: 'March 2024', text: 'Officers raised concerns that public transport capacity may not keep pace with planned housing delivery.' }
    ]
  },
  {
    ref: 'VT2',
    title: 'Freight and Servicing',
    policyArea: 'Transport',
    summary: 'Requires servicing to be planned into development, using consolidation, out-of-hours delivery and off-street facilities to reduce kerbside conflict.'
  },
  {
    ref: 'VT3',
    title: 'Vehicle Parking',
    policyArea: 'Transport',
    summary: 'Restricts general vehicle parking to the minimum necessary, retaining provision for disabled people and essential operational needs.'
  },
  {
    ref: 'VT4',
    title: 'River Transport',
    policyArea: 'Transport',
    summary: 'Supports use of the river for passenger and freight movement, protecting existing piers and wharves from development that would preclude it.'
  },
  {
    ref: 'VT5',
    title: 'Aviation Landing Facilities',
    policyArea: 'Transport',
    summary: 'Manages helicopter and other aviation landing facilities, resisting proposals where noise and safety impacts cannot be acceptably controlled.'
  },
  {
    ref: 'S10',
    title: 'Active Travel and Healthy Streets',
    policyArea: 'Transport',
    summary: 'Sets the strategic approach to active travel, expecting streets to be designed around the healthy streets principles.'
  },
  {
    ref: 'AT1',
    title: 'Pedestrian Movement, Permeability and Wayfinding',
    policyArea: 'Transport',
    summary: 'Requires development to improve pedestrian movement and permeability, with comfortable footways and legible wayfinding at street level.'
  },
  {
    ref: 'AT2',
    title: 'Active Travel including Cycling',
    policyArea: 'Transport',
    summary: 'Supports walking and cycling, expecting development to connect to the cycle network and to provide facilities for those arriving by bike.'
  },
  {
    ref: 'AT3',
    title: 'Cycle Parking',
    policyArea: 'Transport',
    summary: 'Sets cycle parking standards for new development, with secure long-stay provision for occupiers and accessible short-stay provision for visitors.'
  },
  // --- Heritage and Tall Buildings ---
  {
    ref: 'S11',
    title: 'Historic Environment',
    policyArea: 'Heritage and Tall Buildings',
    summary: 'Sets the strategic approach to the historic environment, treating the area\'s heritage as a framework for change rather than a constraint on it.'
  },
  {
    ref: 'HE1',
    title: 'Managing Change to the Historic Environment',
    policyArea: 'Heritage and Tall Buildings',
    summary: 'Sets a positive strategy for the historic environment, supporting changes of use consistent with long-term conservation and paying particular attention to historic routes, spaces and roofscapes.',
    tags: ['Heritage', 'Conservation'],
    evidenceSummary: 'The conservation evidence identifies constraints on the scale and design of new development in and around conservation areas, and highlights historic routes as an under-protected asset.',
    evidenceSources: [
      { title: 'Heritage and Conservation Study', ref: 'Chapter 4', summary: 'Constraints on scale and design near conservation areas' },
      { title: 'Historic Routes and Spaces Review', ref: 'Paragraph 1.9', summary: 'Historic routes as an under-protected asset' },
      { title: 'Conservation Area Character Appraisals', ref: 'Volume 2', summary: 'Character and appearance of each conservation area' },
      { title: 'Tall Buildings Evidence Paper', ref: 'Paragraph 6.8', summary: 'Effect of height on historic roofscapes' },
      { title: 'Protected Views Study', ref: 'Paragraph 3.7', summary: 'Views of listed buildings and skyline landmarks' },
      { title: 'Archaeological Priority Areas Review', ref: 'Paragraph 2.5', summary: 'Areas of archaeological potential' },
      { title: 'Whole Life-Cycle Carbon Study', ref: 'Paragraph 4.4', summary: 'Retention of historic fabric and embodied carbon' },
      { title: 'Public Realm and Wayfinding Study', ref: 'Paragraph 5.2', summary: 'Historic street surfaces and furniture' },
      { title: 'Stakeholder feedback', ref: 'Amenity societies session', summary: 'Societies on routes, spaces and roofscapes' },
      { title: 'National Planning policy', ref: 'Paragraph 203', summary: 'Conserving heritage assets appropriately to their significance' }
    ],
    consultationSummary: 'Amenity societies welcomed the emphasis on routes and roofscapes. Developers sought clarity on how the policy interacts with the tall buildings policy.',
    consultationResponseCount: 88,
    consultationResponses: [
      { respondent: 'Historic England', ref: 'Paragraphs 11, 15', comment: 'Welcomes the emphasis on historic routes and roofscapes, and asks for clearer criteria for assessing harm to setting.', theme: 'Criteria for assessing harm', themeCount: 49 },
      { respondent: 'Amenity Society', ref: 'Paragraph 28', comment: 'Asks how the policy is intended to interact with the tall buildings policy where the two pull in different directions.', theme: 'Interaction with tall buildings policy', themeCount: 39 }
    ],
    notes: [
      { author: 'Heritage team', date: '30 January 2024', text: 'Interaction with tall buildings policy needs resolving before submission.' }
    ]
  },
  {
    ref: 'HE2',
    title: 'Ancient Monuments and Archaeology',
    policyArea: 'Heritage and Tall Buildings',
    summary: 'Requires archaeological potential to be assessed early, with remains preserved in situ where they are of national importance.'
  },
  {
    ref: 'HE3',
    title: 'Setting of the Tower of London World Heritage Site',
    policyArea: 'Heritage and Tall Buildings',
    summary: 'Protects the outstanding universal value of the World Heritage Site, assessing the effect development would have on its setting.'
  },
  {
    ref: 'S12',
    title: 'Tall Buildings',
    policyArea: 'Heritage and Tall Buildings',
    summary: 'Sets out where tall buildings are and are not appropriate, and the design and impact tests proposals for them must meet.'
  },
  {
    ref: 'S13',
    title: 'Protected Views',
    policyArea: 'Heritage and Tall Buildings',
    summary: 'Protects identified strategic and local views, assessing development against the effect it would have on them.'
  },
  // --- Open Spaces and Green Infrastructure ---
  {
    ref: 'S14',
    title: 'Open Spaces and Green Infrastructure',
    policyArea: 'Open Spaces and Green Infrastructure',
    summary: 'Sets the strategic approach to open space and green infrastructure, treating it as a connected network across the area rather than a set of individual sites.'
  },
  {
    ref: 'OS1',
    title: 'Protection and provision of open spaces',
    policyArea: 'Open Spaces and Green Infrastructure',
    summary: 'Protects existing open space and requires new provision or improvement where development would increase pressure on it, with green infrastructure treated as a network rather than isolated sites.',
    tags: ['Green Belt', 'AONB', 'Need'],
    evidenceSummary: 'Open space assessment finds provision well below the local standard in the most densely developed areas, with the greatest deficiency where the most growth is planned.',
    evidenceSources: [
      { title: 'Open Space Assessment', ref: 'Paragraph 2.4', summary: 'Provision below the local standard in the densest areas' },
      { title: 'Green Belt Assessment', ref: 'Paragraph 7.1', summary: 'Boundary review conclusions on exceptional circumstances' },
      { title: 'Biodiversity and Urban Greening Study', ref: 'Paragraph 3.9', summary: 'Urban greening factor and habitat connectivity' },
      { title: 'Tree Canopy Survey', ref: 'Paragraph 2.2', summary: 'Canopy cover by ward and street' },
      { title: 'Climate Risk and Overheating Study', ref: 'Paragraph 6.6', summary: 'Shading and cooling from open space' },
      { title: 'Health Impact and Wellbeing Study', ref: 'Paragraph 4.3', summary: 'Access to green space and physical activity' },
      { title: 'Playing Pitch Strategy', ref: 'Paragraph 5.8', summary: 'Supply and demand for formal sport provision' },
      { title: 'Surface Water Management Plan', ref: 'Paragraph 7.5', summary: 'Open space in surface water management' },
      { title: 'Public Realm and Wayfinding Study', ref: 'Paragraph 6.1', summary: 'Routes between open spaces' },
      { title: 'Stakeholder feedback', ref: 'Open space workshop', summary: 'Requests to map the green infrastructure network' }
    ],
    consultationSummary: 'Widespread support for stronger protection. Several respondents asked for the green infrastructure network to be mapped in the plan rather than described.',
    consultationResponseCount: 115,
    consultationResponses: [
      { respondent: 'Natural England', ref: 'Paragraphs 13, 20', comment: 'Supports treating green infrastructure as a network, and asks that the network be mapped in the plan rather than described.', theme: 'Mapping the green network', themeCount: 64 },
      { respondent: 'Sport England', ref: 'Paragraph 24', comment: 'Asks that provision standards distinguish between formal recreation space and incidental green space.', theme: 'Distinguishing space types', themeCount: 51 }
    ],
    notes: [
      { author: 'Open spaces team', date: '6 March 2024', text: 'Mapping request came up in almost every session — worth a decision before the next draft.' }
    ]
  },
  {
    ref: 'OS2',
    title: 'Urban Greening',
    policyArea: 'Open Spaces and Green Infrastructure',
    summary: 'Applies an urban greening factor to major development, with greening designed in from the start rather than added at the end.'
  },
  {
    ref: 'OS3',
    title: 'Biodiversity',
    policyArea: 'Open Spaces and Green Infrastructure',
    summary: 'Requires development to protect and enhance habitats and species, with priority given to connecting existing habitats.'
  },
  {
    ref: 'OS4',
    title: 'Biodiversity Net Gain',
    policyArea: 'Open Spaces and Green Infrastructure',
    summary: 'Requires development to deliver measurable biodiversity net gain, on site where possible, and secured for the long term.'
  },
  {
    ref: 'OS5',
    title: 'Trees',
    policyArea: 'Open Spaces and Green Infrastructure',
    summary: 'Protects existing trees and requires replacement planting, with species chosen for the conditions they will face over their lifetime.'
  },
  // --- Climate Resilience ---
  {
    ref: 'S15',
    title: 'Climate Resilience and Flood Risk',
    policyArea: 'Climate Resilience',
    summary: 'Sets the strategic approach to climate resilience, expecting development to be adapted to the conditions projected over its lifetime.'
  },
  {
    ref: 'CR1',
    title: 'Overheating and Urban Heat Island Effect',
    policyArea: 'Climate Resilience',
    summary: 'Requires development to reduce overheating risk and avoid adding to the urban heat island effect, following the cooling hierarchy and prioritising passive measures.',
    tags: ['Flood Risk', 'Capacity'],
    evidenceSummary: 'Climate risk modelling projects a marked increase in days exceeding overheating thresholds, with the effect most pronounced in the densest, least vegetated areas.',
    evidenceSources: [
      { title: 'Climate Risk and Overheating Study', ref: 'Paragraph 5.6', summary: 'Projected days above overheating thresholds to 2050' },
      { title: 'Open Space Assessment', ref: 'Paragraph 6.2', summary: 'Tree canopy cover and shading in the urban heat island' },
      { title: 'Whole Life-Cycle Carbon Study', ref: 'Paragraph 9.2', summary: 'Cooling demand over a building\'s lifetime' },
      { title: 'Biodiversity and Urban Greening Study', ref: 'Paragraph 5.5', summary: 'Greening and evaporative cooling' },
      { title: 'Tree Canopy Survey', ref: 'Paragraph 4.7', summary: 'Street tree shading on the hottest routes' },
      { title: 'Health Impact and Wellbeing Study', ref: 'Paragraph 6.2', summary: 'Health effects of heat on vulnerable groups' },
      { title: 'Strategic Flood Risk Assessment', ref: 'Paragraph 8.4', summary: 'Combined heat and surface water risk' },
      { title: 'Daylight and Sunlight Technical Note', ref: 'Paragraph 5.1', summary: 'Solar gain and glazing on south-facing elevations' },
      { title: 'Housing Topic Paper', ref: 'Paragraph 7.7', summary: 'Overheating risk in single-aspect homes' },
      { title: 'Stakeholder feedback', ref: 'Climate roundtable', summary: 'Views on ruling out mechanical cooling' }
    ],
    consultationSummary: 'Support for the cooling hierarchy. Some respondents wanted mechanical cooling ruled out more firmly; others warned this would be unworkable for some building types.',
    consultationResponseCount: 53,
    consultationResponses: [
      { respondent: 'Environment Agency', ref: 'Paragraphs 23, 27', comment: 'Supports the cooling hierarchy and asks that overheating and surface water flood risk be assessed together rather than separately.', theme: 'Assessing risks together', themeCount: 29 },
      { respondent: 'Chartered Institution of Building Services Engineers', ref: 'Paragraph 30', comment: 'Warns that ruling out mechanical cooling entirely would be unworkable for some building types.', theme: 'Mechanical cooling workability', themeCount: 24 }
    ],
    notes: []
  },
  {
    ref: 'CR2',
    title: 'Flood Risk',
    policyArea: 'Climate Resilience',
    summary: 'Requires flood risk to be assessed and managed, directing the most vulnerable uses away from the areas at greatest risk.'
  },
  {
    ref: 'CR3',
    title: 'Sustainable drainage systems (SuDS)',
    policyArea: 'Climate Resilience',
    summary: 'Requires sustainable drainage on development, following the drainage hierarchy and reducing surface water run-off rates.'
  },
  {
    ref: 'CR4',
    title: 'Flood protection and flood defences',
    policyArea: 'Climate Resilience',
    summary: 'Protects existing flood defences and requires development alongside them to allow for maintenance and future raising.'
  },
  {
    ref: 'S16',
    title: 'Circular Economy and Waste',
    policyArea: 'Climate Resilience',
    summary: 'Sets the strategic approach to the circular economy, expecting materials to be retained, reused and recycled through a building\'s life.'
  },
  {
    ref: 'CE1',
    title: 'Sustainable Waste Facilities and Transport',
    policyArea: 'Climate Resilience',
    summary: 'Safeguards waste management capacity and supports facilities that move waste by rail or river rather than by road.'
  },
  {
    ref: 'CE2',
    title: 'New waste management sites',
    policyArea: 'Climate Resilience',
    summary: 'Sets the tests new waste management sites must meet, including amenity, transport and design considerations.'
  }
]

// A policy has a full summary page behind it when it carries the evidence,
// consultation and notes content — the rest are list-only examples.
function hasFullSummary (policy) {
  return Boolean(policy.evidenceSummary)
}

// Every strategic policy in the plan is numbered S1-S16 (one per chapter, or per major topic
// within a chapter) — a plain "S" + digits ref, distinct from a chapter's other policy refs
// (e.g. HL1, DE3), which always start with a topic prefix.
function isStrategicPolicy (ref) {
  return /^S\d+$/.test(ref)
}

// Terms offered by the evidence search's type-ahead: the titles of the
// policies with a full summary, plus the themes officers commonly search the
// evidence base for. List-only policies are left out — there's no evidence
// behind them to find.
const COMMON_SEARCH_TERMS = [
  'accessibility',
  'affordable housing',
  'brownfield land',
  'conservation area',
  'daylight and sunlight',
  'flood risk',
  'green infrastructure',
  'household growth',
  'infrastructure capacity',
  'office floorspace',
  'overheating',
  'pedestrian comfort',
  'public transport',
  'retrofit',
  'servicing',
  'tall buildings',
  'viability',
  'wayfinding',
  'whole life-cycle carbon'
]

function getSearchTerms () {
  return POLICIES.filter(hasFullSummary).map(policy => ({ term: policy.title, kind: 'Policy' }))
    .concat(COMMON_SEARCH_TERMS.map(term => ({ term, kind: 'Topic' })))
}

// hasSummary tells the policy list whether to render the policy as a link to
// its summary page or as plain text. isStrategic tells it whether to show the
// "Strategic Policy" tag.
function getPoliciesForArea (policyArea) {
  if (!policyArea) return []

  return POLICIES
    .filter(policy => policy.policyArea === policyArea)
    .map(policy => Object.assign({}, policy, {
      hasSummary: hasFullSummary(policy),
      isStrategic: isStrategicPolicy(policy.ref)
    }))
}

// Only the worked examples have a summary page, so a ref for a list-only
// policy returns null and the page falls back to listing the policy area.
function getPolicy (ref) {
  const policy = POLICIES.find(policy => policy.ref === ref)

  return policy && hasFullSummary(policy) ? policy : null
}

// Which policies cite a given evidence document. The search results label each
// excerpt with the policies it relates to, and for passages that don't carry
// their own refs (tagged evidence, document body text) the citing policies are
// the best available answer.
function getPolicyRefsForSource (title) {
  return POLICIES
    .filter(policy => (policy.evidenceSources || []).some(source => source.title === title))
    .map(policy => policy.ref)
}

module.exports = {
  POLICIES,
  COMMON_SEARCH_TERMS,
  getSearchTerms,
  getPoliciesForArea,
  getPolicy,
  getPolicyRefsForSource,
  isStrategicPolicy
}
