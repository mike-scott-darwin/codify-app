#!/usr/bin/env node
/**
 * Codify to Git — OpenClaw Skill
 * 
 * Captures decisions and research from Telegram conversations
 * and commits them as dated files to the user's GitHub repo.
 * 
 * Commands:
 *   node codify-to-git.js decide "Title" "Content..."
 *   node codify-to-git.js research "Title" "Content..."
 * 
 * Install on M1:
 *   1. Copy to ~/.openclaw/skills/codify-to-git/
 *   2. Same env vars as codify-queue: CODIFY_API_URL, CODIFY_API_KEY, CODIFY_USER_ID
 */

const API_URL = process.env.CODIFY_API_URL || "https://codify.build";
const API_KEY = process.env.CODIFY_API_KEY;
const USER_ID = process.env.CODIFY_USER_ID;

if (!API_KEY || !USER_ID) {
  console.error("Missing CODIFY_API_KEY or CODIFY_USER_ID env vars");
  process.exit(1);
}

const headers = {
  "Content-Type": "application/json",
  "x-api-key": API_KEY,
};

async function codify(type, title, content) {
  const res = await fetch(`${API_URL}/api/openclaw/codify`, {
    method: "POST",
    headers,
    body: JSON.stringify({
      user_id: USER_ID,
      type,
      title,
      content,
      source: "telegram",
    }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || `HTTP ${res.status}`);
  }
  return res.json();
}

// --- CLI ---
const [,, command, ...args] = process.argv;

(async () => {
  try {
    switch (command) {
      case "decide":
      case "decision": {
        const title = args[0];
        const content = args.slice(1).join(" ");
        if (!title || !content) {
          console.error('Usage: decide "Title" "Decision content..."');
          process.exit(1);
        }
        const result = await codify("decision", title, content);
        console.log(`✅ Decision codified: ${result.file}`);
        break;
      }

      case "research": {
        const title = args[0];
        const content = args.slice(1).join(" ");
        if (!title || !content) {
          console.error('Usage: research "Title" "Research content..."');
          process.exit(1);
        }
        const result = await codify("research", title, content);
        console.log(`✅ Research codified: ${result.file}`);
        break;
      }

      case "codify": {
        // Auto-detect type from content, default to decision
        const title = args[0];
        const content = args.slice(1).join(" ");
        if (!title || !content) {
          console.error('Usage: codify "Title" "Content..."');
          process.exit(1);
        }
        const type = content.toLowerCase().includes("research") ? "research" : "decision";
        const result = await codify(type, title, content);
        console.log(`✅ Codified as ${type}: ${result.file}`);
        break;
      }

      default:
        console.log("Codify to Git — OpenClaw Skill");
        console.log("");
        console.log("Captures Telegram decisions and research into your GitHub repo.");
        console.log("");
        console.log("Commands:");
        console.log('  decide "Title" "Content..."    Commit a decision to decisions/');
        console.log('  research "Title" "Content..."   Commit research to research/');
        console.log('  codify "Title" "Content..."     Auto-detect type and commit');
        console.log("");
        console.log("Example:");
        console.log('  decide "Pivot to senior executives" "Targeting shifted to mature senior executives at $1,497..."');
    }
  } catch (err) {
    console.error(`Error: ${err.message}`);
    process.exit(1);
  }
})();
