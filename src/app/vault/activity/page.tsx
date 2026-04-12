import { createSupabaseServer } from "@/lib/supabase-server";
import { getRecentCommits } from "@/lib/vault";

function commitBadge(message: string): { label: string; color: string } {
  const msg = message.toLowerCase();
  if (msg.startsWith("sync:")) return { label: "Sync", color: "text-purple bg-purple/10" };
  if (msg.startsWith("extract:")) return { label: "Extract", color: "text-green bg-green/10" };
  if (msg.startsWith("[add]")) return { label: "Add", color: "text-blue bg-blue/10" };
  if (msg.startsWith("[update]")) return { label: "Update", color: "text-amber bg-amber/10" };
  if (msg.startsWith("[fix]") || msg.startsWith("fix:")) return { label: "Fix", color: "text-red bg-red/10" };
  if (msg.startsWith("[publish]") || msg.startsWith("publish:")) return { label: "Publish", color: "text-cyan bg-cyan/10" };
  return { label: "Change", color: "text-muted bg-muted/10" };
}

function formatDate(dateStr: string) {
  const date = new Date(dateStr);
  return date.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}

function formatTime(dateStr: string) {
  const date = new Date(dateStr);
  return date.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  });
}

function groupByDay(
  commits: { sha: string; message: string; date: string; author: string }[]
) {
  const groups: Record<
    string,
    { sha: string; message: string; date: string; author: string }[]
  > = {};
  for (const commit of commits) {
    const day = new Date(commit.date).toDateString();
    if (!groups[day]) groups[day] = [];
    groups[day].push(commit);
  }
  return Object.entries(groups);
}

function friendlyMessage(message: string) {
  return message.replace(/^\[?\w+\]?\s*:?\s*/i, "");
}

function dayLabel(dayString: string) {
  const day = new Date(dayString);
  const now = new Date();
  const diff = Math.floor(
    (now.getTime() - day.getTime()) / (1000 * 60 * 60 * 24)
  );
  if (diff === 0) return "Today";
  if (diff === 1) return "Yesterday";
  return formatDate(dayString);
}

export default async function ActivityPage() {
  const supabase = await createSupabaseServer();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: client } = await supabase
    .from("clients")
    .select("*")
    .eq("email", user?.email ?? "")
    .single();

  const token = client?.github_token || process.env.GITHUB_TOKEN;
  const repo = client?.github_repo;

  let commits: { sha: string; message: string; date: string; author: string }[] = [];
  if (token && repo) {
    commits = await getRecentCommits(token, repo, 50).catch(() => []);
  }

  const grouped = groupByDay(commits);

  return (
    <div className="max-w-3xl mx-auto px-4 py-6">
      <h1 className="text-xl font-sans font-bold mb-5">Activity</h1>

      {grouped.length === 0 ? (
        <p className="text-muted text-sm">No activity yet.</p>
      ) : (
        <div className="space-y-6">
          {grouped.map(([day, items]) => (
            <div key={day}>
              <p className="text-xs font-medium text-dim uppercase tracking-wider mb-2">
                {dayLabel(day)}
              </p>
              <div className="bg-surface border border-border rounded-lg divide-y divide-border">
                {items.map((commit) => {
                  const badge = commitBadge(commit.message);
                  return (
                    <div
                      key={commit.sha}
                      className="flex items-start gap-3 px-4 py-3"
                    >
                      <span
                        className={`text-xs px-1.5 py-0.5 rounded font-medium shrink-0 mt-0.5 ${badge.color}`}
                      >
                        {badge.label}
                      </span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-foreground">
                          {friendlyMessage(commit.message)}
                        </p>
                      </div>
                      <span className="text-xs text-dim shrink-0">
                        {formatTime(commit.date)}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
