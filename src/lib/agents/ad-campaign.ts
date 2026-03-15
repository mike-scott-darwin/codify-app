import { callGemini } from "./gemini";
import type { AgentContext, AgentResult } from "./types";

export async function runAdCampaign(ctx: AgentContext): Promise<AgentResult> {
  const { refs, config, updateProgress } = ctx;
  const platform = (config.platform as string) || "Facebook";

  const refBlock = Object.entries(refs)
    .map(([k, v]) => "=== " + k.toUpperCase() + " ===\n" + v)
    .join("\n\n");

  // Step 1: Pick angles
  await updateProgress(1, 5, "Analyzing reference files for angles...");
  const angles = await callGemini(
    "You are an ad strategist. Analyze the business context and identify the 3 strongest ad angles. Output exactly 3 angles, each with a label and one-sentence rationale. Format: 1. ANGLE_NAME: rationale",
    "Business context:\n" + refBlock
  );

  // Step 2: Generate hooks
  await updateProgress(2, 5, "Generating 9 hooks across 3 angles...");
  const hooks = await callGemini(
    "You write scroll-stopping ad hooks for " + platform + ". Match the brand voice exactly. Be specific, not generic. Output exactly 9 hooks numbered 1-9.",
    "Business context:\n" + refBlock + "\n\nAngles:\n" + angles + "\n\nWrite 3 hooks per angle (9 total). Each hook should be 1-2 sentences that stop the scroll."
  );

  // Step 3: Write full ads for top 5
  await updateProgress(3, 5, "Writing full ad copy for top 5 hooks...");
  const fullAds = await callGemini(
    "You write high-converting " + platform + " ads. Match the brand voice. Each ad needs: Hook, Body (2-3 short paragraphs), CTA. Separate ads with ---",
    "Business context:\n" + refBlock + "\n\nHooks generated:\n" + hooks + "\n\nPick the 5 strongest hooks and write a complete ad for each. Include the hook as the opening line."
  );

  // Step 4: Compliance check
  await updateProgress(4, 5, "Running compliance check...");
  const compliance = await callGemini(
    "You are an ad compliance reviewer. Check each ad for: income claims, guarantee language, before/after promises, misleading claims. Flag issues with specific fixes. If an ad is clean, say PASS.",
    "Review these " + platform + " ads for compliance issues:\n\n" + fullAds
  );

  // Step 5: Rank
  await updateProgress(5, 5, "Ranking ads by predicted performance...");
  const ranking = await callGemini(
    "You are a media buyer. Rank these 5 ads from strongest to weakest based on: hook strength, emotional resonance, clarity of CTA, and platform fit for " + platform + ". Give a brief reason for each ranking.",
    "Ads:\n" + fullAds + "\n\nCompliance notes:\n" + compliance
  );

  const content = [
    "# Ad Campaign — " + platform,
    "\n## Angles\n\n" + angles,
    "\n## All Hooks\n\n" + hooks,
    "\n## Full Ads\n\n" + fullAds,
    "\n## Compliance Review\n\n" + compliance,
    "\n## Ranking\n\n" + ranking,
  ].join("\n\n---\n");

  return {
    title: "Ad Campaign (" + platform + ") — " + new Date().toLocaleDateString(),
    content,
  };
}
