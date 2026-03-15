import { callGemini } from "./gemini";
import type { AgentContext, AgentResult } from "./types";

export async function runDeepResearch(ctx: AgentContext): Promise<AgentResult> {
  const { refs, config, updateProgress } = ctx;
  const topic = (config.topic as string) || "general business strategy";
  const existingNotes = (config.existingNotes as string) || "";

  const refBlock = Object.entries(refs)
    .map(([k, v]) => "=== " + k.toUpperCase() + " ===\n" + v)
    .join("\n\n");

  // Step 1: Generate research questions
  await updateProgress(1, 5, "Generating research questions...");
  const questions = await callGemini(
    "You are a research strategist. Generate 5 research questions that explore the topic from different angles: market, customer, competition, opportunity, and risk. Be specific to this business.",
    "Business context:\n" + refBlock + "\n\nResearch topic: " + topic + "\n\nExisting notes:\n" + (existingNotes || "(none)")
  );

  // Step 2-3: Answer each question (two batches for depth)
  await updateProgress(2, 5, "Researching questions 1-3...");
  const answers1 = await callGemini(
    "You are a business research analyst. Answer each question with specific, actionable insights. Use concrete examples. Be thorough but concise.",
    "Business context:\n" + refBlock + "\n\nAnswer the first 3 questions in depth:\n" + questions
  );

  await updateProgress(3, 5, "Researching questions 4-5...");
  const answers2 = await callGemini(
    "You are a business research analyst. Answer each question with specific, actionable insights. Use concrete examples.",
    "Business context:\n" + refBlock + "\n\nAnswer questions 4-5 in depth:\n" + questions
  );

  // Step 4: Synthesize
  await updateProgress(4, 5, "Synthesizing findings...");
  const synthesis = await callGemini(
    "Synthesize these research findings into a clear summary. Identify the 3 most important insights and explain why they matter for this specific business.",
    "Topic: " + topic + "\n\nFindings:\n" + answers1 + "\n\n" + answers2
  );

  // Step 5: Recommendations
  await updateProgress(5, 5, "Generating recommendations...");
  const recommendations = await callGemini(
    "Based on this research, give exactly 3 actionable recommendations. Each should have: what to do, why it matters, and the first concrete step to take.",
    "Business context:\n" + refBlock + "\n\nResearch synthesis:\n" + synthesis
  );

  const content = [
    "# Deep Research: " + topic,
    "\n## Research Questions\n\n" + questions,
    "\n## Findings\n\n" + answers1 + "\n\n" + answers2,
    "\n## Synthesis\n\n" + synthesis,
    "\n## Recommendations\n\n" + recommendations,
  ].join("\n\n---\n");

  return {
    title: "Deep Research: " + topic + " — " + new Date().toLocaleDateString(),
    content,
  };
}
