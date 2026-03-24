export type Tier = "free" | "builder" | "focus" | "brain_sync";

export const TIER_HIERARCHY: Record<Tier, number> = {
  free: 0,
  builder: 1,
  focus: 2,
  brain_sync: 3,
};

export const TIER_LABELS: Record<Tier, string> = {
  free: "FREE",
  builder: "BUILDER",
  focus: "FOCUS",
  brain_sync: "BRAIN SYNC",
};

export const TIER_COLORS: Record<Tier, string> = {
  free: "#6b6b6b",
  builder: "#a78bfa",
  focus: "#22c55e",
  brain_sync: "#4a9eff",
};

export const TIER_PRICES: Record<Tier, string> = {
  free: "Free",
  builder: "$147/mo",
  focus: "$1,497",
  brain_sync: "$497/mo",
};

export const TIER_DESCRIPTIONS: Record<Tier, string> = {
  free: "Taste the system",
  builder: "Build your own reference stack",
  focus: "We extract and build it with you",
  brain_sync: "All skills + automation, ongoing",
};

// Terminal skills mapped to tiers
// Free: /extract (3x), /score, /files, /help
// Builder: /extract (∞), /think, /audit, /score, /files, /help
// Focus: everything in Builder + /ads, /email, /organic, /scout, /brainstorm
// Brain Sync: everything in Focus + scheduled automation (unlimited)

export type Feature =
  | "extract"
  | "think"
  | "audit"
  | "score"
  | "files"
  | "help"
  | "ads"
  | "email"
  | "organic"
  | "scout"
  | "brainstorm"
  | "scheduled_automation"
  | "output_history";

export const FEATURE_REQUIRED_TIER: Record<Feature, Tier> = {
  // Free tier skills
  extract: "free",
  score: "free",
  files: "free",
  help: "free",

  // Builder tier skills
  think: "builder",
  audit: "builder",

  // Focus tier skills
  ads: "focus",
  email: "focus",
  organic: "focus",
  scout: "focus",
  brainstorm: "focus",
  output_history: "focus",

  // Brain Sync tier skills
  scheduled_automation: "brain_sync",
};

export const SKILL_LIMITS: Record<Tier, Record<string, number>> = {
  free: {
    extract: 3,
    score: Infinity,
    files: Infinity,
    help: Infinity,
    think: 0,
    audit: 0,
    ads: 0,
    email: 0,
    organic: 0,
    scout: 0,
    brainstorm: 0,
    scheduled_automation: 0,
  },
  builder: {
    extract: Infinity,
    score: Infinity,
    files: Infinity,
    help: Infinity,
    think: Infinity,
    audit: Infinity,
    ads: 0,
    email: 0,
    organic: 0,
    scout: 0,
    brainstorm: 0,
    scheduled_automation: 0,
  },
  focus: {
    extract: Infinity,
    score: Infinity,
    files: Infinity,
    help: Infinity,
    think: Infinity,
    audit: Infinity,
    ads: Infinity,
    email: Infinity,
    organic: Infinity,
    scout: Infinity,
    brainstorm: Infinity,
    scheduled_automation: 0,
  },
  brain_sync: {
    extract: Infinity,
    score: Infinity,
    files: Infinity,
    help: Infinity,
    think: Infinity,
    audit: Infinity,
    ads: Infinity,
    email: Infinity,
    organic: Infinity,
    scout: Infinity,
    brainstorm: Infinity,
    scheduled_automation: Infinity,
  },
};

export function hasAccess(userTier: Tier, feature: Feature): boolean {
  const requiredTier = FEATURE_REQUIRED_TIER[feature];
  return TIER_HIERARCHY[userTier] >= TIER_HIERARCHY[requiredTier];
}

export function getSkillLimit(tier: Tier, skill: string): number {
  return SKILL_LIMITS[tier][skill] ?? 0;
}

// ---- Backward compatibility for old pages (generate, agents, settings) ----
// These map old feature names to the new terminal skill model.
// TODO: Remove once old pages are fully migrated to terminal skills.

type LegacyFeature =
  | "enrichment"
  | "re_enrich"
  | "generate:ad_copy"
  | "generate:social_post"
  | "generate:email_sequence"
  | "generate:vsl_script"
  | "generate:landing_page"
  | "generate:newsletter"
  | "research"
  | "output_history"
  | "file_editor"
  | "agent:congruence_audit"
  | "agent:ad_campaign"
  | "agent:deep_research"
  | "agent:content_calendar"
  | "agent:email_campaign"
  | "agent:schedules"
  | "agent:chains"
  | "agent:research_scout"
  | "agent:trend_monitor"
  | "agent:social_post_generator"
  | "agent:publisher"
  | "agent:audit_agent";

export type { LegacyFeature };

const LEGACY_TIER_MAP: Record<LegacyFeature, Tier> = {
  enrichment: "free",
  re_enrich: "builder",
  "generate:social_post": "focus",
  research: "free",
  "generate:ad_copy": "focus",
  "generate:email_sequence": "focus",
  "generate:vsl_script": "focus",
  "generate:landing_page": "focus",
  output_history: "focus",
  file_editor: "builder",
  "agent:congruence_audit": "focus",
  "agent:deep_research": "builder",
  "agent:ad_campaign": "focus",
  "agent:content_calendar": "focus",
  "agent:email_campaign": "focus",
  "generate:newsletter": "focus",
  "agent:schedules": "brain_sync",
  "agent:chains": "brain_sync",
  "agent:research_scout": "brain_sync",
  "agent:trend_monitor": "brain_sync",
  "agent:social_post_generator": "brain_sync",
  "agent:publisher": "brain_sync",
  "agent:audit_agent": "brain_sync",
};

export const ENRICHMENT_LIMITS: Record<Tier, number> = {
  free: 3,
  builder: Infinity,
  focus: Infinity,
  brain_sync: Infinity,
};

export const GENERATION_LIMITS: Record<Tier, Record<string, number>> = {
  free: { deep_research: 3 },
  builder: { deep_research: Infinity },
  focus: {
    social_post: Infinity, ad_copy: Infinity, email_sequence: Infinity,
    vsl_script: Infinity, landing_page: Infinity, newsletter: Infinity,
    congruence_audit: Infinity, ad_campaign: Infinity, deep_research: Infinity,
    content_calendar: Infinity, email_campaign: Infinity,
  },
  brain_sync: {
    social_post: Infinity, ad_copy: Infinity, email_sequence: Infinity,
    vsl_script: Infinity, landing_page: Infinity, newsletter: Infinity,
    congruence_audit: Infinity, ad_campaign: Infinity, deep_research: Infinity,
    content_calendar: Infinity, email_campaign: Infinity,
    research_scout: Infinity, trend_monitor: Infinity,
    social_post_generator: Infinity, publisher: Infinity,
    audit_agent: Infinity, scheduled_runs: Infinity,
  },
};

export function getGenerationLimit(tier: Tier, outputType: string): number {
  return GENERATION_LIMITS[tier]?.[outputType] ?? 0;
}
