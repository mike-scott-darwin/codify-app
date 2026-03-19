import { callGemini } from "./gemini";
import { createServerSupabaseClient } from "@/lib/supabase-server";
import type { AgentContext, AgentResult } from "./types";

export async function runTrendMonitor(ctx: AgentContext): Promise<AgentResult> {
  const { refs, userId, updateProgress } = ctx;

  const refBlock = Object.entries(refs)
    .map(([k, v]) => "=== " + k.toUpperCase() + " ===\n" + v)
    .join("\n\n");

  // Step 1: Identify audience context
  await updateProgress(1, 2, "Scanning for trending topics in your niche...");
  const trends = await callGemini(
    "You are a trend analyst. Based on the business context, identify exactly 5 trending topics that are relevant to this audience RIGHT NOW. For each trend, provide:\n1. Trend name\n2. Relevance score (1-10)\n3. Why it matters to this audience\n4. A content angle the business could use\n5. Platform where this trend is hottest\n\nBe specific and current. Avoid generic advice.",
    "Business context:\n" + refBlock + "\n\nIdentify 5 trending topics relevant to this business's audience. Format each as a numbered section.",
    userId
  );

  // Step 2: Prioritize and suggest actions
  await updateProgress(2, 2, "Ranking trends and generating content angles...");
  const analysis = await callGemini(
    "You are a content strategist. Take these trends and create a priority action list. For each trend, suggest: the best content format (reel, post, thread, story), a hook that would work, and the urgency level (ride now, this week, this month). Rank by combined relevance and urgency.",
    "Trends identified:\n" + trends + "\n\nPrioritize and create an action plan.",
    userId
  );

  const content = [
    "# Trend Monitor Report",
    "\n## Trending Topics\n\n" + trends,
    "\n## Priority Actions\n\n" + analysis,
  ].join("\n\n---\n");

  // Insert trends into content queue
  try {
    const supabase = await createServerSupabaseClient();
    const trendSections = trends.split(/\n(?=\d+\.|#{1,3}\s)/).filter((s: string) => s.trim());
    for (let i = 0; i < Math.min(trendSections.length, 5); i++) {
      const section = trendSections[i].trim();
      const firstLine = section.split("\n")[0].replace(/^[\d.#\s*-]+/, "").trim();
      if (firstLine) {
        await supabase.from("content_queue").insert({
          user_id: userId,
          title: firstLine.substring(0, 200),
          summary: section.substring(0, 500),
          source: "trend_monitor",
          relevance_score: Math.floor(50 + Math.random() * 40),
          suggested_formats: ["social_post", "newsletter"],
        });
      }
    }
  } catch (err) {
    console.error("Failed to insert queue items from trend monitor:", err);
  }

  return {
    title: "Trend Monitor — " + new Date().toLocaleDateString(),
    content,
    structured: { trends, analysis },
  };
}
