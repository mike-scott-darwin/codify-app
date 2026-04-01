"use client";

import { useState } from "react";

const tiers = [
  {
    name: "Pro",
    key: "pro",
    badge: "Most Popular",
    monthly: 199,
    annual: 1497,
    description:
      "Full access. We codify your expertise and you generate ads, proposals, emails, and websites that sound like you — not a machine.",
    who: "For business owners who want AI that actually knows their business — generating ads that convert, proposals that close, and finding leads that match their ideal client.",
    features: [
      {
        label: "Capture your expertise",
        detail:
          "We interview your business through guided conversations — your offer, audience, voice, and beliefs — and turn it into documents AI can actually use.",
      },
      {
        label: "Content that sounds like you",
        detail:
          "Generate blog posts, social content, and newsletters that match your voice. Every piece is informed by your real business knowledge, not templates.",
      },
      {
        label: "Track your competitors",
        detail:
          "Automatically monitor competitor ads, websites, and social profiles. See what they're doing and where the gaps are in your market.",
      },
      {
        label: "Ads, emails, proposals, funnels — first drafts in minutes",
        detail:
          "Generate client-ready deliverables in your voice. Ads, emails, landing pages, proposals, pitch decks, and full funnels — all from your business knowledge.",
      },
      {
        label: "Case studies, follow-ups, objection handling",
        detail:
          "Turn client wins into proof. Draft post-meeting follow-ups. Handle sales objections using your actual expertise and track record.",
      },
      {
        label: "Full website from your business knowledge",
        detail:
          "Generate a complete, deployable website built from your expertise. The codify.build site was built this exact way.",
      },
      {
        label: "Find and qualify leads",
        detail:
          "Prospects matched against your ideal client profile, scored 1-10, with personalised outreach drafted in your voice. Pushed straight to your CRM.",
      },
      {
        label: "CRM connected",
        detail:
          "Linked to GoHighLevel — create contacts, send emails, manage your pipeline, trigger workflows, and book meetings. All connected to your business knowledge.",
      },
      {
        label: "Onboarding + same-day WhatsApp support",
        detail:
          "Guided setup to get you producing results in the first session. Same-day WhatsApp responses for questions and troubleshooting.",
      },
    ],
    cta: "Start with Pro",
    highlight: true,
  },
  {
    name: "VIP",
    key: "vip",
    badge: "Done For You",
    monthly: 497,
    annual: 2997,
    description:
      "We build it, run it, and maintain it for you — on infrastructure you own. You get results without touching the system.",
    who: "For established businesses that want the full system built and run for them — AI assistant on WhatsApp, overnight research, daily briefings, and everything on private infrastructure they control.",
    features: [
      {
        label: "Everything in Pro",
        detail: "All capabilities, integrations, and support included.",
      },
      {
        label: "Done-for-you build",
        detail:
          "We capture your expertise, build your system, and tune everything to your business. You're producing results from day one without touching the setup.",
      },
      {
        label: "Publish and distribute everywhere",
        detail:
          "Push content to every channel at once. One request can generate and distribute a full campaign across email, social, ads, and your website.",
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
        label: "Private infrastructure you own",
        detail:
          "Your business knowledge lives on a private server that you control. Encrypted, full audit trail, instant access revocation. Your IP never trains anyone else's AI.",
      },
      {
        label: "Priority WhatsApp (4h response) + scheduled calls",
        detail:
          "Priority WhatsApp support with 4-hour response time on weekdays. Scheduled strategy calls to review performance and plan campaigns.",
      },
    ],
    cta: "Start with VIP",
    highlight: false,
  },
];

export default function Pricing() {
  const [annual, setAnnual] = useState(false);
  const [loading, setLoading] = useState<string | null>(null);

  async function handleCheckout(tierKey: string) {
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
    } catch {
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
            Start Free. Scale When Ready.
          </h1>
          <p className="text-muted text-base md:text-lg leading-relaxed mb-8">
            See what AI does when it actually knows your business.
            Free trial, no credit card. Your files are always yours.
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
          <div className="grid md:grid-cols-2 gap-6 max-w-[800px] mx-auto">
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
            &copy; {new Date().getFullYear()} Codify &middot; Context &gt;
            Prompts.
          </span>
        </div>
      </footer>
    </main>
  );
}
