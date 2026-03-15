export type Tier = "free" | "build" | "pro" | "vip";

export const TIER_HIERARCHY: Record<Tier, number> = {
  free: 0,
  build: 1,
  pro: 2,
  vip: 3,
};

export const TIER_LABELS: Record<Tier, string> = {
  free: "FREE",
  build: "BUILD",
  pro: "PRO",
  vip: "VIP",
};

export const TIER_COLORS: Record<Tier, string> = {
  free: "#6b6b6b",
  build: "#4a9eff",
  pro: "#8b5cf6",
  vip: "#f59e0b",
};

export const TIER_PRICES: Record<Tier, string> = {
  free: "Free",
  build: "99/mo",
  pro: "199/mo",
  vip: "497/mo",
};

export type Feature =
  | "enrichment"
  | "generate:ad_copy"
  | "generate:social_post"
  | "generate:email_sequence"
  | "generate:vsl_script"
  | "generate:landing_page"
  | "research"
  | "output_history";

export const FEATURE_REQUIRED_TIER: Record<Feature, Tier> = {
  enrichment: "free",
  "generate:ad_copy": "pro",
  "generate:social_post": "pro",
  "generate:email_sequence": "pro",
  "generate:vsl_script": "pro",
  "generate:landing_page": "pro",
  research: "build",
  output_history: "pro",
};

export const TIER_LIMITS: Record<Tier, { enrichments: number; generations: number }> = {
  free: { enrichments: 10, generations: 0 },
  build: { enrichments: Infinity, generations: 0 },
  pro: { enrichments: Infinity, generations: 50 },
  vip: { enrichments: Infinity, generations: Infinity },
};

export function hasAccess(userTier: Tier, feature: Feature): boolean {
  const requiredTier = FEATURE_REQUIRED_TIER[feature];
  return TIER_HIERARCHY[userTier] >= TIER_HIERARCHY[requiredTier];
}
