import { createSupabaseServer } from "@/lib/supabase-server";
import { listDirectory, getFileContent, type VaultFile } from "@/lib/vault";
import Link from "next/link";

function parseSlug(filename: string) {
  // "2026-04-10-decision-slug.md" → { date: "2026-04-10", title: "Decision Slug" }
  const match = filename.match(/^(\d{4}-\d{2}-\d{2})-(.+)\.md$/);
  if (!match) return { date: "", title: filename.replace(".md", "") };
  const title = match[2]
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
  return { date: match[1], title };
}

export default async function DecisionsPage() {
  const supabase = await createSupabaseServer();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: client } = await supabase
    .from("clients")
    .select("*")
    .eq("email", user?.email ?? "")
    .single();

  const token = client?.github_token || process.env.GITHUB_TOKEN;
  const repo = client?.github_repo;

  let files: VaultFile[] = [];
  if (token && repo) {
    files = await listDirectory(token, repo, "decisions").catch(() => []);
  }

  const mdFiles = files
    .filter((f) => f.type === "file" && f.name.endsWith(".md"))
    .sort((a, b) => b.name.localeCompare(a.name)); // newest first

  // Fetch frontmatter for each (parallel)
  const decisions = await Promise.all(
    mdFiles.slice(0, 50).map(async (file) => {
      const { date, title } = parseSlug(file.name);
      try {
        const doc = await getFileContent(token!, repo!, file.path);
        return {
          path: file.path,
          date: (doc.frontmatter.date as string) || date,
          title: title,
          status: (doc.frontmatter.status as string) || "active",
          source: (doc.frontmatter.source as string) || "—",
        };
      } catch {
        return { path: file.path, date, title, status: "active", source: "—" };
      }
    })
  );

  return (
    <div className="max-w-5xl mx-auto px-4 py-6">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-sans font-bold">Decisions</h1>
        <span className="text-sm text-muted">{decisions.length} decisions</span>
      </div>

      <div className="bg-surface border border-border rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border text-left">
              <th className="px-4 py-2 text-xs text-dim font-medium">Date</th>
              <th className="px-4 py-2 text-xs text-dim font-medium">Decision</th>
              <th className="px-4 py-2 text-xs text-dim font-medium hidden sm:table-cell">Status</th>
              <th className="px-4 py-2 text-xs text-dim font-medium hidden md:table-cell">Source</th>
            </tr>
          </thead>
          <tbody>
            {decisions.map((d) => (
              <tr
                key={d.path}
                className="border-b border-border last:border-0 hover:bg-[#1a1a1a] transition-colors"
              >
                <td className="px-4 py-2 text-dim whitespace-nowrap">{d.date}</td>
                <td className="px-4 py-2">
                  <Link
                    href={`/vault/${d.path}`}
                    className="text-foreground hover:text-blue transition-colors"
                  >
                    {d.title}
                  </Link>
                </td>
                <td className="px-4 py-2 hidden sm:table-cell">
                  <span
                    className={`text-xs px-1.5 py-0.5 rounded ${
                      d.status === "active"
                        ? "text-green bg-green/10"
                        : d.status === "archived"
                        ? "text-dim bg-dim/10"
                        : "text-amber bg-amber/10"
                    }`}
                  >
                    {d.status}
                  </span>
                </td>
                <td className="px-4 py-2 text-dim hidden md:table-cell">{d.source}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
