export function buildSoulContent(answers: Record<string, string>): string {
  const s: string[] = ["# Soul\n"];
  if (answers.origin) s.push("## Origin Story\n\n" + answers.origin.trim() + "\n");
  if (answers.problem) s.push("## The Problem We Solve\n\n" + answers.problem.trim() + "\n");
  if (answers.belief) s.push("## Core Belief\n\n" + answers.belief.trim() + "\n");
  if (answers.transformation) s.push("## The Transformation\n\n" + answers.transformation.trim() + "\n");
  if (answers.why_you) s.push("## Why Us\n\n" + answers.why_you.trim() + "\n");
  if (answers.values) s.push("## Non-Negotiables\n\n" + answers.values.trim() + "\n");
  if (answers.mission) s.push("## The Mission\n\n" + answers.mission.trim() + "\n");
  return s.join("\n");
}

export function buildOfferContent(answers: Record<string, string>): string {
  const s: string[] = ["# Offer\n"];
  if (answers.offer_name) s.push("## The Offer\n\n" + answers.offer_name.trim() + "\n");
  if (answers.offer_outcome) s.push("## The Outcome\n\n" + answers.offer_outcome.trim() + "\n");
  if (answers.offer_price) s.push("## Price & Model\n\n" + answers.offer_price.trim() + "\n");
  if (answers.offer_audience) s.push("## Who It's For\n\n" + answers.offer_audience.trim() + "\n");
  if (answers.offer_differentiator) s.push("## Why This vs Alternatives\n\n" + answers.offer_differentiator.trim() + "\n");
  return s.join("\n");
}

export function buildAudienceContent(answers: Record<string, string>): string {
  const s: string[] = ["# Audience\n"];
  if (answers.audience_who) s.push("## Who They Are\n\n" + answers.audience_who.trim() + "\n");
  if (answers.audience_struggle) s.push("## What They're Struggling With\n\n" + answers.audience_struggle.trim() + "\n");
  if (answers.audience_tried) s.push("## What They've Already Tried\n\n" + answers.audience_tried.trim() + "\n");
  if (answers.audience_desire) s.push("## What They Actually Want\n\n" + answers.audience_desire.trim() + "\n");
  if (answers.audience_objection) s.push("## Why They Hesitate\n\n" + answers.audience_objection.trim() + "\n");
  return s.join("\n");
}

export function buildVoiceContent(answers: Record<string, string>): string {
  const s: string[] = ["# Voice\n"];
  if (answers.voice_tone) s.push("## Tone\n\n" + answers.voice_tone.trim() + "\n");
  if (answers.voice_phrases) s.push("## Signature Phrases\n\n" + answers.voice_phrases.trim() + "\n");
  if (answers.voice_never) s.push("## Words We Never Use\n\n" + answers.voice_never.trim() + "\n");
  if (answers.voice_example) s.push("## Example (Write Like You Talk)\n\n" + answers.voice_example.trim() + "\n");
  if (answers.voice_personality) s.push("## Personality\n\n" + answers.voice_personality.trim() + "\n");
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
