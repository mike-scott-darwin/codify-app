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
  "emailHtml": "Complete HTML email body (inline styles only, no external CSS). Structure it exactly like this: 1) Summary section with executive overview. 2) The 3 opportunities, each with title, explanation, why it matters, and first step. 3) A BRIDGE section with a light background that connects the scan to the full Codify offering. The bridge should say something like: 'This scan came from a paragraph about your business. Imagine what happens when we codify your full expertise — your offer, your audience, your voice, your frameworks, your 30 years of judgment calls — into structured context that AI reads before it writes a single word. That is what Codify does. Every ad, proposal, email, and piece of content sounds like you wrote it on your best day. And it compounds — getting smarter every week, automatically.' Adapt this to be specific to THEIR business and the opportunities found. 4) A NEXT STEPS section with a prominent blue CTA button linking to BOOKING_LINK_PLACEHOLDER that says 'Book Your Free Strategy Call'. Below the button add: 'In 30 minutes, we will walk through your scan results, show you which opportunity has the highest ROI, and map out exactly how to capture it — using AI that actually knows your business.' 5) Sign-off from 'Mike at Codify'. Use a clean, professional style throughout."
}

The email should feel personal and valuable — like a senior strategist took 30 minutes to analyze their business. Because three AI models actually did. The bridge section is critical — it must connect the free scan value to the ongoing Codify system without being salesy. The tone should be: "you just saw what we can do with a paragraph — here is what happens with your full expertise."

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

  let text = response.content[0].text;
  text = text.replace(/^```(?:json)?\s*\n?/i, "").replace(/\n?```\s*$/i, "");
  const result = JSON.parse(text);

  const durationMs = Date.now() - start;
  log(job.id, "assessor_done", { durationMs });

  return result;
}
