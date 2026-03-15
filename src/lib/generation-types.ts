export type OutputType = "ad_copy" | "social_post" | "email_sequence" | "vsl_script" | "landing_page";

export interface GenerationOption {
  id: string;
  label: string;
  type: "select" | "text";
  options?: { value: string; label: string }[];
  defaultValue: string;
}

export interface GenerationConfig {
  type: OutputType;
  label: string;
  description: string;
  icon: string;
  options: GenerationOption[];
}

export const GENERATION_CONFIGS: GenerationConfig[] = [
  {
    type: "ad_copy",
    label: "Ad Copy",
    description: "Headlines, hooks, and body copy for paid ads",
    icon: "⚡",
    options: [
      {
        id: "platform",
        label: "Platform",
        type: "select",
        options: [
          { value: "facebook", label: "Facebook / Instagram" },
          { value: "linkedin", label: "LinkedIn" },
          { value: "google", label: "Google Ads" },
        ],
        defaultValue: "facebook",
      },
      {
        id: "hook_style",
        label: "Hook Style",
        type: "select",
        options: [
          { value: "pain_point", label: "Pain Point" },
          { value: "curiosity", label: "Curiosity" },
          { value: "story", label: "Story" },
          { value: "direct", label: "Direct" },
          { value: "contrarian", label: "Contrarian" },
        ],
        defaultValue: "pain_point",
      },
      {
        id: "quantity",
        label: "Variations",
        type: "select",
        options: [
          { value: "1", label: "1 ad" },
          { value: "3", label: "3 ads" },
          { value: "5", label: "5 ads" },
        ],
        defaultValue: "3",
      },
    ],
  },
  {
    type: "social_post",
    label: "Social Posts",
    description: "Instagram, X, LinkedIn, TikTok captions",
    icon: "◆",
    options: [
      {
        id: "platform",
        label: "Platform",
        type: "select",
        options: [
          { value: "instagram", label: "Instagram" },
          { value: "twitter", label: "X / Twitter" },
          { value: "linkedin", label: "LinkedIn" },
          { value: "tiktok", label: "TikTok" },
        ],
        defaultValue: "instagram",
      },
      {
        id: "format",
        label: "Format",
        type: "select",
        options: [
          { value: "single", label: "Single Post" },
          { value: "carousel", label: "Carousel Outline" },
          { value: "thread", label: "Thread" },
        ],
        defaultValue: "single",
      },
      {
        id: "topic",
        label: "Topic (optional)",
        type: "text",
        defaultValue: "",
      },
    ],
  },
  {
    type: "email_sequence",
    label: "Email Sequences",
    description: "Welcome, nurture, and launch email series",
    icon: "✉",
    options: [
      {
        id: "sequence_type",
        label: "Sequence Type",
        type: "select",
        options: [
          { value: "welcome", label: "Welcome Sequence" },
          { value: "nurture", label: "Nurture Sequence" },
          { value: "launch", label: "Launch Sequence" },
        ],
        defaultValue: "welcome",
      },
      {
        id: "length",
        label: "Number of Emails",
        type: "select",
        options: [
          { value: "3", label: "3 emails" },
          { value: "5", label: "5 emails" },
          { value: "7", label: "7 emails" },
        ],
        defaultValue: "5",
      },
    ],
  },
  {
    type: "vsl_script",
    label: "VSL Scripts",
    description: "Video sales letter scripts that convert",
    icon: "▶",
    options: [
      {
        id: "length",
        label: "Length",
        type: "select",
        options: [
          { value: "short", label: "Short (3-5 min)" },
          { value: "medium", label: "Medium (8-12 min)" },
          { value: "long", label: "Long (15-20 min)" },
        ],
        defaultValue: "medium",
      },
      {
        id: "framework",
        label: "Framework",
        type: "select",
        options: [
          { value: "problem_solution", label: "Problem-Solution" },
          { value: "story", label: "Story-Based" },
          { value: "before_after", label: "Before/After" },
        ],
        defaultValue: "problem_solution",
      },
    ],
  },
  {
    type: "landing_page",
    label: "Landing Pages",
    description: "Hero, features, CTA — full page copy",
    icon: "■",
    options: [
      {
        id: "page_type",
        label: "Page Type",
        type: "select",
        options: [
          { value: "sales", label: "Sales Page" },
          { value: "lead_magnet", label: "Lead Magnet Opt-in" },
          { value: "webinar", label: "Webinar Registration" },
        ],
        defaultValue: "sales",
      },
      {
        id: "sections",
        label: "Sections",
        type: "select",
        options: [
          { value: "minimal", label: "Minimal (hero + CTA)" },
          { value: "standard", label: "Standard (5 sections)" },
          { value: "full", label: "Full (8+ sections)" },
        ],
        defaultValue: "standard",
      },
    ],
  },
];
