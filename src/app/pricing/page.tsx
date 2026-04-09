"use client";

import { useState } from "react";

const tiers = [
  {
    name: "Snapshot",
    key: "snapshot",
    badge: "One-Time",
    monthly: 97,
    annual: 0,
    description:
      "Your identity, voice, and audience — extracted and structured in one session. Yours to keep.",
    who: "For business owners who want to see what structured context does for their AI outputs — before committing to the full engine. One session, one payment, yours forever.",
    features: [
      {
        label: "20-minute extraction session",
        detail:
          "Send a voice note via WhatsApp, jump on a quick call, or write a summary. Whatever's easiest. We ask specific questions designed to pull out what matters.",
      },
      {
        label: "Soul + Voice + Audience files",
        detail:
          "Three structured documents capturing your core identity, communication style, and buyer profile. The same format used by our full Codify clients.",
      },
      {
        label: "Polished snapshot document",
        detail:
          "A standalone deliverable synthesizing all three files. Hand it to any team member or paste it into any AI tool for immediate results.",
      },
      {
        label: "Works with any AI tool",
        detail:
          "Paste your Voice file into ChatGPT, Claude, or any AI before writing anything. Your outputs immediately stop sounding generic.",
      },
      {
        label: "Delivered in 48 hours",
        detail:
          "From your input to your inbox. No waiting weeks. No onboarding calls. Just your expertise, structured.",
      },
      {
        label: "Yours to keep — no strings attached",
        detail:
          "The snapshot is yours regardless of whether you upgrade. Use it however you want. No subscription required.",
      },
    ],
    cta: "Get Your Snapshot — $97",
    highlight: false,
  },
  {
    name: "Codify",
    key: "codify",
    badge: "Managed",
    monthly: 497,
    annual: 2997,
    description:
      "We extract your expertise, build your sovereign vault, and run the agent for you. Done-for-you. You get outputs — we handle the rest.",
    who: "For established business owners who want AI that actually knows their business — with everything built, run, and maintained for them. WhatsApp assistant, overnight research, daily briefings, and priority support.",
    features: [
      {
        label: "Done-for-you build and operations",
        detail:
          "We extract your expertise through guided conversations, build your vault, and run the agent. You get outputs from day one without touching the setup.",
      },
      {
        label: "Content that sounds like you",
        detail:
          "Generate ads, emails, proposals, landing pages, and funnels in your voice. Every piece is informed by your real business knowledge, not templates.",
      },
      {
        label: "Track your competitors",
        detail:
          "Automatically monitor competitor ads, websites, and social profiles. See what they're doing and where the gaps are in your market.",
      },
      {
        label: "AI assistant on WhatsApp",
        detail:
          "An AI assistant on your phone that knows your business before it responds. Send a message or voice note, get answers grounded in your expertise. Request research, review drafts, or ask strategic questions — all from WhatsApp.",
      },
      {
        label: "Research runs while you sleep",
        detail:
          "Queue research topics via WhatsApp. Results are ready by morning. Your business intelligence compounds while you sleep.",
      },
      {
        label: "Daily Briefing",
        detail:
          "Morning summary delivered to WhatsApp at 7am. What's new, what needs attention, and what opportunities came up — before your first coffee.",
      },
      {
        label: "Monthly Brain Sync",
        detail:
          "We review your vault every month — updating stale context, adding new decisions, and ensuring your AI stays current with your business.",
      },
      {
        label: "CRM connected",
        detail:
          "Linked to GoHighLevel — create contacts, send emails, manage your pipeline, trigger workflows, and book meetings. All connected to your business knowledge.",
      },
      {
        label: "Priority WhatsApp support (4h response) + scheduled calls",
        detail:
          "Priority WhatsApp support with 4-hour response time on weekdays. Scheduled strategy calls to review performance and plan campaigns.",
      },
    ],
    cta: "Find My Missing Revenue",
    highlight: true,
  },
  {
    name: "Orchestrate",
    key: "orchestrate",
    badge: "Autonomous Agents",
    monthly: 2997,
    annual: 0,
    description:
      "We build your orchestrator and deploy a specialised agent team — Strategy, Brand, GTM, Sales, and more — running from your sovereign vault with guardrails you control.",
    who: "For executives who want an autonomous team of AI agents running their business operations — strategy, brand, marketing, sales — on sovereign infrastructure they own. By application only.",
    features: [
      {
        label: "Everything in Codify",
        detail: "All capabilities, integrations, and support included.",
      },
      {
        label: "Autonomous agent team",
        detail:
          "8+ specialised AI workers — Strategy, Brand, GTM, Sales, Product, Engineering, Client Success, Research — each reading your vault, working in parallel.",
      },
      {
        label: "Orchestrator with guardrails",
        detail:
          "An AI orchestrator routes tasks to the right specialist agent and enforces your brand, content, and operational guardrails. You set the direction, the team executes.",
      },
      {
        label: "Sovereign infrastructure",
        detail:
          "Private server, your domain, your jurisdiction. Optional non-US data sovereignty (Switzerland/Finland). Your IP never trains anyone else's AI.",
      },
      {
        label: "Self-hosted git",
        detail:
          "Forgejo, not GitHub. Full zero-knowledge architecture. Your business knowledge lives on infrastructure you control.",
      },
      {
        label: "Human-in-the-Loop",
        detail:
          "All outputs require your sign-off before publishing. Full audit trail. Nothing goes live without your approval.",
      },
      {
        label: "Encrypted off-site backups",
        detail:
          "Automated, auditable backups to encrypted off-site storage. Your vault survives anything.",
      },
      {
        label: "White-glove handover",
        detail:
          "2-hour walkthrough of your sovereign stack. You understand everything that's running and how to control it.",
      },
    ],
    cta: "Talk to Michael",
    highlight: false,
  },
];

