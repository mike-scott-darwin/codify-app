export interface AuditLogEntry {
  id: string;
  agentId: string;
  agentName: string;
  agentEmoji: string;
  action: string;
  status: "completed" | "running" | "failed";
  timestamp: string;
}

// Mock data — will be replaced with real data from Supabase
export const MOCK_AUDIT_LOG: AuditLogEntry[] = [
  {
    id: "1",
    agentId: "strategy",
    agentName: "Strategy",
    agentEmoji: "🧭",
    action: "Ran /brief — weekly vault summary",
    status: "completed",
    timestamp: "2026-04-15T09:30:00Z",
  },
  {
    id: "2",
    agentId: "brand",
    agentName: "Brand",
    agentEmoji: "🎨",
    action: "Ran /voice-check on landing page draft",
    status: "completed",
    timestamp: "2026-04-15T08:15:00Z",
  },
  {
    id: "3",
    agentId: "gtm",
    agentName: "GTM",
    agentEmoji: "🚀",
    action: "Ran /facebook-ad for spring campaign",
    status: "completed",
    timestamp: "2026-04-14T16:45:00Z",
  },
  {
    id: "4",
    agentId: "sales",
    agentName: "Sales",
    agentEmoji: "🤝",
    action: "Ran /email welcome sequence",
    status: "failed",
    timestamp: "2026-04-14T14:20:00Z",
  },
  {
    id: "5",
    agentId: "research",
    agentName: "Research",
    agentEmoji: "🔍",
    action: "Ran /research competitor pricing",
    status: "completed",
    timestamp: "2026-04-14T10:00:00Z",
  },
];

export function formatAuditTimestamp(iso: string): string {
  const d = new Date(iso);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  if (diffMins < 60) return `${diffMins}m ago`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 7) return `${diffDays}d ago`;
  return d.toLocaleDateString("en-GB", { day: "numeric", month: "short" });
}
