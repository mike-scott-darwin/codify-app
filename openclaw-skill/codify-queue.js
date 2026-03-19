#!/usr/bin/env node
/**
 * Codify Content Queue — OpenClaw Skill
 * 
 * Polls Codify's content_queue via API and presents items
 * for approval/rejection via Telegram.
 * 
 * Install on M1:
 *   1. Copy this file to ~/.openclaw/skills/codify-queue/
 *   2. Set env vars: CODIFY_API_URL, CODIFY_API_KEY, CODIFY_USER_ID
 *   3. Register with: claudebot skills install ./codify-queue
 * 
 * Or run standalone:
 *   node codify-queue.js poll    — Check for pending items
 *   node codify-queue.js approve <id> [feedback]
 *   node codify-queue.js reject <id> [feedback]
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

async function fetchPending(since) {
  const params = new URLSearchParams({ user_id: USER_ID, status: "pending" });
  if (since) params.set("since", since);

  const res = await fetch(`${API_URL}/api/openclaw/queue?${params}`, { headers });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || `HTTP ${res.status}`);
  }
  return res.json();
}

async function updateItem(id, action, feedback) {
  const res = await fetch(`${API_URL}/api/openclaw/queue`, {
    method: "PATCH",
    headers,
    body: JSON.stringify({ id, action, feedback }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || `HTTP ${res.status}`);
  }
  return res.json();
}

async function addItem(title, summary, source, topics) {
  const res = await fetch(`${API_URL}/api/openclaw/queue`, {
    method: "POST",
    headers,
    body: JSON.stringify({
      user_id: USER_ID,
      title,
      summary,
      source: source || "openclaw",
      topics: topics || [],
      suggested_formats: ["social_post", "newsletter"],
    }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || `HTTP ${res.status}`);
  }
  return res.json();
}

function formatItem(item) {
  const topics = item.topics?.length ? item.topics.join(", ") : "none";
  const formats = item.suggested_formats?.length ? item.suggested_formats.join(", ") : "any";
  const score = item.relevance_score || 0;
  const source = item.source || "unknown";

  return [
    `📋 ${item.title}`,
    item.summary ? `   ${item.summary}` : null,
    `   Source: ${source} | Score: ${score}/100`,
    `   Topics: ${topics}`,
    `   Formats: ${formats}`,
    `   ID: ${item.id}`,
    `   Created: ${new Date(item.created_at).toLocaleDateString()}`,
  ].filter(Boolean).join("\n");
}

// --- CLI ---
const [,, command, ...args] = process.argv;

(async () => {
  try {
    switch (command) {
      case "poll": {
        const since = args[0] || null;
        const { items, count } = await fetchPending(since);
        if (count === 0) {
          console.log("✅ No pending items in content queue.");
        } else {
          console.log(`📬 ${count} pending item(s):\n`);
          items.forEach((item) => {
            console.log(formatItem(item));
            console.log("");
          });
          console.log("Reply with: approve <id> or reject <id> [reason]");
        }
        break;
      }

      case "approve": {
        const id = args[0];
        if (!id) { console.error("Usage: approve <id> [feedback]"); process.exit(1); }
        const feedback = args.slice(1).join(" ") || null;
        const { item } = await updateItem(id, "approve", feedback);
        console.log(`✅ Approved: ${item.title}`);
        break;
      }

      case "reject": {
        const id = args[0];
        if (!id) { console.error("Usage: reject <id> [feedback]"); process.exit(1); }
        const feedback = args.slice(1).join(" ") || null;
        const { item } = await updateItem(id, "reject", feedback);
        console.log(`❌ Rejected: ${item.title}`);
        break;
      }

      case "add": {
        const title = args[0];
        if (!title) { console.error("Usage: add <title> [summary]"); process.exit(1); }
        const summary = args.slice(1).join(" ") || null;
        const { item } = await addItem(title, summary);
        console.log(`➕ Added to queue: ${item.title} (${item.id})`);
        break;
      }

      default:
        console.log("Codify Content Queue — OpenClaw Skill");
        console.log("");
        console.log("Commands:");
        console.log("  poll [since-iso]      Check for pending items");
        console.log("  approve <id> [note]   Approve a queue item");
        console.log("  reject <id> [note]    Reject a queue item");
        console.log("  add <title> [summary] Add item to queue");
    }
  } catch (err) {
    console.error(`Error: ${err.message}`);
    process.exit(1);
  }
})();
