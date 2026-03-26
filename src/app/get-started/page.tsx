import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Get Started — Codify",
  description:
    "Set up your Codify vault in minutes. Download Obsidian, clone your vault, and start codifying your expertise.",
};

const steps = [
  {
    number: "01",
    title: "Download Obsidian",
    description:
      "Obsidian is a free, private knowledge base that runs on your machine. Your data never leaves your device.",
    action: {
      label: "Download Obsidian",
      url: "https://obsidian.md/download",
      external: true,
    },
    details: [
      "Available on Mac, Windows, Linux, iOS, and Android",
      "Free for personal use",
      "No account required",
    ],
  },
  {
    number: "02",
    title: "Get Your Codify Vault",
    description:
      "Download the pre-configured Codify vault with all skills, context templates, and the compounding architecture ready to go.",
    action: {
      label: "Download Vault",
      url: "https://github.com/codify-build/codify-trial-vault",
      external: true,
    },
    details: [
      "Pre-built context templates: soul.md, offer.md, audience.md, voice.md",
      "Full skill library included",
      "Works with Claude, GPT, Gemini — any AI",
    ],
  },
  {
    number: "03",
    title: "Open & Run /start",
    description:
      "Open the vault in Obsidian, launch Claude in the chat pane, and type /start. The system walks you through your first extraction.",
    action: {
      label: "Watch Setup Guide",
      url: "#",
      external: false,
      comingSoon: true,
    },
    details: [
      "Guided first extraction in under 30 minutes",
      "Your context starts compounding immediately",
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
            Set Up Your Vault
            <br />
            in 5 Minutes.
          </h1>
          <p className="text-muted text-lg leading-relaxed">
            Everything runs locally on your machine.
            <br />
            Your knowledge stays yours.
          </p>
        </div>
      </section>

      {/* Steps */}
      <section className="pb-16 md:pb-20">
        <div className="max-w-[800px] mx-auto px-6 md:px-12">
          <div className="space-y-8">
            {steps.map((step, i) => (
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
