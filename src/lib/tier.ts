export type Tier = "free" | "base" | "opp_engine" | "scale_partner";

export const TIER_HIERARCHY: Record<Tier, number> = {
  free: 0,
  base: 1,
  opp_engine: 2,
  scale_partner: 3,
};

export const TIER_LABELS: Record<Tier, string> = {
  free: "FREE",
  base: "BASE BRAIN",
  opp_engine: "OPP. ENGINE",
  scale_partner: "SCALE PARTNER",
};

export const TIER_COLORS: Record<Tier, string> = {
  free: "#6b6b6b",
  base: "#4a9eff",
  opp_engine: "#8b5cf6",
  scale_partner: "#f59e0b",
};

export const TIER_PRICES: Record<Tier, string> = {
  free: "Free",
  base: "147/mo",
  opp_engine: "497/mo",
  scale_partner: "1,497/mo",
};

export type Feature =
  | "enrichment"
  | "re_enrich"
  | "generate:ad_copy"
  | "generate:social_post"
  | "generate:email_sequence"
  | "generate:vsl_script"
  | "generate:landing_page"
  | "research"
  | "output_history"
  | "file_editor"
  | "brain_sync"
  | "opportunity_scout"
  | "agent:congruence_audit"
  | "agent:ad_campaign"
  | "agent:deep_research"
  | "agent:content_calendar"
  | "agent:email_campaign"
  | "generate:newsletter"
  | "agent:schedules"
  | "agent:chains"
  | "agent:research_scout"
  | "agent:trend_monitor"
  | "agent:social_post_generator"
  | "agent:publisher"
  | "agent:audit_agent"
  | "custom_skills"
  | "legacy_extraction";

export const FEATURE_REQUIRED_TIER: Record<Feature, Tier> = {
  enrichment: "free",
  re_enrich: "base",
  "generate:social_post": "opp_engine",
  research: "base",
  "generate:ad_copy": "opp_engine",
  "generate:email_sequence": "opp_engine",
  "generate:vsl_script": "opp_engine",
  "generate:landing_page": "opp_engine",
  output_history: "opp_engine",
  file_editor: "base",
  brain_sync: "base",
  opportunity_scout: "opp_engine",
  "agent:congruence_audit": "base",
  "agent:deep_research": "base",
  "agent:ad_campaign": "opp_engine",
  "agent:content_calendar": "opp_engine",
  "agent:email_campaign": "opp_engine",
  "generate:newsletter": "opp_engine",
  "agent:schedules": "opp_engine",
  "agent:chains": "opp_engine",
  "agent:research_scout": "opp_engine",
  "agent:trend_monitor": "opp_engine",
  "agent:social_post_generator": "opp_engine",
  "agent:publisher": "opp_engine",
  "agent:audit_agent": "opp_engine",
  custom_skills: "scale_partner",
  legacy_extraction: "scale_partner",
};

// Per-output-type monthly limits by tier
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
    deep_research: 0,
    content_calendar: 0,
    email_campaign: 0,
    research_scout: 0,
    trend_monitor: 0,
    social_post_generator: 0,
    publisher: 0,
    audit_agent: 0,
    scheduled_runs: 0,
  },
  base: {
    social_post: 0,
    ad_copy: 0,
    email_sequence: 0,
    vsl_script: 0,
    landing_page: 0,
    newsletter: 0,
    congruence_audit: 5,
    ad_campaign: 0,
    deep_research: 10,
    content_calendar: 0,
    email_campaign: 0,
    research_scout: 0,
    trend_monitor: 0,
    social_post_generator: 0,
    publisher: 0,
    audit_agent: 0,
    scheduled_runs: 0,
  },
  opp_engine: {
    social_post: 100,
    ad_copy: 100,
    email_sequence: 100,
    vsl_script: 20,
    landing_page: 20,
    newsletter: 20,
    congruence_audit: 20,
    ad_campaign: 10,
    deep_research: 25,
    content_calendar: 10,
    email_campaign: 10,
    research_scout: 25,
    trend_monitor: 50,
    social_post_generator: 50,
    publisher: 50,
    audit_agent: 10,
    scheduled_runs: 100,
  },
  scale_partner: {
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
  base: Infinity,
  opp_engine: Infinity,
  scale_partner: Infinity,
};

export function hasAccess(userTier: Tier, feature: Feature): boolean {
  const tierSlug = userTier?.toLowerCase() as Tier;
  const requiredTier = FEATURE_REQUIRED_TIER[feature];
  return TIER_HIERARCHY[tierSlug] >= TIER_HIERARCHY[requiredTier];
}

export function getGenerationLimit(tier: Tier, outputType: string): number {
  const tierSlug = tier?.toLowerCase() as Tier;
  return GENERATION_LIMITS[tierSlug][outputType] ?? 0;
}
