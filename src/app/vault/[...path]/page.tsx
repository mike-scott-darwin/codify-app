import { createSupabaseServer } from "@/lib/supabase-server";
import { getFileContent } from "@/lib/vault";
import Link from "next/link";
import MarkdownRenderer from "./markdown-renderer";

export default async function VaultDocumentViewer({
  params,
}: {
  params: Promise<{ path: string[] }>;
}) {
  const { path: pathSegments } = await params;
  const filePath = pathSegments.join("/");

  const supabase = await createSupabaseServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: client } = await supabase
    .from("clients")
    .select("*")
    .eq("email", user?.email ?? "")
    .single();

  const token = client?.github_token || process.env.GITHUB_TOKEN;
  const repo = client?.github_repo;

  if (!token || !repo) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-8">
        <p className="text-red">Missing GitHub configuration.</p>
      </div>
    );
  }

  let doc;
  try {
    doc = await getFileContent(token, repo, filePath);
  } catch {
    return (
      <div className="max-w-3xl mx-auto px-4 py-8">
        <p className="text-red">File not found: {filePath}</p>
        <Link href="/vault/files" className="text-blue text-sm hover:underline mt-2 block">
          Back to files
        </Link>
      </div>
    );
  }

  // Build breadcrumb from path
  const parts = filePath.split("/");
  const fileName = parts[parts.length - 1];
  const dirPath = parts.slice(0, -1).join("/");

  const frontmatterEntries = Object.entries(doc.frontmatter).filter(
    ([, v]) => v !== null && v !== undefined && v !== ""
  );

  function badgeColor(key: string, value: unknown) {
    if (key === "status") {
      if (value === "active" || value === "complete") return "text-green bg-green/10";
      if (value === "draft" || value === "in-progress") return "text-amber bg-amber/10";
      if (value === "archived") return "text-dim bg-dim/10";
    }
    if (key === "type") return "text-blue bg-blue/10";
    return "text-muted bg-muted/10";
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-1 text-sm mb-4">
        <Link href="/vault/files" className="text-blue hover:underline">Root</Link>
        {parts.map((part, i) => (
          <span key={i} className="flex items-center gap-1">
            <span className="text-dim">/</span>
            {i < parts.length - 1 ? (
              <Link
                href={`/vault/files?path=${parts.slice(0, i + 1).join("/")}`}
                className="text-blue hover:underline"
              >
                {part}
              </Link>
            ) : (
              <span className="text-foreground font-medium">{part}</span>
            )}
          </span>
        ))}
      </div>

      {/* Frontmatter strip */}
      {frontmatterEntries.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-4">
          {frontmatterEntries.map(([key, value]) => (
            <span
              key={key}
              className={`text-xs px-2 py-1 rounded ${badgeColor(key, value)}`}
            >
              {key}: {String(value)}
            </span>
          ))}
        </div>
      )}

      {/* Markdown content */}
      <div className="bg-surface border border-border rounded-lg p-6">
        <MarkdownRenderer content={doc.content} />
      </div>
    </div>
  );
}
