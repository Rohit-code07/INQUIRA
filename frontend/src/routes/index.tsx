import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowDown,
  ArrowRight,
  ArrowUpRight,
  BookOpenText,
  ChartNoAxesCombined,
  FileSearch,
  FileText,
  ScanSearch,
  ShieldCheck,
} from "lucide-react";
import researchHead from "@/assets/research-head.png";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "INQUIRA — From Information to Insight" },
      {
        name: "description",
        content:
          "A coordinated team of AI research agents searches, analyzes, verifies, and synthesizes source-grounded research.",
      },
      {
        property: "og:title",
        content: "INQUIRA — From Information to Insight",
      },
      {
        property: "og:description",
        content:
          "Search, analyze, verify, and synthesize information into structured research.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

const agents = [
  {
    number: "01",
    name: "Search Agent",
    description: "Finds relevant sources across the research landscape.",
    tag: "DISCOVERY",
    icon: ScanSearch,
  },
  {
    number: "02",
    name: "Reader Agent",
    description: "Extracts useful information and preserves its context.",
    tag: "EXTRACTION",
    icon: BookOpenText,
  },
  {
    number: "03",
    name: "Analyst Agent",
    description: "Compares evidence and brings meaningful patterns into view.",
    tag: "ANALYSIS",
    icon: ChartNoAxesCombined,
  },
  {
    number: "04",
    name: "Critic Agent",
    description: "Checks consistency, credibility, and source quality.",
    tag: "VERIFICATION",
    icon: ShieldCheck,
  },
  {
    number: "05",
    name: "Writer Agent",
    description: "Synthesizes the findings into a structured final report.",
    tag: "SYNTHESIS",
    icon: FileText,
  },
];

function Index() {
  return (
    <main className="research-page">
      <div className="research-shell">
        <header className="research-header">
          <a className="research-wordmark" href="#top" aria-label="INQUIRA home">
            <span className="research-mark" aria-hidden="true">R</span>
            <span>INQUIRA</span>
          </a>
          <nav className="research-nav" aria-label="Main navigation">
            <a href="#workflow">THE METHOD</a>
            <a className="nav-cta" href="#workflow">
              EXPLORE THE PROCESS <ArrowUpRight aria-hidden="true" />
            </a>
          </nav>
        </header>

        <section className="research-hero" id="top" aria-labelledby="hero-title">
          <div className="hero-copy">
            <div className="hero-micro-brand">
              <span>INQUIRA / 01</span>
              <span>MULTI-AGENT RESEARCH</span>
              <span>SOURCE-GROUNDED INTELLIGENCE</span>
            </div>
            <div className="eyebrow">MULTI-AGENT RESEARCH INTELLIGENCE</div>
            <h1 className="hero-title" id="hero-title">
              <span className="title-first">FROM INFORMATION</span>
              <span className="title-second">TO INSIGHT.</span>
            </h1>
            <p className="hero-description">
              Multiple AI agents search, analyze, verify, and synthesize information into
              structured, source-grounded research.
            </p>
            <div className="hero-actions">
              <Link className="hero-button hero-button-primary" to="/research">
                Start research <ArrowRight aria-hidden="true" />
              </Link>
              <a className="hero-button hero-button-secondary" href="#workflow">
                How it works <ArrowDown aria-hidden="true" />
              </a>
            </div>
            <div className="hero-note">Built around sources. Grounded in evidence.</div>
          </div>

          <div className="hero-visual" aria-label="Knowledge assembled from research documents">
            <span className="hero-index">A system for making sense</span>
            <img
              src={researchHead}
              alt="A human profile assembled from layered research papers, diagrams, and evidence"
              width={1280}
              height={1280}
              fetchPriority="high"
            />
            <span className="visual-status">
              SEARCH&nbsp; · &nbsp;ANALYSIS&nbsp; · &nbsp;VERIFICATION&nbsp; · &nbsp;SYNTHESIS
            </span>
          </div>
        </section>
      </div>

      <div className="hero-cut" aria-hidden="true" />

      <section className="workflow-section" id="workflow" aria-labelledby="workflow-title">
        <div className="research-shell">
          <div className="workflow-head">
            <div>
              <div className="section-kicker">Five roles. One shared inquiry.</div>
              <h2 className="workflow-title" id="workflow-title">
                Research, in concert.
              </h2>
            </div>
            <p className="workflow-intro">
              Each specialist adds a layer of rigor, carrying scattered information toward a
              clear, traceable answer.
            </p>
          </div>

          <div className="agent-pipeline">
            {agents.map((agent) => {
              const Icon = agent.icon;
              return (
                <article className="agent-card" key={agent.number}>
                  <div className="agent-topline">
                    <span className="agent-icon"><Icon aria-hidden="true" /></span>
                    <span className="agent-number">{agent.number}</span>
                  </div>
                  <div>
                    <h3 className="agent-title">{agent.name}</h3>
                    <p className="agent-description">{agent.description}</p>
                  </div>
                  <span className="agent-tag">{agent.tag}</span>
                </article>
              );
            })}
          </div>

          <div className="workflow-meta">
            <span>Sources in. Evidence through.</span>
            <span><FileSearch aria-hidden="true" /> Traceable at every step.</span>
          </div>
        </div>
      </section>

      <footer className="research-shell research-footer">
        <span className="footer-mark">INQUIRA</span>
        <span>From information to insight.</span>
      </footer>
    </main>
  );
}
