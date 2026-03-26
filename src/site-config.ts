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
      "Your business knowledge is your moat — but only if AI can use it. Codify extracts, structures, and operationalizes your expertise so AI actually works for your business.",
  },
  hero: {
    eyebrow: "FOR BUSINESS OWNERS ALREADY USING AI",
    headline: "Your AI Doesn't\nKnow Your Business.",
    subhead:
      "Every AI output sounds generic because it has zero context about your business.\nFix that permanently.",
    ctaText: "Start Free Trial",
    ctaUrl: "https://app.codify.build",
  },
  problem: {
    eyebrow: "THE PROBLEM",
    headline: "Generic In. Generic Out.",
    items: [
      {
        title: "The Context Gap",
        stat: "95%",
        statLabel: "of AI pilots fail",
        description:
          "Not because the AI is bad — because it has zero context about your business. You keep re-explaining the same things every session.",
      },
      {
        title: "The Copy-Paste Loop",
        stat: "42%",
        statLabel: "of knowledge is undocumented",
        description:
          "Your expertise lives in your head. Every AI session starts from zero. The outputs sound like everyone else's because the input is missing what makes you different.",
      },
      {
        title: "The Tool Trap",
        stat: "$31.5B",
        statLabel: "lost to knowledge inefficiency",
        description:
          "Better tools don't fix the problem. Prompt packs, custom GPTs, AI consultants — none of them work without your business context structured first.",
      },
    ],
  },
  mechanism: {
    eyebrow: "HOW IT WORKS",
    headline: "Extract. Codify. Generate. Compound.",
    steps: [
      {
        label: "01",
        title: "Extract",
        description:
          "Capture the knowledge that lives in your head — your decisions, frameworks, beliefs, and the logic behind how you run your business. Not what's on your website. What's behind it.",
        outcome: "Your expertise captured in structured files",
      },
      {
        label: "02",
        title: "Codify",
        description:
          "Your knowledge becomes reference files — soul.md, offer.md, audience.md, voice.md — stored in a private repository you own. Platform-agnostic. Works with Claude, GPT, Gemini, whatever comes next.",
        outcome: "AI reads your context before every output",
      },
      {
        label: "03",
        title: "Generate",
        description:
          "Ads, content, proposals, audits, strategy — all generated from your reference files. 90% accuracy on first drafts because the AI finally knows your business.",
        outcome: "High-fidelity outputs that sound like you",
      },
      {
        label: "04",
        title: "Compound",
        description:
          "Every research session, decision, and file update makes the next output better. The system gets smarter every week without you getting busier.",
        outcome: "The system compounds — permanently",
      },
    ],
  },
  proof: {
    eyebrow: "EAT YOUR OWN COOKING",
    headline: "We Run This System Every Day.",
    description:
      "Every piece of content on this site was generated from the same system we sell. 48 reference files. 322+ commits. This isn't theory.",
    stats: [
      { value: "48", label: "Reference files", suffix: "" },
      { value: "322", label: "Git commits", suffix: "+" },
      { value: "90", label: "First-draft accuracy", suffix: "%" },
      { value: "9", label: "Hours/week to run it all", suffix: "h" },
    ],
    before: [
      "Re-explain your business every AI session",
      "Generic outputs that sound like everyone else",
      "Knowledge locked in one person's head",
      "16+ hours/week on content and strategy",
    ],
    after: [
      "AI reads your full context before writing anything",
      "Outputs that sound like you from the first draft",
      "Permanent, versioned business knowledge",
      "9 hours/week — the system does the rest",
    ],
  },
  testimonials: {
    eyebrow: "REAL RESULTS",
    headline: "From Generic to Codified.",
    description:
      "Same engine. Same reference architecture. Their words, not ours.",
    items: [
      {
        name: "Joshua Breaux",
        context: "4 days in",
        quote:
          "Validated 105 keywords in Ahrefs. Mapped 5 pillar articles, 15+ cluster articles, and the full internal linking architecture. The part I\u2019m most pumped about is the compounding. Every decision codified feeds the next session. No more starting over with a different AI stranger.",
        result: "Full content strategy in 5 hours",
      },
      {
        name: "Josh Ballard",
        context: "Busy dad, 9-5 job",
        quote:
          "Giving Claude Code an organizational structure to work within, and being able to build out my business frameworks have been truly incredible. As a busy dad working a 9-5, this is great.",
        result: "Business frameworks built in 2 days",
      },
      {
        name: "Grant Sparks",
        context: "Sales team automation",
        quote:
          "My sales team burns too much time looking for the right business networking events. Claude whipped it up, built the repo, did the initial searches. It\u2019s functional and working, and takes that effort off of the team.",
        result: "Built a working AI agent from scratch",
      },
      {
        name: "Alex Reisch",
        context: "Skool community builder",
        quote:
          "Built a master-level Skool community in record time. Every lesson and email trigger sounded like me, not a machine.",
        result: "Complete IP codification in days",
      },
      {
        name: "Joe DeFilippo",
        context: "Team lead",
        quote:
          "Moved from tactical fixes to architectural growth. 63 PRs in 26 days. The structured files kept my team aligned and honest.",
        result: "60% faster team throughput",
      },
      {
        name: "Community Member",
        context: "Ad campaigns",
        quote:
          "Once you articulate your offer, audience, voice, and proof into structured reference, everything downstream gets better. Ads. Content. Sales pages. I ran the ad skill and it made hundreds of variations. We put them in the account and it\u2019s converting.",
        result: "Hundreds of ad variations, converting",
      },
    ],
  },
  product: {
    eyebrow: "PRICING",
    headline: "Start Free. Scale When Ready.",
    description:
      "Begin with the free starter kit. Upgrade when you're ready to codify your full business.",
    tiers: [
      {
        name: "Build",
        price: "$99",
        period: "/mo",
        annual: "$699/yr",
        description:
          "The thinking engine. Extract, research, and codify — every session makes the next one smarter.",
        features: [
          "Context extraction: /extract /import /enrich",
          "Content creation: /content /research /brief",
          "Vault health: /audit /start",
          "Parallel AI agents + MCP routing",
          "Compounding — every file makes future outputs better",
          "WhatsApp support",
        ],
        cta: "Start Free Trial",
        ctaUrl: "https://app.codify.build",
        highlight: false,
      },
      {
        name: "Pro",
        price: "$199",
        period: "/mo",
        annual: "$1,497/yr",
        description:
          "Full output skill library — ads, emails, proposals, landing pages, case studies. Client ready from day one.",
        features: [
          "Everything in Build",
          "Output skills: /ad /email /landing /proposal /pitch",
          "Client skills: /case-study /follow-up /objection",
          "Compliance lenses + brand templates",
          "Onboarding + ongoing support via WhatsApp",
          "Compounding — outputs improve as your context deepens",
        ],
        cta: "Start Free Trial",
        ctaUrl: "https://app.codify.build",
        highlight: true,
      },
      {
        name: "VIP",
        price: "$497",
        period: "/mo",
        annual: "$2,997/yr",
        badge: "Sovereign Vault",
        description:
          "The Digital Fortress. Done-for-you build, autonomous operations, and your IP secured on infrastructure you own.",
        features: [
          "Everything in Pro",
          "Done-for-you stack build",
          "Distribution: /publish /campaign /repurpose",
          "Sovereign Vault — private VPS, self-hosted, full IP ownership",
          "Direct access via WhatsApp + calls",
          "Compounding — the system runs and improves while you sleep",
        ],
        cta: "Start Free Trial",
        ctaUrl: "https://app.codify.build",
        highlight: false,
      },
    ],
    guarantee:
      "Start with a free trial. Your files are always yours — plain text in your own repository. Cancel anytime. Your system keeps working.",
  },
  objections: {
    eyebrow: "FAQ",
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
          "Prompts are disposable. You write them once, they work once. Reference files inform every output, forever. Context > Prompts.",
      },
      {
        question: '"I\'m not technical"',
        answer:
          "Neither are most of our users. Build tier walks you through it. Pro tier includes onboarding and ongoing support — you're client ready from day one.",
      },
      {
        question: '"Why pay monthly when AI tools are free?"',
        answer:
          "Free AI gives you generic outputs. Codify gives you outputs that know your business. The difference is the reference architecture and the skills that read it. Build starts at $99/mo.",
      },
      {
        question: '"What if I want to cancel?"',
        answer:
          "Month-to-month. Cancel anytime. Your reference files are yours — markdown in your own repo. You keep everything you built. We don't hold your data hostage.",
      },
      {
        question: '"What\'s the Sovereign Vault?"',
        answer:
          "Your own Digital Fortress. Your business knowledge lives on a self-hosted private VPS that you control. Encrypted, version-controlled, with a full audit trail and instant access revocation. You own the infrastructure. Your IP never trains anyone else's AI. Available on the VIP tier.",
      },
      {
        question: '"How is this different from hiring an AI consultant?"',
        answer:
          "Consultants give you a report. We give you a system. Consultants leave after the engagement. The engine keeps compounding. Consultants cost $5-20K. Build starts at $99/mo.",
      },
    ],
  },
  cta: {
    headline: "Stop Prompting.\nStart Codifying.",
    subhead:
      "The problem isn't the AI. The problem is the context.\nStructure your expertise. Let the system compound.",
    ctaText: "Start Free Trial",
    ctaUrl: "https://app.codify.build",
  },
  footer: {
    tagline: "Context > Prompts.",
    copyright: `\u00a9 ${new Date().getFullYear()} Codify`,
    links: [
      { label: "Privacy", url: "/privacy" },
      { label: "Terms", url: "/terms" },
    ],
  },
};
