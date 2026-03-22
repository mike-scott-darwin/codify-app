import { callGemini } from "./gemini";
import type { AgentContext, AgentResult } from "./types";
import { CORE_FILE_KEYS } from "@/lib/types";

export async function runAuditAgent(ctx: AgentContext): Promise<AgentResult> {
  const { refs, userId, updateProgress } = ctx;

  const coreFiles = [...CORE_FILE_KEYS];
  const present = coreFiles.filter((f) => refs[f] && refs[f].trim().length > 0);
  const missing = coreFiles.filter((f) => !refs[f] || refs[f].trim().length === 0);

  const refBlock = Object.entries(refs)
    .map(([k, v]) => "=== " + k.toUpperCase() + " ===\n" + v)
    .join("\n\n");

  // Step 1: Completeness check
  await updateProgress(1, 4, "Checking reference file completeness...");
  const completeness = await callGemini(
    "You are a reference file auditor. Check each file for completeness. A complete file should have: clear thesis, specific details (not vague), actionable information. Score each file 1-10 and explain what's missing.",
    "Files present: " + present.join(", ") + "\nFiles missing: " + (missing.length ? missing.join(", ") : "none") + "\n\nFile contents:\n" + refBlock + "\n\nScore each file's completeness (1-10) and list what's missing.",
    userId
  );

  // Step 2: Staleness detection
  await updateProgress(2, 4, "Detecting stale or outdated content...");
  const staleness = await callGemini(
    "You are a content freshness auditor. Review each reference file for signs of staleness: outdated language, references to past events as current, generic statements that suggest they haven't been refined, placeholder-like content. Flag anything that feels like it was written once and never updated.",
    "File contents:\n" + refBlock + "\n\nIdentify stale or outdated content in each file. For each issue, suggest an update.",
    userId
  );

  // Step 3: Cross-file consistency
  await updateProgress(3, 4, "Checking cross-file consistency...");
  const consistency = await callGemini(
    "You are a business strategist checking for contradictions across reference files. Look for: tone mismatches between voice and other files, audience description that doesn't match the offer, soul mission that conflicts with what's being sold, pricing or positioning inconsistencies. Quote specific contradictions.",
    "File contents:\n" + refBlock + "\n\nFind contradictions and inconsistencies across files. Quote the specific conflicting text.",
    userId
  );

  // Step 4: Health score and recommendations
  await updateProgress(4, 4, "Generating health report...");
  const health = await callGemini(
    "You are a business reference advisor. Based on the audit results, provide:\n1. Overall health score (A/B/C/D/F)\n2. Individual file scores\n3. Top 3 priority fixes (most impactful)\n4. One quick win that can be done in 5 minutes\n5. Strategic recommendation for the next reference update session\n\nBe specific and actionable.",
    "Completeness audit:\n" + completeness + "\n\nStaleness audit:\n" + staleness + "\n\nConsistency audit:\n" + consistency + "\n\nProvide the final health report.",
    userId
  );

  const content = [
    "# Reference File Audit",
    "\n## Completeness\n\n" + completeness,
    "\n## Staleness Check\n\n" + staleness,
    "\n## Cross-File Consistency\n\n" + consistency,
    "\n## Health Report\n\n" + health,
  ].join("\n\n---\n");

  return {
    title: "Reference Audit — " + new Date().toLocaleDateString(),
    content,
    structured: {
      filesPresent: present,
      filesMissing: missing,
      completeness,
      staleness,
      consistency,
      health,
    },
  };
}
