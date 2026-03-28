"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";

const LEAD_API = "/api/lead";

export default function GetStarted() {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

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
      source: "codify.build/get-started",
      tags: ["free-trial", "website"],
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

      router.push("/get-started/setup");
    } catch {
      router.push("/get-started/setup");
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
            FREE TRIAL
          </p>
          <h1 className="font-bold text-white leading-[1.1] mb-4 text-[clamp(1.75rem,5vw,2.5rem)]">
            Start Your Free Trial
          </h1>
          <p className="text-muted text-base md:text-lg leading-relaxed">
            Enter your details to get instant access to the Codify vault.
          </p>
        </div>
      </section>

      {/* Form */}
      <section className="pb-16 md:pb-24">
        <div className="max-w-[480px] mx-auto px-6 md:px-12">
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

              {error && <p className="text-red text-xs">{error}</p>}

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
