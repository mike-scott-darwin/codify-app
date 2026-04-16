// Skills are manual, single-shot commands the Codify agent can execute.
// Phase 1 (Extract) must be completed before Phase 2 (Create) is useful.

export interface Skill {
  id: string;
  command: string;
  name: string;
  description: string;
  emoji: string;
  example: string;
  phase: "extract" | "create";
}

// Phase 1: Extract your knowledge into the vault
export const EXTRACT_SKILLS: Skill[] = [
  {
    id: "extract",
    command: "/extract",
    name: "Extract Knowledge",
    description: "AI interviews you about your business and builds your core profile",
    emoji: "💬",
    example: "/extract soul",
    phase: "extract",
  },
  {
    id: "import",
    command: "/import",
    name: "Import Existing",
    description: "Paste website copy, proposals, or docs — AI extracts the key info",
    emoji: "📄",
    example: "/import",
    phase: "extract",
  },
  {
    id: "audit",
    command: "/audit",
    name: "Context Check",
    description: "See which profile areas need more depth before creating content",
    emoji: "🔎",
    example: "/audit",
    phase: "extract",
  },
  {
    id: "voice-check",
    command: "/voice-check",
    name: "Voice Check",
    description: "Paste any text and check if it sounds like you",
    emoji: "🎤",
    example: "/voice-check [paste your draft]",
    phase: "extract",
  },
];

// Phase 2: Create content from your vault (only useful once context is rich)
export const CREATE_SKILLS: Skill[] = [
  {
    id: "draft",
    command: "/draft",
    name: "Draft Content",
    description: "Blog post, social post, or article — in your voice",
    emoji: "✏️",
    example: "/draft linkedin post about our new offer",
    phase: "create",
  },
  {
    id: "facebook-ad",
    command: "/facebook-ad",
    name: "Facebook Ad",
    description: "Ad copy — headline, primary text, CTA — matched to your audience",
    emoji: "📣",
    example: "/facebook-ad for our spring coaching launch",
    phase: "create",
  },
  {
    id: "email",
    command: "/email",
    name: "Email Sequence",
    description: "Sales or nurture emails grounded in your offer and voice",
    emoji: "📧",
    example: "/email welcome sequence for new subscribers",
    phase: "create",
  },
  {
    id: "proposal",
    command: "/proposal",
    name: "Proposal",
    description: "Client proposal using your offer, voice, and positioning",
    emoji: "📄",
    example: "/proposal for [client name]'s coaching package",
    phase: "create",
  },
  {
    id: "landing-page",
    command: "/landing-page",
    name: "Landing Page",
    description: "Landing page copy — hero, benefits, proof, CTA",
    emoji: "🖥️",
    example: "/landing-page for our free workshop funnel",
    phase: "create",
  },
  {
    id: "research",
    command: "/research",
    name: "Research",
    description: "Investigate a topic, competitor, or market trend",
    emoji: "🔍",
    example: "/research competitor pricing in our niche",
    phase: "create",
  },
];

// Combined list for slash command palette
export const SKILLS: Skill[] = [...EXTRACT_SKILLS, ...CREATE_SKILLS];
