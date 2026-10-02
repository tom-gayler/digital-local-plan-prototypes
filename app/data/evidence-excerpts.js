//
// Paragraph-level excerpts from the evidence base, for the "View policy
// summary" prototype's evidence search.
//
// Searching a term opens a modal listing these as excerpts, ranked by
// relevance, so a policy officer can select the passages worth keeping and
// copy them out. Each excerpt records the document it came from and the
// policies it supports, using the same policy refs as app/data/policies.js.
//
// ALL OF THIS IS INVENTED PROTOTYPE CONTENT. Document titles are the sort of
// evidence base an LPA holds, and the policy refs are City Plan 2040
// references, but the passages themselves are written for the prototype and
// are not quotations from any real study. Don't quote any of it as real.
//
// The corpus is deliberately broad rather than deep: it covers every term the
// search's type-ahead offers, so a demo doesn't dead-end on an empty result.
//

const EVIDENCE_EXCERPTS = [
  {
    text: 'Across the forty sites audited, step-free access and legible wayfinding were the two barriers raised most often. Where a step-free route existed but was signed only at the entrance, participants reported abandoning the journey partway through.',
    source: 'Inclusive Design Access Audit',
    ref: 'Paragraph 4.12',
    policyRefs: ['HL1', 'S1', 'AT1']
  },
  {
    text: 'Accessibility is treated in most schemes as a set of minimum standards to be met at the entrance rather than as a quality of the whole building. Participants described the difference between being able to enter a building and being able to use it independently.',
    source: 'Inclusive Design Access Audit',
    ref: 'Paragraph 5.3',
    policyRefs: ['HL1', 'DE3']
  },
  {
    text: 'Wayfinding on the busiest pedestrian routes is inconsistent, with three separate signage systems in use within a quarter of a mile. Legibility matters most where routes are indirect, and it is these routes that are currently the least well signed.',
    source: 'Public Realm and Wayfinding Study',
    ref: 'Paragraph 2.3',
    policyRefs: ['AT1', 'DE3', 'HL1']
  },
  {
    text: 'Household formation is projected to outpace completions in every year of the plan period, with the gap widest in the first five years. The shortfall falls most heavily on households needing affordable housing.',
    source: 'Local Housing Needs Assessment',
    ref: 'Chapter 3',
    policyRefs: ['HS1', 'S3']
  },
  {
    text: 'The assessment identifies a need for affordable housing across all size categories, with the sharpest need for family-sized homes. Delivery against that need has fallen short in each of the last five years.',
    source: 'Strategic Housing Market Assessment',
    ref: 'Paragraph 4.2',
    policyRefs: ['S3', 'HS1', 'HS4']
  },
  {
    text: 'Supply depends almost entirely on brownfield land, and the sites remaining are smaller and more constrained than those already developed. Assumptions about delivery rates carried over from earlier plans are unlikely to hold.',
    source: 'Housing Topic Paper',
    ref: 'Paragraph 2.8',
    policyRefs: ['HS1', 'S3']
  },
  {
    text: 'Housing demand is concentrated where public transport access is strongest, which is also where the network is closest to capacity at peak times. Planning growth around those locations will require capacity to be increased in step.',
    source: 'Transport Capacity Study',
    ref: 'Paragraph 2.7',
    policyRefs: ['HS1', 'S9', 'VT1']
  },
  {
    text: 'Purpose-built student accommodation has taken pressure off the private rented sector where it has been delivered in accessible locations. Where it has displaced sites suitable for conventional housing, the net effect on need has been negative.',
    source: 'Strategic Housing Market Assessment',
    ref: 'Paragraph 8.6',
    policyRefs: ['HS6', 'S3']
  },
  {
    text: 'Older residents move less often than the tenure profile would suggest. The main barrier is the absence of suitable accessible homes within the same neighbourhood rather than any unwillingness to move.',
    source: 'Health Impact and Wellbeing Study',
    ref: 'Paragraph 9.1',
    policyRefs: ['HS7', 'HL1']
  },
  {
    text: 'Single-aspect homes account for a disproportionate share of overheating risk in the modelled stock. Dual aspect is the single most effective design measure identified, for both overheating and ventilation.',
    source: 'Housing Topic Paper',
    ref: 'Paragraph 7.7',
    policyRefs: ['HS4', 'CR1', 'HS3']
  },
  {
    text: 'Pedestrian comfort levels on several key routes already fall below the standard at peak times, with footways carrying more people than their effective width allows. Development that adds movement without adding width will make this worse.',
    source: 'Healthy Streets and Active Travel Study',
    ref: 'Paragraph 4.5',
    policyRefs: ['VT1', 'S10', 'AT1']
  },
  {
    text: 'Servicing activity is the fastest growing source of kerbside conflict, driven by smaller and more frequent deliveries. Consolidation reduces the number of trips but requires space that is rarely designed into schemes from the outset.',
    source: 'Freight and Servicing Study',
    ref: 'Paragraph 2.8',
    policyRefs: ['VT2', 'VT1', 'S9']
  },
  {
    text: 'Long-stay cycle parking in existing buildings is typically full by mid-morning, while short-stay provision for visitors is scarce and poorly located. Provision that is hard to reach is not used, whatever its capacity.',
    source: 'Healthy Streets and Active Travel Study',
    ref: 'Paragraph 7.3',
    policyRefs: ['AT3', 'AT2', 'S10']
  },
  {
    text: 'The river is capable of carrying a materially greater share of construction and waste movements. The constraint is the availability of wharf capacity rather than demand for the service.',
    source: 'Freight and Servicing Study',
    ref: 'Paragraph 6.4',
    policyRefs: ['VT4', 'CE1', 'S9']
  },
  {
    text: 'Network headroom varies sharply across the area, and the tightest constraints coincide with the places where the most growth is planned. Infrastructure capacity assessments more than two years old should not be relied on.',
    source: 'Utilities Capacity Study',
    ref: 'Paragraph 5.1',
    policyRefs: ['IN2', 'IN1', 'S7']
  },
  {
    text: 'Connections are routinely retrofitted late in the development process, at greater cost and with more disruption to the street than if they had been designed in from the start.',
    source: 'Infrastructure Delivery Plan 2024',
    ref: 'Paragraph 5.2',
    policyRefs: ['IN1', 'S7']
  },
  {
    text: 'Demand for high quality, well connected office floorspace has held up, while a surplus of older stock is proving difficult to let without substantial upgrade. The gap between the two is widening.',
    source: 'Employment Land Review',
    ref: 'Paragraph 3.7',
    policyRefs: ['OF1', 'S4', 'OF2']
  },
  {
    text: 'Refurbishment of older office floorspace is viable across most of the tested typologies, though returns are thinner than for new build. Viability is most sensitive to the length of the void period rather than to construction cost.',
    source: 'Viability Assessment',
    ref: 'Paragraph 2.7',
    policyRefs: ['OF1', 'OF2', 'DE1']
  },
  {
    text: 'Meanwhile uses in long-term vacant units raised footfall on the surrounding street for as long as they ran, and in four of the nine cases the unit was let permanently within a year of the temporary use ending.',
    source: 'Town Centre Health Check 2024',
    ref: 'Paragraph 6.5',
    policyRefs: ['OF3', 'RE1', 'S5']
  },
  {
    text: 'Retention and retrofit outperformed redevelopment on whole life-cycle carbon in twenty-one of the twenty-five schemes sampled. The exceptions were buildings whose structure could not accommodate a change of use without substantial intervention.',
    source: 'Whole Life-Cycle Carbon Study',
    ref: 'Paragraph 6.4',
    policyRefs: ['DE1', 'S8']
  },
  {
    text: 'Upgrading an existing office to current standards typically emits less than half the carbon of demolition and rebuild, even allowing for a shorter remaining life. The carbon case for retrofit is strongest for buildings constructed since 1980.',
    source: 'Whole Life-Cycle Carbon Study',
    ref: 'Paragraph 8.1',
    policyRefs: ['OF1', 'DE1', 'S16']
  },
  {
    text: 'Most material leaving demolition sites is downcycled rather than reused, largely because reuse requires decisions to be taken before demolition begins. Pre-demolition audits change the outcome where they are carried out early enough.',
    source: 'Circular Economy and Waste Study',
    ref: 'Paragraph 3.8',
    policyRefs: ['S16', 'CE1', 'DE1']
  },
  {
    text: 'The panel returned repeatedly to the gap between the quality of the consented scheme and the quality of what was built. Material substitution after permission was the most common cause.',
    source: 'Design Review Panel notes',
    ref: 'Session 11',
    policyRefs: ['DE2', 'DE1', 'S8']
  },
  {
    text: 'Applying suburban daylight and sunlight targets in a dense historic centre produces results that neither reflect the existing condition nor protect amenity meaningfully. Assessment should be calibrated to the character of the surrounding area.',
    source: 'Daylight and Sunlight Technical Note',
    ref: 'Paragraph 2.4',
    policyRefs: ['DE7', 'S8']
  },
  {
    text: 'Over-lighting is more common than under-lighting on the routes surveyed, with spill into residential windows and into tree canopies recorded at most locations. Lighting designed to the task rather than to a uniform level performs better on both counts.',
    source: 'Public Realm and Wayfinding Study',
    ref: 'Paragraph 9.5',
    policyRefs: ['DE8', 'OS3', 'SA3']
  },
  {
    text: 'Shopfront alterations are individually minor and cumulatively significant, particularly in conservation areas where the rhythm of the frontage depends on the proportions of each unit.',
    source: 'Public Realm and Wayfinding Study',
    ref: 'Paragraph 8.2',
    policyRefs: ['DE5', 'RE2', 'HE1']
  },
  {
    text: 'The scale and grain of development within and adjoining conservation areas is the single most common source of harm identified. Historic routes and spaces are consistently under-protected relative to individual listed buildings.',
    source: 'Heritage and Conservation Study',
    ref: 'Chapter 4',
    policyRefs: ['HE1', 'S11']
  },
  {
    text: 'Each appraisal identifies the features that give the conservation area its character, including building lines, roofscape and the width and surfacing of historic routes. Change that erodes these incrementally is harder to resist than change that is obviously harmful.',
    source: 'Conservation Area Character Appraisals',
    ref: 'Volume 2',
    policyRefs: ['HE1', 'S11', 'DE2']
  },
  {
    text: 'Archaeological potential across much of the area is high, and deposits survive at depths that routine ground investigation does not reach. Early evaluation avoids programme risk later in the process.',
    source: 'Archaeological Priority Areas Review',
    ref: 'Paragraph 2.5',
    policyRefs: ['HE2', 'S11']
  },
  {
    text: 'Tall buildings are appropriate in a limited number of locations where they can be accommodated without harm to protected views or to the setting of designated heritage assets. Cumulative effect matters more than the impact of any single building.',
    source: 'Tall Buildings Evidence Paper',
    ref: 'Paragraph 4.2',
    policyRefs: ['S12', 'HE1', 'S13']
  },
  {
    text: 'Several of the protected views are already close to the threshold at which further development in the background would begin to erode the prominence of the landmark. Assessment should consider the view as it will be, not as it is today.',
    source: 'Protected Views Study',
    ref: 'Paragraph 3.7',
    policyRefs: ['S13', 'S12', 'HE1']
  },
  {
    text: 'Days exceeding the overheating threshold are projected to more than double by 2050, with the increase most pronounced in the densest and least vegetated parts of the area. Buildings designed to today\'s conditions will not perform acceptably over their lifetime.',
    source: 'Climate Risk and Overheating Study',
    ref: 'Paragraph 5.6',
    policyRefs: ['CR1', 'S15']
  },
  {
    text: 'Passive measures — orientation, shading, glazing ratio and thermal mass — remove most of the overheating risk in the modelled cases before any mechanical cooling is considered. Schemes that rely on cooling from the outset have usually foreclosed those options at concept stage.',
    source: 'Climate Risk and Overheating Study',
    ref: 'Paragraph 4.1',
    policyRefs: ['CR1', 'DE1']
  },
  {
    text: 'Surface water is the dominant flood risk across most of the area, and the areas at greatest risk do not align with the fluvial flood zones. The most vulnerable uses should be directed away from both.',
    source: 'Strategic Flood Risk Assessment',
    ref: 'Paragraph 3.5',
    policyRefs: ['CR2', 'S15', 'CR4']
  },
  {
    text: 'Sewer capacity in the areas of highest planned growth is already exceeded in heavy rainfall. Sustainable drainage that reduces run-off at source is the only measure identified that scales with the growth proposed.',
    source: 'Surface Water Management Plan',
    ref: 'Paragraph 6.7',
    policyRefs: ['CR3', 'CR2', 'IN2']
  },
  {
    text: 'Provision falls below the local standard in the most densely developed areas, and the deficiency is greatest where the most growth is planned. Green infrastructure functions as a network, and gaps in that network reduce the value of the spaces either side of them.',
    source: 'Open Space Assessment',
    ref: 'Paragraph 2.4',
    policyRefs: ['OS1', 'S14']
  },
  {
    text: 'Urban greening delivers most where it connects existing habitat rather than adding isolated planting. A green infrastructure requirement applied at concept stage produces markedly better outcomes than one applied at the end of design.',
    source: 'Biodiversity and Urban Greening Study',
    ref: 'Paragraph 3.9',
    policyRefs: ['OS2', 'OS3', 'S14']
  },
  {
    text: 'On-site biodiversity net gain is achievable on most of the sites tested, though rarely through ground level habitat alone. Long-term management is the most common point of failure rather than initial delivery.',
    source: 'Biodiversity and Urban Greening Study',
    ref: 'Paragraph 7.2',
    policyRefs: ['OS4', 'OS3']
  },
  {
    text: 'Canopy cover ranges from under two per cent to over twenty per cent between wards, and the lowest cover coincides with the highest projected heat risk. Replacement planting has not kept pace with losses over the last decade.',
    source: 'Tree Canopy Survey',
    ref: 'Paragraph 2.2',
    policyRefs: ['OS5', 'CR1', 'S14']
  },
  {
    text: 'Concentrations exceed the objective on a small number of enclosed street canyons, where the geometry of the street prevents dispersal. New homes fronting these streets need careful attention to ventilation and to the location of habitable rooms.',
    source: 'Air Quality Assessment',
    ref: 'Paragraph 4.9',
    policyRefs: ['HL2', 'S1']
  },
  {
    text: 'Complaints cluster where new residential development has been introduced next to established late-night and servicing uses. Designing out disturbance in the new building is more effective, and more durable, than constraining the existing business.',
    source: 'Noise and Soundscape Study',
    ref: 'Paragraph 3.5',
    policyRefs: ['HL3', 'HS3', 'CV5']
  },
  {
    text: 'Health impact assessment adds most where it is done early enough to change the scheme. Assessments submitted at application stage typically describe effects rather than reduce them.',
    source: 'Health Impact and Wellbeing Study',
    ref: 'Paragraph 3.6',
    policyRefs: ['HL9', 'S1']
  },
  {
    text: 'Protective measures added after a scheme is designed tend to be visually dominant and to close down public space. Where the same protection is achieved through levels, planting and street furniture, the result is both less hostile and less costly to maintain.',
    source: 'Crowded Places and Security Review',
    ref: 'Paragraph 2.4',
    policyRefs: ['SA1', 'SA3', 'S2']
  },
  {
    text: 'The cost of meeting accessibility requirements above the national minimum is small relative to total development cost in every tested typology, and viability is not the binding constraint in any of them.',
    source: 'Viability Assessment',
    ref: 'Paragraph 5.2',
    policyRefs: ['HL1', 'S1']
  },
  {
    text: 'The audit records a net loss of smaller venues over the last decade. Lease insecurity and rising costs are cited more often than redevelopment as the reason for closure.',
    source: 'Cultural Infrastructure Audit',
    ref: 'Paragraph 3.2',
    policyRefs: ['CV1', 'S6']
  },
  {
    text: 'The evening economy is concentrated in a small number of streets, and the cumulative effect of licensed premises in those streets is the main source of residential complaint. Diversity of offer reduces the pressure more effectively than restricting hours.',
    source: 'Evening and Night-Time Economy Study',
    ref: 'Paragraph 3.2',
    policyRefs: ['CV5', 'CV1', 'HL3']
  },
  {
    text: 'Footfall has recovered unevenly since 2020. The designated centres are performing more strongly than dispersed frontages, where vacancy has become entrenched.',
    source: 'Retail and Leisure Needs Study',
    ref: 'Paragraph 4.3',
    policyRefs: ['RE1', 'S5']
  },
  {
    text: 'Streets with continuous active frontage record higher footfall and lower vacancy than comparable streets with intermittent frontage. Blank elevations at ground floor depress activity along the length of the block, not only at the frontage itself.',
    source: 'Retail and Leisure Needs Study',
    ref: 'Paragraph 6.2',
    policyRefs: ['RE2', 'S5', 'DE3']
  },
  {
    text: 'Market trading days record materially higher footfall on the surrounding streets than non-market days, and the effect extends several streets beyond the market itself.',
    source: 'Town Centre Health Check 2024',
    ref: 'Paragraph 2.1',
    policyRefs: ['RE4', 'RE1', 'S5']
  },
  {
    text: 'Access to green space is the strongest environmental predictor of physical activity in the survey data, ahead of both street quality and proximity to sport and recreation facilities.',
    source: 'Health Impact and Wellbeing Study',
    ref: 'Paragraph 4.3',
    policyRefs: ['OS1', 'HL7', 'S14']
  },
  {
    text: 'Publicly accessible terraces are used far more where the route to them is obvious from the street and step-free throughout. Where access depends on passing a reception desk, use falls away sharply whatever the opening hours.',
    source: 'Public Realm and Wayfinding Study',
    ref: 'Paragraph 7.4',
    policyRefs: ['DE4', 'DE3', 'HL1']
  }
,

  // --- National and regional policy ------------------------------------------------------
  //
  // Unlike everything above, the National Planning Policy Framework and the London Plan are
  // REAL published documents. The paragraph and policy references below are genuine and the
  // substance is accurate, but the wording is summarised for this prototype rather than quoted
  // — do not treat it as the text of either document, and check the source before relying on
  // any of it.
  //
  // The NPPF entries below cite the restructured NPPF, which replaced the old version's
  // continuously-numbered paragraphs with named policies (e.g. "Policy S3"), each with its own
  // numbering starting from 1 — matching how the London Plan entries alongside them already
  // cite "Policy H1" rather than a paragraph number.
  {
    text: 'Decisions on development proposals should apply a presumption in favour of sustainable development, with proposals that accord with an up-to-date development plan and the Framework’s decision-making policies approved without delay.',
    source: 'National Planning Policy Framework',
    ref: 'Policy S3',
    policyRefs: ['S1', 'S3', 'HS1']
  },
  {
    text: 'Spatial development strategies, and local plans where a spatial development strategy is not in place, should be based on a housing need assessment establishing the overall number of homes needed in the area as a minimum over the plan period, using the standard method.',
    source: 'National Planning Policy Framework',
    ref: 'Policy HO1',
    policyRefs: ['S3', 'HS1']
  },
  {
    text: 'The development plan should set out policies to address the housing needs of different groups, including through affordable housing requirements and identifying sites for specialist types of accommodation such as housing for older people.',
    source: 'National Planning Policy Framework',
    ref: 'Policy HO5',
    policyRefs: ['S3', 'HS4']
  },
  {
    text: 'Ten-year targets for net housing completions are set for each borough, and boroughs should optimise the potential for housing delivery on all suitable and available brownfield sites.',
    source: 'London Plan',
    ref: 'Policy H1',
    policyRefs: ['S3', 'HS1', 'S1']
  },
  {
    text: 'A strategic target is set for 50 per cent of all new homes to be genuinely affordable, with a threshold approach applying to applications that meet or exceed 35 per cent affordable housing by habitable room without public subsidy.',
    source: 'London Plan',
    ref: 'Policy H4',
    policyRefs: ['S3', 'HS4']
  },
  {
    text: 'Schemes should determine the appropriate mix of housing sizes with regard to local need, the requirement for affordable family housing, and the character and accessibility of the location.',
    source: 'London Plan',
    ref: 'Policy H10',
    policyRefs: ['S3', 'HS4', 'HS1']
  }
]

module.exports = { EVIDENCE_EXCERPTS }
