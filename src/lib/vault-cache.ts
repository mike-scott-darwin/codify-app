import { createSupabaseAdmin } from "./supabase-admin";
import matter from "gray-matter";

// ─── Types ───

export interface CachedFile {
  id?: number;
  repo: string;
  path: string;
  name: string;
  file_type: "file" | "dir";
  content: string | null;
  frontmatter: Record<string, unknown> | null;
  sha: string;
  parent_dir: string;
  word_count: number;
  links_to: string[];   // paths this file links to
  synced_at: string;
}

export interface CachedBacklink {
  path: string;
  name: string;
  context: string;
  type: "link" | "mention";
}

// ─── Read from cache ───

const supabase = () => createSupabaseAdmin();

export async function cachedListDirectory(repo: string, path: string) {
  const { data, error } = await supabase()
    .from("vault_files")
    .select("name, path, file_type, sha")
    .eq("repo", repo)
    .eq("parent_dir", path)
    .order("file_type", { ascending: true })  // dirs first
    .order("name", { ascending: true });

  if (error || !data) return null;

  return data.map((f) => ({
    name: f.name,
    path: f.path,
    type: f.file_type as "file" | "dir",
    sha: f.sha,
    size: 0,
  }));
}

export async function cachedGetFileContent(repo: string, path: string) {
  const { data, error } = await supabase()
    .from("vault_files")
    .select("path, content, frontmatter")
    .eq("repo", repo)
    .eq("path", path)
    .single();

  if (error || !data || !data.content) return null;

  return {
    path: data.path,
    frontmatter: (data.frontmatter as Record<string, unknown>) ?? {},
    content: data.content,
  };
}

export async function cachedGetBacklinks(repo: string, targetPath: string): Promise<CachedBacklink[] | null> {
  const targetName = targetPath.split("/").pop()?.replace(".md", "") ?? "";
  const targetPathNoExt = targetPath.replace(".md", "");

  // Find all files that link to this target
  const { data, error } = await supabase()
    .from("vault_files")
    .select("path, name, content, links_to")
    .eq("repo", repo)
    .eq("file_type", "file")
    .not("path", "eq", targetPath)
    .contains("links_to", [targetPath]);

  if (error) return null;

  const backlinks: CachedBacklink[] = [];

  // Exact link matches from links_to array
  for (const file of data ?? []) {
    if (!file.content) continue;
    const lines = file.content.split("\n");
    for (const line of lines) {
      if (line.includes(targetPath) || line.includes(targetPathNoExt) || line.includes(`[[${targetName}]]`)) {
        backlinks.push({
          path: file.path,
          name: file.name.replace(".md", ""),
          context: line.trim().slice(0, 200),
          type: "link",
        });
        break;
      }
    }
  }

  // Also find unlinked mentions (files not in the links_to result)
  if (targetName.length > 3) {
    const { data: mentionFiles } = await supabase()
      .from("vault_files")
      .select("path, name, content")
      .eq("repo", repo)
      .eq("file_type", "file")
      .not("path", "eq", targetPath)
      .ilike("content", `%${targetName}%`)
      .limit(20);

    for (const file of mentionFiles ?? []) {
      if (backlinks.some((b) => b.path === file.path)) continue;
      if (!file.content) continue;
      const lines = file.content.split("\n");
      for (const line of lines) {
        if (line.toLowerCase().includes(targetName.toLowerCase())) {
          backlinks.push({
            path: file.path,
            name: file.name.replace(".md", ""),
            context: line.trim().slice(0, 200),
            type: "mention",
          });
          break;
        }
      }
    }
  }

  backlinks.sort((a, b) => {
    if (a.type !== b.type) return a.type === "link" ? -1 : 1;
    return a.name.localeCompare(b.name);
  });

  return backlinks;
}

export async function cachedGetContextDepth(repo: string) {
  const coreFiles = [
    { file: "reference/core/soul.md", label: "Soul" },
    { file: "reference/core/offer.md", label: "Offer" },
    { file: "reference/core/audience.md", label: "Audience" },
    { file: "reference/core/voice.md", label: "Voice" },
  ];

  const { data } = await supabase()
    .from("vault_files")
    .select("path, word_count")
    .eq("repo", repo)
    .in("path", coreFiles.map((f) => f.file));

  return coreFiles.map(({ file, label }) => {
    const cached = data?.find((d) => d.path === file);
    const words = cached?.word_count ?? 0;
    const level = words > 2000 ? "deep" : words > 800 ? "growing" : "needs-attention";
    return { file, label, words, level };
  });
}

export async function cachedGetMetrics(repo: string) {
  const folders = [
    { key: "contextFiles", path: "reference/core" },
    { key: "decisions", path: "decisions" },
    { key: "research", path: "research" },
    { key: "outputs", path: "outputs" },
    { key: "drafts", path: "content/drafts" },
    { key: "published", path: "content/published" },
  ];

  const results: Record<string, number> = {};

  for (const folder of folders) {
    const { count } = await supabase()
      .from("vault_files")
      .select("*", { count: "exact", head: true })
      .eq("repo", repo)
      .eq("parent_dir", folder.path)
      .eq("file_type", "file");

    results[folder.key] = count ?? 0;
  }

  return {
    ...results,
    lastCommit: "cached",
  };
}

