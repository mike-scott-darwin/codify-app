import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase-server";
import { callLLM } from "@/lib/llm/provider";
import { getUserLLMConfig } from "@/lib/llm/user-config";
import { getScorePrompt } from "@/lib/score-prompt";
import { SCORE_WEIGHTS } from "@/lib/score-types";
import type { ScoreBreakdown } from "@/lib/score-types";

const DIMENSION_KEYS: (keyof Omit<ScoreBreakdown, "summary" | "improvements">)[] = [
  "hook_strength",
  "voice_alignment",
  "cta_clarity",
  "audience_match",
  "emotional_resonance",
];

export async function POST(request: NextRequest) {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Sign in to score content." }, { status: 401 });
  }

  let body: { outputId?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON." }, { status: 400 });
  }

  const { outputId } = body;
  if (!outputId) {
    return NextResponse.json({ error: "outputId is required." }, { status: 400 });
  }

  // Fetch output row and verify ownership
  const { data: output } = await supabase
    .from("outputs")
    .select("id, user_id, content, output_type, score, score_breakdown")
    .eq("id", outputId)
    .eq("user_id", user.id)
    .single();

  if (!output) {
    return NextResponse.json({ error: "Output not found." }, { status: 404 });
  }

  // Return cached score if it exists
  if (output.score !== null && output.score_breakdown !== null) {
    return NextResponse.json({ score: output.score, breakdown: output.score_breakdown });
  }

  // Load reference files
  const { data: answers } = await supabase
    .from("interview_answers")
    .select("file_type, enriched_content, answers")
    .eq("user_id", user.id);

  const refParts: string[] = [];
  if (answers) {
    for (const row of answers) {
      const content = row.enriched_content || JSON.stringify(row.answers);
      refParts.push(`[${row.file_type}]\n${content}`);
    }
  }
  const refContext = refParts.join("\n\n");

  // Build prompt and call LLM
  const { system, prompt } = getScorePrompt(output.output_type, output.content, refContext);

  try {
    const config = await getUserLLMConfig(user.id);
    const raw = await callLLM(config, system, prompt);

    // Parse JSON — handle potential markdown code fences
    const cleaned = raw.replace(/```json\s*/g, "").replace(/```\s*/g, "").trim();
    let breakdown: ScoreBreakdown;
    try {
      breakdown = JSON.parse(cleaned);
    } catch {
      return NextResponse.json({ error: "Failed to parse score response." }, { status: 500 });
    }

    // Validate dimensions are 0-100
    for (const key of DIMENSION_KEYS) {
      const val = breakdown[key];
      if (typeof val !== "number" || val < 0 || val > 100) {
        breakdown[key] = Math.max(0, Math.min(100, Math.round(Number(val) || 0)));
      }
    }

    // Calculate weighted overall score
    const weights = SCORE_WEIGHTS[output.output_type] || SCORE_WEIGHTS.ad_copy;
    let score = 0;
    for (const key of DIMENSION_KEYS) {
      score += breakdown[key] * (weights[key] || 0.2);
    }
    score = Math.round(score);

    // Update outputs row
    await supabase
      .from("outputs")
      .update({ score, score_breakdown: breakdown })
      .eq("id", outputId)
      .eq("user_id", user.id);

    return NextResponse.json({ score, breakdown });
  } catch (err: unknown) {
    console.error("Score error:", err instanceof Error ? err.message : err);
    return NextResponse.json({ error: "Scoring failed. Try again." }, { status: 500 });
  }
}
