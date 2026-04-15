import { createSupabaseServer } from "@/lib/supabase-server";
import { getVaultMetrics, getContextDepth, getRecentCommits, getContextScore } from "@/lib/vault";
import type { ContextScore } from "@/lib/vault";
import Link from "next/link";
import WelcomeState from "./welcome-state";
import BuildingState from "./building-state";
import SyncButton from "./sync-button";

export const revalidate = 120; // cache dashboard for 2 minutes

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

export default async function VaultDashboard() {
  const supabase = await createSupabaseServer();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: client } = await supabase
    .from("clients")
    .select("*")
    .eq("email", user?.email ?? "")
    .single();

  const token = client?.github_token || process.env.GITHUB_TOKEN;
  const repo = client?.github_repo;

  let metrics = null;
  let depth = null;
  let activity = null;
  let contextScore: ContextScore | null = null;

  if (token && repo) {
    [metrics, depth, activity, contextScore] = await Promise.all([
      getVaultMetrics(token, repo).catch(() => null),
      getContextDepth(token, repo).catch(() => null),
      getRecentCommits(token, repo, 10).catch(() => null),
      getContextScore(token, repo).catch(() => null),
    ]);
  }

  // --- Adaptive homepage: detect vault maturity ---
  const isFirstOpen = !depth || depth.every((d) => d.words < 100);
  const isBuilding = depth && depth.some((d) => d.level === "needs-attention") && !isFirstOpen;

  if (isFirstOpen) {
    return <WelcomeState />;
  }

  if (isBuilding) {
    return <BuildingState depth={depth!} activity={activity} />;
  }

  // --- State 3: Compounding (all context files active) ---
  const clientName = client?.client_name ?? "Your Vault";

  // Vault sections — clickable cards with counts
  const sections = [
    { name: "Context", href: "/vault/files?path=reference/core", count: metrics?.contextFiles, color: "text-blue", borderColor: "border-blue/20 hover:border-blue/40" },
    { name: "Decisions", href: "/vault/decisions", count: metrics?.decisions, color: "text-green", borderColor: "border-green/20 hover:border-green/40" },
    { name: "Research", href: "/vault/research", count: metrics?.research, color: "text-amber", borderColor: "border-amber/20 hover:border-amber/40" },
    { name: "Outputs", href: "/vault/files?path=outputs", count: metrics?.outputs, color: "text-purple", borderColor: "border-purple/20 hover:border-purple/40" },
    { name: "Content", href: "/vault/files?path=content", count: (metrics?.drafts ?? 0) + (metrics?.published ?? 0), color: "text-cyan", borderColor: "border-cyan/20 hover:border-cyan/40" },
  ];

  // Attention items — flag things that need work
  const attentionItems: { label: string; detail: string; color: string }[] = [];
  if (depth) {
    for (const d of depth) {
      if (d.level === "needs-attention") {
        attentionItems.push({ label: d.label, detail: `${d.words} words — needs more depth`, color: "text-red" });
      } else if (d.level === "growing") {
        attentionItems.push({ label: d.label, detail: `${d.words.toLocaleString()} words — still growing`, color: "text-amber" });
      }
    }
  }

  // Tier markers for the benchmark scale
  const tierMarkers = [
    { label: "Invisible", position: 0 },
    { label: "Emerging", position: 10 },
    { label: "Structured", position: 30 },
    { label: "Connected", position: 60 },
    { label: "Compounding", position: 100 },
  ];
  // Map score to a 0-100 visual scale (500 = 100%)
  const scorePosition = contextScore ? Math.min((contextScore.score / 500) * 100, 100) : 0;

  return (
    <div className="max-w-5xl mx-auto px-4 py-6">
      <div className="flex items-center justify-between mb-5">
        <h1 className="text-xl font-sans font-bold">{clientName}</h1>
        <SyncButton />
      </div>

      {/* Context Score with benchmark */}
      {contextScore && (
        <div className="bg-surface border border-border rounded-lg p-5 mb-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <p className="text-xs text-muted mb-1">Context Score</p>
              <div className="flex items-baseline gap-3">
                <p className={`text-4xl font-bold ${contextScore.tier.color}`}>{contextScore.score}</p>
                <span className={`text-sm font-medium ${contextScore.tier.color}`}>{contextScore.tier.label}</span>
              </div>
              <p className="text-xs text-muted mt-1">{contextScore.tier.description}</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-muted">{contextScore.crossReferences} cross-references</p>
              <p className="text-xs text-muted">{contextScore.totalFiles} files</p>
              {metrics?.lastCommit && (
                <p className="text-xs text-dim mt-1">Updated {timeAgo(metrics.lastCommit)}</p>
              )}
            </div>
          </div>

          {/* Benchmark bar */}
          <div className="relative mt-2">
            <div className="h-2 bg-background rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all ${
                  contextScore.score >= 500 ? "bg-green" :
                  contextScore.score >= 300 ? "bg-green" :
                  contextScore.score >= 150 ? "bg-blue" :
                  contextScore.score >= 50 ? "bg-amber" : "bg-red"
                }`}
                style={{ width: `${scorePosition}%` }}
              />
            </div>
            {/* Tier labels below the bar */}
            <div className="relative h-5 mt-1.5">
              {tierMarkers.map((marker) => (
                <span
                  key={marker.label}
                  className="absolute text-[10px] text-dim -translate-x-1/2"
                  style={{ left: `${marker.position}%` }}
                >
                  {marker.label}
                </span>
              ))}
            </div>
          </div>

          {/* Next tier prompt */}
          {contextScore.nextTier && (
            <p className="text-xs text-muted mt-2">
              <span className={contextScore.nextTier.color}>{contextScore.nextTier.min - contextScore.score} points</span> to reach {contextScore.nextTier.label} — {contextScore.nextTier.description.toLowerCase()}
            </p>
          )}
        </div>
      )}

      {/* Vault Sections — single row of clickable cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 mb-6">
        {sections.map((section) => (
          <Link
            key={section.name}
            href={section.href}
            className={`bg-surface border rounded-lg p-3 transition-colors ${section.borderColor}`}
          >
            <p className="text-xs text-muted">{section.name}</p>
            <p className={`text-xl font-bold ${section.color} mt-0.5`}>{section.count ?? "—"}</p>
          </Link>
        ))}
      </div>

      <div className="grid lg:grid-cols-5 gap-6">
        {/* Left column — 3/5 */}
        <div className="lg:col-span-3 space-y-6">
          {/* Context Depth */}
          {depth && (
            <div className="bg-surface border border-border rounded-lg p-4">
              <h2 className="text-sm font-sans font-bold text-foreground mb-3">Context Depth</h2>
              <div className="space-y-3">
                {depth.map((d) => (
                  <div key={d.file}>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-muted">{d.label}</span>
                      <span className={
                        d.level === "deep" ? "text-green" :
                        d.level === "growing" ? "text-amber" : "text-red"
                      }>
                        {d.words.toLocaleString()} words
                        {d.level === "deep" ? " — Deep" : d.level === "growing" ? " — Growing" : " — Needs work"}
                      </span>
                    </div>
                    <div className="h-2 bg-background rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${
                          d.level === "deep" ? "bg-green" :
                          d.level === "growing" ? "bg-amber" : "bg-red"
                        }`}
                        style={{ width: `${Math.min((d.words / 3000) * 100, 100)}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Recent Activity */}
          {activity && activity.length > 0 && (
            <div className="bg-surface border border-border rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-sm font-sans font-bold text-foreground">Recent Activity</h2>
                <Link href="/vault/activity" className="text-xs text-blue hover:underline">View all</Link>
              </div>
              <div className="space-y-2">
                {activity.map((commit) => {
                  const badge = commitBadge(commit.message);
                  return (
                    <div key={commit.sha} className="flex items-start gap-3 py-1.5">
                      <span className={`text-xs px-1.5 py-0.5 rounded font-medium shrink-0 ${badge.color}`}>
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

        {/* Right column — 2/5: Attention items */}
        <div className="lg:col-span-2 space-y-6">
          {/* Needs Attention */}
          {attentionItems.length > 0 && (
            <div className="bg-surface border border-red/20 rounded-lg p-4">
              <h2 className="text-sm font-sans font-bold text-foreground mb-3">Needs Attention</h2>
              <div className="space-y-2">
                {attentionItems.map((item) => (
                  <div key={item.label} className="flex items-center justify-between py-1.5">
                    <span className="text-sm text-foreground">{item.label}</span>
                    <span className={`text-xs ${item.color}`}>{item.detail}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Quick links to vault areas */}
          <div className="bg-surface border border-border rounded-lg p-4">
            <h2 className="text-sm font-sans font-bold text-foreground mb-3">Browse Vault</h2>
            <div className="space-y-1.5">
              {sections.map((section) => (
                <Link
                  key={section.name}
                  href={section.href}
                  className="flex items-center justify-between py-2 px-2 rounded-md hover:bg-background transition-colors"
                >
                  <span className="text-sm text-foreground">{section.name}</span>
                  <span className="text-xs text-muted">{section.count ?? "—"} files</span>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
