import Anthropic from "@anthropic-ai/sdk";
import { log } from "../logger.js";

const client = new Anthropic();

const SYSTEM_PROMPT = `You are a strategic positioning consultant with 20 years of experience. Given a business description, analyze their positioning and return a JSON object with:

- positioningGaps: 3-5 positioning angles where no competitor owns a clear position
- messagingAngles: 5 unconventional messaging angles this business could own
- underservedSegments: 3-5 audience segments competitors are ignoring
- strategicRecommendations: ranked list of 5 strategic moves, each with effort/impact rating

Be specific to THIS business. Reference their industry, audience, and differentiators. No generic advice like "use social media" or "improve SEO."
Return ONLY valid JSON, no markdown.`;

export async function runClaudeScanner(job) {
  const start = Date.now();
  log(job.id, "scanner_start", { scanner: "claude" });

  const { answers } = job.input;
  const prompt = `Analyze this business's strategic positioning:

Business: ${answers.business}
Audience: ${answers.audience || "Not specified"}
Differentiator: ${answers.differentiator || "Not specified"}
Challenge: ${answers.challenge || "Not specified"}

Find positioning gaps, unconventional messaging angles, underserved segments, and strategic recommendations. Return structured JSON.`;

  const response = await client.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 4096,
    system: SYSTEM_PROMPT,
    messages: [{ role: "user", content: prompt }],
  });

  const text = response.content[0].text;
  const findings = JSON.parse(text);

  const durationMs = Date.now() - start;
  log(job.id, "scanner_done", { scanner: "claude", durationMs });

  return { scanner: "claude", findings, durationMs };
}
