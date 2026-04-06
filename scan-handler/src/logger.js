import { appendFileSync, mkdirSync } from "node:fs";
import { dirname } from "node:path";

const LOG_FILE = new URL("../../logs/scans.jsonl", import.meta.url).pathname;

// Ensure logs dir exists
mkdirSync(dirname(LOG_FILE), { recursive: true });

export function log(jobId, event, meta = {}) {
  const entry = {
    timestamp: new Date().toISOString(),
    jobId,
    event,
    ...meta,
  };
  appendFileSync(LOG_FILE, JSON.stringify(entry) + "\n");
  console.log(`[${entry.timestamp}] ${jobId} ${event}`, meta.error || "");
}
