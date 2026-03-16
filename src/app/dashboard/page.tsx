"use client";

import Link from "next/link";
import { useRepo } from "@/lib/repo-context";
import { useTier } from "@/lib/tier-context";
import { hasAccess } from "@/lib/tier";
import type { Feature } from "@/lib/tier";

const CORE_FILES = [
  { key: "soul", label: "Soul", description: "Why you exist" },
  { key: "offer", label: "Offer", description: "What you sell" },
  { key: "audience", label: "Audience", description: "Who you serve" },
  { key: "voice", label: "Voice", description: "How you sound" },
];

const GENERATE_TYPES = [
  { key: "social_post", label: "Social Posts", desc: "Instagram, X, LinkedIn, TikTok", feature: "generate:social_post" as Feature },
  { key: "ad_copy", label: "Ad Copy", desc: "Headlines, hooks, and body copy", feature: "generate:ad_copy" as Feature },
  { key: "email_sequence", label: "Email Sequences", desc: "Welcome, nurture, launch", feature: "generate:email_sequence" as Feature },
];

function terminalBar(percentage: number, length: number = 20): string {
  const filled = Math.round((percentage / 100) * length);
  const empty = length - filled;
  return "\u2588".repeat(filled) + "\u2591".repeat(empty);
}

function fileStatus(wordCount: number, exists: boolean): { label: string; color: string } {
  if (!exists) return { label: "MISSING", color: "#ef4444" };
  if (wordCount < 50) return { label: "THIN", color: "#f59e0b" };
  if (wordCount < 200) return { label: "GROWING", color: "#4a9eff" };
  return { label: "STRONG", color: "#22c55e" };
}

const LOOP_STEPS = [
  { key: "build", label: "Build", desc: "Reference files" },
  { key: "research", label: "Research", desc: "Deepen context" },
  { key: "create", label: "Create", desc: "Generate outputs" },
  { key: "publish", label: "Publish", desc: "Ship content" },
];

function getActiveStep(fileCompleteness: number): string {
  if (fileCompleteness < 4) return "build";
  return "research";
}

