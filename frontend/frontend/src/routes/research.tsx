import { useEffect, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Activity,
  ArrowLeft,
  ArrowRight,
  BookOpenText,
  Check,
  ChevronDown,
  CircleAlert,
  CircleCheck,
  CircleDashed,
  Clock3,
  Download,
  ExternalLink,
  FileSearch,
  FileText,
  LoaderCircle,
  Play,
  Search,
  ShieldCheck,
} from "lucide-react";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

import { Button } from "@/components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Textarea } from "@/components/ui/textarea";
import {
  downloadResearchReport,
  type ReportExportFormat,
} from "@/lib/report-export";
import {
  type AgentStatus,
  type AgentDefinition,
  type ResearchSource,
  demoAgents,
  demoResearchQuestion,
} from "@/lib/research-demo";
import { ResearchService } from "@/services/research";

export const Route = createFileRoute("/research")({
  head: () => ({
    meta: [
      { title: "Research workspace — INQUIRA" },
      {
        name: "description",
        content:
          "Explore an interactive, five-agent research demonstration with progressive evidence, source citations, and a structured report.",
      },
      { property: "og:title", content: "Research workspace — INQUIRA" },
      {
        property: "og:description",
        content:
          "Search, read, analyze, verify, and synthesize source-grounded research in an interactive demonstration.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ResearchWorkspace,
});

const agentIcons = [Search, BookOpenText, Activity, ShieldCheck, FileText];

function ResearchWorkspace() {
  const [question, setQuestion] = useState("");
  const [sessionId, setSessionId] = useState<string | null>(null);
  
  // Data state from service
  const [agents, setAgents] = useState<AgentDefinition[]>(demoAgents);
  const [sources, setSources] = useState<ResearchSource[]>([]);
  const [report, setReport] = useState<AgentDefinition | null>(null);

  const [statuses, setStatuses] = useState<AgentStatus[]>(
    demoAgents.map(() => "pending"),
  );
  const [selectedAgent, setSelectedAgent] = useState(0);
  const [activeStep, setActiveStep] = useState<number | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [downloadState, setDownloadState] = useState<"idle" | "generating" | "downloaded">("idle");
  const [timelineOpen, setTimelineOpen] = useState(true);
  const [activityItems, setActivityItems] = useState<string[]>([]);

  // Poll for updates if a session is running
  useEffect(() => {
    if (!sessionId || !isRunning) return;

    const intervalId = setInterval(async () => {
      const session = await ResearchService.getStatus(sessionId);
      if (session) {
        setStatuses(demoAgents.map(a => session.agentStatuses[a.id] || "pending"));
        setActiveStep(session.activeAgentIndex);
        setActivityItems(session.activityLog);
        
        const currentSources = await ResearchService.getSources(sessionId);
        setSources(currentSources);
        
        const updatedAgents = await Promise.all(
          demoAgents.map(async (a) => {
            if (session.agentStatuses[a.id] === 'completed') {
              const output = await ResearchService.getAgentOutput(sessionId, a.id);
              return output || a;
            }
            return a;
          })
        );
        setAgents(updatedAgents);
        
        if (session.status === "completed" || session.status === "failed") {
          setIsRunning(false);
          setActiveStep(null);
          if (session.status === "completed") {
             const finalReport = await ResearchService.getReport(sessionId);
             setReport(finalReport);
          }
        }
      }
    }, 1000);

    return () => clearInterval(intervalId);
  }, [sessionId, isRunning]);

  const completedCount = statuses.filter((status) => status === "completed").length;
  const progress = (completedCount / demoAgents.length) * 100;
  const allComplete = completedCount === demoAgents.length;

  async function startResearch() {
    if (!question.trim() || isRunning) return;
    
    // Reset local UI state
    setStatuses(demoAgents.map(() => "pending"));
    setActivityItems(["New demonstration inquiry created."]);
    setSelectedAgent(0);
    setActiveStep(0);
    setIsRunning(true);
    setSources([]);
    setReport(null);
    setAgents(demoAgents);
    setDownloadState("idle");
    
    // Start backend process
    const id = await ResearchService.startResearch(question);
    setSessionId(id);
  }

  async function downloadReport(format: ReportExportFormat) {
    if (!allComplete || !report || downloadState === "generating") return;

    setDownloadState("generating");
    await new Promise<void>((resolve) => window.requestAnimationFrame(() => resolve()));

    try {
      downloadResearchReport({
        question,
        report,
        agents,
        sources,
        generatedAt: new Date(),
      }, format);
      setDownloadState("downloaded");
      window.setTimeout(() => setDownloadState("idle"), 3000);
    } catch {
      setDownloadState("idle");
    }
  }

  const selected = agents[selectedAgent] || demoAgents[selectedAgent];
  if (!selected) return null;

  return (
    <main className="research-page research-workspace-page">
      <div className="research-shell">
        <header className="research-header workspace-header">
          <Link className="research-wordmark" to="/" aria-label="INQUIRA home">
            <span className="research-mark" aria-hidden="true">R</span>
            <span>INQUIRA</span>
          </Link>
          <nav className="research-nav" aria-label="Workspace navigation">
            <span className="workspace-demo-label">INTERACTIVE DEMONSTRATION</span>
            <Link className="nav-cta" to="/"><ArrowLeft aria-hidden="true" /> HOME</Link>
          </nav>
        </header>

        <section className="workspace-intro" aria-labelledby="workspace-title">
          <div className="eyebrow">A source-grounded inquiry</div>
          <h1 className="workspace-title" id="workspace-title">Research workspace</h1>
          <p className="workspace-deck">
            Watch a research question move through five specialist reviews, from discovery to report.
          </p>
        </section>

        <section className="workspace-query" aria-labelledby="query-heading">
          <div className="workspace-section-heading">
            <span className="workspace-index">01 / INQUIRY</span>
            <h2 id="query-heading">Your research question</h2>
          </div>
          <form
            className="workspace-query-form"
            onSubmit={(event) => {
              event.preventDefault();
              startResearch();
            }}
          >
            <Textarea
              aria-label="Research question"
              className="workspace-question-input"
              value={question}
              onChange={(event) => setQuestion(event.target.value)}
              placeholder="What would you like to investigate?"
              maxLength={500}
              rows={3}
              disabled={isRunning}
            />
            <div className="workspace-query-footer">
              <p className="workspace-example">
                <span>EXAMPLE</span>{" "}
                <button
                  className="workspace-example-link"
                  type="button"
                  onClick={() => setQuestion(demoResearchQuestion)}
                  disabled={isRunning}
                >
                  Urban heat &amp; public health
                </button>
              </p>
              <Button
                className="workspace-run-button"
                type="submit"
                disabled={!question.trim() || isRunning}
              >
                {isRunning ? (
                  <>Researching <LoaderCircle aria-hidden="true" className="workspace-spin" /></>
                ) : allComplete ? (
                  <>Run again <ArrowRight aria-hidden="true" /></>
                ) : (
                  <>Start research <Play aria-hidden="true" /></>
                )}
              </Button>
            </div>
          </form>
          <div className="workspace-demo-notice" role="note">
            <CircleAlert aria-hidden="true" />
            <span>
              Demonstration mode. The stages use sample findings and references; they are not fetched or verified for your question.
            </span>
          </div>
        </section>

        <section className="workspace-process" aria-labelledby="process-heading">
          <div className="workspace-process-topline">
            <div className="workspace-section-heading">
              <span className="workspace-index">02 / METHOD</span>
              <h2 id="process-heading">Research in progress</h2>
            </div>
            <span className="workspace-progress-label" aria-live="polite">
              {isRunning ? "IN MOTION" : allComplete ? "COMPLETE" : "READY"}
              <span>{Math.round(progress)}%</span>
            </span>
          </div>
          <div
            className="workspace-progress-track"
            role="progressbar"
            aria-label="Research progress"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={progress}
          >
            <span style={{ width: `${progress}%` }} />
          </div>
          <div className={`workspace-agent-list${isRunning ? " is-running" : ""}`}>
            {agents.map((agent, index) => {
              const Icon = agentIcons[index] ?? FileSearch;
              const status = statuses[index] ?? "pending";
              return (
                <div className="workspace-stage-wrap" key={agent.id}>
                  <Button
                    aria-label={`${agent.role}: ${status}`}
                    aria-pressed={selectedAgent === index}
                    className={`workspace-stage${status === "working" ? " is-working" : ""}${selectedAgent === index ? " is-selected" : ""}`}
                    onClick={() => setSelectedAgent(index)}
                    variant="ghost"
                  >
                    <span className="workspace-stage-icon"><Icon aria-hidden="true" /></span>
                    <span className="workspace-stage-title">{agent.name}</span>
                    <span className={`workspace-stage-status is-${status}`}>
                      {statusIcon(status)}
                      <span>{status}</span>
                    </span>
                  </Button>
                  {index < agents.length - 1 && (
                    <span className={`workspace-connection${status === "completed" ? " is-passed" : ""}`} aria-hidden="true">
                      {status === "working" && <span className="workspace-flow-dot" />}
                      <ArrowRight />
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </section>

        <Collapsible className="workspace-activity" open={timelineOpen} onOpenChange={setTimelineOpen}>
          <div className="workspace-activity-heading">
            <span className="workspace-section-heading">
              <span className="workspace-index">ACTIVITY</span>
              <span className="workspace-activity-count">{activityItems.length} events</span>
            </span>
            <CollapsibleTrigger asChild>
              <Button
                className="workspace-collapse-button"
                variant="ghost"
                aria-label={timelineOpen ? "Collapse activity timeline" : "Expand activity timeline"}
              >
                <span>{timelineOpen ? "Hide timeline" : "Show timeline"}</span>
                <ChevronDown aria-hidden="true" className={timelineOpen ? "is-open" : ""} />
              </Button>
            </CollapsibleTrigger>
          </div>
          <CollapsibleContent>
            <ol className="workspace-activity-list" aria-live="polite">
              {activityItems.length > 0 ? activityItems.map((item, index) => (
                <li key={`${item}-${index}`}><Clock3 aria-hidden="true" /><span>{item}</span></li>
              )) : (
                <li className="workspace-activity-empty"><CircleDashed aria-hidden="true" /><span>Agent activity will appear here when your inquiry starts.</span></li>
              )}
            </ol>
          </CollapsibleContent>
        </Collapsible>

        <section className="workspace-output" aria-labelledby="output-heading">
          <div className="workspace-output-header">
            <div className="workspace-section-heading">
              <span className="workspace-index">03 / REVIEW</span>
              <h2 id="output-heading">Agent outputs</h2>
            </div>
            {allComplete && <span className="workspace-report-complete"><Check aria-hidden="true" /> FINAL REPORT READY</span>}
          </div>

          <div className="workspace-output-layout">
            <nav className="workspace-output-nav" aria-label="Research agent outputs">
              {agents.map((agent, index) => {
                const status = statuses[index] ?? "pending";
                return (
                  <Button
                    key={agent.id}
                    aria-pressed={selectedAgent === index}
                    className={`workspace-output-link${selectedAgent === index ? " is-selected" : ""}`}
                    onClick={() => setSelectedAgent(index)}
                    variant="ghost"
                  >
                    <span className="workspace-output-link-number">{agent.number}</span>
                    <span>{agent.role}</span>
                    {status === "completed" && <CircleCheck aria-label="Completed" />}
                  </Button>
                );
              })}
            </nav>

            <article className="workspace-agent-output" aria-live="polite">
              <div className="workspace-agent-output-top">
                <span className="workspace-index">{selected.number} / {selected.tag}</span>
                <span className={`workspace-output-badge is-${statuses[selectedAgent] ?? 'pending'}`}>
                  {statusIcon(statuses[selectedAgent] ?? 'pending')}{statuses[selectedAgent] ?? 'pending'}
                </span>
              </div>
              {statuses[selectedAgent] === "completed" ? (
                <>
                  <h3>{selected.headline}</h3>
                  <div className="workspace-output-copy markdown-prose">
                    {selected.paragraphs.map((paragraph, idx) => (
                      <ReactMarkdown key={idx} remarkPlugins={[remarkGfm]}>{paragraph}</ReactMarkdown>
                    ))}
                  </div>
                  {selected.findings.length > 0 && (
                    <ol className="workspace-findings-list">
                      {selected.findings.map((finding) => (
                        <li key={finding.text}>
                          <span>{finding.text}</span>
                          {finding.sources.length > 0 && <CitationLinks sourceIds={finding.sources} sources={sources} />}
                        </li>
                      ))}
                    </ol>
                  )}
                  {selected.id === "search" && (
                    <div className="workspace-search-sources">
                      <h4><FileSearch aria-hidden="true" /> Sources collected</h4>
                      {sources.map((source) => <SourceRow key={source.id} source={source} />)}
                    </div>
                  )}
                  {selected.sourceIds.length > 0 && <SourceChips sourceIds={selected.sourceIds} sources={sources} />}
                </>
              ) : statuses[selectedAgent] === "working" ? (
                <div className="workspace-output-placeholder">
                  <LoaderCircle aria-hidden="true" className="workspace-spin" />
                  <h3>{selected.role} is reviewing the inquiry.</h3>
                  <p>Its findings will appear here before the next agent begins.</p>
                </div>
              ) : statuses[selectedAgent] === "failed" ? (
                <div className="workspace-output-placeholder">
                  <CircleAlert aria-hidden="true" />
                  <h3>This review could not be completed.</h3>
                  <p>The agent can be retried when connected to a live research service.</p>
                </div>
              ) : (
                <div className="workspace-output-placeholder">
                  <CircleDashed aria-hidden="true" />
                  <h3>{selected.role} is standing by.</h3>
                  <p>Start the research demonstration to inspect its findings.</p>
                </div>
              )}
            </article>
          </div>
        </section>
      </div>

      <section className="workspace-report-section" aria-labelledby="report-title">
        <div className="research-shell">
          <div className="workspace-report-topline">
            <div className="workspace-section-heading">
              <span className="workspace-index">04 / SYNTHESIS</span>
              <h2 id="report-title">Final research report</h2>
            </div>
            <div className="workspace-report-actions">
              <span className={`workspace-report-label${allComplete ? " is-complete" : ""}`}>
                {allComplete ? <><CircleCheck aria-hidden="true" /> RESEARCH COMPLETE</> : <><Clock3 aria-hidden="true" /> AVAILABLE WHEN COMPLETE</>}
              </span>
              {allComplete && report && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      className={`workspace-download-button${downloadState !== "idle" ? ` is-${downloadState}` : ""}`}
                      type="button"
                      disabled={downloadState === "generating"}
                    >
                      {downloadState === "generating" ? (
                        <>Generating report <LoaderCircle aria-hidden="true" className="workspace-spin" /></>
                      ) : downloadState === "downloaded" ? (
                        <>Report downloaded <Check aria-hidden="true" /></>
                      ) : (
                        <><Download aria-hidden="true" /> Download report</>
                      )}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="workspace-download-menu" align="end" sideOffset={8}>
                    <DropdownMenuLabel className="workspace-download-menu-label">Download report</DropdownMenuLabel>
                    <DropdownMenuSeparator className="workspace-download-menu-separator" />
                    <DropdownMenuItem className="workspace-download-menu-item" onSelect={() => void downloadReport("pdf")}>
                      <FileText aria-hidden="true" /> PDF
                    </DropdownMenuItem>
                    <DropdownMenuItem className="workspace-download-menu-item" onSelect={() => void downloadReport("markdown")}>
                      <FileText aria-hidden="true" /> Markdown
                    </DropdownMenuItem>
                    <DropdownMenuItem className="workspace-download-menu-item" onSelect={() => void downloadReport("txt")}>
                      <FileText aria-hidden="true" /> TXT
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>
          </div>
          {allComplete && report ? (
            <div className="workspace-report-body">
              <div className="workspace-report-meta">
                <span>INQUIRA RESEARCH REPORT</span>
                <span>{sources.length} SOURCES</span>
              </div>
              <p className="workspace-report-question">Inquiry: {question.trim()}</p>
              <div className="workspace-output-copy markdown-prose">
                {report.paragraphs.map((p, i) => (
                  <ReactMarkdown key={i} remarkPlugins={[remarkGfm]}>{p}</ReactMarkdown>
                ))}
              </div>
              <div className="workspace-report-evidence">
                <h4>Evidence &amp; references</h4>
                {sources.map((source) => <SourceRow key={source.id} source={source} />)}
              </div>
            </div>
          ) : (
            <div className="workspace-report-empty">
              <FileText aria-hidden="true" />
              <p>The report will take shape here as each agent completes its review.</p>
            </div>
          )}
        </div>
      </section>

      <footer className="research-shell research-footer workspace-footer">
        <Link className="footer-mark" to="/">INQUIRA</Link>
        <span>From information to insight.</span>
      </footer>
    </main>
  );
}

function CitationLinks({ sourceIds, sources }: { sourceIds: string[], sources: ResearchSource[] }) {
  if (!sources || sources.length === 0) return null;
  return (
    <span className="workspace-citations" aria-label="Cited sources">
      {sourceIds.map((id) => {
        const source = sources.find((item) => item.id === id);
        return source ? <a href={`#${source.id}`} key={id}>[{source.number}]</a> : null;
      })}
    </span>
  );
}

function SourceChips({ sourceIds, sources }: { sourceIds: string[], sources: ResearchSource[] }) {
  if (!sources || sources.length === 0) return null;
  return (
    <div className="workspace-source-chips">
      <span className="workspace-index">REFERENCES</span>
      <CitationLinks sourceIds={sourceIds} sources={sources} />
    </div>
  );
}

function SourceRow({ source }: { source: ResearchSource }) {
  return (
    <div className="workspace-source-row" id={source.id}>
      <span className="workspace-source-number">{source.number}</span>
      <div className="workspace-source-copy">
        <a href={source.url} target="_blank" rel="noreferrer">
          {source.title}<ExternalLink aria-hidden="true" />
        </a>
        <span>{source.publisher}</span>
        <p>{source.detail}</p>
      </div>
    </div>
  );
}

function statusIcon(status: AgentStatus) {
  if (status === "working") return <LoaderCircle aria-hidden="true" className="workspace-spin" />;
  if (status === "completed") return <CircleCheck aria-hidden="true" />;
  if (status === "failed") return <CircleAlert aria-hidden="true" />;
  return <CircleDashed aria-hidden="true" />;
}
