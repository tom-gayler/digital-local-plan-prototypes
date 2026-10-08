const { startingState: startingConsultationResponses } = require('./consultation-responses.js')

module.exports = {

  evidenceItems: [
    {
      id: 'evidence-seed-1',
      type: 'passage',
      sourceType: 'document',
      text: 'Projected household growth over the next 15 years will place significant pressure on existing housing supply.',
      source: 'Local Housing Needs Assessment',
      chapter: 'Chapter 3: Housing need',
      tags: ['Need', 'Capacity'],
      customTags: [],
      policyAreas: ['Housing'],
      policyReference: 'H1'
    },
    {
      id: 'evidence-seed-2',
      type: 'note',
      sourceType: 'note',
      text: 'Officers raised concerns at the March infrastructure meeting that public transport capacity around the strategic growth areas may not keep pace with planned housing delivery.',
      source: 'Local Housing Needs Assessment',
      chapter: 'Chapter 3: Housing need',
      tags: ['Capacity'],
      customTags: ['Public transport'],
      policyAreas: ['Transport'],
      policyReference: 'T2'
    },
    {
      id: 'evidence-seed-3',
      type: 'note',
      sourceType: 'consultation-response',
      text: 'Residents raised concerns at the consultation event that planned growth will not be matched by sufficient infrastructure or local services.',
      source: 'Stakeholder feedback',
      chapter: '',
      tags: ['Need'],
      customTags: ['Community engagement'],
      policyAreas: ['Housing'],
      policyReference: 'H1'
    },
    {
      id: 'evidence-seed-4',
      type: 'passage',
      sourceType: 'document',
      text: 'In several parts of the borough, the evidence suggests that housing demand is concentrated in areas with stronger public transport links and better access to services.',
      source: 'Local Housing Needs Assessment',
      chapter: 'Chapter 3: Housing need',
      tags: ['Site Allocations'],
      customTags: [],
      policyAreas: ['Housing'],
      policyReference: 'H2'
    },
    {
      id: 'evidence-seed-5',
      type: 'passage',
      sourceType: 'document',
      text: 'Several conservation areas within the town centre place constraints on the scale and design of new development.',
      source: 'Heritage and Conservation Study',
      chapter: '',
      tags: ['Heritage', 'Conservation'],
      customTags: [],
      policyAreas: ['Heritage and Tall Buildings'],
      policyReference: 'HE1'
    },
    {
      id: 'evidence-seed-6',
      type: 'note',
      sourceType: 'note',
      text: 'The Green Belt boundary review meeting concluded that limited exceptional circumstances exist to justify releasing land at the western edge of the borough.',
      source: 'Green Belt Assessment',
      chapter: '',
      tags: ['Green Belt'],
      customTags: [],
      policyAreas: ['Open Spaces and Green Infrastructure'],
      policyReference: 'GB1'
    },
    {
      id: 'evidence-seed-7',
      type: 'note',
      sourceType: 'scoping-consultation-response',
      text: 'Early engagement respondents highlighted a need for additional flexible office space to support small business growth in the town centre.',
      source: 'Scoping Consultation 2024',
      chapter: '',
      tags: ['Need'],
      customTags: ['Office space'],
      policyAreas: ['Offices'],
      policyReference: 'EMP1'
    }
  ],

  // --- Policy writing prototype ---
  //
  // Two independent variants of the same journey, so a user can experience either starting
  // from realistic example data ("prefilled") or from a blank slate ("blank") — see
  // STARTING_POINT_STEPS/PW_VARIANTS in app/routes.js. Keyed by variant so the two never
  // interfere with each other in the same session.

  policyStartingPointItems: {
    prefilled: {
      'adopted-plan-chapters': [
        { id: 'apc-1', text: 'Strategic priorities' },
        { id: 'apc-2', text: 'Spatial strategies' },
        { id: 'apc-3', text: 'Health, Inclusion & Safety' },
        { id: 'apc-4', text: 'Housing' },
        { id: 'apc-5', text: 'Offices' },
        { id: 'apc-6', text: 'Retail' },
        { id: 'apc-7', text: 'Culture and visitors' },
        { id: 'apc-8', text: 'Infrastructure' },
        { id: 'apc-9', text: 'Design' },
        { id: 'apc-10', text: 'Transport' },
        { id: 'apc-11', text: 'Heritage and Tall buildings' },
        { id: 'apc-12', text: 'Open Spaces and Green Infrastructure' },
        { id: 'apc-13', text: 'Climate Resilience' },
        { id: 'apc-14', text: 'The Temple, the Thames Policy Area & the Key Areas of Change' },
        { id: 'apc-15', text: 'Implementation' }
      ],
      'existing-data-sources': [
        { id: 'eds-1', text: 'Housing Needs Assessment 2020-2040' },
        { id: 'eds-2', text: 'Strategic Flood Risk Assessment' },
        { id: 'eds-3', text: 'Employment Land Review' },
        { id: 'eds-4', text: 'Retail and Town Centres Study' }
      ],
      'current-trends': [
        { id: 'ct-1', text: 'Brownfield reuse strategy' },
        { id: 'ct-2', text: 'Declining school age population adaption' },
        { id: 'ct-3', text: 'London Green corridor' },
        { id: 'ct-4', text: 'New Thames crossings' }
      ],
      'scoping-consultation-themes': [
        { id: 'sct-1', text: 'Housing affordability' },
        { id: 'sct-2', text: 'Town centre vitality' },
        { id: 'sct-3', text: 'Climate adaptation' },
        { id: 'sct-4', text: 'Infrastructure capacity' }
      ],
      'political-priorities': [
        { id: 'pp-1', text: 'Delivering affordable housing' },
        { id: 'pp-2', text: 'Protecting green spaces' },
        { id: 'pp-3', text: 'Supporting local high streets' }
      ],
      'other-plans-policies-strategies': [
        { id: 'opps-1', text: 'London Plan 2021' },
        { id: 'opps-2', text: 'Local Transport Strategy' },
        { id: 'opps-3', text: 'Economic Growth Strategy 2030' }
      ],
      'nppf-sds-requirements': [
        { id: 'nsr-1', text: 'Central London Economic Opportunity Zone' },
        { id: 'nsr-2', text: 'Station density' },
        { id: 'nsr-3', text: 'Grey belt release' }
      ]
    },
    blank: {
      'adopted-plan-chapters': [],
      'existing-data-sources': [],
      'current-trends': [],
      'scoping-consultation-themes': [],
      'political-priorities': [],
      'other-plans-policies-strategies': [],
      'nppf-sds-requirements': []
    }
  },

  policyTopics: {
    prefilled: [
      {
        id: 'topic-1',
        name: 'Housing needs',
        assignedTo: 'Pauline Perrot',
        brief: 'We need to:\n- Meet housing needs as set out in the Strategic Housing Land Availability Assessment (SHLAA)\n- Ensure we comply with the changes to housing supply calculations in the new NPPF\n- Reassess our housing mix against London Plan goals, given the specific nature of the city’s current housing stock',
        desiredImpact: 'We intend to deliver homes that support our goals and grow our economy. Of particular concern is how we provide homes for the young people currently growing up within the key residential estates within the city.',
        sources: [
          { id: 'src-1', label: 'Housing (Adopted plan)' },
          { id: 'src-2', label: 'Housing Needs Assessment 2020-2040 (Existing data source)' },
          { id: 'src-3', label: 'Grey belt release (NPPF/SDS)' }
        ],
        examplePolicies: [
          { id: 'ep-1', label: 'Manchester - City centre homes - H2.1' },
          { id: 'ep-2', label: 'Tower Hamlets - Start homes policy - R11.2' }
        ],
        evidenceNotes: 'We have already a good basis of information as per standard requirements. This work is based on annual monitoring and 2024’s strategic reports.',
        linkedEvidence: [
          { id: 'le-1', label: 'SHLAA 2025' },
          { id: 'le-2', label: 'Brownfield register v2.0' },
          { id: 'le-3', label: 'Housing needs assessment study' }
        ],
        additionalEvidenceNeeds: 'Outstanding: Updated Strategic Flood Risk Assessment (SFRA) Stage 2 required for northern allocations.',
        chapterTitle: 'Spatial Strategy for Wollington',
        explanatoryText: 'The Spatial Strategy for Wollington sets a clear and co-ordinated approach to managing growth over the plan period (2029–2044).\n\nIt responds to the city’s unique challenges and opportunities—from addressing housing needs which includes acute housing affordability needs and infrastructure deficits to environmental protection and heritage conservation—and provides a framework for delivering high-quality, sustainable places.\n\nThe strategy makes sufficient provision of homes, employment, retail, infrastructure and community facilities by promoting development which will primarily be focused on the city centre, town, district and local centres and transport corridors and hubs.',
        policyBlocks: [
          {
            id: 'block-1',
            title: 'S1 Strategic Growth Areas',
            detail: 'A high proportion of housing and employment growth will be directed to the city’s most sustainable locations including:\n\n1. The City Centre – circa X homes, circa X employment\n2. Town and District Centres - circa X homes, circa X employment\n3. Transport corridors and hubs - circa X homes, circa X employment\n\nThese areas will be expected to accommodate a high level of mixed-use development, supported by existing and future infrastructure.'
          }
        ],
        policyHistory: [
          { id: 'ph-1', type: 'Comment', description: 'Reviewed and approved', status: 'Done', statusColour: 'green' },
          { id: 'ph-2', type: 'Discussion', description: 'Team alignment confirmed', status: 'Done', statusColour: 'green' },
          { id: 'ph-3', type: 'Note', description: 'Recorded for reference', status: 'Done', statusColour: 'green' },
          { id: 'ph-4', type: 'Note', description: 'Pending review', status: '', statusColour: '' }
        ],
        latestNote: {
          description: 'Draft housing policy section updated. Awaiting sign-off from planning team before publication.',
          timestamp: 'Updated 2 hours ago'
        }
      }
    ],
    blank: []
  },

  policyWriterSources: [
    { id: 'pws-1', kind: 'policy', title: 'National Planning Policy - Para 85', snippet: 'Planning policies and decisions should help create the conditions in which businesses can invest, expand and adapt' },
    { id: 'pws-2', kind: 'policy', title: 'National Planning Policy - Para 86a', snippet: 'Sets out a clear economic vision and strategy which positively and proactively encourages sustainable economic growth' },
    { id: 'pws-3', kind: 'comment', title: 'Public aspiration for high street amenities', snippet: 'Businesses have requested prioritising of local warehousing and distribution needs' },
    { id: 'pws-4', kind: 'evidence', title: 'Housing Needs Assessment', snippet: 'Statistical analysis of housing demand 2020-2040' },
    { id: 'pws-5', kind: 'evidence', title: 'Site Allocation - Graveney estate', snippet: 'Proposed development sites and green belt boundaries' },
    { id: 'pws-6', kind: 'evidence', title: 'Transport Strategy - Sec 3.4', snippet: 'Connectivity and infrastructure planning report' }
  ],

  // --- Policy writer v2 prototype ---
  //
  // A second take on the drafting workspace (/policy-writing-v2), carrying on from the
  // "Spatial Strategy for Wollington" chapter seeded in policyTopics.prefilled above. It uses
  // its own top-level key rather than extending policyTopics so both prototypes can run side
  // by side in one browser session without touching each other's state. Prefilled only —
  // there is no blank variant here.
  //
  // The drafts are seeded to give the "Check references" review something real to find:
  // S1 keeps its "circa X homes" placeholders, S3 quotes one of its two sources and ignores
  // the other, S9 is empty, and S15 is deliberately vague. See initDraftCheck in
  // app/assets/javascripts/application.js.

  policyWriterV2Chapter: {
    id: 'pw2-chapter-1',
    title: 'Spatial Strategy for Wollington',
    explanatoryText: 'The Spatial Strategy for Wollington sets a clear and co-ordinated approach to managing growth over the plan period (2029–2044).\n\nIt responds to the city’s unique challenges and opportunities—from addressing housing needs which includes acute housing affordability needs and infrastructure deficits to environmental protection and heritage conservation—and provides a framework for delivering high-quality, sustainable places.\n\nThe strategy makes sufficient provision of homes, employment, retail, infrastructure and community facilities by promoting development which will primarily be focused on the city centre, town, district and local centres and transport corridors and hubs.',

    // Read-only example history. This prototype does NOT record what the user does — the
    // panel is captioned to say so. Wiring it up would be a push() in each POST handler.
    // The brief that was agreed when the chapter was scoped. Read-only in the workspace — it
    // is what the drafting is measured against, so it is not something to revise while
    // drafting against it. The bracketed numbers are the references as written in the brief.
    brief: {
      intro: 'We need to:',
      items: [
        { text: 'Meet housing needs as set-out in SHLAA', refs: ['1', '3'] },
        { text: 'Ensure we comply with the changes to the calculations in the new NPPF', refs: ['2'] },
        { text: 'Reassess our housing mix against London Plan goals given the specific nature of City’s current housing stock', refs: ['1'] }
      ]
    },

    // An entry with no status is still open, and renders with a hollow marker and no tag.
    history: [
      { id: 'pw2-h-1', type: 'Chapter created', description: 'Chapter created and S1 Strategic Growth Areas drafted', status: 'Done', date: '2 September 2025', actor: 'Pauline Perrot' },
      { id: 'pw2-h-2', type: 'Evidence linked', description: 'S3 Meeting Housing Need added, with two housing evidence sources', status: 'Done', date: '9 September 2025', actor: 'Pauline Perrot' },
      { id: 'pw2-h-3', type: 'Comment', description: 'Explanatory text reviewed, note left on S1', status: 'Done', date: '15 September 2025', actor: 'Jomo Adeyemi' },
      { id: 'pw2-h-4', type: 'Draft', description: 'S15 Climate Resilience and Flood Risk started', status: '', date: '23 September 2025', actor: 'Pauline Perrot' }
    ],

    policies: [
      {
        id: 'pw2-policy-s1',
        ref: 'S1',
        title: 'Housing Growth and Spatial Distribution',
        status: 'In progress',
        draft: "Over the plan period (2026–2041), provision will be made for the delivery of at least [Total Number, e.g., 12,500] new net additional dwellings.\n\nTo promote sustainable development patterns and maximise infrastructure investment, housing growth will be focused within the designated Strategic Growth Area (SGA) as defined on the Policies Map. The distribution of housing completions will be managed in accordance with the following hierarchy:\n\nStrategic Growth Area: Approximately [e.g., 70-75%] of all new residential development will be focused within the SGA corridor, comprising a minimum of [Number] dwellings.\n\nMarket Towns / Local Service Centres: Up to [e.g., 20%] of total growth will be directed to established settlements to support local services and meet rural housing needs.\n\nRural Settlements / Village Clusters: Development outwith the SGA and Market Towns will be strictly restricted to small-scale windfall, community-led schemes, or rural exception sites to meet proven local affordable needs.",
        sources: [
          {
            id: 'pw2-src-s1-1',
            text: 'Housing demand is concentrated where public transport access is strongest, which is also where the network is closest to capacity at peak times. Planning growth around those locations will require capacity to be increased in step.',
            source: 'Transport Capacity Study',
            ref: 'Paragraph 2.7',
            policyRefs: ['HS1', 'S9', 'VT1']
          },
          {
            id: 'pw2-src-s1-2',
            text: 'Network headroom varies sharply across the area, and the tightest constraints coincide with the places where the most growth is planned. Infrastructure capacity assessments more than two years old should not be relied on.',
            source: 'Utilities Capacity Study',
            ref: 'Paragraph 5.1',
            policyRefs: ['IN2', 'IN1', 'S7']
          }
        ,
          {
            id: 'pw2-src-s1-x1',
            text: "Demand for high quality, well connected office floorspace has held up, while a surplus of older stock is proving difficult to let without substantial upgrade. The gap between the two is widening.",
            source: 'Employment Land Review',
            ref: 'Paragraph 3.7',
            policyRefs: ['OF1', 'S4', 'OF2']
          },
          {
            id: 'pw2-src-s1-x2',
            text: "Meanwhile uses in long-term vacant units raised footfall on the surrounding street for as long as they ran, and in four of the nine cases the unit was let permanently within a year of the temporary use ending.",
            source: 'Town Centre Health Check 2024',
            ref: 'Paragraph 6.5',
            policyRefs: ['OF3', 'RE1', 'S5']
          },
          {
            id: 'pw2-src-s1-x3',
            text: "Connections are routinely retrofitted late in the development process, at greater cost and with more disruption to the street than if they had been designed in from the start.",
            source: 'Infrastructure Delivery Plan 2024',
            ref: 'Paragraph 5.2',
            policyRefs: ['IN1', 'S7']
          }
        ,
          {
            id: 'pw2-src-s1-p1',
            text: "Decisions on development proposals should apply a presumption in favour of sustainable development, with proposals that accord with an up-to-date development plan and the Framework’s decision-making policies approved without delay.",
            source: 'National Planning Policy Framework',
            ref: 'Policy S3',
            policyRefs: ['S1', 'S3', 'HS1']
          },
          {
            id: 'pw2-src-s1-p2',
            text: "Ten-year targets for net housing completions are set for each borough, and boroughs should optimise the potential for housing delivery on all suitable and available brownfield sites.",
            source: 'London Plan',
            ref: 'Policy H1',
            policyRefs: ['S3', 'HS1', 'S1']
          }
        ],
        notes: [
          { id: 'pw2-note-s1-1', author: 'Pauline Perrot', date: '3 September 2025', text: 'Growth figures still to come from the SHLAA refresh — the placeholders in this draft are deliberate, do not remove them yet.' },
          { id: 'pw2-note-s1-2', author: 'Jomo Adeyemi', date: '15 September 2025', text: 'Check the wording on mixed-use against the Design chapter before this goes to the joint session.' }
        ]
      },
      {
        id: 'pw2-policy-s3',
        ref: 'S3',
        title: 'Meeting Housing Need',
        status: 'In progress',
        draft: 'The Council will make provision for at least [X] new homes over the plan period, with at least 35% of homes on qualifying sites delivered as affordable housing.\n\nThe Local Housing Needs Assessment finds that household formation is projected to outpace completions in every year of the plan period, with the gap widest in the first five years. Provision is therefore front-loaded towards sites that are deliverable within the first five years.\n\nProposals will be expected to demonstrate a mix of dwelling sizes that responds to identified need, with particular weight given to family-sized homes.',
        sources: [
          {
            id: 'pw2-src-s3-1',
            text: 'Household formation is projected to outpace completions in every year of the plan period, with the gap widest in the first five years. The shortfall falls most heavily on households needing affordable housing.',
            source: 'Local Housing Needs Assessment',
            ref: 'Chapter 3',
            policyRefs: ['HS1', 'S3']
          },
          {
            id: 'pw2-src-s3-2',
            text: 'The assessment identifies a need for affordable housing across all size categories, with the sharpest need for family-sized homes. Delivery against that need has fallen short in each of the last five years.',
            source: 'Strategic Housing Market Assessment',
            ref: 'Paragraph 4.2',
            policyRefs: ['S3', 'HS1', 'HS4']
          }
        ,
          {
            id: 'pw2-src-s3-x1',
            text: "Supply depends almost entirely on brownfield land, and the sites remaining are smaller and more constrained than those already developed. Assumptions about delivery rates carried over from earlier plans are unlikely to hold.",
            source: 'Housing Topic Paper',
            ref: 'Paragraph 2.8',
            policyRefs: ['HS1', 'S3']
          },
          {
            id: 'pw2-src-s3-x2',
            text: "Purpose-built student accommodation has taken pressure off the private rented sector where it has been delivered in accessible locations. Where it has displaced sites suitable for conventional housing, the net effect on need has been negative.",
            source: 'Strategic Housing Market Assessment',
            ref: 'Paragraph 8.6',
            policyRefs: ['HS6', 'S3']
          },
          {
            id: 'pw2-src-s3-x3',
            text: "The cost of meeting accessibility requirements above the national minimum is small relative to total development cost in every tested typology, and viability is not the binding constraint in any of them.",
            source: 'Viability Assessment',
            ref: 'Paragraph 5.2',
            policyRefs: ['HL1', 'S1']
          }
        ,
          {
            id: 'pw2-src-s3-p1',
            text: "Spatial development strategies, and local plans where a spatial development strategy is not in place, should be based on a housing need assessment establishing the overall number of homes needed in the area as a minimum over the plan period, using the standard method.",
            source: 'National Planning Policy Framework',
            ref: 'Policy HO1',
            policyRefs: ['S3', 'HS1']
          },
          {
            id: 'pw2-src-s3-p2',
            text: "A strategic target is set for 50 per cent of all new homes to be genuinely affordable, with a threshold approach applying to applications that meet or exceed 35 per cent affordable housing by habitable room without public subsidy.",
            source: 'London Plan',
            ref: 'Policy H4',
            policyRefs: ['S3', 'HS4']
          },
          {
            id: 'pw2-src-s3-p3',
            text: "Schemes should determine the appropriate mix of housing sizes with regard to local need, the requirement for affordable family housing, and the character and accessibility of the location.",
            source: 'London Plan',
            ref: 'Policy H10',
            policyRefs: ['S3', 'HS4', 'HS1']
          }
        ],
        notes: [
          { id: 'pw2-note-s3-1', author: 'Pauline Perrot', date: '9 September 2025', text: 'The 35% figure needs checking against the viability evidence before we consult on it.' }
        ]
      },
      {
        id: 'pw2-policy-s9',
        ref: 'S9',
        title: 'Sustainable Transport and Connectivity',
        status: 'Not started',
        draft: '',
        sources: [
          {
            id: 'pw2-src-s9-1',
            text: 'Housing demand is concentrated where public transport access is strongest, which is also where the network is closest to capacity at peak times. Planning growth around those locations will require capacity to be increased in step.',
            source: 'Transport Capacity Study',
            ref: 'Paragraph 2.7',
            policyRefs: ['HS1', 'S9', 'VT1']
          }
        ,
          {
            id: 'pw2-src-s9-x1',
            text: "Pedestrian comfort levels on several key routes already fall below the standard at peak times, with footways carrying more people than their effective width allows. Development that adds movement without adding width will make this worse.",
            source: 'Healthy Streets and Active Travel Study',
            ref: 'Paragraph 4.5',
            policyRefs: ['VT1', 'S10', 'AT1']
          },
          {
            id: 'pw2-src-s9-x2',
            text: "Servicing activity is the fastest growing source of kerbside conflict, driven by smaller and more frequent deliveries. Consolidation reduces the number of trips but requires space that is rarely designed into schemes from the outset.",
            source: 'Freight and Servicing Study',
            ref: 'Paragraph 2.8',
            policyRefs: ['VT2', 'VT1', 'S9']
          },
          {
            id: 'pw2-src-s9-x3',
            text: "Wayfinding on the busiest pedestrian routes is inconsistent, with three separate signage systems in use within a quarter of a mile. Legibility matters most where routes are indirect, and it is these routes that are currently the least well signed.",
            source: 'Public Realm and Wayfinding Study',
            ref: 'Paragraph 2.3',
            policyRefs: ['AT1', 'DE3', 'HL1']
          }
        ],
        notes: []
      },
      {
        id: 'pw2-policy-s15',
        ref: 'S15',
        title: 'Climate Resilience and Flood Risk',
        status: 'In progress',
        draft: 'Development must be resilient to climate change. Where possible, schemes should consider measures to reduce overheating and manage surface water run-off.\n\nFurther detail TBC once the surface water modelling is complete.',
        sources: [
          {
            id: 'pw2-src-s15-1',
            text: 'Surface water is the dominant flood risk across most of the area, and the areas at greatest risk do not align with the fluvial flood zones. The most vulnerable uses should be directed away from both.',
            source: 'Strategic Flood Risk Assessment',
            ref: 'Paragraph 3.5',
            policyRefs: ['CR2', 'S15', 'CR4']
          },
          {
            id: 'pw2-src-s15-2',
            text: 'Days exceeding the overheating threshold are projected to more than double by 2050, with the increase most pronounced in the densest and least vegetated parts of the area. Buildings designed to today\'s conditions will not perform acceptably over their lifetime.',
            source: 'Climate Risk and Overheating Study',
            ref: 'Paragraph 5.6',
            policyRefs: ['CR1', 'S15']
          }
        ,
          {
            id: 'pw2-src-s15-x1',
            text: "Sewer capacity in the areas of highest planned growth is already exceeded in heavy rainfall. Sustainable drainage that reduces run-off at source is the only measure identified that scales with the growth proposed.",
            source: 'Surface Water Management Plan',
            ref: 'Paragraph 6.7',
            policyRefs: ['CR3', 'CR2', 'IN2']
          },
          {
            id: 'pw2-src-s15-x2',
            text: "Urban greening delivers most where it connects existing habitat rather than adding isolated planting. A green infrastructure requirement applied at concept stage produces markedly better outcomes than one applied at the end of design.",
            source: 'Biodiversity and Urban Greening Study',
            ref: 'Paragraph 3.9',
            policyRefs: ['OS2', 'OS3', 'S14']
          },
          {
            id: 'pw2-src-s15-x3',
            text: "Canopy cover ranges from under two per cent to over twenty per cent between wards, and the lowest cover coincides with the highest projected heat risk. Replacement planting has not kept pace with losses over the last decade.",
            source: 'Tree Canopy Survey',
            ref: 'Paragraph 2.2',
            policyRefs: ['OS5', 'CR1', 'S14']
          }
        ],
        notes: [
          { id: 'pw2-note-s15-1', author: 'Pauline Perrot', date: '23 September 2025', text: 'Placeholder draft — rewrite once the surface water modelling lands. The wording is far too soft to be enforceable as it stands.' }
        ]
      }
    ]
  },

  // "Policy drafting with starting points" (/policy-writing-drafting). Read only through
  // getPolicyDrafting in app/routes.js, which deep-clones this on first touch. Changing its
  // shape means bumping POLICY_DRAFTING_SCHEMA_VERSION there.
  //
  // startingPoints follow the Figma "Review starting points" screen, with "Health, inclusion and
  // safety" added as an included starting point so the chapter of that name has one behind it.
  // Chapters are created from the included starting points; Housing is part-way through, so
  // the chapter steps have something to show.
  policyDrafting: {
    reviewed: false,
    chaptersConfirmed: false,
    startingPoints: [
      { id: 'health-inclusion-safety', name: 'Health, inclusion and safety', source: 'Adopted plan', included: true },
      { id: 'housing', name: 'Housing', source: 'Adopted plan', included: true },
      { id: 'infrastructure', name: 'Infrastructure', source: 'Adopted plan', included: true },
      { id: 'design', name: 'Design', source: 'Adopted plan', included: true },
      { id: 'offices', name: 'Offices', source: 'Adopted plan', included: true },
      { id: 'retail', name: 'Retail', source: 'Adopted plan', included: false },
      { id: 'culture-visitors', name: 'Culture and visitors', source: 'Adopted plan', included: true },
      { id: 'heritage-tall-buildings', name: 'Heritage and Tall buildings', source: 'Adopted plan', included: true },
      { id: 'open-spaces', name: 'Open Spaces and Green Infrastructure', source: 'Adopted plan', included: false },
      { id: 'climate-resilience', name: 'Climate Resilience', source: 'New need', included: false },
      { id: 'transport', name: 'Transport', source: 'Adopted plan', included: true },
      { id: 'grey-belt-release', name: 'Grey belt release', source: 'NPPF/SDS', included: false },
      { id: 'new-thames-crossings', name: 'New Thames Crossings', source: 'NPPF/SDS', included: false }
    ],
    chapters: [
      { id: 'health-inclusion-safety', name: 'Health, inclusion and safety', startingPointIds: ['health-inclusion-safety'], brief: '', officers: [], explanatoryText: '', sources: [], policyAreas: null, drafts: {}, exports: [] },
      {
        id: 'housing',
        name: 'Housing',
        startingPointIds: ['housing'],
        brief: 'Plan for the homes the City needs over the plan period, including affordable housing, while protecting its role as a centre of business.',
        officers: ['sarah-jenkins', 'james-chen'],
        explanatoryText: '',
        sources: ['shma', 'nppf-housing'],
        policyAreas: null,
        drafts: {},
        // Earlier exports by colleagues, so the audit log has history to show. Each keeps a
        // snapshot of what was exported, in the shape buildDraftContent returns.
        exports: [
          {
            id: 'export-seed-1',
            what: 'Housing (full chapter)',
            format: 'PDF',
            at: '12/09/2026, 16:05',
            by: 'Sarah Jenkins',
            snapshot: {
              scope: 'chapter',
              chapters: [{
                chapter: {
                  name: 'Housing',
                  explanatoryText: 'The City has a small but growing residential population, concentrated in a handful of established residential areas. The Strategic Housing Market Assessment identifies a need for new homes that are overwhelmingly affordable, alongside the London Plan target of 146 homes a year.'
                },
                policyAreas: [
                  {
                    ref: 'HS1',
                    name: 'Location of New Housing',
                    strategic: false,
                    draft: {
                      title: 'Location of new housing',
                      context: 'This policy directs new housing to places where residents can enjoy a good standard of amenity without constraining the City\'s business function.',
                      detail: 'New housing will be supported in or near identified residential areas, where it would not prejudice the primary business function of the City or cause unacceptable harm to residential amenity.',
                      strategic: false,
                      savedAt: '12/09/2026, 15:48'
                    }
                  },
                  { ref: 'HS2', name: 'Loss of housing', strategic: false, draft: null }
                ]
              }]
            }
          },
          {
            id: 'export-seed-2',
            what: 'HS1: Location of New Housing',
            format: 'Word',
            at: '23/09/2026, 12:52',
            by: 'James Chen',
            snapshot: {
              scope: 'policy',
              chapters: [{
                chapter: { name: 'Housing', explanatoryText: '' },
                policyAreas: [{
                  ref: 'HS1',
                  name: 'Location of New Housing',
                  strategic: false,
                  draft: {
                    title: 'Location of new housing',
                    context: 'This policy directs new housing to places where residents can enjoy a good standard of amenity without constraining the City\'s business function.',
                    detail: 'New housing will be supported in or near identified residential areas, where it would not prejudice the primary business function of the City or cause unacceptable harm to residential amenity. At least 35% of homes on sites of ten or more units should be affordable, in line with the London Plan threshold approach.',
                    strategic: false,
                    savedAt: '23/09/2026, 12:40'
                  }
                }]
              }]
            }
          }
        ]
      },
      { id: 'infrastructure', name: 'Infrastructure', startingPointIds: ['infrastructure'], brief: '', officers: [], explanatoryText: '', sources: [], policyAreas: null, drafts: {}, exports: [] },
      { id: 'design', name: 'Design', startingPointIds: ['design'], brief: '', officers: [], explanatoryText: '', sources: [], policyAreas: null, drafts: {}, exports: [] },
      { id: 'offices', name: 'Offices', startingPointIds: ['offices'], brief: '', officers: [], explanatoryText: '', sources: [], policyAreas: null, drafts: {}, exports: [] },
      { id: 'culture-visitors', name: 'Culture and visitors', startingPointIds: ['culture-visitors'], brief: '', officers: [], explanatoryText: '', sources: [], policyAreas: null, drafts: {}, exports: [] },
      { id: 'heritage-tall-buildings', name: 'Heritage and Tall buildings', startingPointIds: ['heritage-tall-buildings'], brief: '', officers: [], explanatoryText: '', sources: [], policyAreas: null, drafts: {}, exports: [] },
      { id: 'transport', name: 'Transport', startingPointIds: ['transport'], brief: '', officers: [], explanatoryText: '', sources: [], policyAreas: null, drafts: {}, exports: [] }
    ]
  },

  // Managing commissioned evidence (/evidence/commissioned). One commission, part-way through:
  // the consultant has submitted a draft and the officer is reviewing it. Read only through
  // getCommission in app/routes.js, and stamped with COMMISSIONED_EVIDENCE_SCHEMA_VERSION, so
  // bump that when this shape changes. "Start from the beginning" swaps in startingCommission()
  // from app/data/commissioned-evidence.js instead. History is oldest first; pages reverse it.
  commissionedEvidence: {
    stage: 'submitted',
    status: 'draft',
    brief: {
      title: 'Housing delivery assessment',
      text: 'Assess whether the City can deliver the housing target proposed in the draft plan over the plan period. Review delivery since 2020, test the proposed annual target against the capacity of local infrastructure, and recommend a target and phasing that can be supported. Identify any sites where further environmental assessment is needed before they can be relied on.',
      link: 'https://example.com/brief.pdf',
      file: '',
      themes: ['Health, inclusion and safety', 'Housing', 'Infrastructure', 'Climate Resilience', 'Strategic policy'],
      consultant: { name: 'Elena Waters', organisation: 'Waters Consultancy', email: 'elena@waters.co.uk' },
      assignedOfficer: 'Sarah Mitchell',
      sentBy: 'danny.dyer@council.gov.uk',
      commencedOn: '15 September 2025'
    },
    report: {
      title: 'Housing delivery assessment',
      content: '',
      paragraphs: [
        { id: 'p1', text: 'The current housing delivery targets for the upcoming fiscal year are ambitious. Our preliminary analysis suggests that the local infrastructure may struggle to support the rapid expansion proposed in the draft plan.' },
        { id: 'p2', text: 'The target of 500 new units should be revised to 350 units to align with current infrastructure capacity.' },
        { id: 'p3', text: 'Further consultation with local residents and environmental groups is recommended to ensure the plan is sustainable in the long term. Transport links to the proposed development sites require significant investment before construction begins.' },
        { id: 'p4', text: 'The environmental impact assessment has not yet been completed for sites north of the river.' },
        { id: 'p5', text: 'We recommend phasing the development over a 5-year period rather than the proposed 3-year timeline to manage demand on local services.' }
      ],
      links: ['https://example.com/infrastructure-capacity-study'],
      files: ['housing-delivery-tables.xlsx'],
      file: { name: 'housing-delivery-assessment.pdf', meta: 'PDF · 42 pages · 3.8 MB' },
      submittedAt: '22 Sep 2025, 16:30'
    },
    summary: 'This assessment reviews housing delivery across the City of London from 2020 to 2025. It recommends a phased target of 350 new homes a year, supported by planned transport and utilities investment, and identifies further environmental assessment for sites north of the river.',
    comments: [
      {
        id: 'c1',
        author: 'Danny Dyer',
        at: '23 Sep 2025, 10:15',
        anchor: 'p2',
        section: 'Section 2 — Housing target',
        text: 'This target reduction needs supporting evidence from the infrastructure report. Can you reference section 3.2?',
        replies: [
          { author: 'Elena Waters', at: '23 Sep 2025, 14:20', text: 'Updated with the infrastructure report reference and revised the paragraph.' }
        ],
        resolved: false
      },
      {
        id: 'c2',
        author: 'Sarah Mitchell',
        at: '24 Sep 2025, 09:30',
        anchor: 'p4',
        section: 'Section 3 — Environmental assessment',
        text: 'The EIA timeline should be included. I have the draft dates from the environmental team.',
        replies: [],
        resolved: false
      },
      {
        id: 'c3',
        author: 'David Chen',
        at: '24 Sep 2025, 11:00',
        anchor: null,
        section: 'General comment',
        text: 'Overall good progress. Please address the two highlighted sections before we move to final review.',
        replies: [],
        resolved: false
      }
    ],
    notes: [
      { id: 'n1', text: 'I\'ve added the initial evidence source and included the supporting data supplied by the policy team.', date: '18 Sep 2025', time: '11:47', by: 'Danny Dyer', sentToConsultant: true },
      { id: 'n2', text: 'This evidence aligns with the current policy direction, but we should verify the figures before sharing.', date: '23 Sep 2025', time: '09:15', by: 'James Brown', sentToConsultant: false },
      { id: 'n3', text: 'Please clarify the source date and confirm whether the data has been updated since the last review.', date: '24 Sep 2025', time: '14:32', by: 'Sarah Mitchell', sentToConsultant: true }
    ],
    history: [
      { at: '15 Sep 2025, 09:00', actor: 'Danny Dyer', action: 'Created brief and assigned it to Elena Waters', link: { text: 'View brief', href: '/evidence/commissioned/brief' } },
      { at: '22 Sep 2025, 16:30', actor: 'Elena Waters', action: 'Submitted draft report', link: { text: 'View version', href: '/evidence/commissioned/review' } },
      { at: '23 Sep 2025, 10:15', actor: 'Danny Dyer', action: 'Added comment on Section 2 — housing target', link: { text: 'View comment', href: '/evidence/commissioned/review#comment-c1' } },
      { at: '23 Sep 2025, 14:20', actor: 'Elena Waters', action: 'Replied to comment on Section 2', link: { text: 'View comment', href: '/evidence/commissioned/review#comment-c1' } },
      { at: '24 Sep 2025, 09:30', actor: 'Sarah Mitchell', action: 'Added comment on Section 3 — EIA timeline', link: { text: 'View comment', href: '/evidence/commissioned/review#comment-c2' } },
      { at: '24 Sep 2025, 11:00', actor: 'David Chen', action: 'Added comment — overall progress note', link: { text: 'View comment', href: '/evidence/commissioned/review#comment-c3' } }
    ],
    tags: [],
    acceptedOn: null
  },

  // Managing consultation responses. Read only through getConsultationResponses in routes.js.
  // The content itself is static (app/data/consultation-responses.js); this is only what an
  // officer can change: uploads, templates, and each representation's officer, status and
  // response.
  consultationResponses: startingConsultationResponses(),

  // The side-by-side views open filtered to the worked example in the designs. These are the
  // sticky filters the kit stores from the query string, so a tester's own choice replaces them.
  crTheme: 'heritage',
  crPolicy: 'HE1'

}