export async function isCachePopulated(repo: string): Promise<boolean> {
  const { count } = await supabase()
    .from("vault_files")
    .select("*", { count: "exact", head: true })
    .eq("repo", repo);

  return (count ?? 0) > 0;
}

// ─── Sync from GitHub ───

function extractLinks(content: string): string[] {
  const links: string[] = [];

  // Wiki links: [[target]] or [[target|alias]]
  const wikiRegex = /\[\[([^\]|]+)(?:\|[^\]]+)?\]\]/g;
  let match;
  while ((match = wikiRegex.exec(content)) !== null) {
    let target = match[1].trim();
    if (!target.endsWith(".md")) target += ".md";
    links.push(target);
  }

  // Markdown links: [text](path.md)
  const mdRegex = /\]\(([^)]+\.md)\)/g;
  while ((match = mdRegex.exec(content)) !== null) {
    links.push(match[1]);
  }

  return [...new Set(links)];
}

interface GitHubTreeItem {
  path: string;
  type: string;
  sha: string;
  size?: number;
}

export async function syncRepoToCache(token: string, repo: string) {
  const sb = supabase();

  // Use GitHub Trees API to get the entire repo in one call
  const treeRes = await fetch(`https://api.github.com/repos/${repo}/git/trees/main?recursive=1`, {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/vnd.github.v3+json",
    },
  });

  if (!treeRes.ok) throw new Error(`GitHub tree API error: ${treeRes.status}`);
  const treeData = await treeRes.json();
  const tree: GitHubTreeItem[] = treeData.tree;

  // Filter to just files and dirs we care about (skip hidden, archive)
  const SKIP = new Set([".context", ".claude", ".openclaw", ".obsidian", ".git", "archive"]);
  const items = tree.filter((item) => {
    const parts = item.path.split("/");
    return !parts.some((p) => SKIP.has(p));
  });

  // Separate files and dirs
  const dirs = new Set<string>();
  const files: GitHubTreeItem[] = [];

  for (const item of items) {
    if (item.type === "blob") {
      files.push(item);
      // Record all parent directories
      const parts = item.path.split("/");
      for (let i = 1; i < parts.length; i++) {
        dirs.add(parts.slice(0, i).join("/"));
      }
    }
  }

  // Batch upsert directories
  const dirRows = [...dirs].map((d) => ({
    repo,
    path: d,
    name: d.split("/").pop()!,
    file_type: "dir" as const,
    content: null,
    frontmatter: null,
    sha: "",
    parent_dir: d.split("/").slice(0, -1).join("") || "",
    word_count: 0,
    links_to: [],
    synced_at: new Date().toISOString(),
  }));

  // Fix parent_dir for dirs
  for (const row of dirRows) {
    row.parent_dir = row.path.split("/").slice(0, -1).join("/");
  }

  // Fetch content for markdown files (parallel, batched)
  const BATCH = 20;
  const fileRows: CachedFile[] = [];

  for (let i = 0; i < files.length; i += BATCH) {
    const batch = files.slice(i, i + BATCH);
    const results = await Promise.all(
      batch.map(async (file) => {
        const parentDir = file.path.split("/").slice(0, -1).join("/");
        const name = file.path.split("/").pop()!;

        if (!name.endsWith(".md")) {
          // Non-markdown: just store metadata
          return {
            repo,
            path: file.path,
            name,
            file_type: "file" as const,
            content: null,
            frontmatter: null,
            sha: file.sha,
            parent_dir: parentDir,
            word_count: 0,
            links_to: [],
            synced_at: new Date().toISOString(),
          };
        }

        // Fetch markdown content
        try {
          const res = await fetch(`https://api.github.com/repos/${repo}/contents/${file.path}`, {
            headers: {
              Authorization: `Bearer ${token}`,
              Accept: "application/vnd.github.v3.raw",
            },
          });
          if (!res.ok) throw new Error(`${res.status}`);
          const raw = await res.text();
          const { data: frontmatter, content } = matter(raw);
          const words = content.trim().split(/\s+/).filter(Boolean).length;
          const links = extractLinks(raw);

          return {
            repo,
            path: file.path,
            name,
            file_type: "file" as const,
            content,
            frontmatter,
            sha: file.sha,
            parent_dir: parentDir,
            word_count: words,
            links_to: links,
            synced_at: new Date().toISOString(),
          };
        } catch {
          return {
            repo,
            path: file.path,
            name,
            file_type: "file" as const,
            content: null,
            frontmatter: null,
            sha: file.sha,
            parent_dir: parentDir,
            word_count: 0,
            links_to: [],
            synced_at: new Date().toISOString(),
          };
        }
      })
    );
    fileRows.push(...results);
  }

  // Clear old data for this repo and insert fresh
  await sb.from("vault_files").delete().eq("repo", repo);

  // Upsert in chunks of 100
  const allRows = [...dirRows, ...fileRows];
  for (let i = 0; i < allRows.length; i += 100) {
    const chunk = allRows.slice(i, i + 100);
    const { error } = await sb.from("vault_files").insert(chunk);
    if (error) {
      console.error("Supabase insert error:", error.message);
    }
  }

  return { files: fileRows.length, dirs: dirRows.length };
}
