"use client";

import { useState, FormEvent } from "react";

// Replace with your GHL webhook URL
const WEBHOOK_URL = "https://YOUR_GHL_WEBHOOK_URL_HERE";

const prereqs = [
  {
    name: "Claude Pro",
    description: "Codify runs on Claude Code, which requires an Anthropic Claude Pro subscription.",
    price: "$20/mo",
    url: "https://claude.ai/settings/billing",
    linkLabel: "Get Claude Pro",
  },
  {
    name: "Claude Code",
    description: "The AI engine that powers your vault. Install via terminal after signing up for Claude Pro.",
    price: "Included with Pro",
    url: "https://docs.anthropic.com/en/docs/claude-code/overview",
    linkLabel: "Install Claude Code",
  },
  {
    name: "Obsidian",
    description: "Your private knowledge base. Runs locally — your data never leaves your device.",
    price: "Free",
    url: "https://obsidian.md/download",
    linkLabel: "Download Obsidian",
  },
];

const steps = [
  {
    number: "01",
    title: "Download the Codify Vault",
    description:
      "Clone or download the pre-configured vault with all skills, context templates, and the compounding architecture ready to go.",
    action: {
      label: "Get the Vault",
      url: "https://github.com/codify-build/codify-trial-vault",
      external: true,
    },
    details: [
      "Pre-built context templates: soul.md, offer.md, audience.md, voice.md",
      "Full skill library included",
      "Powered by Claude — no lock-in, your files work with any AI",
    ],
  },
  {
    number: "02",
    title: "Open in Obsidian",
    description:
      "Open the vault folder in Obsidian. This is your command centre — all your context, decisions, research, and outputs live here.",
    action: {
      label: "Download Obsidian",
      url: "https://obsidian.md/download",
      external: true,
    },
    details: [
      "Available on Mac, Windows, Linux, iOS, and Android",
      "Free for personal use",
      "Your data stays on your machine",
    ],
  },
  {
    number: "03",
    title: "Launch Claude Code & Run /start",
    description:
      "Open your terminal, navigate to the vault folder, and run 'claude'. Then type /start — the system walks you through your first extraction.",
    action: {
      label: "Claude Code Setup Guide",
      url: "https://docs.anthropic.com/en/docs/claude-code/overview",
      external: true,
    },
    details: [
      "Requires Claude Pro ($20/mo) — sign up at claude.ai",
      "Install: npm install -g @anthropic-ai/claude-code",
      "Guided first extraction in under 30 minutes",
      "3 free extractions on the Explore tier",
    ],
  },
];

const tiers = [
  {
    name: "Explore",
    price: "Free",
    description: "Test the system. 3 extractions to prove it works.",
    skills: ["/start", "/extract (3x)", "/import", "/audit"],
  },
  {
    name: "Build",
    price: "$99/mo",
    description: "Full thinking engine. Research, content, and codification.",
    skills: ["/extract", "/import", "/enrich", "/content", "/research", "/brief"],
  },
  {
    name: "Pro",
    price: "$199/mo",
    description: "Full output library. Client ready from day one.",
    skills: ["/ad", "/email", "/landing", "/proposal", "/pitch", "/case-study", "+ more"],
  },
  {
    name: "VIP",
    price: "$497/mo",
    description: "Sovereign Vault. Done-for-you. Autonomous operations.",
    skills: ["/publish", "/campaign", "/repurpose", "+ Sovereign Vault"],
  },
];

