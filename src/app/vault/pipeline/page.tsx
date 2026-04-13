import { createSupabaseServer } from "@/lib/supabase-server";
import { listDirectory, getFileContent } from "@/lib/vault";
import Link from "next/link";

interface PipelineCard {
  path: string;
  name: string;
  status: string;
  format?: string;
  date?: string;
}

const COLUMNS = [
  { key: "draft", label: "Draft", color: "border-amber/30" },
  { key: "review", label: "Review", color: "border-blue/30" },
  { key: "approved", label: "Approved", color: "border-green/30" },
  { key: "published", label: "Published", color: "border-purple/30" },
];

export default async function PipelinePage() {
  const supabase = await createSupabaseServer();
  const { data: { user } } = await supabase.auth.getUser();
  const { data: client } = await supabase
    .from("clients")
    .select("*")
    .eq("email", user?.email ?? "")
    .single();

  const token = client?.github_token || process.env.GITHUB_TOKEN;
  const repo = client?.github_repo;

  const cards: PipelineCard[] = [];

  if (token && repo) {
    try {
      const files = await listDirectory(token, repo, "outputs");
      const mdFiles = files.filter(f => f.type === "file" && f.name.endsWith(".md"));

      // Fetch frontmatter for each file (limit to 20 to avoid rate limits)
      const batch = mdFiles.slice(0, 20);
      const results = await Promise.all(
        batch.map(async (f) => {
          try {
            const doc = await getFileContent(token, repo, f.path);
            return {
              path: f.path,
              name: f.name.replace(".md", "").replace(/^\d{4}-\d{2}-\d{2}-/, ""),
              status: (doc.frontmatter.status as string) || "draft",
              format: doc.frontmatter.format as string | undefined,
              date: doc.frontmatter.date as string | undefined,
            };
          } catch {
            return { path: f.path, name: f.name.replace(".md", ""), status: "draft" };
          }
        })
      );
      cards.push(...results);
    } catch {}
  }

  // Group by status
  const grouped: Record<string, PipelineCard[]> = {};
  for (const col of COLUMNS) grouped[col.key] = [];
  for (const card of cards) {
    const key = COLUMNS.find(c => c.key === card.status)?.key || "draft";
    grouped[key].push(card);
  }

  return (
    <div className="h-full flex flex-col px-4 py-6">
      <h1 className="text-xl font-sans font-bold mb-5">Content Pipeline</h1>

      <div className="flex-1 grid grid-cols-4 gap-4 min-h-0">
        {COLUMNS.map(col => (
          <div key={col.key} className={`flex flex-col bg-surface border ${col.color} rounded-lg overflow-hidden`}>
            <div className="px-3 py-2 border-b border-border flex items-center justify-between">
              <h2 className="text-sm font-bold text-foreground">{col.label}</h2>
              <span className="text-xs text-muted">{grouped[col.key].length}</span>
            </div>
            <div className="flex-1 overflow-y-auto p-2 space-y-2">
              {grouped[col.key].map(card => (
                <Link
                  key={card.path}
                  href={`/vault/${card.path}`}
                  className="block bg-background border border-border rounded-lg p-3 hover:border-blue/30 transition-colors"
                >
                  <p className="text-sm text-foreground font-medium truncate">
                    {card.name.replace(/-/g, " ")}
                  </p>
                  {card.format && (
                    <span className="text-xs text-blue bg-blue/10 px-1.5 py-0.5 rounded mt-1 inline-block">
                      {card.format}
                    </span>
                  )}
                  {card.date && (
                    <p className="text-xs text-dim mt-1">{card.date}</p>
                  )}
                </Link>
              ))}
              {grouped[col.key].length === 0 && (
                <p className="text-xs text-dim text-center py-4">No items</p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
