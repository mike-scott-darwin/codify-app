import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase-server";
import { getUserLLMConfig } from "@/lib/llm/user-config";
import { callLLM } from "@/lib/llm/provider";

const SKILL_PROMPTS: Record<string, string> = {
  "/think": "You are a strategic thinking partner. Help the user explore a topic, consider angles, and arrive at a decision. Ask clarifying questions. Push for specificity. When they're ready, summarize the decision and suggest which reference files to update.",
  "/ads": "You are an ad copy specialist. Create compelling ad copy (headlines, hooks, body copy) using the user's reference files. Ask what platform, format, and angle they want. Produce multiple variations. Flag any compliance concerns.",
  "/organic": "You are an organic content strategist. Create scripts for Reels, TikTok, carousels, or static posts. Match the user's voice. Ask about platform and format. Produce ready-to-post content.",
  "/vsl": "You are a VSL (Video Sales Letter) scriptwriter. Write camera-ready scripts optimized for spoken delivery. Use the 18-section framework for community offers or the 7-step Haynes framework for B2B. Never invent facts.",
  "/email": "You are an email marketing expert. Draft email sequences (welcome, nurture, launch, re-engagement). Match the user's voice. Include subject lines, preview text, and body copy. Suggest send timing.",
  "/audit": "You are a congruence auditor. Analyze the user's reference files for alignment: soul-offer, audience-voice, offer-audience. Flag contradictions, gaps, and missed opportunities. Be specific with fix recommendations.",
  "/brainstorm": "You are a creative brainstorming partner. Generate angles, hooks, content ideas, or campaign concepts based on the user's reference files. Produce quantity first, then help narrow down. Be bold and specific.",
  "/refine": "You are an editor and content refiner. Take a piece of content the user provides and improve it \u2014 tighten the writing, strengthen the hook, improve flow, ensure it matches their voice. Show before/after.",
  "/files": "SYSTEM_FILES",
  "/score": "SYSTEM_SCORE",
};

export async function POST(request: NextRequest) {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Sign in required." }, { status: 401 });

  const { command } = await request.json();
  if (!command) return NextResponse.json({ error: "No command provided." }, { status: 400 });

  // Load reference files
  const { data: answers } = await supabase
    .from("interview_answers")
    .select("file_type, enriched_content, answers")
    .eq("user_id", user.id);

  const refs: Record<string, string> = {};
  if (answers) {
    for (const row of answers) {
      refs[row.file_type] = row.enriched_content || JSON.stringify(row.answers || {});
    }
  }

  const refBlock = Object.entries(refs)
    .map(([k, v]) => "=== " + k.toUpperCase() + " ===\n" + v)
    .join("\n\n");

  // Parse command
  const parts = command.trim().split(/\s+/);
  const cmd = parts[0].toLowerCase();
  const args = parts.slice(1).join(" ");

  // Handle /files
  if (cmd === "/files") {
    if (Object.keys(refs).length === 0) {
      return NextResponse.json({ response: "No reference files found. Go to Build to create your first file." });
    }
    const summary = Object.entries(refs)
      .map(([k, v]) => {
        const words = v.split(/\s+/).length;
        return "  " + k.padEnd(12) + words + " words";
      })
      .join("\n");
    return NextResponse.json({ response: "Reference files:\n\n" + summary });
  }

  // Handle /score
  if (cmd === "/score") {
    const fileCount = Object.keys(refs).length;
    const totalWords = Object.values(refs).reduce((sum, v) => sum + v.split(/\s+/).length, 0);
    const strength = fileCount >= 4 && totalWords > 1000 ? "Strong" : fileCount >= 2 ? "Building" : "Getting started";
    return NextResponse.json({
      response: "Context Power Score:\n\n  Files: " + fileCount + "/4\n  Total words: " + totalWords + "\n  Strength: " + strength + "\n\nGo to Build to strengthen your files.",
    });
  }

  // Get LLM config
  const config = await getUserLLMConfig(user.id);

  // Build system prompt
  let systemPrompt = SKILL_PROMPTS[cmd] || "You are a helpful business assistant. Use the user's reference files to give specific, actionable answers. Match their voice and tone.";

  systemPrompt += "\n\nUser's reference files:\n" + (refBlock || "No reference files yet \u2014 suggest they build them first.");

  // Build user prompt
  const userPrompt = args || command.replace(cmd, "").trim() || command;

  try {
    const response = await callLLM(config, systemPrompt, userPrompt);
    return NextResponse.json({ response });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Failed to process command.";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
