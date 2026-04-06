import { createServer } from "node:http";
import { log } from "./logger.js";
import { runGoogleScanner } from "./scanners/google.js";
import { runClaudeScanner } from "./scanners/claude.js";
import { runCodexScanner } from "./scanners/codex.js";
import { runAssessor } from "./assessor.js";
import { deliverResults } from "./deliver.js";

const PORT = process.env.PORT || 3141;
const WEBHOOK_SECRET = process.env.WEBHOOK_SECRET;

// Timeout wrapper
function withTimeout(promise, ms) {
  return Promise.race([
    promise,
    new Promise((_, reject) =>
      setTimeout(() => reject(new Error(`Timeout after ${ms}ms`)), ms)
    ),
  ]);
}

// Process a scan job (runs in background after 202 response)
async function processJob(job) {
  const jobStart = Date.now();

  try {
    // 1. Run 3 scanners in parallel
    log(job.id, "scanning");
    const results = await Promise.allSettled([
      withTimeout(runGoogleScanner(job), 60_000),
      withTimeout(runClaudeScanner(job), 90_000),
      withTimeout(runCodexScanner(job), 60_000),
    ]);

    // Collect successful results
    const successful = [];
    const scannerNames = ["google", "claude", "codex"];
    for (let i = 0; i < results.length; i++) {
      if (results[i].status === "fulfilled") {
        successful.push(results[i].value);
      } else {
        log(job.id, "scanner_failed", {
          scanner: scannerNames[i],
          error: results[i].reason?.message || "Unknown error",
        });
      }
    }

    if (successful.length === 0) {
      log(job.id, "failed", { reason: "All scanners failed" });
      return;
    }

    log(job.id, "scanners_complete", {
      successful: successful.length,
      total: 3,
      scanDurationMs: Date.now() - jobStart,
    });

    // 2. Run assessor
    log(job.id, "assessing");
    const assessorOutput = await withTimeout(runAssessor(job, successful), 120_000);

    // 3. Deliver results
    log(job.id, "delivering");
    await deliverResults(job, assessorOutput);

    const totalDurationMs = Date.now() - jobStart;
    log(job.id, "done", {
      totalDurationMs,
      scannersUsed: successful.map((s) => s.scanner),
      opportunities: assessorOutput.topOpportunities?.length || 0,
    });
  } catch (err) {
    log(job.id, "failed", {
      error: err.message,
      totalDurationMs: Date.now() - jobStart,
    });
  }
}

// HTTP server
const server = createServer(async (req, res) => {
  // Health check
  if (req.method === "GET" && req.url === "/health") {
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ status: "ok", uptime: process.uptime() }));
    return;
  }

  // Scan webhook
  if (req.method === "POST" && req.url === "/scan") {
    // Validate webhook secret
    if (WEBHOOK_SECRET && req.headers["x-webhook-secret"] !== WEBHOOK_SECRET) {
      res.writeHead(401, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: "Unauthorized" }));
      return;
    }

    // Parse body
    let body = "";
    for await (const chunk of req) body += chunk;

    let job;
    try {
      job = JSON.parse(body);
    } catch {
      res.writeHead(400, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: "Invalid JSON" }));
      return;
    }

    if (!job.id || !job.contact?.email) {
      res.writeHead(400, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: "Missing job id or contact email" }));
      return;
    }

    log(job.id, "received", { email: job.contact.email });

    // Respond immediately, process in background
    res.writeHead(202, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ accepted: true, jobId: job.id }));

    // Fire and forget
    processJob(job).catch((err) => {
      log(job.id, "unhandled_error", { error: err.message });
    });
    return;
  }

  // 404 everything else
  res.writeHead(404, { "Content-Type": "application/json" });
  res.end(JSON.stringify({ error: "Not found" }));
});

server.listen(PORT, () => {
  console.log(`Scan handler listening on port ${PORT}`);
  console.log(`Health: http://localhost:${PORT}/health`);
  console.log(`Webhook: POST http://localhost:${PORT}/scan`);
});