export default function Pricing() {
  const [annual, setAnnual] = useState(false);
  const [loading, setLoading] = useState<string | null>(null);

  async function handleCheckout(tierKey: string) {
    if (tierKey === "orchestrate") {
      window.location.href = "mailto:hello@codify.build?subject=Orchestrate%20Tier";
      return;
    }
    if (tierKey === "snapshot") {
      // Snapshot is always one-time payment
      setLoading(tierKey);
      try {
        const res = await fetch("/api/checkout", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ tier: tierKey, billing: "monthly" }),
        });
        const data = await res.json();
        if (data.url) {
          window.location.href = data.url;
        }
      } finally {
        setLoading(null);
      }
      return;
    }
    setLoading(tierKey);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tier: tierKey,
          billing: annual ? "annual" : "monthly",
        }),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      }
    } finally {
      setLoading(null);
    }
  }

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
            Four levels. One compounding vault.
          </h1>
          <p className="text-muted text-base md:text-lg leading-relaxed mb-8">
            Start with the Opportunity Assessment — free, no commitment.
            Upgrade when the system proves itself.
          </p>

          {/* Toggle - only for Codify tier */}
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
              <span className="ml-1.5 text-[11px] opacity-80">Save 50%</span>
            </button>
          </div>
        </div>
      </section>

      {/* Tiers */}
      <section className="pb-16 md:pb-24">
        <div className="max-w-[1100px] mx-auto px-6 md:px-12">
          <div className="grid md:grid-cols-3 gap-6 max-w-[1100px] mx-auto">
            {tiers.map((tier) => {
              const isOrchestrate = tier.key === "orchestrate";
              const isSnapshot = tier.key === "snapshot";
              const price = isOrchestrate || isSnapshot
                ? tier.monthly
                : annual
                ? tier.annual
                : tier.monthly;
              const period = isOrchestrate
                ? "/mo"
                : isSnapshot
                ? ""
                : annual
                ? "/yr"
                : "/mo";
              const savings =
                !isOrchestrate && !isSnapshot && annual
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
                    {isOrchestrate && (
                      <p className="text-xs text-muted font-medium">
                        + $5,000 one-time setup
                      </p>
                    )}
                    {savings > 0 && (
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
                  <button
                    onClick={() => handleCheckout(tier.key)}
                    disabled={loading === tier.key}
                    className={`block w-full text-center font-semibold text-sm py-3.5 rounded-lg transition-all cursor-pointer disabled:opacity-60 ${
                      tier.highlight
                        ? "bg-blue text-black hover:brightness-110"
                        : "bg-white/10 text-white hover:bg-white/15"
                    }`}
                  >
                    {loading === tier.key ? "Redirecting..." : tier.cta}
                  </button>
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
                  Try it free — no credit card, no commitment.
                  Cancel anytime — month-to-month, no contracts.
                  Everything we build is yours — stored securely, readable by any AI.
                  You keep everything.
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
            &copy; {new Date().getFullYear()} Codify &middot; Your expertise, structured. Your AI, transformed.
          </span>
        </div>
      </footer>
    </main>
  );
}
