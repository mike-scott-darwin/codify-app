"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { calculateContextScore } from "@/lib/scoring";
import type { ContextScore, ReferenceFile } from "@/lib/types";

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

export default function AssessmentPage() {
  const [score, setScore] = useState<ContextScore | null>(null);

  useEffect(() => {
    // Build files from sessionStorage interview answers
    const soulRaw = sessionStorage.getItem("codify-interview-soul");
    const soulAnswers = soulRaw ? JSON.parse(soulRaw) : null;

    let soulContent = "";
    if (soulAnswers) {
      const sections: string[] = ["# Soul\n"];
      if (soulAnswers.origin) sections.push(`## Origin Story\n\n${soulAnswers.origin.trim()}\n`);
      if (soulAnswers.problem) sections.push(`## The Problem We Solve\n\n${soulAnswers.problem.trim()}\n`);
      if (soulAnswers.belief) sections.push(`## Core Belief\n\n${soulAnswers.belief.trim()}\n`);
      if (soulAnswers.transformation) sections.push(`## The Transformation\n\n${soulAnswers.transformation.trim()}\n`);
      if (soulAnswers.why_you) sections.push(`## Why Us\n\n${soulAnswers.why_you.trim()}\n`);
      if (soulAnswers.values) sections.push(`## Non-Negotiables\n\n${soulAnswers.values.trim()}\n`);
      if (soulAnswers.mission) sections.push(`## The Mission\n\n${soulAnswers.mission.trim()}\n`);
      soulContent = sections.join("\n");
    }

    const files = [
      {
        name: "soul.md",
        path: "reference/core/soul.md",
        ...(soulContent ? { content: soulContent, lastModified: new Date().toISOString().split("T")[0] } : {}),
      },
      { name: "offer.md", path: "reference/core/offer.md" },
      { name: "audience.md", path: "reference/core/audience.md" },
      { name: "voice.md", path: "reference/core/voice.md" },
    ];

    setScore(calculateContextScore(files));
  }, []);

  if (!score) return null;

  const completedCount = score.files.filter((f) => f.status !== "missing").length;

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white flex flex-col">
      {/* Nav */}
      <nav className="border-b border-[#1a1a1a] px-6 py-4">
        <div className="mx-auto flex max-w-4xl items-center justify-between">
          <Link href="/" className="font-mono text-lg text-white">
            <span className="text-[#22c55e]">❯</span> codify
          </Link>
          <span className="font-mono text-xs uppercase tracking-[0.15em] text-[#4a9eff]">
            Assessment
          </span>
        </div>
      </nav>

      <div className="mx-auto max-w-4xl px-6 py-12 flex-1">
        {/* Context Power Score */}
        <div className="bg-[#111111] border border-[#1a1a1a] p-8 mb-10">
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
            {completedCount} of {score.files.length} core files built
          </p>
        </div>

        {/* File breakdown */}
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-[#4a9eff] mb-4">
          Reference Files
        </p>

        <div className="space-y-3 mb-10">
          {score.files.map((file) => {
            const config = STATUS_CONFIG[file.status];
            const percentage = Math.round((file.score / file.maxScore) * 100);
            return (
              <div
                key={file.name}
                className="bg-[#111111] border border-[#1a1a1a] px-5 py-4"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-mono text-[#22c55e] text-sm">{file.name}</span>
                  <div className="flex items-center gap-4">
                    <span className="font-mono text-xs text-[#a0a0a0]">
                      {file.score}/{file.maxScore} pts
                    </span>
                    <span className={`font-mono text-[10px] uppercase tracking-[0.1em] ${config.color}`}>
                      {config.label}
                    </span>
                  </div>
                </div>
                <div className="font-mono text-xs text-[#4a9eff] tracking-wider">
                  {terminalBar(percentage, 30)}
                </div>
                {file.wordCount > 0 && (
                  <p className="font-mono text-[10px] text-[#6b6b6b] mt-1">
                    {file.wordCount} words
                  </p>
                )}
              </div>
            );
          })}
        </div>

        {/* Next steps */}
        {score.recommendations.length > 0 && (
          <>
            <p className="font-mono text-xs uppercase tracking-[0.2em] text-[#4a9eff] mb-4">
              Next Steps
            </p>
            <div className="bg-[#111111] border border-[#1a1a1a] p-5 space-y-3 mb-10">
              {score.recommendations.map((rec, i) => (
                <div key={i} className="flex items-start gap-3">
                  <span className="font-mono text-[#22c55e] text-sm shrink-0">❯</span>
                  <p className="text-sm text-[#a0a0a0]">{rec}</p>
                </div>
              ))}
            </div>
          </>
        )}

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3">
          <Link href="/preview/soul">
            <button className="font-mono text-sm px-6 py-3 border border-[#1a1a1a] text-[#a0a0a0] hover:text-white hover:border-[#333] transition-colors w-full sm:w-auto">
              ← View soul.md
            </button>
          </Link>
          <Link href="/">
            <button className="font-mono text-sm font-bold bg-[#22c55e] text-black px-6 py-3 hover:brightness-110 transition-all w-full sm:w-auto">
              Build next file →
            </button>
          </Link>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-[#1a1a1a] px-6 py-6">
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
