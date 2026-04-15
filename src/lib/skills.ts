// Skills are manual, single-shot commands the Codify agent can execute.
// Each skill reads from the vault's core reference files and produces one output.

export interface Skill {
  id: string;
  command: string;
  name: string;
  description: string;
  emoji: string;
  example: string;
}

export const SKILLS: Skill[] = [
  {
    id: "brief",
    command: "/brief",
    name: "Brief Me",
    description: "Read your core files and recent activity, summarise where things stand",
    emoji: "📋",
    example: "/brief — what changed this week?",
  },
  {
    id: "draft",
    command: "/draft",
    name: "Draft Content",
    description: "Write a blog post, email, or social post in your voice",
    emoji: "✏️",
    example: "/draft linkedin post about our new offer",
  },
  {
    id: "facebook-ad",
    command: "/facebook-ad",
    name: "Facebook Ad",
    description: "Generate ad copy — headline, primary text, and CTA — matched to your audience",
    emoji: "📣",
    example: "/facebook-ad for our spring coaching launch",
  },
  {
    id: "email",
    command: "/email",
    name: "Email Sequence",
    description: "Write a sales or nurture email grounded in your offer and voice",
    emoji: "📧",
    example: "/email welcome sequence for new subscribers",
  },
  {
    id: "research",
    command: "/research",
    name: "Research",
    description: "Investigate a topic, competitor, or market trend and save findings to your vault",
    emoji: "🔍",
    example: "/research competitor pricing in our niche",
  },
  {
    id: "decide",
    command: "/decide",
    name: "Capture Decision",
    description: "Log a strategic decision with reasoning so your vault remembers why",
    emoji: "⚖️",
    example: "/decide we're raising prices 20% because...",
  },
  {
    id: "audit",
    command: "/audit",
    name: "Vault Audit",
    description: "Check which files need updating, what's missing, and what's gone stale",
    emoji: "🔎",
    example: "/audit — what needs attention?",
  },
  {
    id: "proposal",
    command: "/proposal",
    name: "Proposal",
    description: "Draft a client proposal using your offer, voice, and positioning",
    emoji: "📄",
    example: "/proposal for [client name]'s coaching package",
  },
  {
    id: "landing-page",
    command: "/landing-page",
    name: "Landing Page",
    description: "Generate landing page copy — hero, benefits, social proof, CTA",
    emoji: "🖥️",
    example: "/landing-page for our free workshop funnel",
  },
  {
    id: "voice-check",
    command: "/voice-check",
    name: "Voice Check",
    description: "Paste any text and check if it sounds like you",
    emoji: "🎤",
    example: "/voice-check [paste your draft]",
  },
];
