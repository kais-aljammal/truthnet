// Mock data for TruthNet UI development
window.MOCK_CLAIM = "Studies show that 5G towers were proven to spread COVID-19 by activating viral particles in the human bloodstream.";

window.MOCK_RESULT = {
  verdict: "FALSE",
  confidence_score: 94,
  verdict_color: "red",
  headline_summary: "The claim that 5G towers spread COVID-19 by activating viral particles is not supported by any credible scientific evidence and contradicts established virology and radio-frequency physics.",
  detailed_explanation:
    "The assertion conflates two unrelated phenomena: the deployment of fifth-generation cellular infrastructure and the transmission of SARS-CoV-2, a respiratory virus. Viral particles are biological entities that propagate through respiratory droplets and aerosols; they are not influenced by non-ionizing radio-frequency radiation in the 24–100 GHz band used by 5G systems.\n\nMultiple peer-reviewed analyses, including a 2021 review in the IEEE Journal of Microwaves, have established that the photon energy of 5G transmissions is several orders of magnitude below the threshold required to alter molecular bonds in biological tissue. The World Health Organization and the International Commission on Non-Ionizing Radiation Protection both maintain that current 5G deployments fall well within established safety limits.\n\nThe specific phrase “activating viral particles in the human bloodstream” has no analogue in the published virology literature. The claim originated in a series of social-media posts in early 2020 and was subsequently amplified by coordinated disinformation networks documented by Reuters and the Atlantic Council's DFRLab.\n\nWe note that geographic correlation studies comparing 5G rollout maps with COVID-19 incidence have consistently shown no statistically significant relationship after controlling for population density and testing capacity.",
  what_is_true: [
    "5G cellular networks were being deployed during the same period as the initial COVID-19 outbreak.",
    "Both 5G and COVID-19 were significant subjects of public discussion in 2020.",
    "Some early 5G installations occurred in cities that later reported COVID-19 cases."
  ],
  what_is_false: [
    "There is no published study demonstrating that 5G radiation activates viral particles.",
    "Viral particles cannot be activated by non-ionizing electromagnetic radiation at 5G frequencies.",
    "The phrase 'activating viral particles in the human bloodstream' has no scientific basis."
  ],
  what_is_missing: [
    "The original claim omits that COVID-19 cases were documented in regions with no 5G infrastructure (e.g. rural Iran, Bolivia).",
    "No mechanism is proposed by which radio waves could interact with a protein-coated RNA virus.",
    "The cited 'studies' are not named, dated, or linked to any institution."
  ],
  manipulation_techniques_detected: [
    "Appeal to vague authority ('Studies show...') with no citation.",
    "False causation: temporal correlation presented as mechanism.",
    "Scientific-sounding jargon ('activating viral particles') used outside its real meaning.",
    "Conjunction of two unrelated emerging topics to manufacture plausibility."
  ],
  top_sources: [
    { title: "Reuters Fact Check: 5G does not spread COVID-19", url: "reuters.com/article/factcheck-5g-coronavirus", supports: "debunks" },
    { title: "World Health Organization — 5G mobile networks and health", url: "who.int/news-room/q-a-detail/radiation-5g-mobile-networks-and-health", supports: "debunks" },
    { title: "ICNIRP Guidelines for Limiting Exposure to Electromagnetic Fields (2020)", url: "icnirp.org/cms/upload/publications/ICNIRPrfgdl2020.pdf", supports: "contextualizes" },
    { title: "IEEE J. Microwaves — A Review of 5G Health Effects Research", url: "ieeexplore.ieee.org/document/9318745", supports: "contextualizes" },
    { title: "Atlantic Council DFRLab — Anatomy of a 5G-COVID conspiracy", url: "dfrlab.org/2020/04/27/5g-coronavirus-conspiracy", supports: "debunks" },
    { title: "CDC — How COVID-19 Spreads", url: "cdc.gov/coronavirus/2019-ncov/transmission", supports: "contextualizes" }
  ],
  bias_rating_of_original: "propaganda",
  domain_expert_note:
    "Reviewed by panel of three independent agents specializing in epidemiology, RF engineering, and disinformation analysis. The claim exhibits the canonical structure of a conspiracy narrative: an undefined authority, a fabricated mechanism, and an emotionally charged conclusion presented as established fact.",
  error_margin_note:
    "Confidence score reflects agent consensus over 6 retrieval cycles (σ = 1.8). Source corroboration n=14; primary literature n=4. No reasonable interpretation of the claim was found to be supportable."
};

window.MOCK_PIPELINE_STEPS = [
  { id: 1, label: "Claim Extraction", agent: "Agent A", section: "§1" },
  { id: 2, label: "Prosecution + Defense", agent: "Agents B + C", section: "§2–3" },
  { id: 3, label: "Judgment", agent: "Agent D", section: "§4" },
  { id: 4, label: "Verdict Compiled", agent: "Output", section: "§5" }
];
