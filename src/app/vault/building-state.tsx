import { ExtractButton, NextStepAction } from "./building-actions";

interface BuildingStateProps {
  depth: { file: string; label: string; words: number; level: "deep" | "growing" | "needs-attention" }[];
  activity: { sha: string; message: string; date: string; author: string }[] | null;
}

const fileContext: Record<string, { question: string; unlock: string }> = {
  Soul: {
    question: "Why does your business exist?",
    unlock: "Without this, AI doesn't know what makes you different — everything sounds generic.",
  },
  Audience: {
    question: "Who are you selling to?",
    unlock: "Without this, your ads and content won't speak your customer's language.",
  },
  Offer: {
    question: "What do you actually sell?",
    unlock: "Without this, proposals and sales content can't explain your value properly.",
  },
  Voice: {
    question: "How do you naturally communicate?",
    unlock: "Without this, every output reads like it was written by a robot.",
  },
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

export default function BuildingState({ depth, activity }: BuildingStateProps) {
  const activeCount = depth.filter((d) => d.words > 800).length;
  const needsAttention = depth.find((d) => d.level === "needs-attention");
  const recentActivity = activity?.slice(0, 5) ?? [];

  const progressPercent = Math.round((activeCount / 4) * 100);

  return (
    <div className="max-w-2xl mx-auto px-4 py-12">
      {/* Progress header */}
      <div className="flex items-center gap-3 mb-2">
        <h1 className="text-2xl font-sans font-bold text-foreground">
          {activeCount === 0 ? "Getting started" : activeCount < 4 ? "Making progress" : "Almost there"}
        </h1>
        <span className="text-sm text-muted bg-surface border border-border rounded-full px-3 py-1">
          {activeCount}/4 complete
        </span>
      </div>
      <p className="text-sm text-muted mb-8">
        {activeCount === 0
          ? "Once you complete your four core conversations, AI will actually understand your business."
          : activeCount < 3
          ? "Each section you finish makes everything AI creates for you more accurate."
          : "One more section and your AI will have everything it needs to produce real work."}
      </p>

      {/* Overall progress bar */}
      <div className="mb-8">
        <div className="h-2 bg-background rounded-full overflow-hidden">
          <div
            className="h-full rounded-full bg-gradient-to-r from-blue to-green transition-all"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* File progress — business questions, not file names */}
      <div className="space-y-3 mb-8">
        {depth.map((d) => {
          const ctx = fileContext[d.label] ?? { question: d.label, unlock: "" };
          const isDone = d.level === "deep";
          const isEmpty = d.words < 100;

          return (
            <div
              key={d.file}
              className={`bg-surface border rounded-xl p-4 transition-colors ${
                isDone ? "border-green/20" : isEmpty ? "border-red/20" : "border-border"
              }`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3 flex-1">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${
                    isDone ? "bg-green/10" : "bg-background"
                  }`}>
                    {isDone ? (
                      <span className="text-green text-xs">&#10003;</span>
                    ) : (
                      <span className="text-dim text-xs">&#9675;</span>
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-foreground">{ctx.question}</p>
                    <p className="text-xs text-muted mt-0.5">
                      {isDone
                        ? `${d.label} — ${d.words.toLocaleString()} words captured`
                        : d.words > 0
                        ? `${d.label} — ${d.words.toLocaleString()} words so far (needs more depth)`
                        : `${d.label} — not started yet`}
                    </p>
                  </div>
                </div>
                {isEmpty && <ExtractButton file={d.file} />}
              </div>

              {/* Mini progress bar */}
              {!isDone && d.words > 0 && (
                <div className="mt-3 ml-9">
                  <div className="h-1.5 bg-background rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full bg-amber transition-all"
                      style={{ width: `${Math.min((d.words / 800) * 100, 100)}%` }}
                    />
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Next step — clear CTA for the most important empty file */}
      {needsAttention && (
        <NextStepAction
          file={needsAttention.label}
          reason={fileContext[needsAttention.label]?.unlock ?? "your vault will have gaps"}
        />
      )}

      {/* What's unlocked so far */}
      {activeCount > 0 && (
        <div className="mt-8 bg-green/5 border border-green/20 rounded-xl p-5">
          <h3 className="text-sm font-sans font-bold text-green mb-2">
            What's already working for you
          </h3>
          <p className="text-sm text-muted leading-relaxed">
            {activeCount === 1
              ? "AI now knows the basics. Outputs will start reflecting your identity."
              : activeCount === 2
              ? "AI can now match your business to your audience. Ads and content will start hitting closer."
              : activeCount === 3
              ? "AI has a strong foundation. Proposals, ads, and emails are already much more accurate."
              : "Your full profile is active. Everything AI creates will sound like you."}
          </p>
        </div>
      )}

      {/* Recent Activity */}
      {recentActivity.length > 0 && (
        <div className="mt-8 bg-surface border border-border rounded-xl p-5">
          <h2 className="text-sm font-sans font-bold text-foreground mb-3">Recent Activity</h2>
          <div className="space-y-2">
            {recentActivity.map((commit) => (
              <div key={commit.sha} className="flex items-center gap-3 py-1.5">
                <span className="text-xs text-dim shrink-0 w-14 text-right">{timeAgo(commit.date)}</span>
                <p className="text-sm text-muted truncate flex-1">
                  {commit.message.replace(/^\[?\w+\]?\s*:?\s*/i, "")}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
