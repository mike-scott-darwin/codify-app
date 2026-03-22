import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase-server";
import { getUserLLMConfig } from "@/lib/llm/user-config";
import { callLLM } from "@/lib/llm/provider";

const SKILL_PROMPTS: Record<string, string> = {
  "/think": "You are a strategic thinking partner. Help the user explore a topic, consider angles, and arrive at a decision. Ask clarifying questions. Push for specificity. When they're ready, summarize the decision and suggest which reference files to update.",
  "/extract": `You are a business knowledge extractor. Your job is to interview the user and build their reference files.

The user wants to build or strengthen one of their core reference files: soul, offer, audience, or voice.

If they just typed "/extract" without specifying which file, ask them which one they want to work on.

For each file type, ask deep, specific questions one at a time. Don't rush. Each question should push for specificity:

SOUL: Origin story, core beliefs, what they stand against, principles they won't compromise on, what they've learned the hard way
OFFER: What they sell, the transformation, pricing, who it's for, why it works, what makes it different
AUDIENCE: Who they serve, their real problems, what they've tried, how they talk about their pain, what they actually want
VOICE: How they speak, phrases they use, what they'd never say, their personality in writing, examples of their best communication

After each answer, rate the depth (1-10) and either push deeper or move to the next question. When you have enough substance (at least 5 deep answers), generate the complete reference file in markdown and tell them you'll save it.

IMPORTANT: Rate every answer. Be honest. Push for specifics — names, numbers, stories, examples. Generic answers get low scores.`,
  "/scout": `You are an Opportunity Scout. Analyze the user's reference files and identify 5 content/business opportunities they're uniquely positioned for.

For each opportunity:
1. Title — specific, actionable
2. Why them — what in their reference files makes this a fit
3. Format — what type of content or action
4. Relevance score (1-100)

Be specific to THEIR expertise. Don't suggest generic things anyone could do.`,
  "/ads": "You are an ad copy specialist. Create compelling ad copy (headlines, hooks, body copy) using the user's reference files. Ask what platform, format, and angle they want. Produce multiple variations.",
  "/organic": "You are an organic content strategist. Create platform-ready posts using the user's reference files. Match their voice.",
  "/vsl": "You are a VSL scriptwriter. Write camera-ready scripts optimized for spoken delivery.",
  "/email": "You are an email marketing expert. Draft email sequences matching the user's voice. Include subject lines and body copy.",
  "/audit": "You are a congruence auditor. Check alignment across reference files. Flag contradictions and gaps. Be specific.",
  "/brainstorm": "You are a creative brainstorming partner. Generate angles, hooks, and ideas based on the user's reference files. Be bold and specific.",
  "/newsletter": "You are a newsletter writer. Match the user's voice. Write like a smart friend, not a marketer.",
  "/refine": "You are an editor. Take content the user provides and improve it — tighten, strengthen, ensure it matches their voice.",
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
      return NextResponse.json({ response: "No reference files yet. Type /extract to build your first one." });
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
    const corePresent = ["soul", "offer", "audience", "voice"].filter(f => refs[f]).length;
    const strength = corePresent >= 4 && totalWords > 1000 ? "Strong" : corePresent >= 2 ? "Building" : "Getting started";
    const missing = ["soul", "offer", "audience", "voice"].filter(f => !refs[f]);
    let response = "Business Brain:\n\n  Core files: " + corePresent + "/4\n  Total files: " + fileCount + "\n  Total words: " + totalWords + "\n  Strength: " + strength;
    if (missing.length > 0) {
      response += "\n\n  Missing: " + missing.join(", ") + "\n  Type /extract " + missing[0] + " to start.";
    }
    return NextResponse.json({ response });
  }

  // Get LLM config
  const config = await getUserLLMConfig(user.id);

  // Build system prompt
  let systemPrompt = SKILL_PROMPTS[cmd] || "You are a helpful business assistant. Use the user's reference files to give specific, actionable answers. Match their voice and tone.";

  if (Object.keys(refs).length > 0) {
    systemPrompt += "\n\nUser's reference files:\n" + refBlock;
  } else {
    systemPrompt += "\n\nNo reference files yet. If they're asking for content or analysis, suggest they type /extract first to build their business brain.";
  }

  const userPrompt = args || command.replace(cmd, "").trim() || command;

  try {
    const response = await callLLM(config, systemPrompt, userPrompt);
    return NextResponse.json({ response });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Failed to process command.";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
