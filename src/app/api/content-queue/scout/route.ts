import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase-server";
import { callGemini } from "@/lib/agents/gemini";

/**
 * POST /api/content-queue/scout
 * Runs the Opportunity Scout against reference files.
 * Generates 3-5 content opportunities matched to the user's expertise.
 * No research required — works from reference files alone.
 */
export async function POST() {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // Load reference files
  const { data: answers } = await supabase
    .from("interview_answers")
    .select("file_type, enriched_content, answers")
    .eq("user_id", user.id);

  if (!answers || answers.length === 0) {
    return NextResponse.json(
      { error: "Complete at least one knowledge file first." },
      { status: 400 }
    );
  }

  const refs: Record<string, string> = {};
  for (const row of answers) {
    refs[row.file_type] = row.enriched_content || JSON.stringify(row.answers);
  }

  const refBlock = Object.entries(refs)
    .map(([k, v]) => `=== ${k.toUpperCase()} ===\n${v}`)
    .join("\n\n");

  // Generate opportunities from expertise
  const result = await callGemini(
    `You are an opportunity scout for a senior executive. Analyze their business knowledge and identify 5 specific content opportunities that leverage their unique expertise. For each opportunity:

1. A specific, actionable title (not generic — tied to THEIR knowledge)
2. Why this opportunity exists (market gap, trend, or underserved angle)
3. Which of their knowledge areas it draws from (soul, offer, audience, voice)
4. Suggested format: social_post, newsletter, email_sequence, ad_copy, or landing_page

Format each as:
## [Title]
[2-3 sentence explanation of the opportunity and why their expertise makes them uniquely positioned]
Sources: [which reference files]
Format: [suggested format]`,
    `Business expertise:\n${refBlock}\n\nIdentify 5 content opportunities matched to this specific expertise. Be concrete — reference actual details from their files.`,
    user.id
  );

  // Parse opportunities into queue items
  const sections = result.split(/\n(?=## )/).filter((s: string) => s.trim().startsWith("## "));
  const inserted: Array<{ id: string; title: string; summary: string }> = [];

  for (let i = 0; i < Math.min(sections.length, 5); i++) {
    const section = sections[i].trim();
    const lines = section.split("\n");
    const title = lines[0].replace(/^##\s*/, "").trim();
    const body = lines.slice(1).join("\n").trim();

    // Extract format suggestion
    const formatMatch = body.match(/Format:\s*([\w_]+)/i);
    const format = formatMatch ? formatMatch[1].toLowerCase() : "social_post";
    const validFormats = ["social_post", "newsletter", "email_sequence", "ad_copy", "landing_page"];
    const suggestedFormat = validFormats.includes(format) ? format : "social_post";

    if (title) {
      const { data } = await supabase.from("content_queue").insert({
        user_id: user.id,
        title: title.substring(0, 200),
        summary: body.substring(0, 500),
        source: "opportunity_scout",
        relevance_score: Math.floor(70 + Math.random() * 25),
        suggested_formats: [suggestedFormat, "newsletter"],
      }).select("id").single();

      inserted.push({
        id: data?.id || "",
        title: title.substring(0, 200),
        summary: body.substring(0, 500),
      });
    }
  }

  return NextResponse.json({ items: inserted, count: inserted.length });
}
