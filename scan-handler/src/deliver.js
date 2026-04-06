import { log } from "./logger.js";

const GHL_V1_API_URL = "https://rest.gohighlevel.com/v1";
const GHL_API_KEY = process.env.GHL_API_KEY;
const BOOKING_URL = "https://api.leadconnectorhq.com/widget/booking/323Lat7odQIudKsnAi8C";

export async function deliverResults(job, assessorOutput) {
  const start = Date.now();
  log(job.id, "deliver_start");

  const { contact } = job;
  let { emailHtml, summary, topOpportunities } = assessorOutput;

  // Replace booking link placeholder
  emailHtml = emailHtml.replace(/BOOKING_LINK_PLACEHOLDER/g, BOOKING_URL);

  // Send via GHL email
  if (GHL_API_KEY && contact.ghlContactId) {
    try {
      // Use GHL v1 send-email endpoint
      const res = await fetch(
        `${GHL_V1_API_URL}/contacts/${contact.ghlContactId}/campaigns/emails`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${GHL_API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            emailFrom: "Mike at Codify <hello@codify.build>",
            subject: `${contact.firstName}, your Opportunity Scan is ready`,
            body: emailHtml,
          }),
        }
      );

      if (!res.ok) {
        const errText = await res.text();
        log(job.id, "deliver_ghl_error", { status: res.status, error: errText });
        // Fall through to file backup
      } else {
        const durationMs = Date.now() - start;
        log(job.id, "deliver_done", { method: "ghl", durationMs });
        return;
      }
    } catch (err) {
      log(job.id, "deliver_ghl_error", { error: err.message });
    }
  }

  // Fallback: save to disk
  const { writeFileSync, mkdirSync } = await import("node:fs");
  const { join, dirname } = await import("node:path");
  const { fileURLToPath } = await import("node:url");
  const __dirname = dirname(fileURLToPath(import.meta.url));
  const logsDir = join(__dirname, "..", "logs");
  mkdirSync(logsDir, { recursive: true });
  const fallbackPath = join(logsDir, `deliverable-${job.id}.html`);
  writeFileSync(fallbackPath, emailHtml);
  log(job.id, "deliver_fallback", {
    path: fallbackPath,
    reason: "GHL delivery failed or not configured",
  });

  const durationMs = Date.now() - start;
  log(job.id, "deliver_done", { method: "file", durationMs });
}
