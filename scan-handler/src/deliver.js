import { log } from "./logger.js";

const GHL_API_URL = "https://rest.gohighlevel.com/v1";
const GHL_API_KEY = process.env.GHL_API_KEY;

export async function deliverResults(job, assessorOutput) {
  const start = Date.now();
  log(job.id, "deliver_start");

  const { contact } = job;
  const { emailHtml, summary, topOpportunities } = assessorOutput;

  // Send via GHL email
  if (GHL_API_KEY && contact.ghlContactId) {
    try {
      const res = await fetch(
        `${GHL_API_URL}/conversations/messages`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${GHL_API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            type: "Email",
            contactId: contact.ghlContactId,
            subject: `${contact.firstName}, here are your 3 opportunities`,
            html: emailHtml,
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
  const { writeFileSync } = await import("node:fs");
  const fallbackPath = new URL(
    `../../logs/deliverable-${job.id}.html`,
    import.meta.url
  ).pathname;
  writeFileSync(fallbackPath, emailHtml);
  log(job.id, "deliver_fallback", {
    path: fallbackPath,
    reason: "GHL delivery failed or not configured",
  });

  const durationMs = Date.now() - start;
  log(job.id, "deliver_done", { method: "file", durationMs });
}
