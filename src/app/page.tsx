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
          Build your business reference files.
        </h1>
        <p className="text-[#a0a0a0] leading-relaxed max-w-xl mb-16">
          Right now, every time you use AI you re-explain your business from scratch. 
          These reference files fix that — once built, any AI tool reads them first 
          and generates outputs that actually sound like you.
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
              <p className="font-mono text-sm text-white font-bold mb-1">Answer questions about your business</p>
              <p className="text-xs text-[#6b6b6b]">Guided prompts pull out what makes you different — no blank page</p>
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
              <p className="font-mono text-sm text-white font-bold mb-1">We structure it into reference files</p>
              <p className="text-xs text-[#6b6b6b]">Your answers become files any AI tool can read before generating</p>
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
              <p className="font-mono text-sm text-white font-bold mb-1">See your Context Power Score</p>
              <p className="text-xs text-[#6b6b6b]">Measures how well AI understands your business — and where the gaps are</p>
            </div>
          </div>

          {/* Step 4 - the files */}
          <div className="flex items-start gap-5">
            <div className="flex flex-col items-center">
              <div className="w-10 h-10 border border-[#1a1a1a] flex items-center justify-center">
                <span className="font-mono text-sm font-bold text-[#6b6b6b]">4</span>
              </div>
            </div>
            <div className="pt-2">
              <p className="font-mono text-sm text-white font-bold mb-3">Build all 4 core files</p>
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <span className="font-mono text-xs text-[#22c55e] w-24">soul.md</span>
                  <span className="text-xs text-[#6b6b6b]">Why you exist — so AI knows your beliefs and mission</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-mono text-xs text-[#6b6b6b] w-24">offer.md</span>
                  <span className="text-xs text-[#6b6b6b]">What you sell — so AI can describe your transformation</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-mono text-xs text-[#6b6b6b] w-24">audience.md</span>
                  <span className="text-xs text-[#6b6b6b]">Who you serve — so AI speaks to the right person</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-mono text-xs text-[#6b6b6b] w-24">voice.md</span>
                  <span className="text-xs text-[#6b6b6b]">How you sound — so AI writes like you, not like everyone</span>
                </div>
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
