const GITHUB_API = "https://api.github.com";
const TEMPLATE_OWNER = "mike-scott-darwin";
const TEMPLATE_REPO = "codify-vault-template";

interface ProvisionResult {
  repoFullName: string; // e.g. "mike-scott-darwin/codify-vault-john-smith"
  repoUrl: string;
}

/**
 * Create a new client vault from the GitHub template repo,
 * then personalize the core identity files with their details.
 */
export async function provisionVault(opts: {
  token: string;
  clientName: string;
  email: string;
  company: string;
}): Promise<ProvisionResult> {
  const { token, clientName, email, company } = opts;
  const slug = clientName
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
  const repoName = `codify-vault-${slug}`;
  const owner = TEMPLATE_OWNER;

  // 1. Create repo from template
  const createRes = await fetch(
    `${GITHUB_API}/repos/${TEMPLATE_OWNER}/${TEMPLATE_REPO}/generate`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/vnd.github.v3+json",
      },
      body: JSON.stringify({
        owner,
        name: repoName,
        description: `${company} — Codify vault`,
        private: true,
        include_all_branches: false,
      }),
    }
  );

  if (!createRes.ok) {
    const err = await createRes.text();
    throw new Error(`Failed to create repo: ${createRes.status} ${err}`);
  }

  const repo = await createRes.json();
  const repoFullName = repo.full_name as string;

  // 2. Wait for GitHub to finish creating the repo (template generation is async)
  await waitForRepo(token, repoFullName);

  // 3. Personalize soul.md with client details
  const date = new Date().toISOString().split("T")[0];
  const soulContent = `---
type: context
role: core-identity
client: ${clientName}
company: ${company}
created: ${date}
status: draft
---

# Soul — ${company}

## Who
- **Name:** ${clientName}
- **Company:** ${company}
- **Email:** ${email}

## Context Architecture
This vault is a sovereign context engine for ${clientName}.
Everything here compounds — every extraction, every decision, every piece of research
makes the next output more accurate and more "you."

## Status
- **Stage:** Initial Setup
- **Next:** First extraction session — open the chat panel and type \`/extract soul\`

---

*Fill in the sections below during your first extraction. Type \`/extract soul\` in the chat panel to get started.*

## Core Beliefs
<!-- What do you believe that your competitors don't? -->

## Origin Story
<!-- How did you get into this work? What moment made it click? -->

## Differentiators
<!-- What makes you different from the 10 other people who do what you do? -->
`;

  await updateFile(token, repoFullName, "reference/core/soul.md", soulContent);

  // 4. Personalize CLAUDE.md
  const claudeContent = `# CLAUDE.md — ${company} Context Vault

## Owner
- **Client:** ${clientName}
- **Company:** ${company}
- **Started:** ${date}

## Architecture
- **Vault:** This repo (GitHub Private)
- **Engine:** Claude with Codify skills
- **Dashboard:** https://codify.build/vault

## Structure
- \`reference/core/\` — Core identity: soul, voice, audience, offer
- \`decisions/\` — Strategic decisions with dates and reasoning
- \`research/\` — Market intelligence, competitor analysis
- \`outputs/\` — Generated content: ads, emails, proposals
- \`content/\` — Published content: LinkedIn, newsletter, blog

## Rules
1. Read reference/core/ before generating any output
2. All outputs must sound like ${clientName.split(" ")[0]}, not like AI
3. Reference existing decisions before making new recommendations
4. Context compounds — link new work to existing knowledge
`;

  await updateFile(token, repoFullName, "CLAUDE.md", claudeContent);

  return {
    repoFullName,
    repoUrl: `https://github.com/${repoFullName}`,
  };
}

async function waitForRepo(token: string, repoFullName: string, maxWait = 15000) {
  const start = Date.now();
  while (Date.now() - start < maxWait) {
    const res = await fetch(`${GITHUB_API}/repos/${repoFullName}/contents/CLAUDE.md`, {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/vnd.github.v3+json",
      },
    });
    if (res.ok) return;
    await new Promise((r) => setTimeout(r, 2000));
  }
  // Continue anyway — files might still be generating but repo exists
}

async function updateFile(
  token: string,
  repo: string,
  path: string,
  content: string
) {
  // Get current file SHA (needed for updates)
  const getRes = await fetch(`${GITHUB_API}/repos/${repo}/contents/${path}`, {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/vnd.github.v3+json",
    },
  });

  let sha: string | undefined;
  if (getRes.ok) {
    const data = await getRes.json();
    sha = data.sha;
  }

  const body: Record<string, unknown> = {
    message: `[setup] Personalize ${path} for client`,
    content: Buffer.from(content).toString("base64"),
  };
  if (sha) body.sha = sha;

  const putRes = await fetch(`${GITHUB_API}/repos/${repo}/contents/${path}`, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/vnd.github.v3+json",
    },
    body: JSON.stringify(body),
  });

  if (!putRes.ok) {
    const err = await putRes.text();
    throw new Error(`Failed to update ${path}: ${putRes.status} ${err}`);
  }
}
