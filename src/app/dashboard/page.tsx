"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { useTier } from "@/lib/tier-context";
import { loadAllAnswers } from "@/lib/db";
import { calculateContextScore } from "@/lib/scoring";
import { hasAccess, FEATURE_REQUIRED_TIER } from "@/lib/tier";
import type { ContextScore } from "@/lib/types";

const FILE_TYPES = [
  { key: "soul", label: "Soul", storageKey: "codify-interview-soul" },
  { key: "offer", label: "Offer", storageKey: "codify-interview-offer" },
  { key: "audience", label: "Audience", storageKey: "codify-interview-audience" },
  { key: "voice", label: "Voice", storageKey: "codify-interview-voice" },
];

const STATUS_CONFIG: Record<string, { color: string; label: string }> = {
  missing: { color: "#ef4444", label: "NOT STARTED" },
  skeleton: { color: "#f59e0b", label: "SKELETON" },
  draft: { color: "#f59e0b", label: "DRAFT" },
  solid: { color: "#4a9eff", label: "SOLID" },
  strong: { color: "#22c55e", label: "STRONG" },
};

const GENERATE_TYPES = [
  { key: "social_post", label: "Social Posts", desc: "Instagram, X, LinkedIn, TikTok", feature: "generate:social_post" as const },
  { key: "ad_copy", label: "Ad Copy", desc: "Headlines, hooks, and body copy", feature: "generate:ad_copy" as const },
  { key: "email_sequence", label: "Email Sequences", desc: "Welcome, nurture, launch", feature: "generate:email_sequence" as const },
];

function terminalBar(percentage: number, length: number = 20): string {
  const filled = Math.round((percentage / 100) * length);
  const empty = length - filled;
  return "█".repeat(filled) + "░".repeat(empty);
}

