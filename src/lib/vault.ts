import matter from "gray-matter";

// --- Types ---

export interface VaultFile {
  name: string;
  path: string;
  type: "file" | "dir";
  sha: string;
  size: number;
}

export interface VaultDocument {
  path: string;
  frontmatter: Record<string, unknown>;
  content: string;
}

export interface VaultActivity {
  sha: string;
  message: string;
  date: string;
  author: string;
}

export interface VaultMetrics {
  contextFiles: number;
  decisions: number;
  research: number;
  outputs: number;
  drafts: number;
  published: number;
  lastCommit: string;
}

export interface ContextDepth {
  file: string;
  label: string;
  words: number;
  level: "deep" | "growing" | "needs-attention";
}

// --- GitHub API helpers ---

const GITHUB_API = "https://api.github.com";

async function githubFetch(token: string, path: string) {
  const res = await fetch(`${GITHUB_API}${path}`, {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/vnd.github.v3+json",
    },
    next: { revalidate: 300 },
  });
  if (!res.ok) {
    throw new Error(`GitHub API error: ${res.status} ${res.statusText}`);
  }
  return res.json();
}

async function githubFetchRaw(token: string, repo: string, path: string): Promise<string> {
  const res = await fetch(`${GITHUB_API}/repos/${repo}/contents/${path}`, {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/vnd.github.v3.raw",
    },
    next: { revalidate: 300 },
  });
  if (!res.ok) {
    throw new Error(`GitHub API error: ${res.status} ${res.statusText}`);
  }
  return res.text();
}

// --- Public API ---

export async function listDirectory(
  token: string,
  repo: string,
  path: string = ""
): Promise<VaultFile[]> {
  const data = await githubFetch(token, `/repos/${repo}/contents/${path}`);
  if (!Array.isArray(data)) return [];
  return data.map((item: Record<string, unknown>) => ({
    name: item.name as string,
    path: item.path as string,
    type: item.type === "dir" ? "dir" : "file",
    sha: item.sha as string,
    size: (item.size as number) || 0,
  }));
}

export async function getFileContent(
  token: string,
  repo: string,
  path: string
): Promise<VaultDocument> {
  const raw = await githubFetchRaw(token, repo, path);
  const { data: frontmatter, content } = matter(raw);
  return { path, frontmatter, content };
}

export async function getRecentCommits(
  token: string,
  repo: string,
  count: number = 20
): Promise<VaultActivity[]> {
  const data = await githubFetch(
    token,
    `/repos/${repo}/commits?per_page=${count}`
  );
  return data.map((commit: Record<string, unknown>) => {
    const commitData = commit.commit as Record<string, unknown>;
    const authorData = commitData.author as Record<string, unknown>;
    return {
      sha: (commit.sha as string).slice(0, 7),
      message: commitData.message as string,
      date: authorData.date as string,
      author: authorData.name as string,
    };
  });
}

export async function getVaultMetrics(
  token: string,
  repo: string
): Promise<VaultMetrics> {
  const [context, decisions, research, outputs, drafts, published, commits] =
    await Promise.all([
      listDirectory(token, repo, "reference/core").catch(() => []),
      listDirectory(token, repo, "decisions").catch(() => []),
      listDirectory(token, repo, "research").catch(() => []),
      listDirectory(token, repo, "outputs").catch(() => []),
      listDirectory(token, repo, "content/drafts").catch(() => []),
      listDirectory(token, repo, "content/published").catch(() => []),
      getRecentCommits(token, repo, 1).catch(() => []),
    ]);

  return {
    contextFiles: context.filter((f) => f.type === "file").length,
    decisions: decisions.filter((f) => f.type === "file" && f.name.endsWith(".md")).length,
    research: research.filter((f) => f.type === "file" && f.name.endsWith(".md")).length,
    outputs: outputs.length,
    drafts: drafts.length,
    published: published.length,
    lastCommit: commits[0]?.date ?? "Unknown",
  };
}

export async function getContextDepth(
  token: string,
  repo: string
): Promise<ContextDepth[]> {
  const coreFiles = [
    { file: "reference/core/soul.md", label: "Soul" },
    { file: "reference/core/offer.md", label: "Offer" },
    { file: "reference/core/audience.md", label: "Audience" },
    { file: "reference/core/voice.md", label: "Voice" },
  ];

  const results = await Promise.all(
    coreFiles.map(async ({ file, label }) => {
      try {
        const raw = await githubFetchRaw(token, repo, file);
        const { content } = matter(raw);
        const words = content.trim().split(/\s+/).length;
        const level: ContextDepth["level"] =
          words > 2000 ? "deep" : words > 800 ? "growing" : "needs-attention";
        return { file, label, words, level };
      } catch {
        return { file, label, words: 0, level: "needs-attention" as const };
      }
    })
  );

  return results;
}
