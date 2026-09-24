import {
  type AgentDefinition,
  type AgentStatus,
  type ResearchSource,
  demoAgents,
} from "@/lib/research-demo";

export interface ResearchSession {
  id: string;
  question: string;
  status: "pending" | "running" | "completed" | "failed";
  agentStatuses: Record<string, AgentStatus>;
  activityLog: string[];
  activeAgentIndex: number | null;
  apiData?: any;
}

// In-memory store for sessions
const sessions = new Map<string, ResearchSession>();

export const ResearchService = {
  /**
   * Starts a new research process against the backend API
   */
  async startResearch(question: string): Promise<string> {
    const sessionId = crypto.randomUUID();
    
    const initialStatuses: Record<string, AgentStatus> = {};
    demoAgents.forEach(a => {
      initialStatuses[a.id] = "pending";
    });

    const session: ResearchSession = {
      id: sessionId,
      question,
      status: "running",
      agentStatuses: initialStatuses,
      activityLog: ["Research inquiry created. Connecting to INQUIRA backend..."],
      activeAgentIndex: null, // We'll keep it at 0 to show the first agent as working, or just cycle them
    };
    
    sessions.set(sessionId, session);
    
    // Start backend request asynchronously
    this._runActualResearch(sessionId, question);
    
    return sessionId;
  },

  /**
   * Gets the current status of the research process
   */
  async getStatus(sessionId: string): Promise<ResearchSession | null> {
    const session = sessions.get(sessionId);
    if (!session) return null;
    return { ...session };
  },

  /**
   * Helper to normalize backend content to string
   */
  _normalizeContent(raw: any): string {
    if (!raw) return "";
    if (typeof raw === "string") return raw;
    if (Array.isArray(raw)) {
      return raw.map(item => item?.text || (typeof item === "string" ? item : JSON.stringify(item))).join("\n\n");
    }
    if (typeof raw === "object") {
      return JSON.stringify(raw);
    }
    return String(raw);
  },

  /**
   * Gets the sources collected (usually from search agent)
   */
  async getSources(sessionId: string): Promise<ResearchSource[]> {
    const session = sessions.get(sessionId);
    if (!session || !session.apiData || !session.apiData.search_results) return [];
    
    const searchStr = this._normalizeContent(session.apiData.search_results);
    
    return [{
      id: "source-api",
      number: "01",
      title: "Backend Search Results",
      publisher: "INQUIRA Search Agent",
      url: "#",
      detail: searchStr.substring(0, 150) + "..."
    }];
  },

  /**
   * Gets output from a specific agent
   */
  async getAgentOutput(sessionId: string, agentId: string): Promise<AgentDefinition | null> {
    const session = sessions.get(sessionId);
    if (!session || session.status !== "completed" || !session.apiData) return null;
    
    const baseAgent = demoAgents.find(a => a.id === agentId);
    if (!baseAgent) return null;

    let rawContent = "";
    switch(agentId) {
      case "search": rawContent = session.apiData.search_results; break;
      case "reader": rawContent = session.apiData.reader_result; break;
      case "analyst": rawContent = "Analysis is implicitly combined into the process."; break;
      case "critic": rawContent = session.apiData.critic_feedback; break;
      case "writer": rawContent = session.apiData.report; break;
    }
    
    const contentStr = this._normalizeContent(rawContent);
    const paragraphs = contentStr ? [contentStr] : baseAgent.paragraphs;

    return {
      ...baseAgent,
      paragraphs,
      findings: [], // clear mock findings
      sourceIds: [] // clear mock source ids
    };
  },

  /**
   * Gets the final report if synthesis is complete
   */
  async getReport(sessionId: string): Promise<AgentDefinition | null> {
    const session = sessions.get(sessionId);
    if (!session || session.status !== "completed") return null;
    
    return this.getAgentOutput(sessionId, "writer");
  },

  /**
   * Internal function to call the backend API and update session state
   */
  async _runActualResearch(sessionId: string, question: string) {
    const session = sessions.get(sessionId);
    if (!session) return;
    
    try {
      session.activityLog.push("Executing multi-agent research pipeline...");
      session.activeAgentIndex = 0;
      demoAgents.forEach(a => {
        session.agentStatuses[a.id] = "working"; // Mark all as working to signify full pipeline processing
      });
      
      const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:8000";
      const response = await fetch(`${apiUrl}/api/research`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question })
      });
      
      if (!response.ok) {
        throw new Error(`API returned ${response.status}`);
      }
      
      const data = await response.json();
      if (!data.success) {
        throw new Error(data.error || "Unknown error from API");
      }
      
      // Store result and mark complete
      session.apiData = data.result;
      
      demoAgents.forEach(a => {
        session.agentStatuses[a.id] = "completed";
      });
      session.activeAgentIndex = null;
      session.status = "completed";
      session.activityLog.push("Research process completed successfully.");
    } catch (e: any) {
      session.status = "failed";
      session.activeAgentIndex = null;
      demoAgents.forEach(a => {
        session.agentStatuses[a.id] = "failed";
      });
      session.activityLog.push(`Research could not be completed. Please try again. Error: ${e.message}`);
    }
  }
};
