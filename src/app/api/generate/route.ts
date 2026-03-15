import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { createServerSupabaseClient } from "@/lib/supabase-server";
import { getGenerationPrompt } from "@/lib/generation-prompts";
import type { OutputType } from "@/lib/generation-types";

const VALID_TYPES: OutputType[] = ["ad_copy", "social_post", "email_sequence", "vsl_script", "landing_page"];

const TIER_HIERARCHY: Record<string, number> = { free: 0, build: 1, pro: 2, vip: 3 };
const GENERATION_LIMITS: Record<string, number> = { free: 0, build: 0, pro: 50, vip: Infinity };

export async function POST(request: NextRequest) {
  const googleKey = process.env.GOOGLE_API_KEY;
  if (!googleKey) {
    return NextResponse.json({ error: "Generation not configured." }, { status: 503 });
  }

  // Auth check
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Sign in to generate content." }, { status: 401 });
  }

  // Parse body
  let body: { outputType?: string; options?: Record<string, string> };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON." }, { status: 400 });
  }

  const { outputType, options = {} } = body;
  if (!outputType || !VALID_TYPES.includes(outputType as OutputType)) {
    return NextResponse.json({ error: "Invalid output type." }, { status: 400 });
  }

  // Tier check
  const { data: profile } = await supabase
    .from("user_profiles")
    .select("tier")
    .eq("user_id", user.id)
    .single();

  const tier = profile?.tier || "free";
  if (TIER_HIERARCHY[tier] < TIER_HIERARCHY["pro"]) {
    return NextResponse.json({
      error: "Upgrade to PRO to generate content.",
      requiredTier: "pro",
    }, { status: 403 });
  }

  // Generation limit check
  const limit = GENERATION_LIMITS[tier];
  if (limit !== Infinity) {
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);
    const { count } = await supabase
      .from("generation_log")
      .select("*", { count: "exact", head: true })
      .eq("user_id", user.id)
      .gte("created_at", startOfMonth.toISOString());

    if ((count || 0) >= limit) {
      return NextResponse.json({ error: "Monthly generation limit reached." }, { status: 429 });
    }
  }

  // Load reference files
  const { data: answers } = await supabase
    .from("interview_answers")
    .select("file_type, enriched_content, answers")
    .eq("user_id", user.id);

  const refs: Record<string, string> = {};
  if (answers) {
    for (const row of answers) {
      refs[row.file_type] = row.enriched_content || JSON.stringify(row.answers);
    }
  }

  if (Object.keys(refs).length === 0) {
    return NextResponse.json({
      error: "Build at least one reference file before generating.",
    }, { status: 400 });
  }

  // Generate
  const { system, user: userPrompt } = getGenerationPrompt(outputType as OutputType, refs, options);

  try {
    const genAI = new GoogleGenerativeAI(googleKey);
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

    const result = await model.generateContent({
      contents: [{ role: "user", parts: [{ text: userPrompt }] }],
      systemInstruction: { role: "model", parts: [{ text: system }] },
    });

    const content = result.response.text();

    // Build title
    const typeLabels: Record<string, string> = {
      ad_copy: "Ad Copy",
      social_post: "Social Post",
      email_sequence: "Email Sequence",
      vsl_script: "VSL Script",
      landing_page: "Landing Page",
    };
    const title = typeLabels[outputType] + " — " + new Date().toLocaleDateString();

    // Save output
    await supabase.from("outputs").insert({
      user_id: user.id,
      output_type: outputType,
      title,
      prompt_config: options,
      content,
      reference_snapshot: refs,
    });

    // Log generation
    await supabase.from("generation_log").insert({
      user_id: user.id,
      output_type: outputType,
    });

    return NextResponse.json({ content, title });
  } catch (err: unknown) {
    console.error("Generation error:", err instanceof Error ? err.message : err);
    return NextResponse.json({ error: "Generation failed. Try again." }, { status: 500 });
  }
}
