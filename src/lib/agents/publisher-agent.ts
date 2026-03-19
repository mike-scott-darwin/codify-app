import { callGemini } from "./gemini";
import type { AgentContext, AgentResult } from "./types";

export async function runPublisher(ctx: AgentContext): Promise<AgentResult> {
  const { refs, config, userId, updateProgress } = ctx;
  const inputContent = (config.content as string) || "";

  const refBlock = Object.entries(refs)
    .map(([k, v]) => "=== " + k.toUpperCase() + " ===\n" + v)
    .join("\n\n");

  // Step 1: Format for each platform
  await updateProgress(1, 2, "Formatting content for each platform...");
  const formatted = await callGemini(
    "You are a content publishing specialist. Take the input content and format it for publishing on each major platform. For each post in the input, create:\n\n1. **Instagram** — Caption with line breaks, hashtags (5-10), emoji placement\n2. **LinkedIn** — Professional tone adjustment, proper formatting with line breaks for readability\n3. **X/Twitter** — Condensed to 280 chars with thread option if needed\n4. **Facebook** — Conversational adaptation with engagement prompt\n\nMaintain the original message and brand voice. Separate each platform version clearly.",
    "Brand context:\n" + refBlock + "\n\nContent to format:\n" + (inputContent || "No input content provided — format sample content based on reference files.") + "\n\nFormat for all platforms.",
    userId
  );

  // Step 2: Publishing checklist
  await updateProgress(2, 2, "Generating publishing schedule and checklist...");
  const checklist = await callGemini(
    "You are a content operations manager. Create a publishing checklist:\n1. Suggested posting order (which platform first)\n2. Optimal posting times (general best practices)\n3. Pre-publish checklist (links working, images needed, compliance check)\n4. Engagement plan (first 30 min after posting)\n\nKeep it actionable and brief.",
    "Formatted content:\n" + formatted + "\n\nCreate a publishing checklist and schedule.",
    userId
  );

  const content = [
    "# Publish-Ready Content",
    "\n## Platform-Formatted Content\n\n" + formatted,
    "\n## Publishing Checklist\n\n" + checklist,
  ].join("\n\n---\n");

  return {
    title: "Publisher Output — " + new Date().toLocaleDateString(),
    content,
    structured: { formatted, checklist },
  };
}
