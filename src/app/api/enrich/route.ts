import { NextRequest, NextResponse } from "next/server";
import { getEnrichmentPrompt } from "@/lib/enrichment-prompts";
import { createServerSupabaseClient } from "@/lib/supabase-server";
import { callLLM } from "@/lib/llm/provider";
import type { LLMConfig } from "@/lib/llm/provider";
import { getUserLLMConfig } from "@/lib/llm/user-config";


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

  let body: { fileType?: string; answers?: Record<string, string> };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON." }, { status: 400 });
  }

  const { fileType, answers } = body;

  if (!fileType || typeof fileType !== "string") {
    return NextResponse.json(
      { error: "fileType is required." },
      { status: 400 }
    );
  }

  if (!answers || typeof answers !== "object" || Object.keys(answers).length === 0) {
    return NextResponse.json({ error: "Answers cannot be empty." }, { status: 400 });
  }

  const { system, user } = getEnrichmentPrompt(fileType, answers);

  try {
    // Try to load user's LLM config if authenticated
    let config: LLMConfig = { provider: "gemini" };
    try {
      const supabase = await createServerSupabaseClient();
      const { data: { user: authUser } } = await supabase.auth.getUser();
      if (authUser) {
        config = await getUserLLMConfig(authUser.id);
      }
    } catch {
      // Not authenticated or config load failed — use default Gemini
    }

    let enrichedContent = await callLLM(config, system, user);

    // Strip YAML frontmatter if the model includes it
    enrichedContent = enrichedContent.replace(/^---[\s\S]*?---\s*\n/, "").trim();


    // Non-blocking: commit to GitHub if connected
    try {
      const supabaseForGh = await createServerSupabaseClient();
      const { data: { user: ghUser } } = await supabaseForGh.auth.getUser();
      if (ghUser) {
        const { data: profile } = await supabaseForGh
          .from("user_profiles")
          .select("github_config")
          .eq("id", ghUser.id)
          .single();
        if (profile?.github_config) {
          const { writeFileToRepo } = await import("@/lib/github");
          const ghConfig = profile.github_config as { token: string; owner: string; repo: string; branch?: string };
          writeFileToRepo(
            ghConfig,
            `reference/core/${fileType}.md`,
            enrichedContent,
            `[codify] Update ${fileType}.md via enrichment`
          ).catch((err: unknown) => {
            console.error("GitHub commit failed (non-blocking):", err instanceof Error ? err.message : err);
          });
        }
      }
    } catch {
      // GitHub commit is non-blocking
    }

    return NextResponse.json({ enrichedContent });
  } catch (err: unknown) {
    console.error("Enrichment error:", err instanceof Error ? err.message : err);
    return NextResponse.json(
      { error: "Failed to generate enriched content." },
      { status: 500 }
    );
  }
}
