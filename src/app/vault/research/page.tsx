import { createSupabaseServer } from "@/lib/supabase-server";
import { listDirectory, getFileContent, type VaultFile } from "@/lib/vault";
import Link from "next/link";

function parseSlug(filename: string) {
  const match = filename.match(/^(\d{4}-\d{2}-\d{2})-(.+)\.md$/);
  if (!match) return { date: "", title: filename.replace(".md", "") };
  const title = match[2]
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
  return { date: match[1], title };
}

export default async function ResearchPage() {
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
    files = await listDirectory(token, repo, "research").catch(() => []);
  }

  const mdFiles = files
    .filter((f) => f.type === "file" && f.name.endsWith(".md"))
    .sort((a, b) => b.name.localeCompare(a.name));

  const research = await Promise.all(
    mdFiles.slice(0, 50).map(async (file) => {
      const { date, title } = parseSlug(file.name);
      try {
        const doc = await getFileContent(token!, repo!, file.path);
        return {
          path: file.path,
          date: (doc.frontmatter.date as string) || date,
          title,
          status: (doc.frontmatter.status as string) || "complete",
          type: (doc.frontmatter.type as string) || "research",
        };
      } catch {
        return { path: file.path, date, title, status: "complete", type: "research" };
      }
    })
  );

  return (
    <div className="max-w-5xl mx-auto px-4 py-6">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-sans font-bold">Research</h1>
        <span className="text-sm text-muted">{research.length} files</span>
      </div>

      <div className="bg-surface border border-border rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border text-left">
              <th className="px-4 py-2 text-xs text-dim font-medium">Date</th>
              <th className="px-4 py-2 text-xs text-dim font-medium">Topic</th>
              <th className="px-4 py-2 text-xs text-dim font-medium hidden sm:table-cell">Status</th>
              <th className="px-4 py-2 text-xs text-dim font-medium hidden md:table-cell">Type</th>
            </tr>
          </thead>
          <tbody>
            {research.map((r) => (
              <tr
                key={r.path}
                className="border-b border-border last:border-0 hover:bg-[#1a1a1a] transition-colors"
              >
                <td className="px-4 py-2 text-dim whitespace-nowrap">{r.date}</td>
                <td className="px-4 py-2">
                  <Link
                    href={`/vault/${r.path}`}
                    className="text-foreground hover:text-blue transition-colors"
                  >
                    {r.title}
                  </Link>
                </td>
                <td className="px-4 py-2 hidden sm:table-cell">
                  <span
                    className={`text-xs px-1.5 py-0.5 rounded ${
                      r.status === "complete"
                        ? "text-green bg-green/10"
                        : "text-amber bg-amber/10"
                    }`}
                  >
                    {r.status}
                  </span>
                </td>
                <td className="px-4 py-2 hidden md:table-cell">
                  <span className="text-xs px-1.5 py-0.5 rounded text-blue bg-blue/10">
                    {r.type}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
