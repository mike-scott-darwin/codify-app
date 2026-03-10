export const siteConfig = {
  brand: {
    name: "codify",
    tagline: "Context > Prompts.",
    domain: "codify.build",
    email: "hello@codify.build",
  },
  metadata: {
    title: "Codify — Stop Prompting. Start Codifying.",
    description:
      "Your business has knowledge that makes it unique. AI can't use any of it. We fix that. Structure your expertise into reference files AI reads before generating anything.",
  },
  hero: {
    eyebrow: "FOR BUSINESS OWNERS USING AI",
    headline: "Your AI doesn't know\nyour business.",
    subhead:
      "You've tried prompts, custom GPTs, and AI consultants. The outputs are still generic. The problem isn't the AI — it's what the AI knows about you.",
    ctaText: "Get the Starter Kit — Free",
    ctaUrl: "#starter-kit",
    badge: { text: "48 files · 322 commits · 9 hrs/week", dot: true },
  },
  problem: {
    eyebrow: "THE PROBLEM",
    headline: "Generic in, generic out.",
    items: [
      {
        title: "The Prompt Trap",
        description:
          "You've spent hours writing better prompts. Bought prompt packs. Taken courses. The outputs are still generic — because prompts are disposable. You write one, it works once, you start over.",
        stat: "95%",
        statLabel: "of AI pilots fail",
      },
      {
        title: "The Context Gap",
        description:
          "Every AI session starts from zero. Your beliefs, your offer, your audience, your voice — none of it carries forward. You re-explain your business every single time.",
        stat: "42%",
        statLabel: "of knowledge is undocumented",
      },
      {
        title: "The Knowledge Walkout",
        description:
          "Your institutional knowledge lives in people's heads. When they leave, it leaves. No AI tool, no matter how powerful, can use knowledge it doesn't have access to.",
        stat: "$31.5B",
        statLabel: "lost annually to knowledge gaps",
      },
      {
        title: "The Tool Treadmill",
        description:
          "New AI tool every week. Each promises to solve everything. None do — because they all have the same problem: they don't know your business. The tool isn't the bottleneck. The context is.",
        stat: "∞",
        statLabel: "tools, same problem",
      },
    ],
  },
  thesis: {
    eyebrow: "THE THESIS",
    headline: "Context > Prompts.",
    description:
      "Everyone is optimizing the vehicle while ignoring the fuel. The fuel is your business knowledge — structured so AI can use it.",
    comparison: [
      {
        market: "Better prompts = better outputs",
        codify: "Better context = better outputs",
      },
      {
        market: "AI tools are the differentiator",
        codify: "Your knowledge is the differentiator",
      },
      {
        market: "Set it and forget it",
        codify: "The system compounds because you engage",
      },
      {
        market: "Platform matters most",
        codify: "Knowledge structure matters most",
      },
      {
        market: "Hire an AI consultant",
        codify: "Build the skill internally",
      },
    ],
  },
  mechanism: {
    eyebrow: "THE MECHANISM",
    headline: "Extract → Codify → Generate → Compound",
    steps: [
      {
        label: "Extract",
        command: "codify extract",
        description:
          "Pull the knowledge out of your head. The beliefs, expertise, decisions, and voice that make your business yours.",
      },
      {
        label: "Codify",
        command: "codify init",
        description:
          "Structure it into reference files: soul.md, offer.md, audience.md, voice.md. Markdown files any AI can read. Platform-agnostic. Portable. Yours.",
      },
      {
        label: "Generate",
        command: "codify generate",
        description:
          "Every output — ads, emails, scripts, content — reads your reference stack first. No re-explaining. No generic. Everything sounds like you.",
      },
      {
        label: "Compound",
        command: "codify status",
        description:
          "Each research session enriches the stack. Each decision sharpens positioning. The system gets smarter without you getting busier. That's the moat.",
      },
    ],
  },
  proof: {
    eyebrow: "THE PROOF",
    headline: "We eat our own cooking.",
    description:
      "Client Ready is Case Study #1. Every metric below is real. Every piece of content you see on this page was generated from reference files.",
    stats: [
      { value: "48", label: "Reference files", suffix: "" },
      { value: "322", label: "Git commits", suffix: "+" },
      { value: "9", label: "Hours per week", suffix: "hrs" },
      { value: "7", label: "Months daily use", suffix: "mo" },
    ],
    before: [
      "Re-explain the business every AI session",
      "Generic outputs that sound like everyone else",
      "Hours of editing to make AI copy sound human",
      "Knowledge locked in one person's head",
    ],
    after: [
      "AI reads 48 reference files before generating",
      "Every output sounds like the brand from first draft",
      "Minutes to generate an entire ad batch",
      "Knowledge codified, versioned, compounding daily",
    ],
  },
  product: {
    eyebrow: "THE STACK",
    headline: "Learn. Build. License.",
    tiers: [
      {
        name: "Learn",
        command: "codify workshop",
        price: "$197",
        period: "one afternoon",
        description: "Build your 4 core reference files in one guided session.",
        features: [
          "2 sessions, 90 minutes each",
          "Extract your soul, offer, audience, voice",
          "First AI-generated output before you leave",
          "Live cohort or self-paced recording",
        ],
        cta: "Join Next Cohort",
        ctaUrl: "#workshop",
        highlight: false,
      },
      {
        name: "Build",
        command: "codify sprint",
        price: "$2,500",
        period: "4 weeks",
        description:
          "Full reference stack + research layer + first outputs. Done with you.",
        features: [
          "Complete reference architecture",
          "Research layer + decision framework",
          "Content strategy + automation setup",
          "Weekly 1:1 calls + async review",
        ],
        cta: "Apply for Sprint",
        ctaUrl: "#sprint",
        highlight: true,
      },
      {
        name: "License",
        command: "codify subscribe",
        price: "$147",
        period: "/month",
        description:
          "Access the engine. The system keeps improving. Your context keeps compounding.",
        features: [
          "Full engine access (all skills)",
          "Community + weekly sessions",
          "Growing template library",
          "Monthly deep research credit",
        ],
        cta: "Get Access",
        ctaUrl: "#license",
        highlight: false,
      },
    ],
  },
  objections: {
    eyebrow: "OBJECTIONS",
    headline: "You're thinking...",
    items: [
      {
        question: '"I can just use ChatGPT Projects"',
        answer:
          "Projects are a filing cabinet. This is an architecture. Projects don't compound, don't generate from structured context, and lock you to one platform.",
      },
      {
        question: '"Why not just write good prompts?"',
        answer:
          "Because prompts are disposable. You write them once, they work once. Reference files inform every output, forever. Context > Prompts.",
      },
      {
        question: '"I\'m not technical"',
        answer:
          "Neither are most of our members. The workshop walks you through it. The sprint builds it for you. The license gives you a system designed for non-developers.",
      },
      {
        question: '"Why $147/month when AI tools are free?"',
        answer:
          "Free AI gives you generic outputs. Licensed architecture gives you outputs that know your business. The difference is the reference stack — and the community that helps you build it.",
      },
      {
        question: '"$2,500 for a sprint?"',
        answer:
          "You're codifying your business's institutional knowledge — the stuff that walks out the door when someone leaves. The ROI isn't the sprint. It's never losing that knowledge again.",
      },
    ],
  },
  cta: {
    headline: "Stop prompting.\nStart codifying.",
    subhead:
      "Get the free Reference Stack Starter Kit. Four template files that change how AI responds to you — in one session.",
    ctaText: "Get the Starter Kit — Free",
    ctaUrl: "#starter-kit",
    microcopy: "4 files. 5 minutes. See the difference.",
  },
  footer: {
    tagline: "context > prompts",
    copyright: `© ${new Date().getFullYear()} Codify`,
    links: [
      { label: "Privacy", url: "/privacy" },
      { label: "Terms", url: "/terms" },
    ],
  },
};
