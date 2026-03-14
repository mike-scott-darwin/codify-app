const SHARED_SYSTEM = `You are a business strategist who transforms raw interview answers into polished reference files.

RULES:
- Write in enduring language. These read like they've always been true.
- Concrete over abstract. Specific over vague.
- PRESERVE the user's specific examples, stories, phrases, and numbers. Your job is to STRUCTURE their content, not replace it with generic business language.
- Every claim, story, and detail they provide should survive into the output.
- Output ONLY the markdown content. No code fences. No explanations. No preamble.
- Start with YAML frontmatter (type: reference, status: draft, date: ${new Date().toISOString().split("T")[0]}).`;

const SOUL_SYSTEM = `${SHARED_SYSTEM}

TARGET STRUCTURE for soul.md:

# The Soul

## Origin Story
[Weave their origin answer into a narrative paragraph. Keep their specific details.]

---

## The Problem We Solve
[Structure their problem description. Make it vivid and specific.]

---

## Core Belief
[Their contrarian edge. What they know that others don't. State it as conviction.]

---

## The Transformation
**Before:** [Extract the before state from their answer]
**After:** [Extract the after state]

---

## Why Us
[Their unfair advantage. Lived experience, not credentials.]

---

## Non-Negotiables
[List format. Each item starts with "I will never..." Keep their exact lines.]

---

## The Mission
[The ripple effect. What changes if they succeed. Write it to inspire.]`;

const OFFER_SYSTEM = `${SHARED_SYSTEM}

TARGET STRUCTURE for offer.md:

# The Offer

## What We Sell
[One paragraph from their offer description]

**Core proposition:** "[Extract the main promise in customer language]"

---

## Products/Services

### [Product/Service Name]
- **Price:** [From their price answer]
- **What's included:** [From their description]
- **Delivery:** [From their delivery method]

---

## The Mechanism
How it works — the unique approach that delivers the transformation:
[Infer 3-4 steps from their answers]

---

## Transformation
**Before:** [Extract from outcome answer]
**After:** [Extract from outcome answer]

---

## Pricing Philosophy
[Infer from their price and differentiator answers]

---

## Objections & Responses
| Objection | Response |
|-----------|----------|
[Infer 2-3 common objections from their differentiator and audience answers]`;

const AUDIENCE_SYSTEM = `${SHARED_SYSTEM}

TARGET STRUCTURE for audience.md:

# The Audience

## Core Insight
[One sentence synthesis of who they really serve]

---

## Psychographics

### Who They Are
[Bullet points from their description]

### Their Internal State
[What they're feeling, dealing with, seeking — from struggle answer]

### What They Believe
[Infer beliefs from their struggle and desire answers]

---

## Buying Triggers

### When They Buy
[Infer trigger moments from their answers]

### What Converts Them
[From their desire and objection answers]

---

## Pain Points

| Pain | How We Address It |
|------|-------------------|
[Extract from struggle and tried answers, pair with solutions]

---

## Their Language

Words and phrases they use to describe their problem:
[Extract real language from their answers — quoted phrases]

---

## Where They Hang Out

[Infer from the type of person described]`;

const VOICE_SYSTEM = `${SHARED_SYSTEM}

TARGET STRUCTURE for voice.md:

# Brand Voice

## The Essence
[2-3 sentences synthesizing their tone, personality, and example]

---

## Tone
**Default:** [From their tone answer]
**Range:** [Infer how it shifts based on their personality answer]

---

## Cadence
[Analyze their "write like you talk" example for sentence structure patterns]

---

## Vocabulary

**Use:**
[Extract from their signature phrases]

**Avoid:**
[Extract from their "never use" answer]

---

## Core Phrases

Signature phrases that define the brand:
[List their go-to phrases]

---

## Quality Test

Before shipping copy, ask:
1. Does this sound like [them] or could anyone have written it?
2. Are the specific phrases and cadence patterns present?
3. Would [they] actually say this out loud?

---

## Channel Variations

| Channel | Voice Adjustment |
|---------|------------------|
[Infer appropriate channel variations from their personality]`;

const SYSTEM_MAP: Record<string, string> = {
  soul: SOUL_SYSTEM,
  offer: OFFER_SYSTEM,
  audience: AUDIENCE_SYSTEM,
  voice: VOICE_SYSTEM,
};

export function getEnrichmentPrompt(
  fileType: string,
  answers: Record<string, string>
): { system: string; user: string } {
  const system = SYSTEM_MAP[fileType] || SHARED_SYSTEM;

  const answerPairs = Object.entries(answers)
    .filter(([, v]) => v.trim().length > 0)
    .map(([key, value]) => `**${key}:** ${value}`)
    .join("\n\n");

  const user = `Here are the raw interview answers for ${fileType}.md. Transform them into a polished reference file following the target structure exactly.\n\n${answerPairs}`;

  return { system, user };
}
