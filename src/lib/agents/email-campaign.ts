import { callGemini } from "./gemini";
import type { AgentContext, AgentResult } from "./types";

export async function runEmailCampaign(ctx: AgentContext): Promise<AgentResult> {
  const { refs, config, updateProgress } = ctx;
  const sequenceType = (config.sequenceType as string) || "welcome";
  const length = parseInt((config.length as string) || "5");

  const refBlock = Object.entries(refs)
    .map(([k, v]) => "=== " + k.toUpperCase() + " ===\n" + v)
    .join("\n\n");

  // Step 1: Plan the arc
  await updateProgress(1, 5, "Planning email sequence arc...");
  const arc = await callGemini(
    "You are an email marketing strategist. Plan a " + length + "-email " + sequenceType + " sequence arc. Define the emotional journey: what each email accomplishes, the shift from email to email, and where the conversion happens. Be specific to this business.",
    "Business context:\n" + refBlock + "\n\nPlan a " + sequenceType + " sequence with " + length + " emails. Define the arc."
  );

  // Step 2: Generate subject lines
  await updateProgress(2, 5, "Generating subject line variations...");
  const subjects = await callGemini(
    "Write 3 subject line options for each of the " + length + " emails. Mix styles: curiosity, benefit, urgency, personal. Keep under 50 characters. Match the brand voice.",
    "Business context:\n" + refBlock + "\n\nSequence arc:\n" + arc + "\n\nWrite 3 subject line options per email (" + length + " emails = " + (length * 3) + " subject lines total)."
  );

  // Step 3: Write emails 1-3
  await updateProgress(3, 5, "Writing emails 1-" + Math.min(3, length) + "...");
  const emails1 = await callGemini(
    "Write the first " + Math.min(3, length) + " emails. Match the brand voice. Each email needs: Subject (pick best from options), Preview text, Body (conversational, 150-300 words), CTA. Separate with === EMAIL [N] ===",
    "Business context:\n" + refBlock + "\n\nArc:\n" + arc + "\n\nSubject options:\n" + subjects + "\n\nWrite emails 1-" + Math.min(3, length) + "."
  );

  // Step 4: Write remaining emails
  let emails2 = "";
  if (length > 3) {
    await updateProgress(4, 5, "Writing emails 4-" + length + "...");
    emails2 = await callGemini(
      "Write emails " + 4 + "-" + length + ". Same format: Subject, Preview, Body, CTA. Continue the arc naturally. Separate with === EMAIL [N] ===",
      "Business context:\n" + refBlock + "\n\nArc:\n" + arc + "\n\nPrevious emails:\n" + emails1 + "\n\nWrite emails 4-" + length + "."
    );
  } else {
    await updateProgress(4, 5, "Skipping (sequence complete)...");
  }

  // Step 5: Timing + summary
  await updateProgress(5, 5, "Creating send schedule and summary...");
  const summary = await callGemini(
    "Create a send schedule for this " + length + "-email sequence. Include: Email # | Day to Send | Subject | Goal | Best Send Time. Also add 2-3 tips for maximizing open rates for this specific sequence type.",
    "Sequence type: " + sequenceType + "\n\nEmails:\n" + emails1 + "\n" + emails2
  );

  const content = [
    "# Email Campaign — " + sequenceType.charAt(0).toUpperCase() + sequenceType.slice(1) + " Sequence",
    "\n## Sequence Arc\n\n" + arc,
    "\n## Subject Line Options\n\n" + subjects,
    "\n## Emails\n\n" + emails1 + (emails2 ? "\n\n" + emails2 : ""),
    "\n## Send Schedule & Tips\n\n" + summary,
  ].join("\n\n---\n");

  return {
    title: "Email Campaign (" + sequenceType + ") — " + new Date().toLocaleDateString(),
    content,
  };
}
