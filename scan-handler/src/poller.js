import { log } from "./logger.js";
import { runGoogleScanner } from "./scanners/google.js";
import { runClaudeScanner } from "./scanners/claude.js";
import { runCodexScanner } from "./scanners/codex.js";
import { runAssessor } from "./assessor.js";
import { deliverResults } from "./deliver.js";

const GHL_API_URL = "https://rest.gohighlevel.com/v1";
const GHL_API_KEY = process.env.GHL_API_KEY;
const POLL_INTERVAL = 30_000; // 30 seconds

const processing = new Set(); // track in-flight jobs by contactId

function withTimeout(promise, ms) {
  return Promise.race([
    promise,
    new Promise((_, reject) =>
      setTimeout(() => reject(new Error(`Timeout after ${ms}ms`)), ms)
    ),
  ]);
}

async function fetchPendingScans() {
  const res = await fetch(
    `${GHL_API_URL}/contacts/?query=&limit=20`,
    {
      headers: { Authorization: `Bearer ${GHL_API_KEY}` },
    }
  );

  if (!res.ok) {
    console.error("GHL fetch error:", res.status);
    return [];
  }

  const data = await res.json();
  const contacts = data.contacts || [];

  // Filter for contacts tagged "opportunity-scan" but NOT "scan-complete"
  return contacts.filter(
    (c) =>
      c.tags?.includes("opportunity-scan") &&
      !c.tags?.includes("scan-complete") &&
      !c.tags?.includes("scan-processing") &&
      !processing.has(c.id)
  );
}

async function tagContact(contactId, addTags, removeTags = []) {
  // Add tags
  if (addTags.length > 0) {
    await fetch(`${GHL_API_URL}/contacts/${contactId}`, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${GHL_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ tags: addTags }),
    });
  }

  // Remove tags (GHL v1 uses DELETE for tag removal)
  for (const tag of removeTags) {
    await fetch(`${GHL_API_URL}/contacts/${contactId}/tags`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${GHL_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ tags: [tag] }),
    });
  }
}

async function processContact(contact) {
  const jobId = `scan_${contact.id}_${Date.now()}`;
  processing.add(contact.id);

  // Build a job from GHL contact data
  const job = {
    id: jobId,
    created: new Date().toISOString(),
    contact: {
      firstName: contact.firstName || "",
      lastName: contact.lastName || "",
      email: contact.email || "",
      phone: contact.phone || "",
      ghlContactId: contact.id,
    },
    input: {
      answers: {
        business:
          contact.customField?.business_summary ||
          contact.customField?.business ||
          "",
        audience: contact.customField?.audience || "",
        differentiator: contact.customField?.differentiator || "",
        challenge: contact.customField?.challenge || "",
      },
      uploads: [],
      voiceNote: null,
      inputMode: "write",
    },
  };

  log(jobId, "received", { email: contact.email, source: "ghl-poll" });

  // Tag as processing so we don't pick it up again
  await tagContact(contact.id, ["scan-processing"]);

  const jobStart = Date.now();

  try {
    // Run 3 scanners in parallel
    log(jobId, "scanning");
    const results = await Promise.allSettled([
      withTimeout(runGoogleScanner(job), 60_000),
      withTimeout(runClaudeScanner(job), 90_000),
      withTimeout(runCodexScanner(job), 60_000),
    ]);

    const successful = [];
    const scannerNames = ["google", "claude", "codex"];
    for (let i = 0; i < results.length; i++) {
      if (results[i].status === "fulfilled") {
        successful.push(results[i].value);
      } else {
        log(jobId, "scanner_failed", {
          scanner: scannerNames[i],
          error: results[i].reason?.message || "Unknown error",
        });
      }
    }

    if (successful.length === 0) {
      log(jobId, "failed", { reason: "All scanners failed" });
      await tagContact(contact.id, ["scan-failed"], ["scan-processing"]);
      processing.delete(contact.id);
      return;
    }

    log(jobId, "scanners_complete", {
      successful: successful.length,
      scanDurationMs: Date.now() - jobStart,
    });

    // Run assessor
    log(jobId, "assessing");
    const assessorOutput = await withTimeout(
      runAssessor(job, successful),
      120_000
    );

    // Deliver results
    log(jobId, "delivering");
    await deliverResults(job, assessorOutput);

    // Tag as complete
    await tagContact(
      contact.id,
      ["scan-complete"],
      ["opportunity-scan", "scan-processing"]
    );

    const totalDurationMs = Date.now() - jobStart;
    log(jobId, "done", {
      totalDurationMs,
      scannersUsed: successful.map((s) => s.scanner),
    });
  } catch (err) {
    log(jobId, "failed", { error: err.message });
    await tagContact(contact.id, ["scan-failed"], ["scan-processing"]);
  } finally {
    processing.delete(contact.id);
  }
}

async function poll() {
  try {
    const pending = await fetchPendingScans();
    if (pending.length > 0) {
      console.log(`Found ${pending.length} pending scan(s)`);
      // Process one at a time to avoid API rate limits
      for (const contact of pending) {
        await processContact(contact);
      }
    }
  } catch (err) {
    console.error("Poll error:", err.message);
  }
}

// Start polling
console.log(
  `Scan poller started. Checking GHL every ${POLL_INTERVAL / 1000}s...`
);
poll(); // run immediately on start
setInterval(poll, POLL_INTERVAL);

// Keep the health endpoint for monitoring
import { createServer } from "node:http";
const PORT = process.env.PORT || 3141;
createServer((req, res) => {
  if (req.method === "GET" && req.url === "/health") {
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(
      JSON.stringify({
        status: "ok",
        uptime: process.uptime(),
        processing: [...processing],
      })
    );
  } else {
    res.writeHead(404);
    res.end();
  }
}).listen(PORT, () => console.log(`Health check on port ${PORT}`));
