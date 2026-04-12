import { createSupabaseServer } from "@/lib/supabase-server";
import { getVaultMetrics, getContextDepth, getRecentCommits } from "@/lib/vault";
import Link from "next/link";
import DashboardActions from "./dashboard-actions";

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

  if (token && repo) {
    [metrics, depth, activity] = await Promise.all([
      getVaultMetrics(token, repo).catch(() => null),
      getContextDepth(token, repo).catch(() => null),
      getRecentCommits(token, repo, 10).catch(() => null),
    ]);
  }

  const clientName = client?.client_name ?? "Your Vault";

  const stats = [
    { label: "Context", value: metrics?.contextFiles ?? "—", color: "text-blue" },
    { label: "Decisions", value: metrics?.decisions ?? "—", color: "text-green" },
    { label: "Research", value: metrics?.research ?? "—", color: "text-amber" },
    { label: "Outputs", value: metrics?.outputs ?? "—", color: "text-purple" },
    { label: "Content", value: (metrics?.drafts ?? 0) + (metrics?.published ?? 0) || "—", color: "text-cyan" },
    { label: "Last Update", value: metrics?.lastCommit ? timeAgo(metrics.lastCommit) : "—", color: "text-muted" },
  ];

  return (
    <div className="max-w-5xl mx-auto px-4 py-6">
      <h1 className="text-xl font-sans font-bold mb-5">{clientName}</h1>

      {/* Stat cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
        {stats.map((stat) => (
          <div key={stat.label} className="bg-surface border border-border rounded-lg p-3">
            <p className="text-xs text-muted">{stat.label}</p>
            <p className={`text-xl font-bold ${stat.color} mt-0.5`}>{stat.value}</p>
          </div>
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

        {/* Right column — 2/5 */}
        <div className="lg:col-span-2 space-y-6">
          {/* Quick Actions — triggers chat panel */}
          <DashboardActions />

          {/* Vault Sections */}
          <div className="space-y-2">
            {[
              { name: "Decisions", href: "/vault/decisions", count: metrics?.decisions, color: "border-green/20 hover:border-green/40" },
              { name: "Research", href: "/vault/research", count: metrics?.research, color: "border-amber/20 hover:border-amber/40" },
              { name: "Outputs", href: "/vault/files?path=outputs", count: metrics?.outputs, color: "border-purple/20 hover:border-purple/40" },
              { name: "Content", href: "/vault/files?path=content", count: (metrics?.drafts ?? 0) + (metrics?.published ?? 0), color: "border-cyan/20 hover:border-cyan/40" },
            ].map((section) => (
              <Link
                key={section.name}
                href={section.href}
                className={`flex items-center justify-between bg-surface border rounded-lg p-3 transition-colors ${section.color}`}
              >
                <span className="text-sm text-foreground">{section.name}</span>
                <span className="text-sm text-muted">{section.count ?? "—"}</span>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
