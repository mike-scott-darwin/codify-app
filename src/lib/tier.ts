export type Tier = "explore" | "architect" | "focus";

export const TIER_HIERARCHY: Record<Tier, number> = {
  explore: 0,
  architect: 1,
  focus: 2,
};

export const TIER_LABELS: Record<Tier, string> = {
  explore: "EXPLORE",
  architect: "ARCHITECT",
  focus: "FOCUS",
};

export const TIER_COLORS: Record<Tier, string> = {
  explore: "#6b6b6b",
  architect: "#4a9eff",
  focus: "#22c55e",
};

export const TIER_PRICES: Record<Tier, string> = {
  explore: "Free",
  architect: "$497/mo",
  focus: "$1,497 + $497/mo",
};

export const TIER_DESCRIPTIONS: Record<Tier, string> = {
  explore: "Demo the system. See what codification feels like.",
  architect: "The Brain Sync. Full access to every skill. Your context compounds monthly.",
  focus: "The Focus Engagement. Done-for-you extraction + architecture + ongoing Brain Sync.",
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
  // Explore tier skills
  extract: "explore",
  files: "explore",
  score: "explore",
  help: "explore",

  // Architect tier skills (all paid skills)
  think: "architect",
  end: "architect",
  audit: "architect",
  refine: "architect",
  voice: "architect",
  ads: "architect",
  site: "architect",
  organic: "architect",
  email: "architect",
  newsletter: "architect",
  brainstorm: "architect",
  output_history: "architect",
  seo: "architect",
  blog: "architect",
  repurpose: "architect",
  scout: "architect",
  vsl: "architect",
  scheduled_automation: "architect",
  proposal: "architect",
  report: "architect",
};

export function hasAccess(userTier: Tier, feature: Feature): boolean {
  const requiredTier = FEATURE_REQUIRED_TIER[feature];
  return TIER_HIERARCHY[userTier] >= TIER_HIERARCHY[requiredTier];
}

export function hasAccessWithMode(userTier: Tier, feature: Feature, mode: "diy" | "dfy"): boolean {
  if (mode === "dfy") return true;
  return hasAccess(userTier, feature);
}
