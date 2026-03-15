import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { createServerSupabaseClient } from "@/lib/supabase-server";
import { getGenerationPrompt } from "@/lib/generation-prompts";
import { FEATURE_REQUIRED_TIER, TIER_HIERARCHY, getGenerationLimit } from "@/lib/tier";
import type { OutputType } from "@/lib/generation-types";
import type { Tier, Feature } from "@/lib/tier";

const VALID_TYPES: OutputType[] = ["ad_copy", "social_post", "email_sequence", "vsl_script", "landing_page"];

export async function POST(request: NextRequest) {
  const googleKey = process.env.GOOGLE_API_KEY;
  if (!googleKey) {
    return NextResponse.json({ error: "Generation not configured." }, { status: 503 });
  }

  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Sign in to generate content." }, { status: 401 });
  }

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

  // Get user tier
  const { data: profile } = await supabase
    .from("user_profiles")
    .select("tier")
    .eq("user_id", user.id)
    .single();

  const tier = (profile?.tier || "free") as Tier;

  // Check feature access (each output type has its own required tier)
  const feature = ("generate:" + outputType) as Feature;
  const requiredTier = FEATURE_REQUIRED_TIER[feature];
  if (TIER_HIERARCHY[tier] < TIER_HIERARCHY[requiredTier]) {
    return NextResponse.json({
      error: "Upgrade to " + requiredTier.toUpperCase() + " to generate " + outputType.replace("_", " ") + ".",
      requiredTier,
    }, { status: 403 });
  }

  // Per-type generation limit check
  const limit = getGenerationLimit(tier, outputType);
  if (limit !== Infinity) {
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);
    const { count } = await supabase
      .from("generation_log")
      .select("*", { count: "exact", head: true })
      .eq("user_id", user.id)
      .eq("output_type", outputType)
      .gte("created_at", startOfMonth.toISOString());

    if ((count || 0) >= limit) {
      return NextResponse.json({
        error: "Monthly limit reached for " + outputType.replace("_", " ") + " (" + limit + "/mo). Upgrade for more.",
      }, { status: 429 });
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

  const { system, user: userPrompt } = getGenerationPrompt(outputType as OutputType, refs, options);

  try {
    const genAI = new GoogleGenerativeAI(googleKey);
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

    const result = await model.generateContent({
      contents: [{ role: "user", parts: [{ text: userPrompt }] }],
      systemInstruction: { role: "model", parts: [{ text: system }] },
    });

    const content = result.response.text();

    const typeLabels: Record<string, string> = {
      ad_copy: "Ad Copy",
      social_post: "Social Post",
      email_sequence: "Email Sequence",
      vsl_script: "VSL Script",
      landing_page: "Landing Page",
    };
    const title = typeLabels[outputType] + " — " + new Date().toLocaleDateString();

    await supabase.from("outputs").insert({
      user_id: user.id,
      output_type: outputType,
      title,
      prompt_config: options,
      content,
      reference_snapshot: refs,
    });

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