export default function GetStarted() {
  const [unlocked, setUnlocked] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitting(true);
    setError("");

    const form = e.currentTarget;
    const data = {
      firstName: (form.elements.namedItem("firstName") as HTMLInputElement).value,
      lastName: (form.elements.namedItem("lastName") as HTMLInputElement).value,
      email: (form.elements.namedItem("email") as HTMLInputElement).value,
      phone: (form.elements.namedItem("phone") as HTMLInputElement).value,
      source: "codify.build/get-started",
      tags: ["free-trial", "website"],
    };

    try {
      await fetch(WEBHOOK_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        mode: "no-cors",
      });
      setUnlocked(true);
    } catch {
      // If webhook fails, still unlock — don't block the user
      setUnlocked(true);
    } finally {
      setSubmitting(false);
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
      <section className="pt-28 pb-12 md:pt-36 md:pb-16">
        <div className="max-w-[700px] mx-auto px-6 md:px-12 text-center">
          <p className="text-xs tracking-[0.2em] uppercase text-blue mb-4">
            GET STARTED
          </p>
          <h1
            className="font-bold text-white leading-[1.1] mb-4"
            style={{ fontSize: "var(--text-4xl)" }}
          >
            {unlocked ? "You're In." : "Start Your Free Trial"}
          </h1>
          <p className="text-muted text-lg leading-relaxed">
            {unlocked
              ? "Follow the steps below to set up your vault."
              : "Enter your details to get instant access to the Codify vault."}
          </p>
        </div>
      </section>

      {/* Lead capture form — shown before unlock */}
      {!unlocked && (
        <section className="pb-16 md:pb-20">
          <div className="max-w-[480px] mx-auto px-6 md:px-12">
            <form
              onSubmit={handleSubmit}
              className="bg-surface border border-border rounded-xl p-8 space-y-5"
            >
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label
                    htmlFor="firstName"
                    className="block text-xs text-muted mb-1.5"
                  >
                    First name
                  </label>
                  <input
                    id="firstName"
                    name="firstName"
                    type="text"
                    required
                    className="w-full bg-background border border-border rounded-lg px-4 py-3 text-sm text-white placeholder:text-dim outline-none focus:border-blue transition-colors"
                    placeholder="Mike"
                  />
                </div>
                <div>
                  <label
                    htmlFor="lastName"
                    className="block text-xs text-muted mb-1.5"
                  >
                    Last name
                  </label>
                  <input
                    id="lastName"
                    name="lastName"
                    type="text"
                    required
                    className="w-full bg-background border border-border rounded-lg px-4 py-3 text-sm text-white placeholder:text-dim outline-none focus:border-blue transition-colors"
                    placeholder="Scott"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="email"
                  className="block text-xs text-muted mb-1.5"
                >
                  Email
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  className="w-full bg-background border border-border rounded-lg px-4 py-3 text-sm text-white placeholder:text-dim outline-none focus:border-blue transition-colors"
                  placeholder="mike@example.com"
                />
              </div>

              <div>
                <label
                  htmlFor="phone"
                  className="block text-xs text-muted mb-1.5"
                >
                  Phone (for WhatsApp support)
                </label>
                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  required
                  className="w-full bg-background border border-border rounded-lg px-4 py-3 text-sm text-white placeholder:text-dim outline-none focus:border-blue transition-colors"
                  placeholder="+44 7700 900000"
                />
              </div>

              {error && (
                <p className="text-red text-xs">{error}</p>
              )}

              <button
                type="submit"
                disabled={submitting}
                className="w-full bg-blue text-black font-semibold text-sm py-3.5 rounded-lg hover:brightness-110 transition-all disabled:opacity-50"
              >
                {submitting ? "Setting up..." : "Get Free Access"}
              </button>

              <p className="text-[11px] text-dim text-center">
                Your data stays yours. We only use this to set up your account
                and provide WhatsApp support.
              </p>
            </form>
          </div>
        </section>
      )}

      {/* Steps — shown after unlock */}
      {unlocked && (
        <>
          {/* Prerequisites */}
          <section className="pb-12 md:pb-16">
            <div className="max-w-[800px] mx-auto px-6 md:px-12">
              <h2 className="font-bold text-white text-lg mb-6">
                What You Need
              </h2>
              <div className="grid sm:grid-cols-3 gap-4">
                {prereqs.map((req) => (
                  <div
                    key={req.name}
                    className="bg-surface border border-border rounded-xl p-5"
                  >
                    <div className="flex items-baseline justify-between mb-2">
                      <h3 className="font-semibold text-white text-sm">
                        {req.name}
                      </h3>
                      <span className="text-xs text-blue font-semibold">
                        {req.price}
                      </span>
                    </div>
                    <p className="text-xs text-muted leading-relaxed mb-3">
                      {req.description}
                    </p>
                    <a
                      href={req.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-blue hover:underline"
                    >
                      {req.linkLabel} &rarr;
                    </a>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Steps */}
          <section className="pb-16 md:pb-20">
            <div className="max-w-[800px] mx-auto px-6 md:px-12">
              <h2 className="font-bold text-white text-lg mb-6">
                Setup Steps
              </h2>
              <div className="space-y-8">
                {steps.map((step) => (
                  <div
                    key={step.number}
                    className="bg-surface border border-border rounded-xl p-8"
                  >
                    <div className="flex items-start gap-6">
                      <div className="text-4xl font-bold text-white/10 shrink-0">
                        {step.number}
                      </div>
                      <div className="flex-1">
                        <h2 className="font-bold text-white text-xl mb-2">
                          {step.title}
                        </h2>
                        <p className="text-muted text-sm leading-relaxed mb-4">
                          {step.description}
                        </p>

                        <ul className="space-y-2 mb-6">
                          {step.details.map((detail) => (
                            <li
                              key={detail}
                              className="flex items-start gap-2 text-sm"
                            >
                              <span className="text-green shrink-0 mt-0.5">
                                &#x2713;
                              </span>
                              <span className="text-foreground">{detail}</span>
                            </li>
                          ))}
                        </ul>

                        {"comingSoon" in step.action && step.action.comingSoon ? (
                          <span className="inline-flex items-center text-sm text-dim border border-border px-5 py-2.5 rounded-lg">
                            {step.action.label} — Coming Soon
                          </span>
                        ) : (
                          <a
                            href={step.action.url}
                            target={step.action.external ? "_blank" : undefined}
                            rel={
                              step.action.external
                                ? "noopener noreferrer"
                                : undefined
                            }
                            className="inline-flex items-center gap-2 text-sm font-semibold bg-blue text-black px-5 py-2.5 rounded-lg hover:brightness-110 transition-all"
                          >
                            {step.action.label}
                            {step.action.external && (
                              <svg
                                width="14"
                                height="14"
                                viewBox="0 0 16 16"
                                fill="none"
                              >
                                <path
                                  d="M6 3h7v7M13 3L3 13"
                                  stroke="currentColor"
                                  strokeWidth="2"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                />
                              </svg>
                            )}
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Tier quick reference */}
          <section className="pb-16 md:pb-20 border-t border-border pt-16 md:pt-20">
            <div className="max-w-[900px] mx-auto px-6 md:px-12">
              <div className="text-center mb-12">
                <h2
                  className="font-bold text-white mb-3"
                  style={{ fontSize: "var(--text-2xl)" }}
                >
                  What You Get at Each Tier
                </h2>
                <p className="text-muted text-sm">
                  Start free. Upgrade when the compounding kicks in.
                </p>
              </div>

              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {tiers.map((tier) => (
                  <div
                    key={tier.name}
                    className="bg-surface border border-border rounded-xl p-5"
                  >
                    <div className="flex items-baseline justify-between mb-2">
                      <h3 className="font-semibold text-white">{tier.name}</h3>
                      <span className="text-sm text-blue font-semibold">
                        {tier.price}
                      </span>
                    </div>
                    <p className="text-xs text-muted mb-4 leading-relaxed">
                      {tier.description}
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {tier.skills.map((skill) => (
                        <span
                          key={skill}
                          className="font-mono text-[11px] text-green bg-green/10 border border-green/20 px-2 py-0.5 rounded"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        </>
      )}

      {/* Help */}
      <section className="pb-16 md:pb-20">
        <div className="max-w-[600px] mx-auto px-6 md:px-12 text-center">
          <div className="bg-surface border border-border rounded-xl p-8">
            <h3 className="font-bold text-white text-lg mb-2">Need Help?</h3>
            <p className="text-muted text-sm mb-4">
              Stuck on setup or have questions about which tier is right for you?
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
