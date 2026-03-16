export function getScorePrompt(
  outputType: string,
  content: string,
  refContext: string
): { system: string; prompt: string } {
  const system = `You are a content performance prediction engine. Your job is to score marketing content on 5 dimensions, each rated 0-100.

Dimensions:
1. hook_strength — How effectively does the opening grab attention and stop the scroll?
2. voice_alignment — How well does the content match the brand's established voice and tone?
3. cta_clarity — How clear, compelling, and actionable is the call to action?
4. audience_match — How precisely does the content speak to the target audience's pain points and desires?
5. emotional_resonance — How effectively does the content create an emotional response that drives action?

Calibration guide:
- 85-100: Excellent — ready to publish, high-performance potential
- 70-84: Good — solid foundation, minor refinements possible
- 50-69: Needs Work — clear gaps that will limit performance
- 0-49: Rework — fundamental issues, should be regenerated

Also provide:
- summary: A 1-2 sentence overall assessment
- improvements: An array of 2-3 specific, actionable improvements

You MUST respond with ONLY valid JSON matching this exact structure (no markdown, no explanation):
{
  "hook_strength": <number>,
  "voice_alignment": <number>,
  "cta_clarity": <number>,
  "audience_match": <number>,
  "emotional_resonance": <number>,
  "summary": "<string>",
  "improvements": ["<string>", "<string>"]
}`;

  const prompt = `Output type: ${outputType.replace(/_/g, " ")}

--- CONTENT TO SCORE ---
${content}

--- REFERENCE CONTEXT (brand voice, audience, offer) ---
${refContext}

Score this content now. Return ONLY the JSON object.`;

  return { system, prompt };
}
