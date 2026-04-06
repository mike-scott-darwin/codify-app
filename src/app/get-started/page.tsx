"use client";

import { useState, FormEvent } from "react";

const LEAD_API = "/api/lead";

export default function GetStarted() {
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [submitted, setSubmitted] = useState(false);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitting(true);
    setError("");

    const form = e.currentTarget;
    const data = {
      firstName: (form.elements.namedItem("firstName") as HTMLInputElement)
        .value,
      lastName: (form.elements.namedItem("lastName") as HTMLInputElement).value,
      email: (form.elements.namedItem("email") as HTMLInputElement).value,
      phone: (form.elements.namedItem("phone") as HTMLInputElement).value,
      businessSummary: (
        form.elements.namedItem("businessSummary") as HTMLTextAreaElement
      ).value,
      source: "codify.build/get-started",
      tags: ["opportunity-scan", "website"],
    };

    try {
      const res = await fetch(LEAD_API, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        setError(err.error || "Something went wrong. Please try again.");
        setSubmitting(false);
        return;
      }

      setSubmitted(true);
    } catch {
      setSubmitted(true);
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
            OPPORTUNITY SCAN
          </p>
          <h1 className="font-bold text-white leading-[1.1] mb-4 text-[clamp(1.75rem,5vw,2.5rem)]">
            We&apos;ll Find 3 Opportunities{"\n"}Your Competitors Haven&apos;t
            Seen
          </h1>
          <p className="text-muted text-base md:text-lg leading-relaxed">
            Send us a paragraph about your business. We&apos;ll scan your
            market, cross-reference your positioning, and deliver 3 specific
            opportunities — free, in 24–48 hours.
          </p>
        </div>
      </section>

      {/* Form */}
      <section className="pb-16 md:pb-24">
        <div className="max-w-[480px] mx-auto px-6 md:px-12">
          {submitted ? (
            <div className="bg-surface border border-green/30 rounded-xl p-6 md:p-8 text-center">
              <p className="text-2xl mb-3">&#x2713;</p>
              <h2 className="font-bold text-white text-xl mb-2">
                We&apos;re on it.
              </h2>
              <p className="text-muted text-sm leading-relaxed">
                Your opportunity scan is being prepared. You&apos;ll receive
                your 3 opportunities within 24–48 hours via email.
              </p>
            </div>
          ) : (
            <div className="bg-surface border border-blue/30 rounded-xl p-6 md:p-8">
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                      className="w-full bg-background border border-border rounded-lg px-4 py-3 text-base md:text-sm text-white placeholder:text-dim outline-none focus:border-blue transition-colors"
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
                      className="w-full bg-background border border-border rounded-lg px-4 py-3 text-base md:text-sm text-white placeholder:text-dim outline-none focus:border-blue transition-colors"
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
                    className="w-full bg-background border border-border rounded-lg px-4 py-3 text-base md:text-sm text-white placeholder:text-dim outline-none focus:border-blue transition-colors"
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
                    className="w-full bg-background border border-border rounded-lg px-4 py-3 text-base md:text-sm text-white placeholder:text-dim outline-none focus:border-blue transition-colors"
                    placeholder="+44 7700 900000"
                  />
                </div>

                <div>
                  <label
                    htmlFor="businessSummary"
                    className="block text-xs text-muted mb-1.5"
                  >
                    Tell us about your business
                  </label>
                  <textarea
                    id="businessSummary"
                    name="businessSummary"
                    required
                    rows={4}
                    className="w-full bg-background border border-border rounded-lg px-4 py-3 text-base md:text-sm text-white placeholder:text-dim outline-none focus:border-blue transition-colors resize-none"
                    placeholder="What do you do, who do you serve, and what makes you different? A paragraph is enough."
                  />
                </div>

                {error && <p className="text-red text-xs">{error}</p>}

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full bg-blue text-black font-semibold text-sm py-3.5 rounded-lg hover:brightness-110 transition-all disabled:opacity-50"
                >
                  {submitting ? "Submitting..." : "Get Your 3 Opportunities"}
                </button>

                <p className="text-[11px] text-dim text-center">
                  No app to download. No credit card. We do the work. You see
                  the results.
                </p>
              </form>
            </div>
          )}

          {/* How it works */}
          <div className="mt-6 space-y-3">
            <p className="text-xs text-dim uppercase tracking-wider text-center">
              How it works
            </p>
            <div className="grid grid-cols-1 gap-3">
              <div className="bg-surface border border-border rounded-lg p-4 flex items-start gap-3">
                <span className="text-blue shrink-0 mt-0.5 font-bold text-sm">
                  1
                </span>
                <div>
                  <p className="text-sm font-medium text-white">
                    You send a paragraph about your business
                  </p>
                  <p className="text-xs text-muted">
                    What you do, who you serve, what makes you different.
                  </p>
                </div>
              </div>
              <div className="bg-surface border border-border rounded-lg p-4 flex items-start gap-3">
                <span className="text-blue shrink-0 mt-0.5 font-bold text-sm">
                  2
                </span>
                <div>
                  <p className="text-sm font-medium text-white">
                    We scan your market
                  </p>
                  <p className="text-xs text-muted">
                    Our system researches your space, cross-references your
                    positioning against competitors, and identifies gaps.
                  </p>
                </div>
              </div>
              <div className="bg-surface border border-border rounded-lg p-4 flex items-start gap-3">
                <span className="text-blue shrink-0 mt-0.5 font-bold text-sm">
                  3
                </span>
                <div>
                  <p className="text-sm font-medium text-white">
                    You get 3 specific opportunities
                  </p>
                  <p className="text-xs text-muted">
                    Not generic advice. Specific, non-obvious opportunities
                    tailored to your business — delivered in 24–48 hours.
                  </p>
                </div>
              </div>
            </div>
            <div className="bg-surface border border-border rounded-lg p-4 text-center mt-4">
              <p className="text-xs text-muted italic">
                &ldquo;These 3 came from a paragraph. Imagine what happens with
                your full expertise codified.&rdquo;
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 border-t border-border">
        <div className="max-w-[1000px] mx-auto px-6 md:px-12 text-center">
          <span className="text-xs text-dim">
            &copy; {new Date().getFullYear()} Codify &middot; Your expertise,
            structured. Your AI, transformed.
          </span>
        </div>
      </footer>
    </main>
  );
}
