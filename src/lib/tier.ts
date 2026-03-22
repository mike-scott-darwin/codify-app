export type Tier = "free" | "focus" | "brain_sync";

export const TIER_HIERARCHY: Record<Tier, number> = {
  free: 0,
  focus: 1,
  brain_sync: 2,
};

export const TIER_LABELS: Record<Tier, string> = {
  free: "FREE",
  focus: "FOCUS",
  brain_sync: "BRAIN SYNC",
};

export const TIER_COLORS: Record<Tier, string> = {
  free: "#6b6b6b",
  focus: "#22c55e",
  brain_sync: "#4a9eff",
};

export const TIER_PRICES: Record<Tier, string> = {
  free: "Free",
  focus: "$1,497",
  brain_sync: "$497/mo",
};

export type Feature =
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

// Free: onboarding + reference files + basic enrichment
// Focus: everything unlocked (one-time engagement)
// Brain Sync: everything unlocked + ongoing support
export const FEATURE_REQUIRED_TIER: Record<Feature, Tier> = {
  enrichment: "free",
  re_enrich: "focus",
  "generate:social_post": "focus",
  research: "free",
  "generate:ad_copy": "focus",
  "generate:email_sequence": "focus",
  "generate:vsl_script": "focus",
  "generate:landing_page": "focus",
  output_history: "focus",
  file_editor: "focus",
  "agent:congruence_audit": "focus",
  "agent:deep_research": "focus",
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

export const GENERATION_LIMITS: Record<Tier, Record<string, number>> = {
  free: {
    social_post: 0,
    ad_copy: 0,
    email_sequence: 0,
    vsl_script: 0,
    landing_page: 0,
    newsletter: 0,
    congruence_audit: 0,
    ad_campaign: 0,
    deep_research: 3,
    content_calendar: 0,
    email_campaign: 0,
    research_scout: 0,
    trend_monitor: 0,
    social_post_generator: 0,
    publisher: 0,
    audit_agent: 0,
    scheduled_runs: 0,
  },
  focus: {
    social_post: 50,
    ad_copy: 50,
    email_sequence: 50,
    vsl_script: 10,
    landing_page: 10,
    newsletter: 10,
    congruence_audit: 5,
    ad_campaign: 4,
    deep_research: 10,
    content_calendar: 4,
    email_campaign: 4,
    research_scout: 0,
    trend_monitor: 0,
    social_post_generator: 0,
    publisher: 0,
    audit_agent: 0,
    scheduled_runs: 0,
  },
  brain_sync: {
    social_post: Infinity,
    ad_copy: Infinity,
    email_sequence: Infinity,
    vsl_script: Infinity,
    landing_page: Infinity,
    newsletter: Infinity,
    congruence_audit: Infinity,
    ad_campaign: Infinity,
    deep_research: Infinity,
    content_calendar: Infinity,
    email_campaign: Infinity,
    research_scout: Infinity,
    trend_monitor: Infinity,
    social_post_generator: Infinity,
    publisher: Infinity,
    audit_agent: Infinity,
    scheduled_runs: Infinity,
  },
};

export const ENRICHMENT_LIMITS: Record<Tier, number> = {
  free: 10,
  focus: Infinity,
  brain_sync: Infinity,
};

export function hasAccess(userTier: Tier, feature: Feature): boolean {
  const requiredTier = FEATURE_REQUIRED_TIER[feature];
  return TIER_HIERARCHY[userTier] >= TIER_HIERARCHY[requiredTier];
}

export function getGenerationLimit(tier: Tier, outputType: string): number {
  return GENERATION_LIMITS[tier][outputType] ?? 0;
}
