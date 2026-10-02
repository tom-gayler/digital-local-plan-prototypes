//
// Numbered-paragraph extracts from the evidence base, so the evidence viewer shows something
// that reads like a real study rather than a lone floating quotation.
//
// The cited paragraph is never written out here: `excerpt()` pulls it from
// evidence-excerpts.js by document and reference. That corpus is what the draft check scores
// against, so writing the text twice would let the two drift and the check would start
// disagreeing with what the viewer shows. The surrounding paragraphs are context written for
// this prototype — plausible, but not from any real study.
//
// A document only needs an entry here if a seeded source cites it. Anything without one falls
// back to showing the excerpt on its own (see getEvidenceDocument).
//

const { EVIDENCE_EXCERPTS } = require('./evidence-excerpts.js')

function excerpt (source, ref) {
  const hit = EVIDENCE_EXCERPTS.find(item => item.source === source && item.ref === ref)
  return hit ? hit.text : ''
}

const EVIDENCE_DOCUMENTS = {
  'Transport Capacity Study': {
    section: '2. Network capacity and demand',
    paragraphs: [
      { number: '2.5', text: 'Morning peak loadings were surveyed at all twelve interchange points over four consecutive weeks in autumn 2024. Counts were taken manually and cross-checked against automatic gate data.' },
      { number: '2.6', text: 'Three corridors are already operating above the comfort standard for more than an hour each weekday morning. On two of them, the standard is exceeded in the evening peak as well.' },
      { number: '2.7', text: excerpt('Transport Capacity Study', 'Paragraph 2.7') },
      { number: '2.8', text: 'Modelling of the committed development pipeline suggests that, without intervention, a fourth corridor will cross the comfort standard before the end of the plan period.' }
    ]
  },

  'Utilities Capacity Study': {
    section: '5. Network headroom',
    paragraphs: [
      { number: '4.9', text: 'Headroom figures in this chapter were supplied by the distribution network operators in response to a joint data request issued in January 2025.' },
      { number: '5.1', text: excerpt('Utilities Capacity Study', 'Paragraph 5.1') },
      { number: '5.2', text: 'Reinforcement lead times of three to five years were quoted for the two most constrained substations. Neither is currently programmed for investment.' },
      { number: '5.3', text: 'Where headroom is limited, phasing development to match confirmed reinforcement dates is likely to be more deliverable than seeking capacity ahead of the operator’s own programme.' }
    ]
  },

  'Employment Land Review': {
    section: '3. Floorspace supply and demand',
    paragraphs: [
      { number: '3.5', text: 'Take-up over the last five years has averaged slightly below the long-run trend, but the figure conceals a widening split between grades.' },
      { number: '3.6', text: 'Grade A stock in the core has let quickly and at rising rents throughout the period, including through the weaker years.' },
      { number: '3.7', text: excerpt('Employment Land Review', 'Paragraph 3.7') },
      { number: '3.8', text: 'Around a third of the older stock would require substantial intervention to reach the specification occupiers now expect, principally on servicing, floor-to-ceiling heights and energy performance.' }
    ]
  },

  'Town Centre Health Check 2024': {
    section: '6. Vacancy and occupier mix',
    paragraphs: [
      { number: '6.3', text: 'Ground-floor units were surveyed in March 2024 and classified by occupier type, using the same categories as the 2019 and 2021 surveys.' },
      { number: '6.4', text: 'Overall vacancy has fallen since the previous survey, though it remains above the level recorded before 2020.' },
      { number: '6.5', text: excerpt('Town Centre Health Check 2024', 'Paragraph 6.5') },
      { number: '6.6', text: 'Long-term vacancy is concentrated in the largest units. Units above 500 sqm account for a fifth of vacant floorspace but a twentieth of vacant units.' }
    ]
  },

  'Infrastructure Delivery Plan 2024': {
    section: '5. Utilities and connections',
    paragraphs: [
      { number: '5.0', text: 'This chapter covers the utility connections needed to serve committed and planned development, and the sequencing implied by them.' },
      { number: '5.1', text: 'Providers were asked to identify works that must be completed before occupation, as distinct from works that can follow it.' },
      { number: '5.2', text: excerpt('Infrastructure Delivery Plan 2024', 'Paragraph 5.2') },
      { number: '5.3', text: 'Early engagement at pre-application stage was identified by every provider consulted as the single change most likely to reduce both cost and disruption.' }
    ]
  },

  'Local Housing Needs Assessment': {
    section: 'Chapter 3: Housing need',
    paragraphs: [
      { number: '3.1', text: 'This chapter establishes the scale and mix of housing need over the plan period, using the 2021 Census as its base and the latest available household projections.' },
      { number: '3.2', text: 'Need is assessed both in the round and for each tenure, so that the affordable requirement can be read separately from the overall figure.' },
      { number: '3.3', text: excerpt('Local Housing Needs Assessment', 'Chapter 3') },
      { number: '3.4', text: 'The shortfall is not evenly spread across the period. Front-loading delivery would close more of the gap than an even annual profile, though it places more weight on sites that are deliverable early.' }
    ]
  },

  'Strategic Housing Market Assessment': {
    section: '4. Affordable housing need',
    paragraphs: [
      { number: '4.1', text: 'Affordable need is derived from the backlog of households in unsuitable housing, newly arising need, and the supply of relets, following the standard method.' },
      { number: '4.2', text: excerpt('Strategic Housing Market Assessment', 'Paragraph 4.2') },
      { number: '4.3', text: 'Need for larger homes is proportionally greater than current delivery, which has been weighted towards one- and two-bedroom units on smaller sites.' },
      { number: '8.6', text: excerpt('Strategic Housing Market Assessment', 'Paragraph 8.6') }
    ]
  },

  'Housing Topic Paper': {
    section: '2. Supply and deliverability',
    paragraphs: [
      { number: '2.6', text: 'The supply position is set out below by source, separating sites with permission from allocations and from the windfall allowance.' },
      { number: '2.7', text: 'Sites with permission account for the larger share of the first five years, and allocations for most of the remainder.' },
      { number: '2.8', text: excerpt('Housing Topic Paper', 'Paragraph 2.8') },
      { number: '2.9', text: 'A lower delivery rate assumption has therefore been tested as a sensitivity. On that assumption the five-year position is not met without additional allocations.' }
    ]
  },

  'Viability Assessment': {
    section: '5. Policy cost testing',
    paragraphs: [
      { number: '5.0', text: 'Each policy requirement carrying a cost was tested against the typologies set out in Chapter 3, at both current and reduced values.' },
      { number: '5.1', text: 'Requirements were tested cumulatively as well as individually, since it is the combined burden that determines whether a scheme comes forward.' },
      { number: '5.2', text: excerpt('Viability Assessment', 'Paragraph 5.2') },
      { number: '5.3', text: 'Where a typology failed, the binding constraint was in every case land value expectation rather than any individual policy requirement.' }
    ]
  },

  'Healthy Streets and Active Travel Study': {
    section: '4. Walking and cycling conditions',
    paragraphs: [
      { number: '4.3', text: 'Conditions were assessed against the Healthy Streets indicators on 62 links, weighted by footfall recorded in the 2024 counts.' },
      { number: '4.4', text: 'Pedestrian comfort levels fall below the recommended standard on nine links, all of them in the central area at peak times.' },
      { number: '4.5', text: excerpt('Healthy Streets and Active Travel Study', 'Paragraph 4.5') },
      { number: '4.6', text: 'Severance at the larger junctions is the most frequently cited deterrent in the accompanying user survey, ahead of both distance and weather.' }
    ]
  },

  'Freight and Servicing Study': {
    section: '2. Servicing demand and kerbside pressure',
    paragraphs: [
      { number: '2.6', text: 'Servicing trips were surveyed across a fortnight at fifteen sites, recording vehicle type, dwell time and whether the activity took place at a designated bay.' },
      { number: '2.7', text: 'More than half of observed activity took place outside a designated bay, most often on double yellow lines within 20 metres of one.' },
      { number: '2.8', text: excerpt('Freight and Servicing Study', 'Paragraph 2.8') },
      { number: '2.9', text: 'Consolidation schemes operating elsewhere report trip reductions of between 40 and 60 per cent, but depend on space being available at or near the receiving site.' }
    ]
  },

  'Public Realm and Wayfinding Study': {
    section: '2. Legibility and route choice',
    paragraphs: [
      { number: '2.1', text: 'Wayfinding was assessed through accompanied journeys with 24 participants, followed by a street-intercept survey at the main arrival points.' },
      { number: '2.2', text: 'Participants relied on landmarks and sightlines far more than on signage, and signage was most valued at decision points rather than along routes.' },
      { number: '2.3', text: excerpt('Public Realm and Wayfinding Study', 'Paragraph 2.3') },
      { number: '2.4', text: 'Where a route was not visible from the decision point, participants consistently defaulted to the wider and busier street even when it was longer.' }
    ]
  },

  'Strategic Flood Risk Assessment': {
    section: '3. Sources of flood risk',
    paragraphs: [
      { number: '3.3', text: 'Risk is assessed here from all sources — fluvial, surface water, groundwater and sewer — and mapped both separately and in combination.' },
      { number: '3.4', text: 'The fluvial flood zones cover a small proportion of the area and have not changed materially since the previous assessment.' },
      { number: '3.5', text: excerpt('Strategic Flood Risk Assessment', 'Paragraph 3.5') },
      { number: '3.6', text: 'The sequential test should therefore be applied using the combined map rather than the fluvial zones alone, or it will direct development towards surface water risk.' }
    ]
  },

  'Surface Water Management Plan': {
    section: '6. Drainage capacity and mitigation',
    paragraphs: [
      { number: '6.5', text: 'Sewer performance was modelled for the 1 in 30 and 1 in 100 year events, with and without the committed development pipeline.' },
      { number: '6.6', text: 'Surcharging is predicted at eleven locations in the 1 in 30 event, rising to nineteen once committed development is included.' },
      { number: '6.7', text: excerpt('Surface Water Management Plan', 'Paragraph 6.7') },
      { number: '6.8', text: 'Measures that attenuate run-off without reducing it at source defer the problem rather than resolving it, and perform poorly in back-to-back rainfall events.' }
    ]
  },

  'Climate Risk and Overheating Study': {
    section: '5. Overheating projections',
    paragraphs: [
      { number: '5.4', text: 'Projections use the UKCP18 central estimate, tested against the high-emissions scenario as a sensitivity.' },
      { number: '5.5', text: 'Overheating is assessed for the 2030s, 2050s and 2080s, for both the existing stock and typical new-build specifications.' },
      { number: '5.6', text: excerpt('Climate Risk and Overheating Study', 'Paragraph 5.6') },
      { number: '5.7', text: 'Single-aspect flats and upper-floor units perform worst in every scenario tested, and the gap between them and dual-aspect units widens over time.' }
    ]
  },

  'Biodiversity and Urban Greening Study': {
    section: '3. Habitat condition and connectivity',
    paragraphs: [
      { number: '3.7', text: 'Habitats were surveyed and condition-assessed using the statutory biodiversity metric, with a sample re-surveyed to check consistency.' },
      { number: '3.8', text: 'Most habitat is in moderate condition. Very little is in good condition, and what there is sits in a small number of larger sites.' },
      { number: '3.9', text: excerpt('Biodiversity and Urban Greening Study', 'Paragraph 3.9') },
      { number: '3.10', text: 'Connectivity is the weaker of the two measures. Several otherwise good sites are functionally isolated by roads with no crossing structures.' }
    ]
  },

  // Real documents, unlike the studies above. References are genuine and the substance is
  // accurate, but the wording is summarised for this prototype rather than quoted.
  // The restructured NPPF replaced continuously-numbered paragraphs with named policies (each
  // numbered from 1), so these are labelled "S3"/"HO1" etc. rather than bare paragraph numbers
  // — matching how the London Plan entry below already labels its paragraphs "H1"/"H4".
  'National Planning Policy Framework': {
    section: 'Decision-making policies; Delivering a sufficient supply of homes',
    paragraphs: [
      { number: 'S3', text: excerpt('National Planning Policy Framework', 'Policy S3') },
      { number: 'HO13', text: 'To significantly boost the supply of homes, it is important that land with permission is developed without unnecessary delay.' },
      { number: 'HO1', text: excerpt('National Planning Policy Framework', 'Policy HO1') },
      { number: 'HO5', text: excerpt('National Planning Policy Framework', 'Policy HO5') }
    ]
  },

  'London Plan': {
    section: 'Chapter 4: Housing',
    paragraphs: [
      { number: 'H1', text: excerpt('London Plan', 'Policy H1') },
      { number: 'H4', text: excerpt('London Plan', 'Policy H4') },
      { number: 'H5', text: 'The threshold approach is intended to speed up delivery by removing the need for a viability assessment where the affordable housing threshold and other criteria are met.' },
      { number: 'H10', text: excerpt('London Plan', 'Policy H10') }
    ]
  },

  'Tree Canopy Survey': {
    section: '2. Canopy cover and distribution',
    paragraphs: [
      { number: '2.0', text: 'Canopy cover was measured from 2024 aerial imagery at 1m resolution and validated against a ground sample of 200 points.' },
      { number: '2.1', text: 'Cover across the area as a whole is close to the regional average, but the average conceals a wide range between wards.' },
      { number: '2.2', text: excerpt('Tree Canopy Survey', 'Paragraph 2.2') },
      { number: '2.3', text: 'The wards with least cover are also those with the highest projected overheating risk, so the two deficits compound one another.' }
    ]
  }
}

// The extract for a source, if there is one. Falls back to a single-paragraph document built
// from the excerpt itself, so the viewer renders the same shape either way and a source added
// from the search modal is never a special case.
function getEvidenceDocument (source) {
  if (!source) return null

  const document = EVIDENCE_DOCUMENTS[source.source]
  // References are written as 'Paragraph 4.2' in the studies and 'Policy H4' in the London
  // Plan, so both labels have to come off before matching against a paragraph number.
  const number = String(source.ref || '').replace(/^(Paragraph|Policy)\s+/i, '')

  if (!document) {
    return {
      section: source.ref || '',
      paragraphs: [{ number, text: source.text || '', cited: true }]
    }
  }

  return {
    section: document.section,
    paragraphs: document.paragraphs.map(paragraph => ({
      number: paragraph.number,
      text: paragraph.text,
      // Matched on the reference where it names a paragraph, and on the text itself where it
      // names a chapter — "Chapter 3" identifies no single paragraph number.
      cited: paragraph.number === number || paragraph.text === source.text
    }))
  }
}

module.exports = { EVIDENCE_DOCUMENTS, getEvidenceDocument }
