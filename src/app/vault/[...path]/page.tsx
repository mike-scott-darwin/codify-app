import { createSupabaseServer } from "@/lib/supabase-server";
import { getFileContent, getContextDepth } from "@/lib/vault";
import Link from "next/link";
import MarkdownRenderer from "./markdown-renderer";
import DocumentActions from "./document-actions";
import Backlinks from "./backlinks";
import FileContextSetter from "./file-context-setter";

const CLEAN_FILES = new Set([
  "ONBOARDING.md",
  "reference/core/soul.md",
  "reference/core/audience.md",
  "reference/core/offer.md",
  "reference/core/voice.md",
]);

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

  const isClean = CLEAN_FILES.has(filePath);
  const parts = filePath.split("/");
  const fileName = parts[parts.length - 1];

  let depthInfo: { words: number; level: string } | null = null;
  if (filePath.startsWith("reference/core/")) {
    try {
      const allDepth = await getContextDepth(token, repo);
      const match = allDepth.find((d: { file: string; words: number; level: string }) => d.file === filePath);
      if (match) depthInfo = { words: match.words, level: match.level };
    } catch {}
  }

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
      <FileContextSetter path={filePath} />

      {/* Breadcrumb */}
      <div className="flex items-center gap-1 text-sm mb-3">
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

      {/* Depth badge for context files */}
      {isClean && filePath.startsWith("reference/core/") && depthInfo && (
        <div className="flex items-center gap-2 mb-4 text-xs">
          <span className={`inline-block w-2 h-2 rounded-full ${
            depthInfo.level === "deep" ? "bg-green" :
            depthInfo.level === "growing" ? "bg-amber" : "bg-red/50"
          }`} />
          <span className={
            depthInfo.level === "deep" ? "text-green" :
            depthInfo.level === "growing" ? "text-amber" : "text-red"
          }>
            {depthInfo.level === "deep" ? "Deep" : depthInfo.level === "growing" ? "Growing" : "Needs work"}
          </span>
          <span className="text-dim">&mdash;</span>
          <span className="text-muted">{depthInfo.words.toLocaleString()} words</span>
        </div>
      )}

      {/* Frontmatter badges — hidden for clean files */}
      {!isClean && frontmatterEntries.length > 0 && (
        <div className="flex flex-wrap items-center gap-2 mb-4">
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

      {/* Context-aware actions — hidden for clean files */}
      {!isClean && (
        <div className="mb-4">
          <DocumentActions filePath={filePath} fileName={fileName} />
        </div>
      )}

      {/* Markdown content */}
      <div className="bg-surface border border-border rounded-lg p-6">
        <MarkdownRenderer content={doc.content} />
      </div>

      {/* Backlinks — hidden for clean files */}
      {!isClean && <Backlinks filePath={filePath} />}
    </div>
  );
}
