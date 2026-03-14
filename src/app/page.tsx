"use client";

import Link from "next/link";

const REFERENCE_FILES = [
  {
    name: "soul.md",
    description: "Your origin story, core beliefs, and mission",
    interview: "/interview/soul",
  },
  {
    name: "offer.md",
    description: "What you sell, the transformation, and the proof",
    interview: "/interview/soul",
  },
  {
    name: "audience.md",
    description: "Who you serve and what keeps them stuck",
    interview: "/interview/soul",
  },
  {
    name: "voice.md",
    description: "How you sound — tone, language, personality",
    interview: "/interview/soul",
  },
];

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

      <div className="mx-auto max-w-3xl px-6 py-16 flex-1">
        {/* Welcome */}
        <div className="mb-12">
          <h1 className="font-mono text-2xl font-bold mb-3">
            Build your reference files.
          </h1>
          <p className="text-[#a0a0a0] leading-relaxed max-w-xl">
            Answer guided questions about your business. We turn your answers
            into structured files that make AI understand who you are, what you
            sell, and how you sound.
          </p>
        </div>

        {/* What you'll build */}
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-[#4a9eff] mb-4">
          4 core files
        </p>

        <div className="space-y-3 mb-12">
          {REFERENCE_FILES.map((file, i) => (
            <div
              key={file.name}
              className="bg-[#111111] border border-[#1a1a1a] px-5 py-4 flex items-center justify-between"
            >
              <div className="flex items-center gap-4">
                <span className="font-mono text-[#22c55e] text-sm">
                  {file.name}
                </span>
                <span className="text-sm text-[#6b6b6b]">
                  {file.description}
                </span>
              </div>
              {i === 0 ? (
                <span className="font-mono text-xs text-[#4a9eff]">
                  start here →
                </span>
              ) : (
                <span className="font-mono text-xs text-[#333]">
                  locked
                </span>
              )}
            </div>
          ))}
        </div>

        {/* What you'll get */}
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-[#4a9eff] mb-4">
          What you get
        </p>

        <div className="bg-[#111111] border border-[#1a1a1a] p-5 mb-12">
          <div className="space-y-3 text-sm text-[#a0a0a0]">
            <div className="flex items-start gap-3">
              <span className="font-mono text-[#22c55e] shrink-0">❯</span>
              <span>Structured reference files your AI tools can read</span>
            </div>
            <div className="flex items-start gap-3">
              <span className="font-mono text-[#22c55e] shrink-0">❯</span>
              <span>A Context Power Score showing how well AI knows your business</span>
            </div>
            <div className="flex items-start gap-3">
              <span className="font-mono text-[#22c55e] shrink-0">❯</span>
              <span>Outputs that sound like you from the first draft</span>
            </div>
          </div>
        </div>

        {/* CTA */}
        <Link href="/interview/soul">
          <button className="font-mono text-sm font-bold bg-[#22c55e] text-black px-8 py-3 hover:brightness-110 transition-all w-full sm:w-auto">
            Start with soul.md →
          </button>
        </Link>

        <p className="font-mono text-xs text-[#6b6b6b] mt-3">
          7 questions · takes about 5 minutes
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
