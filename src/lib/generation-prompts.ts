import type { OutputType } from "./generation-types";

interface ReferenceFiles {
  soul?: string;
  offer?: string;
  audience?: string;
  voice?: string;
}

function buildRefContext(refs: ReferenceFiles): string {
  const parts: string[] = [];
  if (refs.soul) parts.push("=== SOUL (Why this business exists) ===\n" + refs.soul);
  if (refs.offer) parts.push("=== OFFER (What they sell) ===\n" + refs.offer);
  if (refs.audience) parts.push("=== AUDIENCE (Who they serve) ===\n" + refs.audience);
  if (refs.voice) parts.push("=== VOICE (How they sound) ===\n" + refs.voice);
  return parts.join("\n\n");
}

const PROMPTS: Record<OutputType, (refs: ReferenceFiles, opts: Record<string, string>) => { system: string; user: string }> = {
  ad_copy: (refs, opts) => ({
    system: `You write high-converting ad copy. You match the brand voice exactly. You never sound generic.

RULES:
- Match the voice file tone, phrases, and personality exactly
- Address the specific pain points from the audience file
- Reference the specific offer and transformation
- Write hooks that stop the scroll
- Keep body copy concise and punchy
- Include a clear CTA
- Output ONLY the ad copy, no explanations or meta-commentary`,

    user: `Here is the business context:\n\n${buildRefContext(refs)}\n\n---\n\nWrite ${opts.quantity || "3"} ${opts.platform || "Facebook"} ad variations.\nHook style: ${opts.hook_style || "pain_point"}\n\nFor each ad, provide:\n- Hook (first line that stops the scroll)\n- Body (2-4 short paragraphs)\n- CTA (call to action)\n\nSeparate each ad with "---"`,
  }),

  social_post: (refs, opts) => ({
    system: `You write engaging social media content. You match the brand voice exactly. Never generic.

RULES:
- Match voice file tone and personality
- Write for the specific platform's format and culture
- Use the audience's language and pain points
- Be specific, not vague
- Include hooks that create engagement
- Output ONLY the content, no explanations`,

    user: `Here is the business context:\n\n${buildRefContext(refs)}\n\n---\n\nWrite a ${opts.format || "single"} ${opts.platform || "Instagram"} post.${opts.topic ? "\nTopic: " + opts.topic : "\nChoose a topic based on the reference files — something that would resonate with this audience."}\n\nInclude relevant hashtags if appropriate for the platform.`,
  }),

  email_sequence: (refs, opts) => ({
    system: `You write email sequences that build trust and convert. You match the brand voice exactly.

RULES:
- Match voice file tone throughout
- Each email should stand alone but build on the sequence arc
- Subject lines must be compelling and specific
- Use the audience's language and address their pain points
- Reference the specific offer naturally
- Include clear CTAs
- Output ONLY the emails, no explanations`,

    user: `Here is the business context:\n\n${buildRefContext(refs)}\n\n---\n\nWrite a ${opts.length || "5"}-email ${opts.sequence_type || "welcome"} sequence.\n\nFor each email provide:\n- Subject line\n- Preview text\n- Body copy\n- CTA\n\nSeparate each email with "=== EMAIL [number] ==="`,
  }),

  vsl_script: (refs, opts) => ({
    system: `You write video sales letter scripts optimized for spoken delivery. You match the brand voice exactly.

RULES:
- Write for spoken word, not reading
- Short sentences, natural rhythm
- Match voice file tone and personality
- Address audience pain points directly
- Present the offer as the natural solution
- Build tension before the reveal
- Include specific transformation details
- Output ONLY the script, no stage directions or explanations unless essential`,

    user: `Here is the business context:\n\n${buildRefContext(refs)}\n\n---\n\nWrite a ${opts.length || "medium"} VSL script.\nFramework: ${opts.framework || "problem_solution"}\n\nFormat as a continuous script with section markers like [HOOK], [PROBLEM], [SOLUTION], [PROOF], [OFFER], [CTA].`,
  }),

  landing_page: (refs, opts) => ({
    system: `You write landing page copy that converts visitors into leads or customers. You match the brand voice exactly.

RULES:
- Match voice file tone throughout
- Lead with the transformation, not the product
- Address specific audience objections
- Use the audience's language
- Be specific about the offer
- Write compelling headlines and subheadlines
- Output ONLY the copy sections, no design notes or explanations`,

    user: `Here is the business context:\n\n${buildRefContext(refs)}\n\n---\n\nWrite ${opts.sections || "standard"} landing page copy for a ${opts.page_type || "sales"} page.\n\nFor each section provide:\n- Section label (e.g., HERO, PROBLEM, SOLUTION, SOCIAL PROOF, FEATURES, FAQ, CTA)\n- Headline\n- Body copy\n- CTA button text (if applicable)\n\nSeparate sections with "=== [SECTION NAME] ==="`,
  }),
};

export function getGenerationPrompt(
  outputType: OutputType,
  refs: ReferenceFiles,
  opts: Record<string, string>
): { system: string; user: string } {
  return PROMPTS[outputType](refs, opts);
}
