import { callGemini } from "./gemini";
import type { AgentContext, AgentResult } from "./types";

export async function runContentCalendar(ctx: AgentContext): Promise<AgentResult> {
  const { refs, config, updateProgress } = ctx;
  const platform = (config.platform as string) || "Instagram";

  const refBlock = Object.entries(refs)
    .map(([k, v]) => "=== " + k.toUpperCase() + " ===\n" + v)
    .join("\n\n");

  // Step 1: Identify pillars
  await updateProgress(1, 5, "Identifying content pillars...");
  const pillars = await callGemini(
    "You are a content strategist. Identify 5 content pillars based on this business's audience pain points, offer, and expertise. Each pillar should be a theme they can post about repeatedly. Format: numbered list with pillar name and one-sentence description.",
    "Business context:\n" + refBlock
  );

  // Step 2: Assign to days
  await updateProgress(2, 5, "Planning weekly schedule...");
  const schedule = await callGemini(
    "Assign each content pillar to a day of the week (Mon-Fri). Consider audience engagement patterns for " + platform + ". Include the best time to post for each day. Format: Day | Pillar | Best Time | Why This Day",
    "Platform: " + platform + "\n\nPillars:\n" + pillars
  );

  // Step 3: Generate Mon-Wed posts
  await updateProgress(3, 5, "Writing posts for Mon-Wed...");
  const posts1 = await callGemini(
    "Write 3 " + platform + " posts (Monday, Tuesday, Wednesday). Match the brand voice exactly. Each post should: hook in the first line, deliver value, end with engagement prompt or CTA. Include hashtags if relevant for the platform.",
    "Business context:\n" + refBlock + "\n\nSchedule:\n" + schedule + "\n\nWrite the posts for Monday, Tuesday, and Wednesday. Label each with the day and pillar."
  );

  // Step 4: Generate Thu-Fri posts
  await updateProgress(4, 5, "Writing posts for Thu-Fri...");
  const posts2 = await callGemini(
    "Write 2 " + platform + " posts (Thursday, Friday). Match the brand voice exactly. Each post should: hook in the first line, deliver value, end with engagement prompt or CTA.",
    "Business context:\n" + refBlock + "\n\nSchedule:\n" + schedule + "\n\nWrite the posts for Thursday and Friday. Label each with the day and pillar."
  );

  // Step 5: Summary
  await updateProgress(5, 5, "Creating calendar summary...");
  const summary = await callGemini(
    "Create a clean weekly content calendar summary table. Include: Day | Pillar | Post Hook (first line) | Format | Best Time. Keep it scannable.",
    "Schedule:\n" + schedule + "\n\nPosts:\n" + posts1 + "\n\n" + posts2
  );

  const content = [
    "# Content Calendar — " + platform + " (This Week)",
    "\n## Content Pillars\n\n" + pillars,
    "\n## Weekly Schedule\n\n" + schedule,
    "\n## Posts: Monday - Wednesday\n\n" + posts1,
    "\n## Posts: Thursday - Friday\n\n" + posts2,
    "\n## Calendar Summary\n\n" + summary,
  ].join("\n\n---\n");

  return {
    title: "Content Calendar (" + platform + ") — " + new Date().toLocaleDateString(),
    content,
  };
}
