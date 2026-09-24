export type AgentStatus = "pending" | "working" | "completed" | "failed";

export type ResearchSource = {
  id: string;
  number: string;
  title: string;
  publisher: string;
  url: string;
  detail: string;
};

export type AgentDefinition = {
  id: string;
  number: string;
  name: string;
  role: string;
  tag: string;
  description: string;
  headline: string;
  paragraphs: string[];
  findings: { text: string; sources: string[] }[];
  sourceIds: string[];
};

export const demoResearchQuestion =
  "How can cities reduce urban heat while protecting vulnerable residents?";

export const demoSources: ResearchSource[] = [
  {
    id: "source-1",
    number: "01",
    title: "Learn About Heat Islands",
    publisher: "U.S. Environmental Protection Agency",
    url: "https://www.epa.gov/heatislands/learn-about-heat-islands",
    detail: "How built environments intensify heat, with mitigation approaches.",
  },
  {
    id: "source-2",
    number: "02",
    title: "Urban Heat Island Effect",
    publisher: "NASA Earth Observatory",
    url: "https://earthobservatory.nasa.gov/features/UrbanHeatIsland",
    detail: "Satellite observations and the drivers of urban heat islands.",
  },
  {
    id: "source-3",
    number: "03",
    title: "Climate change and health",
    publisher: "World Health Organization",
    url: "https://www.who.int/news-room/fact-sheets/detail/climate-change-and-health",
    detail: "Health risks from rising temperatures and unequal exposure.",
  },
];

export const demoAgents: AgentDefinition[] = [
  {
    id: "search",
    number: "01",
    name: "Search",
    role: "Search Agent",
    tag: "DISCOVERY",
    description: "Finds a focused set of useful sources.",
    headline: "Three starting points, selected for relevance.",
    paragraphs: [
      "This demonstration gathers a small reference set spanning heat mitigation, satellite observations, and public-health risk. In a live run, this stage would search for sources about your specific question.",
    ],
    findings: [],
    sourceIds: ["source-1", "source-2", "source-3"],
  },
  {
    id: "reader",
    number: "02",
    name: "Reader",
    role: "Reader Agent",
    tag: "EXTRACTION",
    description: "Extracts evidence and keeps its context.",
    headline: "Evidence kept close to its original source.",
    paragraphs: [
      "The reference set describes heat as a product of both physical surroundings and human exposure. These short notes summarize the demonstration material; they are not quoted passages.",
    ],
    findings: [
      { text: "Dark surfaces and limited vegetation can intensify neighborhood heat.", sources: ["source-1", "source-2"] },
      { text: "Extreme heat is a health risk, with the burden shaped by who is exposed and who can access protection.", sources: ["source-3"] },
      { text: "Cooling interventions can be considered at both the neighborhood and building scale.", sources: ["source-1"] },
    ],
    sourceIds: ["source-1", "source-2", "source-3"],
  },
  {
    id: "analyst",
    number: "03",
    name: "Analyst",
    role: "Analyst Agent",
    tag: "ANALYSIS",
    description: "Compares evidence and identifies patterns.",
    headline: "The strongest response connects place with people.",
    paragraphs: [
      "The evidence points toward a combined approach: target the hottest places, choose interventions suited to each block, and prioritize the people most at risk.",
    ],
    findings: [
      { text: "Measure heat and exposure locally before deciding where resources go.", sources: ["source-2", "source-3"] },
      { text: "Pair neighborhood-scale greening with reflective or shaded built surfaces.", sources: ["source-1", "source-2"] },
      { text: "Assess benefits by health and access, not just area treated.", sources: ["source-3"] },
    ],
    sourceIds: ["source-1", "source-2", "source-3"],
  },
  {
    id: "critic",
    number: "04",
    name: "Critic",
    role: "Critic Agent",
    tag: "VERIFICATION",
    description: "Checks credibility, coverage, and uncertainty.",
    headline: "Useful guidance; not a local impact evaluation.",
    paragraphs: [
      "The sources include public agencies and an international health authority. This is a compact, illustrative sample—not a systematic review—and it does not establish which intervention would work best in a particular city.",
    ],
    findings: [
      { text: "Source publishers and source types are identifiable.", sources: ["source-1", "source-2", "source-3"] },
      { text: "Recommendations require local temperature, health, and access data to prioritize fairly.", sources: ["source-2", "source-3"] },
      { text: "This demonstration has no live retrieval or independent fact-checking.", sources: [] },
    ],
    sourceIds: ["source-1", "source-2", "source-3"],
  },
  {
    id: "writer",
    number: "05",
    name: "Writer",
    role: "Writer Agent",
    tag: "SYNTHESIS",
    description: "Shapes the reviewed material into a report.",
    headline: "A practical starting point for cooler, fairer cities.",
    paragraphs: [
      "Cities can reduce heat exposure by combining place-based cooling measures with health-led prioritization. Begin with a local picture of heat and vulnerability, then direct investment to the neighborhoods where both are greatest.",
    ],
    findings: [
      { text: "Map hot spots alongside indicators of health risk and access to cooling.", sources: ["source-2", "source-3"] },
      { text: "Mix shade, vegetation, and cooler surfaces to respond to neighborhood conditions.", sources: ["source-1", "source-2"] },
      { text: "Track who benefits and revise plans as local evidence improves.", sources: ["source-3"] },
    ],
    sourceIds: ["source-1", "source-2", "source-3"],
  },
];