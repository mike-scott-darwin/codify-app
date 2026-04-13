import { ExtractButton, NextStepAction } from "./building-actions";

interface BuildingStateProps {
  depth: { file: string; label: string; words: number; level: "deep" | "growing" | "needs-attention" }[];
  activity: { sha: string; message: string; date: string; author: string }[] | null;
}

const reasons: Record<string, string> = {
  Soul: "outputs won't reflect your identity",
  Audience: "content won't speak their language",
  Offer: "proposals won't explain your value",
  Voice: "everything will sound generic",
};

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

function commitBadge(message: string): { label: string; color: string } {
  const msg = message.toLowerCase();
  if (msg.startsWith("sync:")) return { label: "Sync", color: "text-purple bg-purple/10" };
  if (msg.startsWith("extract:")) return { label: "Extract", color: "text-green bg-green/10" };
  if (msg.startsWith("[add]")) return { label: "Add", color: "text-blue bg-blue/10" };
  if (msg.startsWith("[update]")) return { label: "Update", color: "text-amber bg-amber/10" };
  if (msg.startsWith("[fix]")) return { label: "Fix", color: "text-red bg-red/10" };
  if (msg.startsWith("fix:")) return { label: "Fix", color: "text-red bg-red/10" };
  return { label: "Change", color: "text-muted bg-muted/10" };
}

export default function BuildingState({ depth, activity }: BuildingStateProps) {
  const activeCount = depth.filter((d) => d.words > 800).length;
  const needsAttention = depth.find((d) => d.level === "needs-attention");
  const recentActivity = activity?.slice(0, 5) ?? [];

  return (
    <div className="max-w-2xl mx-auto px-4 py-12">
      <h1 className="text-2xl font-sans font-bold text-foreground mb-2">
        Your Vault — Building
      </h1>
      <p className="text-sm text-muted mb-10">
        {activeCount} of 4 context files active
      </p>

      {/* Context Depth */}
      <div className="bg-surface border border-border rounded-xl p-5 mb-6">
        <h2 className="text-sm font-sans font-bold text-foreground mb-4">Context Depth</h2>
        <div className="space-y-4">
          {depth.map((d) => (
            <div key={d.file}>
              <div className="flex justify-between items-center text-xs mb-1.5">
                <span className="text-muted">{d.label}</span>
                <div className="flex items-center gap-3">
                  <span
                    className={
                      d.level === "deep"
                        ? "text-green"
                        : d.level === "growing"
                        ? "text-amber"
                        : "text-red"
                    }
                  >
                    {d.words.toLocaleString()} words
                    {d.level === "deep"
                      ? " — Deep"
                      : d.level === "growing"
                      ? " — Growing"
                      : " — Needs work"}
                  </span>
                  {d.words < 100 && <ExtractButton file={d.file} />}
                </div>
              </div>
              <div className="h-2 bg-background rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all ${
                    d.level === "deep"
                      ? "bg-green"
                      : d.level === "growing"
                      ? "bg-amber"
                      : "bg-red/40"
                  }`}
                  style={{ width: `${Math.min((d.words / 3000) * 100, 100)}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Next Step */}
      {needsAttention && (
        <div className="mb-6">
          <NextStepAction
            file={needsAttention.label}
            reason={reasons[needsAttention.label] ?? "your vault will have gaps"}
          />
        </div>
      )}

      {/* Recent Activity */}
      {recentActivity.length > 0 && (
        <div className="bg-surface border border-border rounded-xl p-5">
          <h2 className="text-sm font-sans font-bold text-foreground mb-3">Recent Activity</h2>
          <div className="space-y-2">
            {recentActivity.map((commit) => {
              const badge = commitBadge(commit.message);
              return (
                <div key={commit.sha} className="flex items-start gap-3 py-1.5">
                  <span
                    className={`text-xs px-1.5 py-0.5 rounded font-medium shrink-0 ${badge.color}`}
                  >
                    {badge.label}
                  </span>
                  <p className="text-sm text-muted truncate flex-1">
                    {commit.message.replace(/^\[?\w+\]?\s*:?\s*/i, "")}
                  </p>
                  <span className="text-xs text-dim shrink-0">{timeAgo(commit.date)}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
