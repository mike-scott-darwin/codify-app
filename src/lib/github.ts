export interface GitHubConfig {
  token: string;
  owner: string;
  repo: string;
  branch?: string;
}

const API_BASE = "https://api.github.com";

function headers(token: string): Record<string, string> {
  return {
    Authorization: `Bearer ${token}`,
    Accept: "application/vnd.github.v3+json",
    "Content-Type": "application/json",
    "X-GitHub-Api-Version": "2022-11-28",
  };
}

export async function readFileFromRepo(
  config: GitHubConfig,
  path: string
): Promise<string | null> {
  const branch = config.branch || "main";
  const url = `${API_BASE}/repos/${config.owner}/${config.repo}/contents/${path}?ref=${branch}`;
  const res = await fetch(url, { headers: headers(config.token) });
  if (!res.ok) return null;
  const data = await res.json();
  if (data.encoding === "base64" && data.content) {
    return Buffer.from(data.content, "base64").toString("utf-8");
  }
  return null;
}

export async function writeFileToRepo(
  config: GitHubConfig,
  path: string,
  content: string,
  message: string
): Promise<{ success: boolean; sha?: string; error?: string }> {
  const branch = config.branch || "main";
  const url = `${API_BASE}/repos/${config.owner}/${config.repo}/contents/${path}`;

  // Check if file exists to get its SHA (required for updates)
  let existingSha: string | undefined;
  const checkRes = await fetch(`${url}?ref=${branch}`, {
    headers: headers(config.token),
  });
  if (checkRes.ok) {
    const existing = await checkRes.json();
    existingSha = existing.sha;
  }

  const body: Record<string, string> = {
    message,
    content: Buffer.from(content, "utf-8").toString("base64"),
    branch,
  };
  if (existingSha) {
    body.sha = existingSha;
  }

  const res = await fetch(url, {
    method: "PUT",
    headers: headers(config.token),
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    return {
      success: false,
      error: err.message || `GitHub API error: ${res.status}`,
    };
  }

  const data = await res.json();
  return { success: true, sha: data.content?.sha };
}

export async function listFilesInRepo(
  config: GitHubConfig,
  path: string
): Promise<Array<{ name: string; path: string; sha: string }>> {
  const branch = config.branch || "main";
  const url = `${API_BASE}/repos/${config.owner}/${config.repo}/contents/${path}?ref=${branch}`;
  const res = await fetch(url, { headers: headers(config.token) });
  if (!res.ok) return [];
  const data = await res.json();
  if (!Array.isArray(data)) return [];
  return data
    .filter((item: { type: string }) => item.type === "file")
    .map((item: { name: string; path: string; sha: string }) => ({
      name: item.name,
      path: item.path,
      sha: item.sha,
    }));
}

export async function verifyRepo(
  config: GitHubConfig
): Promise<{ valid: boolean; message: string }> {
  const url = `${API_BASE}/repos/${config.owner}/${config.repo}`;
  try {
    const res = await fetch(url, { headers: headers(config.token) });
    if (res.status === 401 || res.status === 403) {
      return { valid: false, message: "Invalid token or insufficient permissions." };
    }
    if (res.status === 404) {
      return { valid: false, message: "Repository not found. Check owner and repo name." };
    }
    if (!res.ok) {
      return { valid: false, message: `GitHub API error: ${res.status}` };
    }
    const data = await res.json();
    const permissions = data.permissions || {};
    if (!permissions.push) {
      return { valid: false, message: "Token lacks write access to this repository." };
    }
    return { valid: true, message: `Connected to ${config.owner}/${config.repo}` };
  } catch {
    return { valid: false, message: "Failed to reach GitHub API." };
  }
}

export async function initRepoStructure(
  config: GitHubConfig
): Promise<{ success: boolean; message: string }> {
  const dirs = [
    "reference/core",
    "research",
    "decisions",
    "outputs",
  ];

  let created = 0;
  for (const dir of dirs) {
    const readmePath = `${dir}/.gitkeep`;
    const existing = await readFileFromRepo(config, readmePath);
    if (existing === null) {
      const result = await writeFileToRepo(
        config,
        readmePath,
        "",
        `[codify] Initialize ${dir}/`
      );
      if (result.success) created++;
    }
  }

  if (created === 0) {
    return { success: true, message: "Repository structure already exists." };
  }
  return { success: true, message: `Initialized ${created} directories.` };
}

export function maskToken(token: string): string {
  if (token.length <= 8) return "****";
  return token.slice(0, 4) + "****" + token.slice(-4);
}
