"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";

const isDevBypass = process.env.NEXT_PUBLIC_DEV_BYPASS_AUTH === "true";

function GithubIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" className="inline-block">
      <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

function PulsingDots() {
  return (
    <span className="inline-flex gap-1">
      <span className="w-1.5 h-1.5 rounded-full bg-[#22c55e] animate-pulse" style={{ animationDelay: "0ms" }} />
      <span className="w-1.5 h-1.5 rounded-full bg-[#22c55e] animate-pulse" style={{ animationDelay: "150ms" }} />
      <span className="w-1.5 h-1.5 rounded-full bg-[#22c55e] animate-pulse" style={{ animationDelay: "300ms" }} />
    </span>
  );
}

export default function HomePage() {
  const { user, loading, signInWithGitHub } = useAuth();
  const router = useRouter();
  const [connecting, setConnecting] = useState(false);

  useEffect(() => {
    if (isDevBypass) {
      router.push("/dashboard");
      return;
    }
    if (loading) return;
    if (!user) return;

    const checkConfig = async () => {
      try {
        const res = await fetch("/api/github/config");
        const data = await res.json();
        if (data.config && data.config.connected) {
          router.push("/dashboard");
        } else {
          router.push("/onboarding");
        }
      } catch {
        router.push("/onboarding");
      }
    };
    checkConfig();
  }, [user, loading, router]);

  const handleConnect = async () => {
    setConnecting(true);
    await signInWithGitHub();
  };

  if (loading || user) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] text-white flex items-center justify-center">
        <PulsingDots />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white flex flex-col">
      {/* Nav */}
      <nav className="border-b border-[#1a1a1a] px-6 py-4">
        <div className="mx-auto flex max-w-lg items-center justify-center">
          <span className="font-mono text-lg text-white">
            <span className="text-[#22c55e]">&#10095;</span> codify
          </span>
        </div>
      </nav>

      {/* Main */}
      <div className="flex-1 flex items-center justify-center px-6">
        <div className="w-full max-w-sm">
          {/* Headline */}
          <div className="text-center mb-10">
            <h1 className="font-mono text-2xl font-bold mb-3">
              Teach AI how your business works
            </h1>
            <p className="text-sm text-[#a0a0a0] leading-relaxed">
              Answer a few questions. We&apos;ll turn your answers into files
              that any AI tool can read &mdash; so it sounds like you,
              not like everyone else.
            </p>
          </div>

          {/* What happens */}
          <div className="space-y-4 mb-10">
            <div className="flex items-start gap-3">
              <div className="mt-0.5"><CheckIcon /></div>
              <p className="text-sm text-[#a0a0a0]">
                <span className="text-white font-medium">Create your account</span>
                {" "}&mdash; one click, using your GitHub login
              </p>
            </div>
            <div className="flex items-start gap-3">
              <div className="mt-0.5"><CheckIcon /></div>
              <p className="text-sm text-[#a0a0a0]">
                <span className="text-white font-medium">Answer questions about your business</span>
                {" "}&mdash; guided prompts, no blank page
              </p>
            </div>
            <div className="flex items-start gap-3">
              <div className="mt-0.5"><CheckIcon /></div>
              <p className="text-sm text-[#a0a0a0]">
                <span className="text-white font-medium">Get your business files</span>
                {" "}&mdash; stored securely, owned by you, always up to date
              </p>
            </div>
          </div>

          {/* CTA */}
          <button
            onClick={handleConnect}
            disabled={connecting}
            className="w-full font-mono text-sm font-bold bg-[#22c55e] text-black py-3.5 hover:brightness-110 transition-all inline-flex items-center justify-center gap-3 disabled:opacity-60"
          >
            {connecting ? (
              <PulsingDots />
            ) : (
              <>
                <GithubIcon />
                Get Started with GitHub
              </>
            )}
          </button>

          <p className="text-center text-[11px] text-[#6b6b6b] mt-4 leading-relaxed">
            GitHub is where your business files are stored &mdash; like a secure
            folder that keeps a history of every change.
          </p>

          <p className="text-center text-[11px] text-[#6b6b6b] mt-4">
            Don&apos;t have a GitHub account?{" "}
            <a
              href="https://github.com/signup"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#4a9eff] hover:underline"
            >
              Create one free here
            </a>
            {" "}&mdash; takes 30 seconds.
          </p>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-[#1a1a1a] px-6 py-6">
        <div className="mx-auto max-w-lg flex items-center justify-center">
          <span className="font-mono text-xs text-[#6b6b6b]">
            context &gt; prompts
          </span>
        </div>
      </footer>
    </div>
  );
}
