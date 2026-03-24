import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase-server";
import { getUserLLMConfig } from "@/lib/llm/user-config";
import { callLLM } from "@/lib/llm/provider";
import { hasAccessWithMode } from "@/lib/tier";
import type { Tier, Feature } from "@/lib/tier";

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
  "/seo": `You are an SEO content analyst working for a business owner. You have their reference files for context.

Your job: Score any content the user provides for search visibility and discoverability. Analyze:
- Keyword density and relevance
- Title/headline optimization
- Meta description potential
- Internal linking opportunities
- Search intent alignment
- Readability score

Provide a 1-100 SEO score with specific, actionable improvements. Reference their audience file to ensure keywords match what their buyers actually search for. Be direct — no fluff, just scores and fixes.`,
  "/blog": `You are a blog writer who produces publish-ready posts. You have the user's reference files — their voice, audience, offer, and soul.

Your job: Write a complete blog post that sounds like them, not like AI. Follow this structure:
1. Hook — open with a specific observation or contrarian take (from their voice)
2. Problem — name the pain their audience feels (from audience file)
3. Mechanism — explain the insight or framework (from their domain knowledge)
4. Proof — reference real examples, numbers, or case studies (from proof files)
5. CTA — close with next step tied to their offer

Target 800-1200 words. Use short paragraphs. No corporate speak. Write like a practitioner sharing what they've learned, not a marketer selling something. Ask the user for the topic if they don't provide one.`,
  "/voice": `You are a transcription analyst. The user will paste a transcript, meeting notes, or voice memo text.

Your job: Extract structured business knowledge from unstructured speech. Identify:
- Core beliefs and principles (→ soul.md)
- Audience insights and language (→ audience.md)
- Offer details and positioning (→ offer.md)
- Voice patterns, phrases, and tone (→ voice.md)
- Stories and proof points (→ case studies)

Format your output as suggested updates to specific reference files. Use their exact words and phrases — don't paraphrase into corporate speak. Flag contradictions with existing reference files if you spot them.`,
  "/proposal": `You are a proposal writer for high-value professional services. You have the user's reference files — their expertise, offer, audience, and voice.

Your job: Generate a professional client proposal. Ask the user for:
- Client name and company
- The specific problem or opportunity
- Budget range (if known)
- Timeline

Then produce a proposal with:
1. Executive Summary — the client's situation in their language
2. Diagnosis — what's actually going on (demonstrate expertise)
3. Recommended Approach — phases, deliverables, timeline
4. Investment — pricing with clear scope
5. About — credibility drawn from reference files
6. Next Steps — clear CTA

Write in the user's voice. No templates or filler. Every proposal should feel custom because it IS custom — it's built from their codified knowledge.`,
  "/report": `You are a context health analyst. You have access to all of the user's reference files.

Your job: Produce a monthly context health report analyzing their business brain. Cover:

1. **Completeness Score** (0-100) — How filled out are the reference files? Flag empty sections or thin areas.
2. **Freshness** — When were files last updated? Flag anything that might be stale.
3. **Consistency** — Do the files contradict each other? Does the voice match the audience? Does the offer align with the soul?
4. **Depth** — Where is the knowledge surface-level vs. deep? What needs more extraction?
5. **Opportunities** — Based on what's in their brain, what content/offers/angles are they missing?
6. **Recommended Actions** — Top 3 things to do this month to strengthen their context.

Be specific and actionable. Reference exact sections of their files. This report should make them smarter about their own business.`,
  "/repurpose": `You are a content repurposing specialist. You have the user's reference files for voice and audience context.

Your job: Take one piece of content the user provides and produce 5 format variations:

1. **LinkedIn Post** — Professional, insight-led, 150-200 words, hook + insight + CTA
2. **X Thread** — 5-7 tweets, punchy, each tweet stands alone, thread builds an argument
3. **Email Newsletter Section** — 200-300 words, conversational, drives to CTA
4. **Ad Hook** — 3 variations of a scroll-stopping opening line for paid social
5. **Blog Excerpt** — 300-400 words, SEO-friendly, expandable into full post

Maintain their voice across all formats. Each format should feel native to its platform — not just the same text copy-pasted. Ask the user for the source content if they don't provide it.`,
};

const COMMAND_TO_FEATURE: Record<string, Feature> = {
  "/extract": "extract",
  "/files": "files",
  "/score": "score",
  "/help": "help",
  "/think": "think",
  "/audit": "audit",
  "/refine": "refine",
  "/voice": "voice",
  "/ads": "ads",
  "/organic": "organic",
  "/email": "email",
  "/newsletter": "newsletter",
  "/brainstorm": "brainstorm",
  "/seo": "seo",
  "/blog": "blog",
  "/repurpose": "repurpose",
  "/scout": "scout",
  "/vsl": "vsl",
  "/proposal": "proposal",
  "/report": "report",
};

const UPGRADE_RESPONSE = `## Plans

**Free** — $0
  /extract, /files, /score, /help

**Build** — $99/mo
  + /think, /audit, /refine, /voice

**Pro** — $199/mo
  + /ads, /organic, /email, /newsletter, /brainstorm, /seo, /blog, /repurpose

**VIP** — $497/mo
  + /scout, /vsl, /proposal, /report, scheduled automation

Visit codify.build/settings to upgrade your plan.`;

export async function POST(request: NextRequest) {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Sign in required." }, { status: 401 });

  const { command } = await request.json();
  if (!command) return NextResponse.json({ error: "No command provided." }, { status: 400 });

  // Parse command
  const parts = command.trim().split(/\s+/);
  const cmd = parts[0].toLowerCase();
  const args = parts.slice(1).join(" ");

  // Handle /upgrade
  if (cmd === "/upgrade") {
    return NextResponse.json({ response: UPGRADE_RESPONSE });
  }

  // Fetch user profile for tier gating
  const { data: profile } = await supabase
    .from("user_profiles")
    .select("tier, mode")
    .eq("user_id", user.id)
    .single();

  const userTier: Tier = (profile?.tier as Tier) || "free";
  const userMode: "diy" | "dfy" = (profile?.mode as "diy" | "dfy") || "diy";

  // Tier gating — check access before executing any skill
  const feature = COMMAND_TO_FEATURE[cmd];
  if (feature && !hasAccessWithMode(userTier, feature, userMode)) {
    const requiredTier = cmd === "/scout" || cmd === "/vsl" || cmd === "/proposal" || cmd === "/report"
      ? "VIP"
      : cmd === "/ads" || cmd === "/organic" || cmd === "/email" || cmd === "/newsletter" || cmd === "/brainstorm" || cmd === "/seo" || cmd === "/blog" || cmd === "/repurpose"
        ? "PRO"
        : "BUILD";
    return NextResponse.json({
      response: `This skill requires the ${requiredTier} tier. Type /upgrade to see plans.`,
    });
  }

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
