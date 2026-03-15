import { callGemini } from "./gemini";
import type { AgentContext, AgentResult } from "./types";

export async function runCongruenceAudit(ctx: AgentContext): Promise<AgentResult> {
  const { refs, updateProgress } = ctx;
  const results: string[] = [];

  const system = "You are a business strategist auditing reference files for congruence. Be specific. Flag exact contradictions with quotes. Give actionable fixes. Be concise.";

  // Step 1: Soul <> Offer alignment
  await updateProgress(1, 4, "Checking soul and offer alignment...");
  const soulOffer = await callGemini(system,
    "Check if the SOUL and OFFER are aligned. Does the offer deliver on the soul's mission? Are there contradictions?\n\nSOUL:\n" + (refs.soul || "(missing)") + "\n\nOFFER:\n" + (refs.offer || "(missing)") + "\n\nList: aligned points, contradictions, and fixes."
  );
  results.push("## Soul ↔ Offer\n\n" + soulOffer);

  // Step 2: Audience <> Voice alignment
  await updateProgress(2, 4, "Checking audience and voice alignment...");
  const audVoice = await callGemini(system,
    "Check if the VOICE matches what the AUDIENCE needs to hear. Does the tone resonate with their pain points? Would they trust this voice?\n\nAUDIENCE:\n" + (refs.audience || "(missing)") + "\n\nVOICE:\n" + (refs.voice || "(missing)") + "\n\nList: aligned points, mismatches, and fixes."
  );
  results.push("## Audience ↔ Voice\n\n" + audVoice);

  // Step 3: Offer <> Audience alignment
  await updateProgress(3, 4, "Checking offer and audience alignment...");
  const offerAud = await callGemini(system,
    "Check if the OFFER speaks to the AUDIENCE's actual problems. Is it priced right? Does it address their objections?\n\nOFFER:\n" + (refs.offer || "(missing)") + "\n\nAUDIENCE:\n" + (refs.audience || "(missing)") + "\n\nList: aligned points, gaps, and fixes."
  );
  results.push("## Offer ↔ Audience\n\n" + offerAud);

  // Step 4: Overall synthesis
  await updateProgress(4, 4, "Synthesizing audit results...");
  const synthesis = await callGemini(system,
    "Based on these three alignment checks, write a brief overall congruence score (Strong / Solid / Needs Work / Misaligned) and the top 3 priority fixes:\n\n" + results.join("\n\n")
  );
  results.push("## Overall Assessment\n\n" + synthesis);

  const content = "# Congruence Audit\n\n" + results.join("\n\n---\n\n");

  return {
    title: "Congruence Audit — " + new Date().toLocaleDateString(),
    content,
  };
}
