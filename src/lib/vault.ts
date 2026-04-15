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

// --- Compound Score ---

export interface ContextScoreTier {
  label: string;
  description: string;
  color: string;
  min: number;
  max: number;
}

const CONTEXT_TIERS: ContextScoreTier[] = [
  { label: "Invisible", description: "AI knows almost nothing about your business", color: "text-red", min: 0, max: 49 },
  { label: "Emerging", description: "AI has a basic outline — enough to start, not enough to be useful", color: "text-amber", min: 50, max: 149 },
  { label: "Structured", description: "AI understands your business well enough to draft and advise", color: "text-blue", min: 150, max: 299 },
  { label: "Connected", description: "AI sees how your decisions, research, and strategy link together", color: "text-green", min: 300, max: 499 },
  { label: "Compounding", description: "AI operates like an insider — every new file makes the whole vault smarter", color: "text-green", min: 500, max: Infinity },
];

export interface ContextScore {
  score: number;
  crossReferences: number;
  totalFiles: number;
  tier: ContextScoreTier;
  nextTier: ContextScoreTier | null;
  progressToNext: number; // 0-100
}

function getTier(score: number): { tier: ContextScoreTier; nextTier: ContextScoreTier | null; progressToNext: number } {
  let currentIdx = 0;
  for (let i = CONTEXT_TIERS.length - 1; i >= 0; i--) {
    if (score >= CONTEXT_TIERS[i].min) {
      currentIdx = i;
      break;
    }
  }
  const tier = CONTEXT_TIERS[currentIdx];
  const nextTier = currentIdx < CONTEXT_TIERS.length - 1 ? CONTEXT_TIERS[currentIdx + 1] : null;
  const progressToNext = nextTier
    ? Math.min(Math.round(((score - tier.min) / (nextTier.min - tier.min)) * 100), 100)
    : 100;
  return { tier, nextTier, progressToNext };
}

export async function getContextScore(
  token: string,
  repo: string
): Promise<ContextScore> {
  // Get all markdown files from key folders
  const folders = ["reference/core", "decisions", "research", "outputs"];
  const allFiles: VaultFile[] = [];

  for (const folder of folders) {
    try {
      const files = await listDirectory(token, repo, folder);
      allFiles.push(...files.filter(f => f.type === "file" && f.name.endsWith(".md")));
    } catch {}
  }

  let crossReferences = 0;

  // Sample up to 10 files to keep load fast
  const sample = allFiles.slice(0, 10);

  for (const file of sample) {
    try {
      const raw = await githubFetchRaw(token, repo, file.path);
      // Count wikilinks [[...]]
      const wikilinks = (raw.match(/\[\[[^\]]+\]\]/g) || []).length;
      // Count markdown links [text](path) that point to vault files
      const mdlinks = (raw.match(/\]\([^)]+\.md\)/g) || []).length;
      crossReferences += wikilinks + mdlinks;
    } catch {}
  }

  // Score: cross-references + bonus for file count
  const score = crossReferences + Math.floor(allFiles.length * 2);
  const { tier, nextTier, progressToNext } = getTier(score);

  return { score, crossReferences, totalFiles: allFiles.length, tier, nextTier, progressToNext };
}

// --- Backlinks ---

export interface BacklinkResult {
  path: string;
  name: string;
  context: string; // the line containing the link
  type: "link" | "mention";
}

async function getAllMarkdownFiles(
  token: string,
  repo: string,
  dir: string = ""
): Promise<VaultFile[]> {
  try {
    const items = await listDirectory(token, repo, dir);
    const results: VaultFile[] = [];

    for (const item of items) {
      if (item.type === "file" && item.name.endsWith(".md")) {
        results.push(item);
      } else if (item.type === "dir" && !item.name.startsWith(".")) {
        const nested = await getAllMarkdownFiles(token, repo, item.path);
        results.push(...nested);
      }
    }

    return results;
  } catch {
    return [];
  }
}

export async function getBacklinks(
  token: string,
  repo: string,
  targetPath: string
): Promise<BacklinkResult[]> {
  const targetName = targetPath.split("/").pop()?.replace(".md", "") ?? "";
  const targetPathNoExt = targetPath.replace(".md", "");

  // Get all markdown files
  const allFiles = await getAllMarkdownFiles(token, repo);

  // Filter out the target file itself
  const otherFiles = allFiles.filter((f) => f.path !== targetPath);

  // Scan each file for references (parallel, batched to avoid rate limits)
  const BATCH = 10;
  const backlinks: BacklinkResult[] = [];

  for (let i = 0; i < otherFiles.length; i += BATCH) {
    const batch = otherFiles.slice(i, i + BATCH);
    const results = await Promise.all(
      batch.map(async (file) => {
        try {
          const raw = await githubFetchRaw(token, repo, file.path);
          const lines = raw.split("\n");
          const matches: BacklinkResult[] = [];

          for (const line of lines) {
            // Skip frontmatter
            if (line.trim() === "---") continue;

            // Check for markdown links: [text](path)
            const mdLinkRegex = /\[([^\]]*)\]\(([^)]+)\)/g;
            let match;
            while ((match = mdLinkRegex.exec(line)) !== null) {
              const linkTarget = match[2];
              if (
                linkTarget.includes(targetPath) ||
                linkTarget.includes(targetPathNoExt) ||
                linkTarget.endsWith(targetName + ".md") ||
                linkTarget.endsWith(targetName)
              ) {
                matches.push({
                  path: file.path,
                  name: file.name.replace(".md", ""),
                  context: line.trim().slice(0, 200),
                  type: "link",
                });
                break; // one match per file for links
              }
            }

            // Check for wikilinks: [[filename]]
            const wikiRegex = /\[\[([^\]]+)\]\]/g;
            while ((match = wikiRegex.exec(line)) !== null) {
              const wikiTarget = match[1].split("|")[0].trim(); // handle [[path|alias]]
              if (
                wikiTarget === targetName ||
                wikiTarget === targetPath ||
                wikiTarget === targetPathNoExt ||
                wikiTarget.endsWith(targetName)
              ) {
                matches.push({
                  path: file.path,
                  name: file.name.replace(".md", ""),
                  context: line.trim().slice(0, 200),
                  type: "link",
                });
                break;
              }
            }
          }

          // If no formal links found, check for unlinked mentions
          if (matches.length === 0 && targetName.length > 3) {
            const lowerContent = raw.toLowerCase();
            const lowerName = targetName.toLowerCase().replace(/-/g, " ");
            // Also try the raw filename with dashes
            const lowerNameDash = targetName.toLowerCase();

            if (lowerContent.includes(lowerName) || lowerContent.includes(lowerNameDash)) {
              // Find the first line with the mention
              for (const line of lines) {
                const lowerLine = line.toLowerCase();
                if (lowerLine.includes(lowerName) || lowerLine.includes(lowerNameDash)) {
                  if (line.trim() && !line.startsWith("---")) {
                    matches.push({
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
          }

          return matches;
        } catch {
          return [];
        }
      })
    );

    backlinks.push(...results.flat());
  }

  // Sort: links first, then mentions
  backlinks.sort((a, b) => {
    if (a.type !== b.type) return a.type === "link" ? -1 : 1;
    return a.name.localeCompare(b.name);
  });

  return backlinks;
}
