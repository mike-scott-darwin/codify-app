import { createSupabaseServer } from "@/lib/supabase-server";
import { listDirectory, type VaultFile } from "@/lib/vault";
import Link from "next/link";

export const revalidate = 300; // cache for 5 minutes

function fileIcon(file: VaultFile) {
  if (file.type === "dir") return "text-amber";
  if (file.name.endsWith(".md")) return "text-blue";
  return "text-dim";
}

function formatSize(bytes: number) {
  if (bytes === 0) return "—";
  if (bytes < 1024) return `${bytes} B`;
  return `${(bytes / 1024).toFixed(1)} KB`;
}

export default async function VaultFiles({
  searchParams,
}: {
  searchParams: Promise<{ path?: string }>;
}) {
  const params = await searchParams;
  const path = params.path ?? "";

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
    files = await listDirectory(token, repo, path).catch(() => []);
  }

  // Build breadcrumb
  const pathParts = path ? path.split("/") : [];
  const breadcrumbs = [{ name: "Root", path: "" }];
  pathParts.forEach((part, i) => {
    breadcrumbs.push({
      name: part,
      path: pathParts.slice(0, i + 1).join("/"),
    });
  });

  // Sort: dirs first, then files
  const sorted = [...files].sort((a, b) => {
    if (a.type !== b.type) return a.type === "dir" ? -1 : 1;
    return a.name.localeCompare(b.name);
  });

  return (
    <div className="max-w-5xl mx-auto px-4 py-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-1 text-sm mb-4">
        {breadcrumbs.map((crumb, i) => (
          <span key={crumb.path} className="flex items-center gap-1">
            {i > 0 && <span className="text-dim">/</span>}
            {i < breadcrumbs.length - 1 ? (
              <Link
                href={`/vault/files?path=${crumb.path}`}
                className="text-blue hover:underline"
              >
                {crumb.name}
              </Link>
            ) : (
              <span className="text-foreground font-medium">{crumb.name}</span>
            )}
          </span>
        ))}
      </div>

      {/* File list */}
      <div className="bg-surface border border-border rounded-lg overflow-hidden">
        {sorted.length === 0 ? (
          <p className="p-4 text-muted text-sm">No files found.</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left">
                <th className="px-4 py-2 text-xs text-dim font-medium">Name</th>
                <th className="px-4 py-2 text-xs text-dim font-medium text-right hidden sm:table-cell">Size</th>
              </tr>
            </thead>
            <tbody>
              {sorted.map((file) => {
                const href =
                  file.type === "dir"
                    ? `/vault/files?path=${file.path}`
                    : `/vault/${file.path}`;
                return (
                  <tr
                    key={file.sha}
                    className="border-b border-border last:border-0 hover:bg-[#1a1a1a] transition-colors"
                  >
                    <td className="px-4 py-2">
                      <Link href={href} className="flex items-center gap-2">
                        {file.type === "dir" ? (
                          <svg className={`w-4 h-4 ${fileIcon(file)}`} fill="none" viewBox="0 0 16 16" stroke="currentColor" strokeWidth="1.5">
                            <path d="M2 4a1 1 0 011-1h3.5l1.5 1.5H13a1 1 0 011 1V12a1 1 0 01-1 1H3a1 1 0 01-1-1V4z" />
                          </svg>
                        ) : (
                          <svg className={`w-4 h-4 ${fileIcon(file)}`} fill="none" viewBox="0 0 16 16" stroke="currentColor" strokeWidth="1.5">
                            <path d="M9.5 1.5H4a1 1 0 00-1 1v11a1 1 0 001 1h8a1 1 0 001-1V5L9.5 1.5z" />
                            <path d="M9.5 1.5V5H13" />
                          </svg>
                        )}
                        <span className="text-foreground hover:text-blue">
                          {file.name}
                        </span>
                      </Link>
                    </td>
                    <td className="px-4 py-2 text-right text-dim hidden sm:table-cell">
                      {file.type === "file" ? formatSize(file.size) : "—"}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
