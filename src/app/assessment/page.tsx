"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth-context";
import { loadAllAnswers } from "@/lib/db";
import Link from "next/link";
import { useRouter } from "next/navigation";
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

interface FileConfig {
  storageKey: string;
  name: string;
  path: string;
  interviewPath: string;
  previewPath: string;
  buildContent: (answers: Record<string, string>) => string;
}

const FILE_CONFIGS: FileConfig[] = [
  {
    storageKey: "codify-interview-soul",
    name: "soul.md",
    path: "reference/core/soul.md",
    interviewPath: "/interview/soul",
    previewPath: "/preview/soul",
    buildContent: (a) => {
      const s: string[] = ["# Soul\n"];
      if (a.origin) s.push(`## Origin Story\n\n${a.origin.trim()}\n`);
      if (a.problem) s.push(`## The Problem We Solve\n\n${a.problem.trim()}\n`);
      if (a.belief) s.push(`## Core Belief\n\n${a.belief.trim()}\n`);
      if (a.transformation) s.push(`## The Transformation\n\n${a.transformation.trim()}\n`);
      if (a.why_you) s.push(`## Why Us\n\n${a.why_you.trim()}\n`);
      if (a.values) s.push(`## Non-Negotiables\n\n${a.values.trim()}\n`);
      if (a.mission) s.push(`## The Mission\n\n${a.mission.trim()}\n`);
      return s.join("\n");
    },
  },
  {
    storageKey: "codify-interview-offer",
    name: "offer.md",
    path: "reference/core/offer.md",
    interviewPath: "/interview/offer",
    previewPath: "/preview/offer",
    buildContent: (a) => {
      const s: string[] = ["# Offer\n"];
      if (a.offer_name) s.push(`## The Offer\n\n${a.offer_name.trim()}\n`);
      if (a.offer_outcome) s.push(`## The Outcome\n\n${a.offer_outcome.trim()}\n`);
      if (a.offer_price) s.push(`## Price & Model\n\n${a.offer_price.trim()}\n`);
      if (a.offer_audience) s.push(`## Who It's For\n\n${a.offer_audience.trim()}\n`);
      if (a.offer_differentiator) s.push(`## Why This vs Alternatives\n\n${a.offer_differentiator.trim()}\n`);
      return s.join("\n");
    },
  },
  {
    storageKey: "codify-interview-audience",
    name: "audience.md",
    path: "reference/core/audience.md",
    interviewPath: "/interview/audience",
    previewPath: "/preview/audience",
    buildContent: (a) => {
      const s: string[] = ["# Audience\n"];
      if (a.audience_who) s.push(`## Who They Are\n\n${a.audience_who.trim()}\n`);
      if (a.audience_struggle) s.push(`## What They're Struggling With\n\n${a.audience_struggle.trim()}\n`);
      if (a.audience_tried) s.push(`## What They've Already Tried\n\n${a.audience_tried.trim()}\n`);
      if (a.audience_desire) s.push(`## What They Actually Want\n\n${a.audience_desire.trim()}\n`);
      if (a.audience_objection) s.push(`## Why They Hesitate\n\n${a.audience_objection.trim()}\n`);
      return s.join("\n");
    },
  },
  {
    storageKey: "codify-interview-voice",
    name: "voice.md",
    path: "reference/core/voice.md",
    interviewPath: "/interview/voice",
    previewPath: "/preview/voice",
    buildContent: (a) => {
      const s: string[] = ["# Voice\n"];
      if (a.voice_tone) s.push(`## Tone\n\n${a.voice_tone.trim()}\n`);
      if (a.voice_phrases) s.push(`## Signature Phrases\n\n${a.voice_phrases.trim()}\n`);
      if (a.voice_never) s.push(`## Words We Never Use\n\n${a.voice_never.trim()}\n`);
      if (a.voice_example) s.push(`## Example (Write Like You Talk)\n\n${a.voice_example.trim()}\n`);
      if (a.voice_personality) s.push(`## Personality\n\n${a.voice_personality.trim()}\n`);
      return s.join("\n");
    },
  },
];

interface ScoutItem {
  id: string;
  title: string;
  summary: string;
}

