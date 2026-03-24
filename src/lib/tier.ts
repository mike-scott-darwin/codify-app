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
  build: "#a78bfa",
  pro: "#22c55e",
  vip: "#4a9eff",
};

export const TIER_PRICES: Record<Tier, string> = {
  free: "Free",
  build: "$99/mo",
  pro: "$199/mo",
  vip: "$497/mo",
};

export const TIER_DESCRIPTIONS: Record<Tier, string> = {
  free: "Start building your business brain",
  build: "Research, decide, improve",
  pro: "Full content engine",
  vip: "Your compounding machine",
};

export type Feature =
  | "extract"
  | "files"
  | "score"
  | "help"
  | "think"
  | "audit"
  | "refine"
  | "voice"
  | "ads"
  | "organic"
  | "email"
  | "newsletter"
  | "brainstorm"
  | "seo"
  | "blog"
  | "repurpose"
  | "scout"
  | "vsl"
  | "proposal"
  | "report"
  | "scheduled_automation"
  | "output_history"
  | "end"
  | "site";

export const FEATURE_REQUIRED_TIER: Record<Feature, Tier> = {
  // Free tier skills
  extract: "free",
  files: "free",
  score: "free",
  help: "free",

  // Build tier skills
  think: "build",
  end: "build",
  audit: "build",
  refine: "build",
  voice: "build",

  // Pro tier skills
  ads: "pro",
  site: "pro",
  organic: "pro",
  email: "pro",
  newsletter: "pro",
  brainstorm: "pro",
  output_history: "pro",
  seo: "pro",
  blog: "pro",
  repurpose: "pro",

  // VIP tier skills
  scout: "vip",
  vsl: "vip",
  scheduled_automation: "vip",
  proposal: "vip",
  report: "vip",
};

export function hasAccess(userTier: Tier, feature: Feature): boolean {
  const requiredTier = FEATURE_REQUIRED_TIER[feature];
  return TIER_HIERARCHY[userTier] >= TIER_HIERARCHY[requiredTier];
}

export function hasAccessWithMode(userTier: Tier, feature: Feature, mode: "diy" | "dfy"): boolean {
  if (mode === "dfy") return true;
  return hasAccess(userTier, feature);
}
