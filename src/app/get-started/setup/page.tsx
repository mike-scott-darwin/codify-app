"use client";

import { useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";

function SetupContent() {
  const searchParams = useSearchParams();
  const name = searchParams.get("name") || "there";
  const email = searchParams.get("email") || "";
  const [copied, setCopied] = useState(false);

  const installCmd = `curl -fsSL "https://codify.build/api/installer?email=${encodeURIComponent(email)}" | bash`;

  function handleCopy() {
    navigator.clipboard.writeText(installCmd);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
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
        <div className="max-w-[600px] mx-auto px-6 md:px-12 text-center">
          <p className="text-xs tracking-[0.2em] uppercase text-blue mb-3">
            YOU&apos;RE IN
          </p>
          <h1 className="font-bold text-white leading-[1.1] mb-4 text-[clamp(1.75rem,5vw,2.5rem)]">
            Hi {name}, here&apos;s your vault.
          </h1>
          <p className="text-muted text-base md:text-lg leading-relaxed">
            Open Terminal on your Mac and paste the command below.
            <br />
            Everything installs automatically.
          </p>
        </div>
      </section>

      {/* Install command */}
      <section className="pb-10 md:pb-14">
        <div className="max-w-[520px] mx-auto px-6 md:px-12">
          <div className="bg-surface border border-green/30 rounded-xl p-6 md:p-8">
            <p className="text-xs text-muted mb-3 text-center">
              Open Terminal (Cmd + Space, type &quot;Terminal&quot;, press Enter)
              then paste:
            </p>
            <div className="relative">
              <div className="bg-[#111] rounded-lg border border-border p-4 font-mono text-xs leading-relaxed text-white overflow-x-auto">
                {installCmd}
              </div>
              <button
                onClick={handleCopy}
                className="absolute top-2 right-2 bg-blue/20 hover:bg-blue/40 text-blue text-xs px-3 py-1.5 rounded-md transition-colors"
              >
                {copied ? "Copied!" : "Copy"}
              </button>
            </div>
            <p className="text-xs text-muted mt-4 text-center">
              Takes about 2 minutes. You may need to enter your Mac password
              once.
            </p>
          </div>
        </div>
      </section>

      {/* What happens */}
      <section className="pb-10 md:pb-16">
        <div className="max-w-[520px] mx-auto px-6 md:px-12">
          <h2 className="font-bold text-white text-lg mb-5 text-center">
            What happens when you run it
          </h2>
          <div className="space-y-4">
            <div className="flex items-start gap-4">
              <div className="text-2xl font-bold text-white/10 shrink-0 w-8">
                1
              </div>
              <div>
                <p className="text-sm font-medium text-white">
                  Installs Obsidian + AI engine
                </p>
                <p className="text-xs text-muted">
                  Two free apps. Automatic. About 90 seconds.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="text-2xl font-bold text-white/10 shrink-0 w-8">
                2
              </div>
              <div>
                <p className="text-sm font-medium text-white">
                  Opens your vault in Obsidian
                </p>
                <p className="text-xs text-muted">
                  Your private knowledge base with 27 skills ready to go.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="text-2xl font-bold text-white/10 shrink-0 w-8">
                3
              </div>
              <div>
                <p className="text-sm font-medium text-white">
                  Type &quot;claude&quot; then &quot;/start&quot;
                </p>
                <p className="text-xs text-muted">
                  The AI asks about your business and builds your vault. About
                  30 minutes.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Terminal preview */}
      <section className="pb-10 md:pb-16">
        <div className="max-w-[480px] mx-auto px-6 md:px-12">
          <div className="rounded-lg border border-border overflow-hidden bg-[#1a1a1a]">
            <div className="flex items-center gap-2 px-4 py-2.5 bg-[#111] border-b border-border">
              <div className="flex gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-[#ff5f57]" />
                <div className="w-2.5 h-2.5 rounded-full bg-[#febc2e]" />
                <div className="w-2.5 h-2.5 rounded-full bg-[#28c840]" />
              </div>
              <span className="text-[11px] text-dim ml-2">Terminal</span>
            </div>
            <div className="px-4 py-4 font-mono text-xs leading-relaxed">
              <p className="text-dim">
                <span className="text-green">$</span>{" "}
                <span className="text-white">claude</span>
              </p>
              <p className="text-dim mt-3">
                <span className="text-blue">&gt;</span>{" "}
                <span className="text-white">/start</span>
                <span className="inline-block w-1.5 h-3.5 bg-blue ml-0.5 animate-pulse" />
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Help */}
      <section className="pb-10 md:pb-16">
        <div className="max-w-[480px] mx-auto px-6 md:px-12 text-center">
          <p className="text-muted text-sm">
            Stuck?{" "}
            <a
              href="mailto:hello@codify.build"
              className="text-blue hover:underline"
            >
              hello@codify.build
            </a>
          </p>
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

export default function Setup() {
  return (
    <Suspense>
      <SetupContent />
    </Suspense>
  );
}
