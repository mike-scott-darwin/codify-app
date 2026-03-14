"use client";

import Link from "next/link";
import { useState, useEffect } from "react";

function BlinkingCursor() {
  const [visible, setVisible] = useState(true);
  useEffect(() => {
    const interval = setInterval(() => setVisible((v) => !v), 530);
    return () => clearInterval(interval);
  }, []);
  return (
    <span
      className="inline-block w-[2px] h-[1.1em] bg-[#4a9eff] align-middle ml-0.5"
      style={{ opacity: visible ? 1 : 0 }}
    />
  );
}

function BrandMark({ size = "text-xl" }: { size?: string }) {
  return (
    <span className={`font-mono font-bold ${size} text-white`}>
      <span className="text-[#22c55e]">❯</span> codify
      <BlinkingCursor />
    </span>
  );
}

const problemItems = [
  {
    title: "The Prompt Trap",
    stat: "95%",
    desc: "of AI pilots fail",
  },
  {
    title: "The Context Gap",
    stat: "42%",
    desc: "of knowledge is undocumented",
  },
  {
    title: "The Knowledge Walkout",
    stat: "$31.5B",
    desc: "lost annually to knowledge gaps",
  },
  {
    title: "The Market Is Moving",
    stat: "47%",
    desc: "YoY market growth",
  },
];

