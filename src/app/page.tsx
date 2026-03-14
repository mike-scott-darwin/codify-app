"use client";

import Link from "next/link";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white flex flex-col">
      {/* Nav */}
      <nav className="border-b border-[#1a1a1a] px-6 py-4">
        <div className="mx-auto flex max-w-3xl items-center justify-between">
          <span className="font-mono text-lg text-white">
            <span className="text-[#22c55e]">❯</span> codify
          </span>
        </div>
      </nav>

      <div className="mx-auto max-w-3xl px-6 flex-1 flex flex-col justify-center py-16">
        {/* Headline */}
        <h1 className="font-mono text-2xl font-bold mb-3">
          Build your reference files.
        </h1>
        <p className="text-[#a0a0a0] leading-relaxed max-w-xl mb-16">
          Answer guided questions about your business. We turn your answers
          into structured files that make AI understand who you are, what you
          sell, and how you sound.
        </p>

        {/* Visual process flow */}
        <div className="mb-16">
          {/* Step 1 */}
          <div className="flex items-start gap-5">
            <div className="flex flex-col items-center">
              <div className="w-10 h-10 border border-[#4a9eff] flex items-center justify-center">
                <span className="font-mono text-sm font-bold text-[#4a9eff]">1</span>
              </div>
              <div className="w-px h-8 bg-[#1a1a1a]" />
            </div>
            <div className="pt-2">
              <p className="font-mono text-sm text-white font-bold mb-1">Answer questions</p>
              <p className="text-xs text-[#6b6b6b]">7 guided questions about your business — one at a time</p>
            </div>
          </div>

          {/* Step 2 */}
          <div className="flex items-start gap-5">
            <div className="flex flex-col items-center">
              <div className="w-10 h-10 border border-[#1a1a1a] flex items-center justify-center">
                <span className="font-mono text-sm font-bold text-[#6b6b6b]">2</span>
              </div>
              <div className="w-px h-8 bg-[#1a1a1a]" />
            </div>
            <div className="pt-2">
              <p className="font-mono text-sm text-white font-bold mb-1">Preview your file</p>
              <p className="text-xs text-[#6b6b6b]">See your answers transformed into a structured reference file</p>
            </div>
          </div>

          {/* Step 3 */}
          <div className="flex items-start gap-5">
            <div className="flex flex-col items-center">
              <div className="w-10 h-10 border border-[#1a1a1a] flex items-center justify-center">
                <span className="font-mono text-sm font-bold text-[#6b6b6b]">3</span>
              </div>
              <div className="w-px h-8 bg-[#1a1a1a]" />
            </div>
            <div className="pt-2">
              <p className="font-mono text-sm text-white font-bold mb-1">Get your score</p>
              <p className="text-xs text-[#6b6b6b]">See how well AI understands your business — and what to build next</p>
            </div>
          </div>

          {/* Step 4 */}
          <div className="flex items-start gap-5">
            <div className="flex flex-col items-center">
              <div className="w-10 h-10 border border-[#1a1a1a] flex items-center justify-center">
                <span className="font-mono text-sm font-bold text-[#6b6b6b]">4</span>
              </div>
            </div>
            <div className="pt-2">
              <p className="font-mono text-sm text-white font-bold mb-1">Repeat for all 4 files</p>
              <div className="flex items-center gap-3 mt-1.5">
                <span className="font-mono text-xs text-[#22c55e]">soul.md</span>
                <span className="font-mono text-xs text-[#6b6b6b]">→</span>
                <span className="font-mono text-xs text-[#6b6b6b]">offer.md</span>
                <span className="font-mono text-xs text-[#6b6b6b]">→</span>
                <span className="font-mono text-xs text-[#6b6b6b]">audience.md</span>
                <span className="font-mono text-xs text-[#6b6b6b]">→</span>
                <span className="font-mono text-xs text-[#6b6b6b]">voice.md</span>
              </div>
            </div>
          </div>
        </div>

        {/* Single CTA */}
        <Link href="/interview/soul">
          <button className="font-mono text-sm font-bold bg-[#22c55e] text-black px-10 py-3.5 hover:brightness-110 transition-all">
            Start →
          </button>
        </Link>
        <p className="font-mono text-xs text-[#6b6b6b] mt-3">
          Takes about 5 minutes
        </p>
      </div>

      {/* Footer */}
      <footer className="border-t border-[#1a1a1a] px-6 py-6">
        <div className="mx-auto max-w-3xl flex items-center justify-between">
          <span className="font-mono text-xs text-[#6b6b6b]">
            context &gt; prompts
          </span>
          <span className="font-mono text-xs text-[#6b6b6b]">
            codify.build
          </span>
        </div>
      </footer>
    </div>
  );
}
