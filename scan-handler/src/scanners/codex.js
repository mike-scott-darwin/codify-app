import OpenAI from "openai";
import { log } from "../logger.js";

const client = new OpenAI();

const SYSTEM_PROMPT = `You are a competitive pattern analyst. Given a business description, analyze the competitive landscape and return a JSON object with:

- marketStructure: type of competitive landscape (fragmented, consolidated, emerging, etc.) with explanation
- competitivePatterns: 5 recurring strategies competitors use in this space
- blindSpots: 5 things most businesses in this space miss or ignore
- disruptionOpportunities: 3-5 specific ways this market is vulnerable to disruption
- contentGaps: topics and angles that competitors aren't covering but the audience cares about

Be specific. Name patterns, reference real market dynamics. No generic business advice.
Return ONLY valid JSON, no markdown.`;

export async function runCodexScanner(job) {
  const start = Date.now();
  log(job.id, "scanner_start", { scanner: "codex" });

  const { answers } = job.input;
  const prompt = `Analyze the competitive landscape for this business:

Business: ${answers.business}
Audience: ${answers.audience || "Not specified"}
Differentiator: ${answers.differentiator || "Not specified"}
Challenge: ${answers.challenge || "Not specified"}

Find market structure, competitive patterns, blind spots, disruption opportunities, and content gaps. Return structured JSON.`;

  const response = await client.chat.completions.create({
    model: "gpt-4o",
    temperature: 0.7,
    response_format: { type: "json_object" },
    messages: [
      { role: "system", content: SYSTEM_PROMPT },
      { role: "user", content: prompt },
    ],
  });

  let text = response.choices[0].message.content;
  text = text.replace(/^```(?:json)?\s*\n?/i, "").replace(/\n?```\s*$/i, "");
  const findings = JSON.parse(text);

  const durationMs = Date.now() - start;
  log(job.id, "scanner_done", { scanner: "codex", durationMs });

  return { scanner: "codex", findings, durationMs };
}