const mechanismSteps = [
  {
    cmd: "extract",
    label: "Extract",
    desc: "Guided interviews pull out what you know but haven't documented.",
  },
  {
    cmd: "codify",
    label: "Codify",
    desc: "Answers become structured reference files — soul, offer, audience, voice.",
  },
  {
    cmd: "generate",
    label: "Generate",
    desc: "Every AI tool reads your context. Outputs sound like you, sell what you sell.",
  },
  {
    cmd: "compound",
    label: "Compound",
    desc: "Context gets richer with every session. Generic competitors fall further behind.",
  },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      {/* ─── NAV ─── */}
      <nav className="fixed top-0 z-50 w-full border-b border-[#1a1a1a] bg-[#0a0a0a]/90 backdrop-blur-sm">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <BrandMark />
          <div className="flex items-center gap-6">
            <Link
              href="#problem"
              className="hidden text-sm text-[#a0a0a0] hover:text-white transition-colors sm:block"
            >
              Problem
            </Link>
            <Link
              href="#mechanism"
              className="hidden text-sm text-[#a0a0a0] hover:text-white transition-colors sm:block"
            >
              How It Works
            </Link>
            <Link
              href="#app"
              className="hidden text-sm text-[#a0a0a0] hover:text-white transition-colors sm:block"
            >
              The App
            </Link>
            <Link href="/interview/soul">
              <button className="rounded-none border border-[#22c55e] bg-[#22c55e]/10 px-4 py-2 text-sm font-medium text-[#22c55e] hover:bg-[#22c55e]/20 transition-colors">
                Get Started
              </button>
            </Link>
          </div>
        </div>
      </nav>

      {/* ─── HERO ─── */}
      <section className="mx-auto max-w-4xl px-6 pt-32 pb-24 text-center">
        <div className="mb-8">
          <BrandMark size="text-3xl sm:text-4xl" />
        </div>

        <h1 className="font-mono text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl mb-6">
          Context compounds.
          <br />
          Prompts don&apos;t.
        </h1>

        <p className="mx-auto max-w-2xl text-lg text-[#a0a0a0] mb-10 leading-relaxed">
          The context layer between your business and AI.
          <br />
          Less time. Less tools. Better output.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-10">
          <Link href="/interview/soul">
            <button className="rounded-none bg-[#4a9eff] px-8 py-3 text-sm font-semibold text-white hover:bg-[#4a9eff]/80 transition-colors w-full sm:w-auto">
              Start Building Context →
            </button>
          </Link>
          <Link href="/dashboard">
            <button className="rounded-none border border-[#1a1a1a] bg-[#111111] px-8 py-3 text-sm font-medium text-[#a0a0a0] hover:text-white hover:border-[#333] transition-colors w-full sm:w-auto">
              View Dashboard
            </button>
          </Link>
        </div>

        <div className="inline-flex items-center gap-3 border border-[#1a1a1a] bg-[#111111] px-5 py-2.5 text-sm text-[#a0a0a0]">
          <span className="inline-block h-2 w-2 bg-[#22c55e] rounded-full animate-pulse" />
          <span className="font-mono">48 files · 322 commits · 9 hrs/week</span>
        </div>
      </section>

      {/* ─── PROBLEM ─── */}
      <section id="problem" className="border-t border-[#1a1a1a] px-6 py-24">
        <div className="mx-auto max-w-5xl">
          <div className="text-center mb-16">
            <span className="text-xs font-semibold uppercase tracking-[0.2em] text-[#4a9eff] mb-4 block">
              THE PROBLEM
            </span>
            <h2 className="font-mono text-3xl font-bold sm:text-4xl">
              Generic in, generic out.
            </h2>
          </div>

          <div className="grid gap-0 sm:grid-cols-2 lg:grid-cols-4">
            {problemItems.map((item) => (
              <div
                key={item.title}
                className="border border-[#1a1a1a] bg-[#111111] p-6 -mt-px -ml-px"
              >
                <p className="text-sm text-[#6b6b6b] mb-3 font-mono">{item.title}</p>
                <p className="text-3xl font-mono font-bold text-red-400 mb-1">
                  {item.stat}
                </p>
                <p className="text-sm text-[#a0a0a0]">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── MECHANISM ─── */}
      <section id="mechanism" className="border-t border-[#1a1a1a] px-6 py-24">
        <div className="mx-auto max-w-5xl">
          <div className="text-center mb-16">
            <span className="text-xs font-semibold uppercase tracking-[0.2em] text-[#4a9eff] mb-4 block">
              THE MECHANISM
            </span>
            <h2 className="font-mono text-3xl font-bold sm:text-4xl">
              Extract → Codify → Generate → Compound
            </h2>
          </div>

          {/* Terminal window */}
          <div className="border border-[#1a1a1a] bg-[#111111] overflow-hidden max-w-3xl mx-auto">
            {/* Title bar */}
            <div className="flex items-center gap-2 border-b border-[#1a1a1a] px-4 py-3">
              <span className="h-3 w-3 rounded-full bg-[#ff5f57]" />
              <span className="h-3 w-3 rounded-full bg-[#febc2e]" />
              <span className="h-3 w-3 rounded-full bg-[#28c840]" />
              <span className="ml-4 text-xs text-[#6b6b6b] font-mono">~/business</span>
            </div>

            {/* Terminal content */}
            <div className="p-6 font-mono text-sm space-y-6">
              {mechanismSteps.map((step, i) => (
                <div key={step.cmd}>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[#22c55e]">❯</span>
                    <span className="text-white">codify {step.cmd}</span>
                    {i === mechanismSteps.length - 1 && <BlinkingCursor />}
                  </div>
                  <p className="text-[#6b6b6b] pl-5">{step.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ─── HOW THE APP WORKS ─── */}
      <section id="app" className="border-t border-[#1a1a1a] px-6 py-24">
        <div className="mx-auto max-w-5xl">
          <div className="text-center mb-16">
            <span className="text-xs font-semibold uppercase tracking-[0.2em] text-[#4a9eff] mb-4 block">
              THE APP
            </span>
            <h2 className="font-mono text-3xl font-bold sm:text-4xl">
              Three surfaces. One system.
            </h2>
          </div>

          <div className="grid gap-0 sm:grid-cols-3">
            <div className="border border-[#1a1a1a] bg-[#111111] p-8 -ml-px -mt-px">
              <div className="font-mono text-[#22c55e] text-2xl mb-4">01</div>
              <h3 className="font-mono text-lg font-bold mb-3">Dashboard</h3>
              <p className="text-sm text-[#a0a0a0] leading-relaxed">
                See your entire context system at a glance. Track file completeness,
                view recent activity, and know exactly where to pick up.
              </p>
            </div>

            <div className="border border-[#1a1a1a] bg-[#111111] p-8 -ml-px -mt-px">
              <div className="font-mono text-[#22c55e] text-2xl mb-4">02</div>
              <h3 className="font-mono text-lg font-bold mb-3">Interview</h3>
              <p className="text-sm text-[#a0a0a0] leading-relaxed">
                Guided questions extract what you know. No blank pages, no overwhelm.
                One question at a time — your answers become structured reference files.
              </p>
            </div>

            <div className="border border-[#1a1a1a] bg-[#111111] p-8 -ml-px -mt-px">
              <div className="font-mono text-[#22c55e] text-2xl mb-4">03</div>
              <h3 className="font-mono text-lg font-bold mb-3">Preview</h3>
              <p className="text-sm text-[#a0a0a0] leading-relaxed">
                See your reference files rendered in real time. Watch your business
                context take shape as you answer — soul, offer, audience, voice.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ─── CTA ─── */}
      <section className="border-t border-[#1a1a1a] px-6 py-24">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="font-mono text-3xl font-bold sm:text-4xl mb-6">
            The window is open.
            <br />
            Not for long.
          </h2>
          <p className="text-[#a0a0a0] mb-10 max-w-xl mx-auto leading-relaxed">
            AI is rewriting every industry. The businesses that win are the ones
            whose context is already codified. Start building yours now.
          </p>
          <Link href="/interview/soul">
            <button className="rounded-none bg-[#4a9eff] px-10 py-4 text-sm font-semibold text-white hover:bg-[#4a9eff]/80 transition-colors">
              Start Your First Interview →
            </button>
          </Link>
        </div>
      </section>

      {/* ─── FOOTER ─── */}
      <footer className="border-t border-[#1a1a1a] px-6 py-8">
        <div className="mx-auto flex max-w-6xl flex-col sm:flex-row items-center justify-between gap-4">
          <BrandMark size="text-base" />
          <p className="text-xs text-[#6b6b6b]">
            Context compounds. Prompts don&apos;t.
          </p>
          <div className="flex items-center gap-6">
            <Link
              href="/interview/soul"
              className="text-xs text-[#6b6b6b] hover:text-white transition-colors"
            >
              Start Interview
            </Link>
            <Link
              href="/dashboard"
              className="text-xs text-[#6b6b6b] hover:text-white transition-colors"
            >
              Dashboard
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
