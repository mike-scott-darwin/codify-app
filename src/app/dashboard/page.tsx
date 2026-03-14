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

function terminalBar(percentage: number, length: number = 20): string {
  const filled = Math.round((percentage / 100) * length);
  const empty = length - filled;
  return "█".repeat(filled) + "░".repeat(empty);
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
  const percentage = Math.round((file.score / file.maxScore) * 100);

  return (
    <div className="bg-[#111111] border border-[#1a1a1a] p-5">
      <div className="flex items-center justify-between mb-3">
        <span className="font-mono text-[#22c55e] text-sm">{file.name}</span>
        <span className={`font-mono text-xs uppercase tracking-[0.1em] ${config.color}`}>
          {config.label}
        </span>
      </div>

      <div className="flex items-center justify-between mb-2">
        <span className="font-mono text-xs text-[#6b6b6b]">
          {file.wordCount} words
        </span>
        <span className="font-mono text-xs text-[#a0a0a0]">
          {file.score}/{file.maxScore} pts
        </span>
      </div>

      <div className="font-mono text-xs text-[#4a9eff] tracking-wider mb-2">
        {terminalBar(percentage, 24)}
      </div>

      {file.lastModified && (
        <p className="font-mono text-[10px] text-[#6b6b6b]">
          modified {file.lastModified}
        </p>
      )}
    </div>
  );
}

export default function DashboardPage() {
  const [score, setScore] = useState<ContextScore | null>(null);

  useEffect(() => {
    const result = calculateContextScore(DEMO_FILES);
    setScore(result);
  }, []);

  if (!score) return null;

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      {/* Nav */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-[#0a0a0a] border-b border-[#1a1a1a] px-6 py-4">
        <div className="mx-auto flex max-w-5xl items-center justify-between">
          <Link href="/" className="font-mono text-lg text-white hover:text-[#a0a0a0] transition-colors">
            <span className="text-[#4a9eff]">❯</span> codify
          </Link>
          <div className="flex items-center gap-6">
            <Link
              href="/"
              className="font-mono text-xs uppercase tracking-[0.15em] text-[#6b6b6b] hover:text-[#a0a0a0] transition-colors"
            >
              Home
            </Link>
            <span className="font-mono text-xs uppercase tracking-[0.15em] text-[#4a9eff]">
              Dashboard
            </span>
          </div>
        </div>
      </nav>

      <div className="mx-auto max-w-5xl px-6 pt-24 pb-20">
        {/* Context Power Score */}
        <div className="mb-12">
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-[#4a9eff] mb-6">
            Context Power Score
          </p>

          <div className="bg-[#111111] border border-[#1a1a1a] p-8">
            <div className="flex items-baseline gap-4 mb-4">
              <span className="font-mono text-6xl font-bold text-white tabular-nums">
                {score.percentage}
              </span>
              <span className="font-mono text-2xl text-[#6b6b6b]">%</span>
              <span className="font-mono text-2xl text-[#a0a0a0] ml-2">
                grade {score.grade}
              </span>
            </div>

            <div className="font-mono text-sm text-[#4a9eff] tracking-wider mb-3">
              {terminalBar(score.percentage, 40)}
            </div>

            <p className="font-mono text-xs text-[#6b6b6b]">
              {score.total} / {score.maxTotal} points across {score.files.length} core reference files
            </p>
          </div>
        </div>

        {/* Reference File Cards */}
        <div className="mb-12">
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-[#4a9eff] mb-6">
            Reference Files
          </p>

          <div className="grid gap-4 sm:grid-cols-2">
            {score.files.map((file) => (
              <FileCard key={file.name} file={file} />
            ))}
          </div>
        </div>

        {/* Recommendations */}
        {score.recommendations.length > 0 && (
          <div>
            <p className="font-mono text-xs uppercase tracking-[0.2em] text-[#4a9eff] mb-6">
              Recommendations
            </p>

            <div className="bg-[#111111] border border-[#1a1a1a] p-6">
              <div className="space-y-3">
                {score.recommendations.map((rec, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <span className="font-mono text-[#4a9eff] text-sm shrink-0">❯</span>
                    <p className="text-sm text-[#a0a0a0] flex-1">{rec}</p>
                    <Link
                      href="/interview/soul"
                      className="font-mono text-xs text-[#4a9eff] hover:text-white transition-colors shrink-0 border border-[#1a1a1a] px-3 py-1 hover:border-[#4a9eff]"
                    >
                      start →
                    </Link>
                  </div>
                ))}
              </div>

              <div className="mt-6 pt-4 border-t border-[#1a1a1a]">
                <p className="font-mono text-xs text-[#6b6b6b]">
                  <span className="text-[#4a9eff]">❯</span> run{" "}
                  <Link
                    href="/interview/soul"
                    className="text-[#22c55e] hover:underline"
                  >
                    /interview/soul
                  </Link>{" "}
                  to build your first reference file
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