export default function AssessmentPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [score, setScore] = useState<ContextScore | null>(null);
  const [completedFiles, setCompletedFiles] = useState<string[]>([]);
  const [missingFiles, setMissingFiles] = useState<FileConfig[]>([]);
  const [scoutItems, setScoutItems] = useState<ScoutItem[]>([]);
  const [scouting, setScouting] = useState(false);
  const [scoutDone, setScoutDone] = useState(false);

  useEffect(() => {
    const init = async () => {
      if (user) {
        await loadAllAnswers();
      }

      const completed: string[] = [];
      const missing: FileConfig[] = [];

      const files = FILE_CONFIGS.map((config) => {
        const raw = sessionStorage.getItem(config.storageKey);
        const answers = raw ? JSON.parse(raw) : null;

        let content = "";
        if (answers) {
          content = config.buildContent(answers);
          completed.push(config.name);
        } else {
          missing.push(config);
        }

        return {
          name: config.name,
          path: config.path,
          ...(content
            ? { content, lastModified: new Date().toISOString().split("T")[0] }
            : {}),
        };
      });

      setCompletedFiles(completed);
      setMissingFiles(missing);
      setScore(calculateContextScore(files));

      // Auto-scout if user is logged in and has files
      if (user && completed.length > 0) {
        autoScout();
      }
    };
    init();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const autoScout = async () => {
    setScouting(true);
    try {
      const res = await fetch("/api/content-queue/scout", { method: "POST" });
      if (res.ok) {
        const d = await res.json();
        setScoutItems(d.items || []);
      }
    } catch {
      // Silent — dashboard will still work
    } finally {
      setScouting(false);
      setScoutDone(true);
    }
  };

  if (!score) return null;

  const completedCount = score.files.filter((f) => f.status !== "missing").length;
  const allComplete = missingFiles.length === 0;

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white flex flex-col">
      {/* Nav */}
      <nav className="border-b border-[#1a1a1a] px-6 py-4">
        <div className="mx-auto flex max-w-4xl items-center justify-between">
          <Link href="/" className="font-mono text-lg text-white">
            <span className="text-[#22c55e]">&#10095;</span> codify
          </Link>
          <div className="flex items-center gap-4">
            <span className="font-mono text-xs uppercase tracking-[0.15em] text-[#4a9eff]">
              Assessment
            </span>
            {user && (
              <span className="font-mono text-xs text-[#6b6b6b]">
                {user.email}
              </span>
            )}
          </div>
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
            {completedCount} of {score.files.length} knowledge areas captured
          </p>
        </div>

        {/* What your knowledge unlocked — replaces "paste into AI" */}
        {completedCount > 0 && (
          <div className="mb-10">
            <p className="font-mono text-xs uppercase tracking-[0.2em] text-[#f59e0b] mb-4">
              {scouting
                ? "Scanning Your Expertise..."
                : scoutDone
                ? "Matched to Your Expertise"
                : "Opportunities"}
            </p>

            {scouting ? (
              <div className="bg-[#111111] border border-[#1a1a1a] p-8">
                <div className="flex items-center gap-3">
                  <div className="w-4 h-4 border-2 border-[#f59e0b] border-t-transparent rounded-full animate-spin" />
                  <p className="font-mono text-sm text-[#a0a0a0]">
                    The Opportunity Scout is analyzing your knowledge files and finding content gaps matched to your expertise...
                  </p>
                </div>
              </div>
            ) : scoutItems.length > 0 ? (
              <div className="bg-[#111111] border border-[#1a1a1a] divide-y divide-[#0a0a0a]">
                {scoutItems.map((item, i) => (
                  <div key={item.id || i} className="px-5 py-4">
                    <div className="flex items-start gap-3">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#f59e0b] mt-2 shrink-0" />
                      <div>
                        <p className="font-mono text-sm text-white mb-1">{item.title}</p>
                        {item.summary && (
                          <p className="text-xs text-[#6b6b6b] leading-relaxed">
                            {item.summary.substring(0, 200)}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
                <div className="px-5 py-4 bg-white/[0.02]">
                  <p className="font-mono text-xs text-[#a0a0a0]">
                    These opportunities are waiting in your dashboard. Research deepens them over time.
                  </p>
                </div>
              </div>
            ) : scoutDone ? (
              <div className="bg-[#111111] border border-[#1a1a1a] p-8">
                <p className="font-mono text-sm text-[#a0a0a0]">
                  Opportunities will appear in your dashboard once you sign in and complete your knowledge files.
                </p>
              </div>
            ) : null}
          </div>
        )}

        {/* Knowledge file breakdown */}
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-[#4a9eff] mb-4">
          Knowledge Files
        </p>

        <div className="space-y-3 mb-10">
          {score.files.map((file) => {
            const config = STATUS_CONFIG[file.status];
            const percentage = Math.round((file.score / file.maxScore) * 100);
            const fileConfig = FILE_CONFIGS.find((fc) => fc.name === file.name);
            return (
              <div
                key={file.name}
                className="bg-[#111111] border border-[#1a1a1a] px-5 py-4"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-[#22c55e] text-sm">{file.name}</span>
                    {file.status !== "missing" && fileConfig && (
                      <Link
                        href={fileConfig.previewPath}
                        className="font-mono text-[10px] uppercase tracking-[0.1em] text-[#4a9eff] hover:text-white transition-colors"
                      >
                        view
                      </Link>
                    )}
                  </div>
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

        {/* All complete — go to dashboard */}
        {allComplete ? (
          <div className="bg-white/[0.03] border border-[#22c55e] p-8 mb-10">
            <p className="font-mono text-xs uppercase tracking-[0.2em] text-[#22c55e] mb-3">
              Your Knowledge Engine is Live
            </p>
            <p className="font-mono text-sm text-white mb-2">
              All 4 knowledge areas captured.
            </p>
            <p className="text-sm text-[#a0a0a0] mb-6">
              Every output from here is informed by your expertise — your voice, your offer, your audience. The more you research and refine, the smarter it gets.
            </p>
            <button
              onClick={() => router.push("/dashboard")}
              className="font-mono text-sm font-bold px-8 py-3 hover:brightness-110 transition-all"
              style={{ backgroundColor: "#22c55e", color: "#000000", borderRadius: 0 }}
            >
              Go to Dashboard &rarr;
            </button>
          </div>
        ) : (
          <>
            <p className="font-mono text-xs uppercase tracking-[0.2em] text-[#4a9eff] mb-4">
              Build Next File
            </p>
            <div className="space-y-3 mb-10">
              {missingFiles.map((config) => (
                <div
                  key={config.name}
                  className="bg-[#111111] border border-[#1a1a1a] px-5 py-4 flex items-center justify-between"
                >
                  <div>
                    <span className="font-mono text-sm text-[#ef4444]">{config.name}</span>
                    <span className="font-mono text-[10px] uppercase tracking-[0.1em] text-[#6b6b6b] ml-3">
                      not started
                    </span>
                  </div>
                  <Link href={config.interviewPath}>
                    <button className="font-mono text-xs font-bold px-4 py-2 hover:brightness-110 transition-all"
                      style={{ backgroundColor: "#22c55e", color: "#000000", borderRadius: 0 }}
                    >
                      Start Interview
                    </button>
                  </Link>
                </div>
              ))}
            </div>

            {/* Partial completion — still push toward dashboard */}
            {completedCount >= 2 && (
              <div className="bg-white/[0.03] border border-[#1a1a1a] p-6 mb-10">
                <p className="font-mono text-xs text-[#a0a0a0] mb-3">
                  You can start using your dashboard now. Completing all 4 files makes every output stronger.
                </p>
                <button
                  onClick={() => router.push("/dashboard")}
                  className="font-mono text-xs px-5 py-2 border border-[#22c55e] text-[#22c55e] hover:bg-[#22c55e] hover:text-black transition-colors"
                >
                  Go to Dashboard &rarr;
                </button>
              </div>
            )}
          </>
        )}

        {/* Recommendations */}
        {score.recommendations.length > 0 && (
          <>
            <p className="font-mono text-xs uppercase tracking-[0.2em] text-[#4a9eff] mb-4">
              Ways to Strengthen
            </p>
            <div className="bg-[#111111] border border-[#1a1a1a] p-5 space-y-3 mb-10">
              {score.recommendations.map((rec, i) => (
                <div key={i} className="flex items-start gap-3">
                  <span className="font-mono text-[#22c55e] text-sm shrink-0">&#10095;</span>
                  <p className="text-sm text-[#a0a0a0]">{rec}</p>
                </div>
              ))}
            </div>
          </>
        )}
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
