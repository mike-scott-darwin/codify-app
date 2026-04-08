"use client";

import { useState } from "react";

const codify = {
  name: "Codify",
  key: "codify",
  badge: "Managed Service",
  monthly: 497,
  annual: 2997,
  description:
    "We extract your expertise, structure it into a sovereign vault, and build the compounding architecture that makes any AI tool work for your business.",
  who: "For business owners who want their expertise extracted, structured, and built into a system that compounds — so every AI tool they use actually knows their business.",
  features: [
    {
      label: "Done-for-you build",
      detail:
        "We extract your expertise through guided conversations, structure it into your vault, and deploy the full architecture. You're producing results from day one.",
    },
    {
      label: "Context extraction interviews",
      detail:
        "We pull out what's in your head — your offer, audience, voice, beliefs, process, objection handling — through structured conversations designed to capture what matters.",
    },
    {
      label: "Sovereign vault",
      detail:
        "Structured files you own, portable to any AI tool (Claude, GPT, Gemini). Your expertise lives in one place and powers everything downstream.",
    },
    {
      label: "Compounding architecture",
      detail:
        "Every session builds on the last. New wins, new positioning, new insights — all captured and layered into your vault. Nothing starts from scratch.",
    },
    {
      label: "AI assistant on WhatsApp",
      detail:
        "An AI assistant on your phone grounded in your vault. Voice notes, quick questions, strategic research — all from WhatsApp.",
    },
    {
      label: "90% accurate first drafts",
      detail:
        "Because AI reads your full context before generating anything. Ads, proposals, emails, content — all sound like you on the first pass.",
    },
    {
      label: "Monthly Brain Sync",
      detail:
        "Keeps your context fresh as your business evolves. New offers, new wins, new positioning — all captured and compounding.",
    },
    {
      label: "No platform lock-in",
      detail:
        "Plain files in your own secure storage, readable by any AI. You keep everything. Your system works regardless of which tools you use.",
    },
    {
      label: "Priority WhatsApp (4h response) + scheduled calls",
      detail:
        "Priority WhatsApp support with 4-hour response time on weekdays. Scheduled strategy calls to review your architecture and plan next steps.",
    },
  ],
  highlight: true,
};

const orchestrate = {
  name: "Orchestrate",
  badge: "By Application",
  description:
    "We build the full sovereign infrastructure — your vault, your orchestrator, your agent team — on hardware you own. You control everything.",
  who: "For established businesses that want the full architecture built on their own sovereign infrastructure — private server, agent team, orchestrator — all under their control.",
  features: [
    {
      label: "Everything in Codify",
      detail: "Full vault build, context extraction, compounding architecture, and ongoing support.",
    },
    {
      label: "Orchestrator architecture",
      detail:
        "Routes tasks to specialist agents with guardrails you define. Enforces brand, content, and operational standards automatically.",
    },
    {
      label: "Agent team deployment",
      detail:
        "Strategy, Brand, GTM, Sales, Product, Research agents — each reads your vault and works in parallel. We build and deploy them on your infrastructure.",
    },
    {
      label: "Sovereign infrastructure",
      detail:
        "Private server on your domain, your jurisdiction. Optional non-US data sovereignty (Switzerland/Finland). Fully encrypted.",
    },
    {
      label: "Human-in-the-loop approval",
      detail:
        "Nothing publishes without your sign-off. You set direction, the architecture executes.",
    },
    {
      label: "Zero-knowledge architecture",
      detail:
        "Your data never leaves your infrastructure. No shared servers, no third-party access, no training on your content.",
    },
    {
      label: "Encrypted off-site backups",
      detail:
        "Automated, auditable, off-site. Your business knowledge is protected and recoverable.",
    },
    {
      label: "White-glove handover",
      detail:
        "2-hour walkthrough of your sovereign stack. We don't just build it — we make sure you understand every piece.",
    },
  ],
  highlight: false,
};

export default function Pricing() {
  const [annual, setAnnual] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleCheckout() {
    setLoading(true);
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
            Same system. More depth.
          </h1>
          <p className="text-muted text-base md:text-lg leading-relaxed mb-8">
            Start with the Opportunity Scan — free, no commitment.
            Upgrade when the system proves itself.
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
              <span className="ml-1.5 text-[11px] opacity-80">Save 50%</span>
            </button>
          </div>
        </div>
      </section>

      {/* Tiers */}
      <section className="pb-16 md:pb-24">
        <div className="max-w-[1100px] mx-auto px-6 md:px-12">
          <div className="grid md:grid-cols-2 gap-6 max-w-[800px] mx-auto">
            {/* Codify */}
            <div className="bg-surface border border-blue/50 ring-1 ring-blue/20 rounded-xl p-6 md:p-8 flex flex-col">
              <div className="mb-6">
                <div className="flex items-center gap-2 mb-2">
                  <h2 className="font-bold text-white text-xl">
                    {codify.name}
                  </h2>
                  <span className="text-[10px] uppercase tracking-wider font-semibold text-blue bg-blue/10 px-2 py-0.5 rounded-full">
                    {codify.badge}
                  </span>
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