export default function DashboardPage() {
  const { user } = useAuth();
  const { tier } = useTier();
  const [score, setScore] = useState<ContextScore | null>(null);
  const [completedCount, setCompletedCount] = useState(0);

  useEffect(() => {
    const init = async () => {
      if (user) await loadAllAnswers();

      const files = FILE_TYPES.map(({ key, storageKey }) => {
        const raw = sessionStorage.getItem(storageKey);
        const enriched = sessionStorage.getItem("codify-enriched-" + key);
        const content = enriched || (raw ? "placeholder content for scoring" : undefined);
        return {
          name: key + ".md",
          path: "reference/core/" + key + ".md",
          ...(content ? { content } : {}),
        };
      });

      const completed = FILE_TYPES.filter(
        ({ storageKey }) => sessionStorage.getItem(storageKey) !== null
      ).length;
      setCompletedCount(completed);
      setScore(calculateContextScore(files));
    };
    init();
  }, [user]);

  if (!score) return null;

  const nextMissing = score.files.find((f) => f.status === "missing");

  return (
    <>
      {/* Welcome */}
      <div className="mb-10">
        <h1 className="font-mono text-xl font-bold mb-2">
          {completedCount === 0
            ? "Let’s build your context."
            : completedCount < 4
            ? "Keep building."
            : "Your context is live."}
        </h1>
        <p className="text-sm text-[#6b6b6b]">
          {completedCount === 0
            ? "Start with your first reference file. Each one makes every AI output better."
            : completedCount < 4
            ? completedCount + " of 4 files built. The more context, the better every output."
            : "All 4 reference files built. Now generate outputs that sound like you."}
        </p>
      </div>

      {/* Context Power Score */}
      <div className="bg-[#111111] border border-[#1a1a1a] p-6 mb-8">
        <div className="flex items-center justify-between mb-3">
          <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#4a9eff]">
            Context Power Score
          </span>
          <Link href="/dashboard/files" className="font-mono text-[10px] text-[#6b6b6b] hover:text-white transition-colors">
            View files →
          </Link>
        </div>
        <div className="flex items-baseline gap-2 mb-2">
          <span className="font-mono text-4xl font-bold tabular-nums">{score.percentage}</span>
          <span className="font-mono text-sm text-[#6b6b6b]">/ 100</span>
        </div>
        <div className="font-mono text-xs text-[#4a9eff] tracking-wider mb-3">
          {terminalBar(score.percentage, 30)}
        </div>

        {/* Mini file grid */}
        <div className="grid grid-cols-4 gap-2">
          {score.files.map((file) => {
            const cfg = STATUS_CONFIG[file.status] || STATUS_CONFIG.missing;
            return (
              <div key={file.name} className="text-center">
                <p className="font-mono text-[10px] text-[#a0a0a0] mb-1">
                  {file.name.replace(".md", "")}
                </p>
                <p className="font-mono text-[9px] uppercase tracking-wider" style={{ color: cfg.color }}>
                  {cfg.label}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Next action */}
      {nextMissing && (
        <div className="bg-[#111111] border border-[#22c55e] p-6 mb-8">
          <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#22c55e] mb-3">
            Next Step
          </p>
          <p className="font-mono text-sm text-white mb-4">
            Build your {nextMissing.name.replace(".md", "")} file
          </p>
          <Link
            href={"/interview/" + nextMissing.name.replace(".md", "")}
            className="inline-block font-mono text-sm font-bold px-6 py-3 hover:brightness-110 transition-all"
            style={{ backgroundColor: "#22c55e", color: "#000", borderRadius: 0 }}
          >
            Start Interview →
          </Link>
        </div>
      )}

      {/* Generate section */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#4a9eff]">
            Generate Outputs
          </span>
          {hasAccess(tier, "generate:ad_copy") && (
            <Link href="/dashboard/generate" className="font-mono text-[10px] text-[#6b6b6b] hover:text-white transition-colors">
              View all →
            </Link>
          )}
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {GENERATE_TYPES.slice(0, 3).map((g) => {
            const locked = !hasAccess(tier, g.feature);
            return (
              <Link
                key={g.key}
                href={locked ? "/dashboard/upgrade" : "/dashboard/generate/" + g.key}
                className="bg-[#111111] border border-[#1a1a1a] p-4 hover:border-[#333] transition-colors block"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-mono text-sm text-white">{g.label}</span>
                  {locked && <span className="font-mono text-[10px] text-[#6b6b6b]">⚿ PRO</span>}
                </div>
                <p className="text-[11px] text-[#6b6b6b]">{g.desc}</p>
              </Link>
            );
          })}
        </div>
      </div>

      {/* The Compounding Loop */}
      <div className="bg-[#111111] border border-[#1a1a1a] p-6 mb-8">
        <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#8b5cf6] mb-4">
          How Codify Works
        </p>
        <p className="font-mono text-sm text-[#a0a0a0] mb-6 leading-relaxed">
          Every cycle makes your outputs better. Research sharpens your reference files.
          Sharper files produce better content. Better content reveals what to research next.
        </p>

        {/* Flow — matches sidebar order */}
        <div className="space-y-0">
          {[
            { icon: "☰", label: "Reference Files", desc: "Build and enrich your soul, offer, audience, and voice", color: "#22c55e", href: "/dashboard/files", step: "Build" },
            { icon: "◆", label: "Research", desc: "Explore topics, make decisions, codify insights back into reference", color: "#4a9eff", href: "/dashboard/research", step: "Research + Decide + Codify" },
            { icon: "⚡", label: "Generate", desc: "Create content powered by your reference files", color: "#f59e0b", href: "/dashboard/generate", step: "Create" },
            { icon: "▶", label: "Outputs", desc: "Review, publish to connected platforms", color: "#8b5cf6", href: "/dashboard/outputs", step: "Publish" },
            { icon: "⬡", label: "Agents", desc: "Multi-step campaigns, audits, deep research", color: "#4a9eff", href: "/dashboard/agents", step: "Automate" },
          ].map((s, i) => (
            <Link key={s.label} href={s.href} className="flex items-center gap-4 p-3 hover:bg-[#1a1a1a] transition-colors group">
              <div className="flex flex-col items-center w-8">
                <span className="text-sm" style={{ color: s.color }}>{s.icon}</span>
                {i < 4 && <div className="w-px h-6 bg-[#333] mt-1" />}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-3">
                  <span className="font-mono text-sm text-white font-bold">{s.label}</span>
                  <span className="font-mono text-[9px] uppercase tracking-wider px-1.5 py-0.5 border" style={{ color: s.color, borderColor: s.color }}>{s.step}</span>
                </div>
                <p className="font-mono text-[11px] text-[#6b6b6b] mt-0.5">{s.desc}</p>
              </div>
              <span className="font-mono text-[#333] text-xs group-hover:text-[#6b6b6b] transition-colors">→</span>
            </Link>
          ))}
        </div>

        {/* Loop back */}
        <div className="flex items-center gap-3 mt-4 pl-12">
          <span className="font-mono text-[#8b5cf6] text-xs">↰</span>
          <span className="font-mono text-[10px] text-[#8b5cf6]">Outputs reveal what to research next — the loop compounds</span>
        </div>

        {/* Loop indicator */}
        <div className="flex items-center justify-center gap-2">
          <div className="h-px flex-1 bg-[#1a1a1a]" />
          <span className="font-mono text-[9px] text-[#8b5cf6] uppercase tracking-[0.2em]">
            Loop — each cycle compounds
          </span>
          <div className="h-px flex-1 bg-[#1a1a1a]" />
        </div>
      </div>

      {/* Quick links */}
      <div className="grid grid-cols-2 gap-3">
        <Link
          href="/dashboard/files"
          className="bg-[#111111] border border-[#1a1a1a] p-4 hover:border-[#333] transition-colors"
        >
          <span className="font-mono text-sm text-[#a0a0a0]">Reference Files</span>
          <p className="text-[11px] text-[#6b6b6b] mt-1">{completedCount}/4 built</p>
        </Link>
        <Link
          href="/dashboard/settings"
          className="bg-[#111111] border border-[#1a1a1a] p-4 hover:border-[#333] transition-colors"
        >
          <span className="font-mono text-sm text-[#a0a0a0]">Settings</span>
          <p className="text-[11px] text-[#6b6b6b] mt-1">API keys, integrations</p>
        </Link>
      </div>
    </>
  );
}
