import { GoogleGenerativeAI } from "@google/generative-ai";
import { log } from "../logger.js";

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY);

const SYSTEM_PROMPT = `You are a market intelligence analyst. Given a business description, research their market and return a JSON object with:

- competitors: top 5 competitors with their positioning, pricing signals, and strengths
- searchTrends: relevant market trends and search demand patterns
- pricingIntel: pricing ranges and models used in this market
- adInsights: what competitors are advertising, which channels, what messaging angles they use
- marketGaps: areas where competitor coverage is thin or non-existent

Be specific. Use real company names and data where possible. No generic advice.
Return ONLY valid JSON, no markdown.`;

export async function runGoogleScanner(job) {
  const start = Date.now();
  log(job.id, "scanner_start", { scanner: "google" });

  const { answers } = job.input;
  const prompt = `Analyze this business and its market:

Business: ${answers.business}
Audience: ${answers.audience || "Not specified"}
Differentiator: ${answers.differentiator || "Not specified"}
Challenge: ${answers.challenge || "Not specified"}

Research their competitors, market trends, pricing, and advertising. Return structured JSON.`;

  const model = genAI.getGenerativeModel({
    model: "gemini-2.0-flash",
    systemInstruction: SYSTEM_PROMPT,
    generationConfig: { responseMimeType: "application/json" },
  });

  const result = await model.generateContent(prompt);
  let text = result.response.text();
  text = text.replace(/^```(?:json)?\s*\n?/i, "").replace(/\n?```\s*$/i, "");
  const findings = JSON.parse(text);

  const durationMs = Date.now() - start;
  log(job.id, "scanner_done", { scanner: "google", durationMs });

  return { scanner: "google", findings, durationMs };
}
