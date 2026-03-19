export type AgentType = "ad_campaign" | "deep_research" | "content_calendar" | "congruence_audit" | "email_campaign" | "research_scout" | "trend_monitor" | "social_post_generator" | "publisher" | "audit_agent";

export interface AgentJob {
  id: string;
  user_id: string;
  agent_type: AgentType;
  config: Record<string, unknown>;
  status: "pending" | "running" | "complete" | "failed";
  progress: {
    step: number;
    totalSteps: number;
    currentAction: string;
  };
  result: unknown;
  error: string | null;
  created_at: string;
  updated_at: string;
}

export interface AgentContext {
  jobId: string;
  userId: string;
  config: Record<string, unknown>;
  refs: Record<string, string>;
  updateProgress: (step: number, totalSteps: number, currentAction: string) => Promise<void>;
}

export interface AgentResult {
  title: string;
  content: string;
  structured?: unknown;
}

export const AGENT_CONFIGS: Record<AgentType, {
  label: string;
  description: string;
  icon: string;
  steps: number;
  requiredTier: "build" | "pro" | "agency";
}> = {
  congruence_audit: {
    label: "Congruence Audit",
    description: "Check alignment across all 4 reference files. Flag contradictions and gaps.",
    icon: "✓",
    steps: 4,
    requiredTier: "build",
  },
  deep_research: {
    label: "Deep Research",
    description: "Multi-angle research on any topic, tailored to your business context.",
    icon: "◆",
    steps: 5,
    requiredTier: "build",
  },
  ad_campaign: {
    label: "Ad Campaign",
    description: "Generate a full campaign: angles, hooks, body copy, compliance check, ranking.",
    icon: "⚡",
    steps: 5,
    requiredTier: "pro",
  },
  content_calendar: {
    label: "Content Calendar",
    description: "Plan a week of content: pillars, posts, platform assignments.",
    icon: "☰",
    steps: 5,
    requiredTier: "pro",
  },
  email_campaign: {
    label: "Email Campaign",
    description: "Full email sequence with arc planning, subject lines, and timing.",
    icon: "✉",
    steps: 5,
    requiredTier: "pro",
  },
  research_scout: {
    label: "Research Scout",
    description: "Scout trending topics in your niche and generate a research brief with relevance scores.",
    icon: "◈",
    steps: 3,
    requiredTier: "pro",
  },
  trend_monitor: {
    label: "Trend Monitor",
    description: "Scan for 5 trending topics relevant to your audience with content angles.",
    icon: "◉",
    steps: 2,
    requiredTier: "pro",
  },
  social_post_generator: {
    label: "Social Post Generator",
    description: "Generate 5 platform-ready social posts using your brand voice.",
    icon: "◫",
    steps: 3,
    requiredTier: "pro",
  },
  publisher: {
    label: "Publisher",
    description: "Format generated content for platform-specific publishing.",
    icon: "▸",
    steps: 2,
    requiredTier: "pro",
  },
  audit_agent: {
    label: "Audit Agent",
    description: "Deep reference file audit — completeness, staleness, consistency scores and recommendations.",
    icon: "⊘",
    steps: 4,
    requiredTier: "pro",
  },
};
