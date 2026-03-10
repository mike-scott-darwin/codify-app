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
    headline: "Context compounds.\nPrompts don't.",
    subhead:
      "Prompts are disposable. You use them once and start over. Context compounds. Structure your business knowledge once — every AI output gets better forever.",
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
          "Better prompts. Prompt packs. Courses. The outputs are still generic. Because prompts are disposable — you use them once and start over.",
        stat: "95%",
        statLabel: "of AI pilots fail",
      },
      {
        title: "The Context Gap",
        description:
          "Every AI session starts from zero. Your beliefs, offer, audience, voice — none of it carries forward. You re-explain your business every single time.",
        stat: "42%",
        statLabel: "of knowledge is undocumented",
      },
      {
        title: "The Knowledge Walkout",
        description:
          "Your knowledge lives in people's heads. When they leave, it leaves with them. No AI tool can use knowledge it can't access.",
        stat: "$31.5B",
        statLabel: "lost annually to knowledge gaps",
      },
      {
        title: "The Market Is Moving",
        description:
          "47% year-over-year growth. Your competitors aren't waiting for better prompts — they're structuring their knowledge now. Every quarter you don't, the gap widens.",
        stat: "47%",
        statLabel: "YoY market growth",
      },
    ],
  },
  thesis: {
    eyebrow: "THE THESIS",
    headline: "Context > Prompts.",
    description:
      "Everyone is optimizing the vehicle. Nobody is checking the fuel.",
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
    headline: "Think. Create. Scale.",
    description:
      "Same engine, more skills. Every tier compounds on the last.",
    tiers: [
      {
        name: "Build",
        command: "codify think",
        price: "$99",
        period: "/mo",
        annualPrice: "$699/yr",
        annualSavings: "Save $489",
        description:
          "The thinking engine. Research, decide, and codify your business knowledge into structured reference files.",
        skills: ["/start", "/think", "/help"],
        features: [
          "Unlimited research sessions + AI generations",
          "Parallel AI agents + MCP routing",
          "Full thinking engine — research, decide, codify",
          "Community access + classroom",
          "Group calls",
        ],
        cta: "Start Building",
        ctaUrl: "#build",
        highlight: false,
      },
      {
        name: "Pro",
        command: "codify generate",
        price: "$199",
        period: "/mo",
        annualPrice: "$1,497/yr",
        annualSavings: "Save $891",
        description:
          "Everything in Build — plus the output skills that turn your reference stack into ads, content, sites, and scripts.",
        skills: ["/start", "/think", "/help", "/ads", "/organic", "/vsl", "/site", "/wiki"],
        features: [
          "Everything in Build",
          "Unlimited output generation — ads, organic, VSL, site, wiki",
          "Compliance lenses + brand templates",
          "Guided onboarding sprint (first 4 weeks)",
          "Monthly co-working sessions",
        ],
        cta: "Go Pro",
        ctaUrl: "#pro",
        highlight: true,
      },
      {
        name: "VIP",
        command: "codify scale",
        price: "$497",
        period: "/mo",
        annualPrice: "$2,997/yr",
        annualSavings: "Save $2,967",
        description:
          "Everything in Pro — plus direct access, internal research, and the infrastructure to scale across clients.",
        skills: ["All skills", "Internal research library", "Decision archive", "Advanced automations"],
        features: [
          "Everything in Pro",
          "Unlimited everything — no caps, no throttling",
          "Internal research + decision library",
          "Advanced automations + agent workflows",
          "Weekly co-working sessions",
          "Direct access — async + calls",
          "Agency multi-client support",
        ],
        cta: "Apply for VIP",
        ctaUrl: "#vip",
        highlight: false,
      },
    ],
  },
  urgency: {
    eyebrow: "THE WINDOW",
    headline: "While you prompt, they compound.",
    terminal: {
      command: "codify market --status",
      lines: [
        { type: "info", text: "AI knowledge management market ........... $4.8B → $16.2B by 2028" },
        { type: "growth", text: "Year-over-year growth rate ............... 47%" },
        { type: "info", text: "Businesses codifying their knowledge ..... pulling away" },
        { type: "warning", text: "Businesses still prompting from scratch .. getting buried" },
        { type: "blank", text: "" },
        { type: "result", text: "VERDICT: The window is open. It won't be for long." },
      ],
    },
    cards: [
      {
        label: "Today",
        title: "You move first",
        description: "You lock in your knowledge now. Every AI output carries your identity. Your competitors are still re-explaining themselves to ChatGPT every morning.",
        status: "green",
      },
      {
        label: "6 months",
        title: "The gap becomes a canyon",
        description: "50+ reference files deep. Your AI knows your business cold. Competitors wake up — but you've been compounding for six months. They can't catch you.",
        status: "green",
      },
      {
        label: "12 months",
        title: "The moat is permanent",
        description: "Your context IS the business. New entrants need a year just to stand where you are — and you're still pulling ahead.",
        status: "green",
      },
    ],
    closingLine: "The businesses that codify first win. The rest become case studies in what went wrong.",
  },
  testimonials: {
    eyebrow: "FROM THE COMMUNITY",
    headline: "Real people. Real timelines. Real results.",
    description:
      "These are members using the same engine that powers Codify. Same reference architecture. Same compounding system. Their words, not ours.",
    items: [
      {
        name: "Joshua Breaux",
        context: "4 days in — blog strategy",
        result: "Full content strategy in 5 hours",
        quote:
          "Validated 105 keywords in Ahrefs. Mapped 5 pillar articles, 15+ cluster articles, and the full internal linking architecture between them. The part I\u2019m most pumped about is the compounding. Every decision codified in my reference files feeds the next session. No more starting over every time with a different AI Stranger.",
      },
      {
        name: "Josh Ballard",
        context: "2 days in — busy dad, 9-5 job",
        result: "Business frameworks built in 2 days",
        quote:
          "Giving Claude Code an organizational structure to work within, and being able to build out my business frameworks have been truly incredible. This is just for a small community here on Skool, but as a busy dad and working a 9-5, this is great.",
      },
      {
        name: "Grant Sparks",
        context: "Sales team automation",
        result: "Built a working AI agent from scratch",
        quote:
          "My sales team burns too much time looking for the right business networking events. Claude whipped it up, built the repo, did the initial searches. We refined the queries. It\u2019s functional and working, and takes that effort off of the team.",
      },
      {
        name: "Community Member",
        context: "Canceled every other subscription",
        result: "Hundreds of ad variations, converting",
        quote:
          "Once you articulate your offer, your audience, your voice, and your proof into structured reference, everything downstream gets better. Ads. Content. Sales pages. Everything. I ran the ad skill and it made hundreds of ad variations. We put them in the ad account and it\u2019s converting.",
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
          "Neither are most of our members. Build tier walks you through it. Pro tier includes guided onboarding — your stack built with you in the first 4 weeks.",
      },
      {
        question: '"Why pay monthly when AI tools are free?"',
        answer:
          "Free AI gives you generic outputs. The engine gives you outputs that know your business. The difference is the reference stack, the skills that read it, and the community that helps you build it.",
      },
      {
        question: '"What if I want to cancel?"',
        answer:
          "Month-to-month. Cancel anytime. Your reference files are yours — markdown files in your own git repo. You keep everything you built. We don't hold your data hostage.",
      },
      {
        question: '"How is this different from hiring an AI consultant?"',
        answer:
          "Consultants give you a report. We give you a system. Consultants leave after the engagement. The engine keeps compounding. Consultants cost $5-20K. Build starts at $99/mo.",
      },
    ],
  },
  cta: {
    headline: "The window is open.\nNot for long.",
    subhead:
      "Your competitors are structuring their knowledge right now. See why context beats prompts — in one session.",
    ctaText: "Get the Starter Kit — Free",
    ctaUrl: "#starter-kit",
    files: ["soul.md", "offer.md", "audience.md", "voice.md"],
    microcopy: "soul.md · offer.md · audience.md · voice.md — yours in 5 minutes.",
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
