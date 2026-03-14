import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { getEnrichmentPrompt } from "@/lib/enrichment-prompts";

const VALID_FILE_TYPES = ["soul", "offer", "audience", "voice"] as const;

// Simple in-memory rate limiting: 10 requests per IP per minute
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);
  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + 60_000 });
    return false;
  }
  entry.count++;
  return entry.count > 10;
}

export async function POST(request: NextRequest) {
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    request.headers.get("x-real-ip") ??
    "unknown";

  if (isRateLimited(ip)) {
    return NextResponse.json(
      { error: "Rate limit exceeded. Try again in a minute." },
      { status: 429 }
    );
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "Enrichment not configured. ANTHROPIC_API_KEY missing." },
      { status: 503 }
    );
  }

  let body: { fileType?: string; answers?: Record<string, string> };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON." }, { status: 400 });
  }

  const { fileType, answers } = body;

  if (!fileType || !VALID_FILE_TYPES.includes(fileType as typeof VALID_FILE_TYPES[number])) {
    return NextResponse.json(
      { error: `Invalid fileType. Must be: ${VALID_FILE_TYPES.join(", ")}` },
      { status: 400 }
    );
  }

  if (!answers || typeof answers !== "object" || Object.keys(answers).length === 0) {
    return NextResponse.json({ error: "Answers cannot be empty." }, { status: 400 });
  }

  const { system, user } = getEnrichmentPrompt(fileType, answers);

  try {
    const client = new Anthropic({ apiKey });
    const message = await client.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 2000,
      system,
      messages: [{ role: "user", content: user }],
    });

    const textBlock = message.content.find((block) => block.type === "text");
    const enrichedContent = textBlock && "text" in textBlock ? textBlock.text : "";

    return NextResponse.json({ enrichedContent });
  } catch (err: unknown) {
    console.error("Enrichment error:", err instanceof Error ? err.message : err);
    return NextResponse.json(
      { error: "Failed to generate enriched content." },
      { status: 500 }
    );
  }
}
