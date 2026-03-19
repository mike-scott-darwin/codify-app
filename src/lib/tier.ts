export type Tier = "free" | "build" | "pro" | "agency";

export const TIER_HIERARCHY: Record<Tier, number> = {
  free: 0,
  build: 1,
  pro: 2,
  agency: 3,
};

export const TIER_LABELS: Record<Tier, string> = {
  free: "FREE",
  build: "BUILD",
  pro: "PRO",
  agency: "AGENCY",
};

export const TIER_COLORS: Record<Tier, string> = {
  free: "#6b6b6b",
  build: "#4a9eff",
  pro: "#8b5cf6",
  agency: "#f59e0b",
};

export const TIER_PRICES: Record<Tier, string> = {
  free: "Free",
  build: "47/mo",
  pro: "147/mo",
  agency: "397/mo",
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
  | "agent:audit_agent";

export const FEATURE_REQUIRED_TIER: Record<Feature, Tier> = {
  enrichment: "free",
  re_enrich: "build",
  "generate:social_post": "build",
  research: "build",
  "generate:ad_copy": "pro",
  "generate:email_sequence": "pro",
  "generate:vsl_script": "pro",
  "generate:landing_page": "pro",
  output_history: "pro",
  file_editor: "pro",
  "agent:congruence_audit": "build",
  "agent:deep_research": "build",
  "agent:ad_campaign": "pro",
  "agent:content_calendar": "pro",
  "agent:email_campaign": "pro",
  "generate:newsletter": "pro",
  "agent:schedules": "pro",
  "agent:chains": "pro",
  "agent:research_scout": "pro",
  "agent:trend_monitor": "pro",
  "agent:social_post_generator": "pro",
  "agent:publisher": "pro",
  "agent:audit_agent": "pro",
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
  build: {
    social_post: 5,
    ad_copy: 0,
    email_sequence: 0,
    vsl_script: 0,
    landing_page: 0,
    newsletter: 0,
    congruence_audit: 1,
    ad_campaign: 0,
    deep_research: 2,
    content_calendar: 0,
    email_campaign: 0,
    research_scout: 0,
    trend_monitor: 0,
    social_post_generator: 0,
    publisher: 0,
    audit_agent: 0,
    scheduled_runs: 0,
  },
  pro: {
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
    research_scout: 10,
    trend_monitor: 20,
    social_post_generator: 20,
    publisher: 20,
    audit_agent: 4,
    scheduled_runs: 30,
  },
  agency: {
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
  build: Infinity,
  pro: Infinity,
  agency: Infinity,
};

export function hasAccess(userTier: Tier, feature: Feature): boolean {
  const requiredTier = FEATURE_REQUIRED_TIER[feature];
  return TIER_HIERARCHY[userTier] >= TIER_HIERARCHY[requiredTier];
}

export function getGenerationLimit(tier: Tier, outputType: string): number {
  return GENERATION_LIMITS[tier][outputType] ?? 0;
}
