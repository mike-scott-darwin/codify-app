import { callGemini } from "./gemini";
import type { AgentContext, AgentResult } from "./types";

export async function runSocialPostGenerator(ctx: AgentContext): Promise<AgentResult> {
  const { refs, config, userId, updateProgress } = ctx;
  const inputContext = (config.research_findings as string) || (config.trends as string) || (config.topic as string) || "";

  const refBlock = Object.entries(refs)
    .map(([k, v]) => "=== " + k.toUpperCase() + " ===\n" + v)
    .join("\n\n");

  const voiceRef = refs.voice || "(no voice file — use a professional but approachable tone)";

  // Step 1: Identify angles from input
  await updateProgress(1, 3, "Analyzing input for content angles...");
  const angles = await callGemini(
    "You are a social media strategist. Based on the input context and business reference, identify 5 unique content angles. Each angle should target a different emotion or hook type (curiosity, authority, vulnerability, contrarian, educational). Be specific to this brand.",
    "Business context:\n" + refBlock + "\n\nInput context:\n" + (inputContext || "No specific input — generate from reference files.") + "\n\nIdentify 5 content angles.",
    userId
  );

  // Step 2: Generate posts
  await updateProgress(2, 3, "Generating 5 social media posts...");
  const posts = await callGemini(
    "You are a social media copywriter. Write exactly 5 social media posts, one for each angle. Match this brand voice EXACTLY:\n\n" + voiceRef + "\n\nEach post should:\n- Have a scroll-stopping opening line\n- Be 50-150 words\n- Include a clear call-to-action\n- Be platform-adaptable (works on Instagram, LinkedIn, X)\n- Separate each post with ---\n\nNumber each post 1-5.",
    "Business context:\n" + refBlock + "\n\nAngles:\n" + angles + "\n\nWrite 5 posts, one per angle.",
    userId
  );

  // Step 3: Platform optimization notes
  await updateProgress(3, 3, "Adding platform-specific optimization notes...");
  const optimization = await callGemini(
    "You are a social media optimization expert. For each of the 5 posts, provide brief platform-specific notes:\n- Instagram: hashtag suggestions (5 max), best format (carousel, single, reel script)\n- LinkedIn: any tone adjustments needed\n- X/Twitter: condensed version if over 280 chars\n\nKeep notes concise — bullet points only.",
    "Posts:\n" + posts + "\n\nProvide platform optimization notes for each.",
    userId
  );

  const content = [
    "# Social Posts",
    "\n## Content Angles\n\n" + angles,
    "\n## Posts\n\n" + posts,
    "\n## Platform Notes\n\n" + optimization,
  ].join("\n\n---\n");

  return {
    title: "Social Posts — " + new Date().toLocaleDateString(),
    content,
    structured: { angles, posts, optimization },
  };
}
