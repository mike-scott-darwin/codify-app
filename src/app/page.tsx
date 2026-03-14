"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { calculateContextScore } from "@/lib/scoring";
import type { ContextScore, ReferenceFile } from "@/lib/types";

// Demo data — replace with GitHub API later
const DEMO_FILES = [
  {
    name: "soul.md",
    path: "reference/core/soul.md",
    content: `# Soul\n\n## Origin\nI started coaching because I saw too many talented people stuck in jobs that drained them.\n\n## Core Belief\nEveryone has a zone of genius. Most people just need permission and a framework to find it.`,
    lastModified: "2026-03-10",
  },
  {
    name: "offer.md",
    path: "reference/core/offer.md",
    content: `# Offer\n\n## What I Sell\n12-week coaching program for mid-career professionals who want to transition to coaching.\n\n## Price\n$2,500 one-time\n\n## Delivery\nWeekly 1:1 calls + Skool community access`,
    lastModified: "2026-03-12",
  },
  {
    name: "audience.md",
    path: "reference/core/audience.md",
  },
  {
    name: "voice.md",
    path: "reference/core/voice.md",
  },
];

const FILE_DESCRIPTIONS: Record<string, { tagline: string; interview: string }> = {
  "soul.md": {
    tagline: "WHY you exist — your origin, beliefs, and mission",
    interview: "/interview/soul",
  },
  "offer.md": {
    tagline: "WHAT you sell — the transformation, price, and proof",
    interview: "/interview/soul", // TODO: /interview/offer
  },
  "audience.md": {
    tagline: "WHO you serve — real people, not avatars",
    interview: "/interview/soul", // TODO: /interview/audience
  },
  "voice.md": {
    tagline: "HOW you sound — tone, phrases, personality",
    interview: "/interview/soul", // TODO: /interview/voice
  },
};

function terminalBar(percentage: number, length: number = 20): string {
  const filled = Math.round((percentage / 100) * length);
  const empty = length - filled;
  return "\u2588".repeat(filled) + "\u2591".repeat(empty);
}

const STATUS_CONFIG: Record<
  ReferenceFile["status"],
  { color: string; label: string }
> = {
  missing: { color: "text-[#ef4444]", label: "MISSING" },
  skeleton: { color: "text-[#f59e0b]", label: "SKELETON" },
  draft: { color: "text-[#f59e0b]", label: "DRAFT" },
  solid: { color: "text-[#4a9eff]", label: "SOLID" },
  strong: { color: "text-[#22c55e]", label: "STRONG" },
};

function FileCard({ file }: { file: ReferenceFile }) {
  const config = STATUS_CONFIG[file.status];
  const desc = FILE_DESCRIPTIONS[file.name];
  const percentage = Math.round((file.score / file.maxScore) * 100);

  return (
    <Link href={desc?.interview || "/interview/soul"} className="block group">
      <div className="bg-[#111111] border border-[#1a1a1a] p-5 group-hover:border-[#333] transition-colors">
        <div className="flex items-center justify-between mb-1">
          <span className="font-mono text-[#22c55e] text-sm">{file.name}</span>
          <span className={`font-mono text-[10px] uppercase tracking-[0.1em] ${config.color}`}>
            {config.label}
          </span>
        </div>

        <p className="text-xs text-[#6b6b6b] mb-3">{desc?.tagline}</p>

        <div className="flex items-center justify-between mb-2">
          <span className="font-mono text-[10px] text-[#6b6b6b]">
            {file.wordCount} words
          </span>
          <span className="font-mono text-[10px] text-[#a0a0a0]">
            {file.score}/{file.maxScore} pts
          </span>
        </div>

        <div className="font-mono text-xs text-[#4a9eff] tracking-wider mb-2">
          {terminalBar(percentage, 24)}
        </div>

        {file.lastModified ? (
          <p className="font-mono text-[10px] text-[#6b6b6b]">
            modified {file.lastModified}
          </p>
        ) : (
          <p className="font-mono text-[10px] text-[#4a9eff] group-hover:text-white transition-colors">
            start interview →
          </p>
        )}
      </div>
    </Link>
  );
}

export default function AppDashboard() {
  const [score, setScore] = useState<ContextScore | null>(null);

  useEffect(() => {
    const result = calculateContextScore(DEMO_FILES);
    setScore(result);
  }, []);

  if (!score) return null;

  const missingCount = score.files.filter((f) => f.status === "missing").length;

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      {/* Nav */}
      <nav className="border-b border-[#1a1a1a] px-6 py-4">
        <div className="mx-auto flex max-w-4xl items-center justify-between">
          <span className="font-mono text-lg text-white">
            <span className="text-[#22c55e]">❯</span> codify
          </span>
          <Link
            href="/interview/soul"
            className="font-mono text-xs bg-[#22c55e] text-black px-4 py-2 font-bold hover:brightness-110 transition-all"
          >
            Build Reference →
          </Link>
        </div>
      </nav>

      <div className="mx-auto max-w-4xl px-6 py-10">
        {/* Context Power Score */}
        <div className="bg-[#111111] border border-[#1a1a1a] p-8 mb-8">
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-[#4a9eff] mb-5">
            Context Power Score
          </p>

          <div className="flex items-baseline gap-3 mb-4">
            <span className="font-mono text-6xl font-bold tabular-nums">
              {score.percentage}
            </span>
            <span className="font-mono text-xl text-[#6b6b6b]">/ 100</span>
          </div>

          <div className="font-mono text-sm text-[#4a9eff] tracking-wider mb-3">
            {terminalBar(score.percentage, 40)}
          </div>

          <p className="text-sm text-[#a0a0a0]">
            {score.total} points across {score.files.length} core files
            {missingCount > 0 && (
              <span className="text-[#6b6b6b]">
                {" "}&middot; {missingCount} file{missingCount > 1 ? "s" : ""} missing
              </span>
            )}
          </p>
        </div>

        {/* Reference Files */}
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-[#4a9eff] mb-4">
          Reference Files
        </p>

        <div className="grid gap-3 sm:grid-cols-2 mb-8">
          {score.files.map((file) => (
            <FileCard key={file.name} file={file} />
          ))}
        </div>

        {/* Next Steps */}
        {score.recommendations.length > 0 && (
          <>
            <p className="font-mono text-xs uppercase tracking-[0.2em] text-[#4a9eff] mb-4">
              Next Steps
            </p>

            <div className="bg-[#111111] border border-[#1a1a1a] p-5 space-y-3">
              {score.recommendations.map((rec, i) => (
                <div key={i} className="flex items-start gap-3">
                  <span className="font-mono text-[#22c55e] text-sm shrink-0">❯</span>
                  <p className="text-sm text-[#a0a0a0]">{rec}</p>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Footer */}
      <footer className="border-t border-[#1a1a1a] px-6 py-6 mt-auto">
        <div className="mx-auto max-w-4xl flex items-center justify-between">
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