export default function DashboardPage() {
  const { owner, repo, connected, loading, files, fileCompleteness, contextScore, error } = useRepo();
  const { tier } = useTier();

  if (loading) return null;

  // Find weakest file for smart action
  const weakest = CORE_FILES.find((f) => {
    const file = files[f.key];
    return !file || !file.exists || file.wordCount < 50;
  });

  const allStrong = fileCompleteness === 4;
  const activeStep = getActiveStep(fileCompleteness);

  return (
    <>
      {/* Repo Header */}
      <div className="mb-10">
        <div className="flex items-center gap-3 mb-2">
          <h1 className="font-mono text-xl font-bold">
            {fileCompleteness === 0
              ? "Let\u2019s build your context."
              : fileCompleteness < 4
              ? "Keep building."
              : "Your context is live."}
          </h1>
          {connected && (
            <span className="font-mono text-[10px] px-2 py-0.5 border border-[#22c55e]/30 text-[#22c55e]">
              {owner}/{repo}
            </span>
          )}
        </div>
        <p className="text-sm text-[#6b6b6b]">
          {fileCompleteness === 0
            ? "Start with your first reference file. Each one makes every AI output better."
            : fileCompleteness < 4
            ? fileCompleteness + " of 4 files built. The more context, the better every output."
            : "All 4 reference files built. Now generate outputs that sound like you."}
        </p>
        {error && (
          <p className="font-mono text-xs text-[#ef4444] mt-2">{error}</p>
        )}
      </div>

      {/* Context Power Score */}
      <div className="bg-[#111111] border border-[#1a1a1a] p-6 mb-8">
        <div className="flex items-center justify-between mb-3">
          <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#4a9eff]">
            Context Power Score
          </span>
          <Link href="/dashboard/files" className="font-mono text-[10px] text-[#6b6b6b] hover:text-white transition-colors">
            View files &rarr;
          </Link>
        </div>
        <div className="flex items-baseline gap-2 mb-2">
          <span className="font-mono text-4xl font-bold tabular-nums">{contextScore}</span>
          <span className="font-mono text-sm text-[#6b6b6b]">/ 100</span>
        </div>
        <div className="font-mono text-xs text-[#4a9eff] tracking-wider">
          {terminalBar(contextScore, 30)}
        </div>
      </div>

      {/* File Health Grid */}
      <div className="mb-8">
        <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#4a9eff] block mb-4">
          File Health
        </span>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {CORE_FILES.map((f) => {
            const file = files[f.key];
            const exists = file?.exists ?? false;
            const wc = file?.wordCount ?? 0;
            const status = fileStatus(wc, exists);

            return (
              <div key={f.key} className="bg-[#111111] border border-[#1a1a1a] p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-mono text-sm text-white font-bold">{f.label}</span>
                  <span
                    className="font-mono text-[9px] uppercase tracking-wider"
                    style={{ color: status.color }}
                  >
                    {status.label}
                  </span>
                </div>
                <p className="text-[10px] text-[#6b6b6b] mb-3">{f.description}</p>
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[10px] text-[#6b6b6b]">
                    {exists ? wc + " words" : "\u2014"}
                  </span>
                  <Link
                    href={exists ? "/dashboard/files/" + f.key + "/edit" : "/interview/" + f.key}
                    className="font-mono text-[10px] text-[#4a9eff] hover:text-white transition-colors"
                  >
                    {exists ? "Edit \u2192" : "Start \u2192"}
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Smart Actions */}
      <div className="mb-8">
        <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#22c55e] block mb-4">
          Next Step
        </span>
        {weakest ? (
          <div className="bg-[#111111] border border-[#22c55e] p-6">
            <p className="font-mono text-sm text-white mb-4">
              {files[weakest.key]?.exists
                ? "Enrich your " + weakest.label.toLowerCase() + " file \u2014 it\u2019s thin"
                : "Build your " + weakest.label.toLowerCase() + " file"}
            </p>
            <Link
              href={files[weakest.key]?.exists ? "/dashboard/files/" + weakest.key + "/edit" : "/interview/" + weakest.key}
              className="inline-block font-mono text-sm font-bold px-6 py-3 hover:brightness-110 transition-all"
              style={{ backgroundColor: "#22c55e", color: "#000", borderRadius: 0 }}
            >
              {files[weakest.key]?.exists ? "Enrich " + weakest.label + " \u2192" : "Start Interview \u2192"}
            </Link>
          </div>
        ) : allStrong ? (
          <div className="bg-[#111111] border border-[#8b5cf6] p-6">
            <p className="font-mono text-sm text-white mb-4">
              All files are strong. Start researching to deepen your context further.
            </p>
            <Link
              href="/dashboard/research"
              className="inline-block font-mono text-sm font-bold px-6 py-3 hover:brightness-110 transition-all"
              style={{ backgroundColor: "#8b5cf6", color: "#fff", borderRadius: 0 }}
            >
              Start Research &rarr;
            </Link>
          </div>
        ) : null}
      </div>

      {/* Generate section */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#4a9eff]">
            Generate Outputs
          </span>
          {hasAccess(tier, "generate:ad_copy") && (
            <Link href="/dashboard/generate" className="font-mono text-[10px] text-[#6b6b6b] hover:text-white transition-colors">
              View all &rarr;
            </Link>
          )}
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {GENERATE_TYPES.map((g) => {
            const locked = !hasAccess(tier, g.feature);
            return (
              <Link
                key={g.key}
                href={locked ? "/dashboard/upgrade" : "/dashboard/generate/" + g.key}
                className="bg-[#111111] border border-[#1a1a1a] p-4 hover:border-[#333] transition-colors block"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-mono text-sm text-white">{g.label}</span>
                  {locked && <span className="font-mono text-[10px] text-[#6b6b6b]">&loz; PRO</span>}
                </div>
                <p className="text-[11px] text-[#6b6b6b]">{g.desc}</p>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Compounding Loop */}
      <div className="bg-[#111111] border border-[#1a1a1a] p-6">
        <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#6b6b6b] block mb-4">
          The Compounding Loop
        </span>
        <div className="flex items-center justify-between">
          {LOOP_STEPS.map((step, i) => {
            const isActive = step.key === activeStep;
            return (
              <div key={step.key} className="flex items-center">
                <div className="text-center">
                  <div
                    className={"font-mono text-xs font-bold px-3 py-1.5 border transition-colors " + (isActive ? "border-[#22c55e] text-[#22c55e] bg-[#22c55e]/10" : "border-[#1a1a1a] text-[#6b6b6b]")}
                  >
                    {step.label}
                  </div>
                  <p className="font-mono text-[9px] text-[#6b6b6b] mt-1">{step.desc}</p>
                </div>
                {i < LOOP_STEPS.length - 1 && (
                  <span className="font-mono text-[#333] mx-2">&rarr;</span>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
}
