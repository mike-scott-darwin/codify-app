export interface ScoreBreakdown {
  hook_strength: number;
  voice_alignment: number;
  cta_clarity: number;
  audience_match: number;
  emotional_resonance: number;
  summary: string;
  improvements: string[];
}

export interface ScoreResult {
  score: number;
  breakdown: ScoreBreakdown;
}

export const SCORE_DIMENSIONS: { key: keyof Omit<ScoreBreakdown, 'summary' | 'improvements'>; label: string; color: string }[] = [
  { key: 'hook_strength', label: 'Hook Strength', color: '#22c55e' },
  { key: 'voice_alignment', label: 'Voice Alignment', color: '#4a9eff' },
  { key: 'cta_clarity', label: 'CTA Clarity', color: '#8b5cf6' },
  { key: 'audience_match', label: 'Audience Match', color: '#f59e0b' },
  { key: 'emotional_resonance', label: 'Emotional Resonance', color: '#ef4444' },
];

export const SCORE_WEIGHTS: Record<string, Record<string, number>> = {
  ad_copy: { hook_strength: 0.30, cta_clarity: 0.25, audience_match: 0.20, voice_alignment: 0.15, emotional_resonance: 0.10 },
  social_post: { hook_strength: 0.25, audience_match: 0.25, voice_alignment: 0.20, emotional_resonance: 0.20, cta_clarity: 0.10 },
  email_sequence: { voice_alignment: 0.25, audience_match: 0.25, cta_clarity: 0.20, hook_strength: 0.15, emotional_resonance: 0.15 },
  vsl_script: { emotional_resonance: 0.30, hook_strength: 0.25, audience_match: 0.20, cta_clarity: 0.15, voice_alignment: 0.10 },
  landing_page: { cta_clarity: 0.25, hook_strength: 0.25, audience_match: 0.20, voice_alignment: 0.15, emotional_resonance: 0.15 },
  newsletter: { voice_alignment: 0.30, audience_match: 0.25, hook_strength: 0.20, emotional_resonance: 0.15, cta_clarity: 0.10 },
};
