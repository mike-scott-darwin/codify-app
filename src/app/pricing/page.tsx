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
    cta: "Get Snapshot",
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
        label: "Done-for-you vault build and operations",
        detail:
          "We extract your expertise, build your vault, and run it. You get outputs from day one.",
      },
      {
        label: "Content that sounds like you",
        detail:
          "Ads, emails, proposals, landing pages — all in your voice, grounded in your real business knowledge.",
      },
      {
        label: "AI assistant on WhatsApp",
        detail:
          "Ask questions, request drafts, queue research — all from your phone. Answers grounded in your vault.",
      },
      {
        label: "Overnight research + daily briefing",
        detail:
          "Queue topics, results land by morning. Daily summary of what changed and what needs attention.",
      },
      {
        label: "CRM, competitor tracking + monthly Brain Sync",
        detail:
          "Connected to GoHighLevel. Competitor monitoring. Monthly vault review keeps your AI current.",
      },
      {
        label: "Priority support + scheduled strategy calls",
        detail:
          "4-hour WhatsApp response on weekdays. Scheduled calls to review performance and plan campaigns.",
      },
    ],
    cta: "Join Codify",
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
  const [loading, setLoading] = useState(false);

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
          tier: "codify",
          billing: annual ? "annual" : "monthly",
        }),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      }
    } finally {
      setLoading(false);
    }
  }

  const price = annual ? codify.annual : codify.monthly;
  const period = annual ? "/yr" : "/mo";
  const savings = annual ? codify.monthly * 12 - codify.annual : 0;

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
            Start with the Opportunity Scan — free, no commitment.
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
                  {codify.description}
                </p>
              </div>

              <div className="bg-background/50 border border-border rounded-lg p-4 mb-6">
                <p className="text-xs text-dim uppercase tracking-wider mb-1.5">
                  Who it&apos;s for
                </p>
                <p className="text-sm text-foreground leading-relaxed">
                  {codify.who}
                </p>
              </div>

              <div className="space-y-4 mb-8 flex-1">
                {codify.features.map((feature) => (
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

              <button
                onClick={handleCheckout}
                disabled={loading}
                className="block w-full text-center font-semibold text-sm py-3.5 rounded-lg transition-all cursor-pointer disabled:opacity-60 bg-blue text-black hover:brightness-110"
              >
                {loading ? "Redirecting..." : "Join Codify"}
              </button>
            </div>

            {/* Orchestrate */}
            <div className="bg-surface border border-border rounded-xl p-6 md:p-8 flex flex-col">
              <div className="mb-6">
                <div className="flex items-center gap-2 mb-2">
                  <h2 className="font-bold text-white text-xl">
                    {orchestrate.name}
                  </h2>
                  <span className="text-[10px] uppercase tracking-wider font-semibold text-blue bg-blue/10 px-2 py-0.5 rounded-full">
                    {orchestrate.badge}
                  </span>
                </div>
                <div className="flex items-baseline gap-1 mb-3">
                  <span className="text-3xl font-bold text-white">
                    Custom
                  </span>
                </div>
                <p className="text-sm text-muted leading-relaxed mt-3">
                  {orchestrate.description}
                </p>
              </div>

              <div className="bg-background/50 border border-border rounded-lg p-4 mb-6">
                <p className="text-xs text-dim uppercase tracking-wider mb-1.5">
                  Who it&apos;s for
                </p>
                <p className="text-sm text-foreground leading-relaxed">
                  {orchestrate.who}
                </p>
              </div>

              <div className="space-y-4 mb-8 flex-1">
                {orchestrate.features.map((feature) => (
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

              <a
                href="mailto:hello@codify.build?subject=Orchestrate%20Inquiry"
                className="block w-full text-center font-semibold text-sm py-3.5 rounded-lg transition-all bg-white/10 text-white hover:bg-white/15"
              >
                Talk to Michael
              </a>
            </div>
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
                  Start with a free Opportunity Scan — no credit card, no commitment.
                  Codify is month-to-month, cancel anytime.
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
