export function buildSoulContent(answers: Record<string, string>): string {
  const s: string[] = ["# Soul\n"];
  if (answers.origin) s.push("## The Defining Experience\n\n" + answers.origin.trim() + "\n");
  if (answers.expertise) s.push("## Hard-Won Expertise\n\n" + answers.expertise.trim() + "\n");
  if (answers.framework) s.push("## The Framework\n\n" + answers.framework.trim() + "\n");
  if (answers.anti_position) s.push("## What We Stand Against\n\n" + answers.anti_position.trim() + "\n");
  if (answers.legacy) s.push("## Institutional Knowledge\n\n" + answers.legacy.trim() + "\n");
  if (answers.principles) s.push("## Operating Principles\n\n" + answers.principles.trim() + "\n");
  if (answers.vision) s.push("## Where We're Headed\n\n" + answers.vision.trim() + "\n");
  return s.join("\n");
}

export function buildOfferContent(answers: Record<string, string>): string {
  const s: string[] = ["# Offer\n"];
  if (answers.offer_name) s.push("## What We Do\n\n" + answers.offer_name.trim() + "\n");
  if (answers.offer_outcome) s.push("## The Transformation\n\n" + answers.offer_outcome.trim() + "\n");
  if (answers.offer_process) s.push("## How We Work\n\n" + answers.offer_process.trim() + "\n");
  if (answers.offer_audience) s.push("## Our Best Client\n\n" + answers.offer_audience.trim() + "\n");
  if (answers.offer_differentiator) s.push("## Why Us\n\n" + answers.offer_differentiator.trim() + "\n");
  if (answers.offer_proof) s.push("## Proof\n\n" + answers.offer_proof.trim() + "\n");
  return s.join("\n");
}

export function buildAudienceContent(answers: Record<string, string>): string {
  const s: string[] = ["# Audience\n"];
  if (answers.audience_who) s.push("## Who We Serve\n\n" + answers.audience_who.trim() + "\n");
  if (answers.audience_pain) s.push("## Their Real Problem\n\n" + answers.audience_pain.trim() + "\n");
  if (answers.audience_tried) s.push("## What Hasn't Worked\n\n" + answers.audience_tried.trim() + "\n");
  if (answers.audience_language) s.push("## How They Talk About It\n\n" + answers.audience_language.trim() + "\n");
  if (answers.audience_stakes) s.push("## What's At Stake\n\n" + answers.audience_stakes.trim() + "\n");
  return s.join("\n");
}

export function buildVoiceContent(answers: Record<string, string>): string {
  const s: string[] = ["# Voice\n"];
  if (answers.voice_tone) s.push("## How We Come Across\n\n" + answers.voice_tone.trim() + "\n");
  if (answers.voice_phrases) s.push("## Signature Phrases\n\n" + answers.voice_phrases.trim() + "\n");
  if (answers.voice_never) s.push("## What We'd Never Say\n\n" + answers.voice_never.trim() + "\n");
  if (answers.voice_example) s.push("## Natural Voice\n\n" + answers.voice_example.trim() + "\n");
  if (answers.voice_influence) s.push("## Style Influences\n\n" + answers.voice_influence.trim() + "\n");
  return s.join("\n");
}

const builders: Record<string, (a: Record<string, string>) => string> = {
  soul: buildSoulContent,
  offer: buildOfferContent,
  audience: buildAudienceContent,
  voice: buildVoiceContent,
};

export function buildContent(fileType: string, answers: Record<string, string>): string {
  const builder = builders[fileType];
  if (!builder) throw new Error("Unknown file type: " + fileType);
  return builder(answers);
}
