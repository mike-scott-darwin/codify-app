"use client";

import { useState } from "react";

const tiers = [
  {
    name: "Build",
    monthly: 99,
    annual: 699,
    description:
      "The thinking engine. Extract, research, and codify — every session makes the next one smarter.",
    who: "For founders getting started with AI who want to capture their expertise and start generating content that actually sounds like them.",
    features: [
      {
        label: "Context extraction",
        detail:
          "Capture the knowledge in your head through guided interviews. /extract, /import, and /enrich build your context files from scratch or from existing documents.",
      },
      {
        label: "Content creation",
        detail:
          "Generate blog posts, social content, and newsletters that match your voice. /content, /research, and /brief — all informed by your context.",
      },
      {
        label: "Competitive intelligence",
        detail:
          "Scrape competitor ads, websites, and social profiles. /spy saves findings to your vault and flags gaps in your positioning.",
      },
      {
        label: "Vault health & optimisation",
        detail:
          "/audit checks your vault health. /optimise analyses what's working and recommends context file updates. Your vault gets smarter every week.",
      },
      {
        label: "Auto-sync",
        detail:
          "Update a context file and every downstream output regenerates automatically. Change your offer once — everything updates.",
      },
      {
        label: "Setup support via WhatsApp",
        detail: "Get help with installation, configuration, and your first extraction.",
      },
    ],
    cta: "Start with Build",
    ctaUrl: "https://link.fastpaydirect.com/payment-link/69c89e4cfb727d9c905d31e5",
    highlight: false,
  },
  {
    name: "Pro",
    badge: "Most Popular",
    monthly: 199,
    annual: 1497,
    description:
      "Full output skill library — ads, emails, proposals, websites, lead gen, and CRM. Client ready from day one.",
    who: "For business owners ready to turn their vault into a revenue engine — generating ads, building websites, finding leads, and managing their pipeline from one place.",
    features: [
      {
        label: "Everything in Build",
        detail: "All extraction, content, competitive intel, and vault tools.",
      },
      {
        label: "Output skills",
        detail:
          "Full library: /ad, /email, /landing, /proposal, /pitch, /funnel. Generate client-ready deliverables in your voice, every time.",
      },
      {
        label: "Client skills",
        detail:
          "/case-study turns wins into proof. /follow-up drafts post-meeting messages. /objection handles sales pushback using your actual expertise.",
      },
      {
        label: "Website builder",
        detail:
          "/site builds a complete, deployable website from your context files. The codify.build site was built with this exact skill.",
      },
      {
        label: "Lead generation",
        detail:
          "/leads finds and qualifies prospects against your ideal client profile, scores them 1-10, and drafts personalised outreach in your voice.",
      },
      {
        label: "CRM integration",
        detail:
          "/ghl connects your vault to GoHighLevel — create contacts, send emails, manage your pipeline, trigger workflows, book meetings. All from the vault.",
      },
      {
        label: "Onboarding + WhatsApp support",
        detail:
          "Guided setup to get your vault producing in the first session. Same-day WhatsApp support for questions and troubleshooting.",
      },
    ],
    cta: "Start with Pro",
    ctaUrl: "https://link.fastpaydirect.com/payment-link/69c89e84fb727d9c905d31e6",
    highlight: true,
  },
  {
    name: "VIP",
    badge: "Sovereign Vault",
    monthly: 497,
    annual: 2997,
    description:
      "The Digital Fortress. Done-for-you build, autonomous operations, and your IP secured on infrastructure you own.",
    who: "For established businesses that want the full system built for them — vault configured, skills tuned, context extracted, and everything running on private infrastructure they control.",
    features: [
      {
        label: "Everything in Pro",
        detail: "All skills, integrations, and support.",
      },
      {
        label: "Done-for-you stack build",
        detail:
          "We build your vault, extract your context, configure your skills, and tune everything to your business. You're operational from day one.",
      },
      {
        label: "Distribution skills",
        detail:
          "/publish, /campaign, /repurpose — push content to every channel. One command can generate and distribute a full campaign across email, social, ads, and your website.",
      },
      {
        label: "Autonomous optimisation",
        detail:
          "/optimise runs weekly on autopilot. Your vault analyses what's working, updates context files, and regenerates outputs. The system improves itself without you doing anything.",
      },
      {
        label: "Sovereign Vault",
        detail:
          "Your business knowledge lives on a private VPS that you control. Encrypted, version-controlled, full audit trail, instant access revocation. Your IP never trains anyone else's AI.",
      },
      {
        label: "Direct access",
        detail:
          "WhatsApp + scheduled calls. Priority support and strategic input.",
      },
    ],
    cta: "Start with VIP",
    ctaUrl: "https://link.fastpaydirect.com/payment-link/69c89dddfb727d9c905d31e2",
    highlight: false,
  },
];

