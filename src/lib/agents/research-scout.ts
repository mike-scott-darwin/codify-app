import { callGemini } from "./gemini";
import type { AgentContext, AgentResult } from "./types";

export async function runResearchScout(ctx: AgentContext): Promise<AgentResult> {
  const { refs, config, userId, updateProgress } = ctx;
  const niche = (config.niche as string) || "";

  const refBlock = Object.entries(refs)
    .map(([k, v]) => "=== " + k.toUpperCase() + " ===\n" + v)
    .join("\n\n");

  // Step 1: Identify niche and research areas
  await updateProgress(1, 3, "Analyzing business context for research areas...");
  const areas = await callGemini(
    "You are a research strategist. Analyze the business context and identify the top 5 research areas that would provide the most value. For each area, explain why it matters to this specific business. Be specific, not generic.",
    "Business context:\n" + refBlock + (niche ? "\n\nAdditional niche focus: " + niche : "") + "\n\nIdentify 5 high-value research areas with rationale for each.",
    userId
  );

  // Step 2: Deep-dive research brief
  await updateProgress(2, 3, "Generating research briefs with relevance scores...");
  const briefs = await callGemini(
    "You are a trend researcher. For each research area, provide: a brief summary of current trends, 3 specific data points or insights, a relevance score (1-10) based on how actionable this is for the business, and one content angle that could be derived from it. Format each as a clear section with headers.",
    "Business context:\n" + refBlock + "\n\nResearch areas:\n" + areas + "\n\nProvide detailed research briefs for each area.",
    userId
  );

  // Step 3: Synthesize findings
  await updateProgress(3, 3, "Synthesizing findings and ranking by relevance...");
  const synthesis = await callGemini(
    "You are a strategic advisor. Rank the research findings by relevance score, identify the single most actionable insight, and suggest the immediate next step the business should take. Be concise and action-oriented.",
    "Research briefs:\n" + briefs + "\n\nRank findings, identify the #1 insight, and recommend next steps.",
    userId
  );

  const content = [
    "# Research Scout Report",
    "\n## Research Areas\n\n" + areas,
    "\n## Detailed Findings\n\n" + briefs,
    "\n## Synthesis & Recommendations\n\n" + synthesis,
  ].join("\n\n---\n");

  return {
    title: "Research Scout — " + new Date().toLocaleDateString(),
    content,
    structured: { areas, briefs, synthesis },
  };
}
