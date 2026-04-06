import Anthropic from "@anthropic-ai/sdk";
import { log } from "./logger.js";

const client = new Anthropic();

const SYSTEM_PROMPT = `You are the chief assessor for an opportunity scan service. You receive outputs from three AI scanners (Google, Claude, Codex) that each analyzed a business's market from a different angle.

Your job:
1. Cross-reference all scanner outputs — find agreements and contradictions
2. REMOVE any advice that is generic or obvious (e.g., "use social media", "improve your website", "create content")
3. REMOVE duplicates across scanners
4. Rank remaining opportunities by estimated ROI (low effort + high impact = best)
5. Pick the TOP 3 most specific, non-obvious opportunities
6. For each opportunity, write in plain business language — no jargon

Return a JSON object with:
{
  "summary": "2-3 sentence executive overview of what we found",
  "topOpportunities": [
    {
      "title": "Short punchy title",
      "explanation": "What this opportunity is, in 2-3 sentences",
      "whyItMatters": "Why this matters specifically for THIS business",
      "firstStep": "One concrete action they can take this week"
    }
  ],
  "emailHtml": "Complete HTML email body (inline styles only, no external CSS) with the summary and 3 opportunities formatted for easy reading. Use a clean, professional style. Include a sign-off from 'Mike at Codify'."
}

The email should feel personal and valuable — like a senior strategist took 30 minutes to analyze their business. Because three AI models actually did.

Return ONLY valid JSON, no markdown.`;

export async function runAssessor(job, scannerOutputs) {
  const start = Date.now();
  log(job.id, "assessor_start", { scannerCount: scannerOutputs.length });

  const scannersUsed = scannerOutputs.map((s) => s.scanner).join(", ");
  const scannerData = scannerOutputs
    .map(
      (s) =>
        `=== ${s.scanner.toUpperCase()} SCANNER ===\n${JSON.stringify(s.findings, null, 2)}`
    )
    .join("\n\n");

  const prompt = `Here is the business being analyzed:

Business: ${job.input.answers.business}
Audience: ${job.input.answers.audience || "Not specified"}
Differentiator: ${job.input.answers.differentiator || "Not specified"}
Challenge: ${job.input.answers.challenge || "Not specified"}

Here are the outputs from ${scannerOutputs.length} scanner(s) (${scannersUsed}):

${scannerData}

Cross-reference these outputs. Remove generic advice. Pick the 3 best, most specific opportunities. Write the email.`;

  const response = await client.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 4096,
    system: SYSTEM_PROMPT,
    messages: [{ role: "user", content: prompt }],
  });

  const text = response.content[0].text;
  const result = JSON.parse(text);

  const durationMs = Date.now() - start;
  log(job.id, "assessor_done", { durationMs });

  return result;
}