export default function Pricing() {
  const [annual, setAnnual] = useState(false);

  return (
    <main>
      {/* Nav */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
        <div className="max-w-[1000px] mx-auto px-6 md:px-12 flex items-center justify-between h-14">
          <a href="/" className="flex items-center gap-2">
            <span className="text-lg font-bold text-white tracking-tight">
              codify
            </span>
          </a>
          <a
            href="/"
            className="text-sm text-muted hover:text-white transition-colors"
          >
            Back to site
          </a>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-20 pb-8 md:pt-36 md:pb-12">
        <div className="max-w-[700px] mx-auto px-6 md:px-12 text-center">
          <p className="text-xs tracking-[0.2em] uppercase text-blue mb-3">
            PRICING
          </p>
          <h1 className="font-bold text-white leading-[1.1] mb-4 text-[clamp(1.75rem,5vw,2.5rem)]">
            Start Free. Scale When Ready.
          </h1>
          <p className="text-muted text-base md:text-lg leading-relaxed mb-8">
            5 extractions + 3 content outputs free. No credit card. Your files
            are always yours.
          </p>

          {/* Toggle */}
          <div className="inline-flex items-center gap-3 bg-surface border border-border rounded-full px-2 py-1.5">
            <button
              onClick={() => setAnnual(false)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
                !annual
                  ? "bg-blue text-black"
                  : "text-muted hover:text-white"
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setAnnual(true)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
                annual
                  ? "bg-blue text-black"
                  : "text-muted hover:text-white"
              }`}
            >
              Annual
              <span className="ml-1.5 text-[11px] opacity-80">Save up to 50%</span>
            </button>
          </div>
        </div>
      </section>

      {/* Tiers */}
      <section className="pb-16 md:pb-24">
        <div className="max-w-[1100px] mx-auto px-6 md:px-12">
          <div className="grid md:grid-cols-3 gap-6">
            {tiers.map((tier) => {
              const price = annual ? tier.annual : tier.monthly;
              const period = annual ? "/yr" : "/mo";
              const savings = annual
                ? tier.monthly * 12 - tier.annual
                : 0;

              return (
                <div
                  key={tier.name}
                  className={`bg-surface border rounded-xl p-6 md:p-8 flex flex-col ${
                    tier.highlight
                      ? "border-blue/50 ring-1 ring-blue/20"
                      : "border-border"
                  }`}
                >
                  {/* Header */}
                  <div className="mb-6">
                    <div className="flex items-center gap-2 mb-2">
                      <h2 className="font-bold text-white text-xl">
                        {tier.name}
                      </h2>
                      {tier.badge && (
                        <span className="text-[10px] uppercase tracking-wider font-semibold text-blue bg-blue/10 px-2 py-0.5 rounded-full">
                          {tier.badge}
                        </span>
                      )}
                    </div>
                    <div className="flex items-baseline gap-1 mb-3">
                      <span className="text-3xl font-bold text-white">
                        ${price.toLocaleString()}
                      </span>
                      <span className="text-sm text-muted">{period}</span>
                    </div>
                    {annual && savings > 0 && (
                      <p className="text-xs text-green font-medium">
                        Save ${savings.toLocaleString()} vs monthly
                      </p>
                    )}
                    <p className="text-sm text-muted leading-relaxed mt-3">
                      {tier.description}
                    </p>
                  </div>

                  {/* Who it's for */}
                  <div className="bg-background/50 border border-border rounded-lg p-4 mb-6">
                    <p className="text-xs text-dim uppercase tracking-wider mb-1.5">
                      Who it&apos;s for
                    </p>
                    <p className="text-sm text-foreground leading-relaxed">
                      {tier.who}
                    </p>
                  </div>

                  {/* Features */}
                  <div className="space-y-4 mb-8 flex-1">
                    {tier.features.map((feature) => (
                      <div key={feature.label}>
                        <div className="flex items-start gap-2">
                          <span className="text-green shrink-0 mt-0.5 text-sm">
                            &#x2713;
                          </span>
                          <div>
                            <p className="text-sm font-medium text-white">
                              {feature.label}
                            </p>
                            <p className="text-xs text-muted leading-relaxed mt-0.5">
                              {feature.detail}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* CTA */}
                  <a
                    href={tier.ctaUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`block text-center font-semibold text-sm py-3.5 rounded-lg transition-all ${
                      tier.highlight
                        ? "bg-blue text-black hover:brightness-110"
                        : "bg-white/10 text-white hover:bg-white/15"
                    }`}
                  >
                    {tier.cta}
                  </a>
                </div>
              );
            })}
          </div>

          {/* Guarantee */}
          <div className="mt-12 text-center">
            <div className="inline-flex items-start gap-3 bg-surface border border-border rounded-xl px-6 py-4 max-w-[600px] text-left">
              <span className="text-2xl shrink-0">&#x1F6E1;</span>
              <div>
                <p className="font-semibold text-white text-sm mb-1">
                  No lock-in. Your data is yours.
                </p>
                <p className="text-xs text-muted leading-relaxed">
                  Start with 5 extractions + 3 content outputs free. No credit card.
                  Cancel anytime — month-to-month, no contracts. Your reference
                  files are plain markdown in your own repository. You keep
                  everything you built.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ mini */}
      <section className="pb-10 md:pb-16">
        <div className="max-w-[600px] mx-auto px-6 md:px-12 text-center">
          <div className="bg-surface border border-border rounded-xl p-6 md:p-8">
            <h3 className="font-bold text-white text-lg mb-2">Questions?</h3>
            <p className="text-muted text-sm mb-4">
              Not sure which tier is right for you?
            </p>
            <a
              href="https://codify.build/#faq"
              className="text-blue text-sm hover:underline"
            >
              Check the FAQ
            </a>
            <span className="text-dim text-sm mx-3">or</span>
            <a
              href="mailto:hello@codify.build"
              className="text-blue text-sm hover:underline"
            >
              hello@codify.build
            </a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 border-t border-border">
        <div className="max-w-[1000px] mx-auto px-6 md:px-12 text-center">
          <span className="text-xs text-dim">
            &copy; {new Date().getFullYear()} Codify &middot; Context &gt;
            Prompts.
          </span>
        </div>
      </footer>
    </main>
  );
}
