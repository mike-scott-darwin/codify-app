"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRepo } from "@/lib/repo-context";
import { useTier } from "@/lib/tier-context";

const CORE_FILES = [
  { key: "soul", label: "Soul", description: "Why you exist" },
  { key: "offer", label: "Offer", description: "What you do" },
  { key: "audience", label: "Audience", description: "Who you serve" },
  { key: "voice", label: "Voice", description: "How you sound" },
];

function fileStatus(wordCount: number, exists: boolean): { label: string; color: string } {
  if (!exists) return { label: "MISSING", color: "#ef4444" };
  if (wordCount < 50) return { label: "THIN", color: "#f59e0b" };
  if (wordCount < 200) return { label: "GROWING", color: "#4a9eff" };
  return { label: "STRONG", color: "#22c55e" };
}

function terminalBar(percentage: number, length: number = 20): string {
  const filled = Math.round((percentage / 100) * length);
  const empty = length - filled;
  return "\u2588".repeat(filled) + "\u2591".repeat(empty);
}

interface Output {
  id: string;
  output_type: string;
  title: string;
  created_at: string;
}

interface QueueItem {
  id: string;
  title: string;
  summary?: string;
  relevance_score?: number;
  source?: string;
  status: string;
  created_at: string;
}

interface ResearchTopic {
  id: string;
  title: string;
  status: string;
  updated_at: string;
}

export default function DashboardPage() {
  const { connected, loading, files, fileCompleteness, contextScore, error } = useRepo();
  const { tier } = useTier();

  const [outputs, setOutputs] = useState<Output[]>([]);
  const [outputCount, setOutputCount] = useState(0);
  const [opportunities, setOpportunities] = useState<QueueItem[]>([]);
  const [recentResearch, setRecentResearch] = useState<ResearchTopic[]>([]);
  const [dataLoaded, setDataLoaded] = useState(false);
  const [scouting, setScouting] = useState(false);
  const [scoutError, setScoutError] = useState("");

  // Fetch dashboard data
  useEffect(() => {
    const loadData = async () => {
      try {
        const [outputsRes, queueRes, researchRes] = await Promise.all([
          fetch("/api/outputs"),
          fetch("/api/content-queue?status=pending"),
          fetch("/api/research"),
        ]);

        if (outputsRes.ok) {
          const d = await outputsRes.json();
          const allOutputs: Output[] = d.outputs || [];
          setOutputs(allOutputs.slice(0, 5));
          const now = new Date();
          const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
          setOutputCount(allOutputs.filter((o) => o.created_at >= monthStart).length);
        }

        if (queueRes.ok) {
          const d = await queueRes.json();
          setOpportunities((d.items || []).slice(0, 5));
        }

        if (researchRes.ok) {
          const d = await researchRes.json();
          setRecentResearch((d.topics || []).slice(0, 5));
        }
      } catch {
        // Dashboard still works with repo data
      }
      setDataLoaded(true);
    };
    loadData();
  }, []);

  // Scout opportunities from reference files
  const runScout = async () => {
    setScouting(true);
    setScoutError("");
    try {
      const res = await fetch("/api/content-queue/scout", { method: "POST" });
      if (!res.ok) {
        const d = await res.json();
        setScoutError(d.error || "Scout failed");
        return;
      }
      const d = await res.json();
      // Reload opportunities
      const queueRes = await fetch("/api/content-queue?status=pending");
      if (queueRes.ok) {
        const q = await queueRes.json();
        setOpportunities((q.items || []).slice(0, 5));
      }
    } catch {
      setScoutError("Could not reach the server.");
    } finally {
      setScouting(false);
    }
  };

  if (loading) return null;

  const allStrong = fileCompleteness === 4;
  const hasExpertise = fileCompleteness >= 2;
  const hasAnyFile = fileCompleteness >= 1;

  // Find weakest file for CTA
  const weakest = CORE_FILES.find((f) => {
    const file = files[f.key];
    return !file || !file.exists || file.wordCount < 50;
  });

  // Merge recent activity
  const recentActivity: Array<{ type: string; title: string; date: string; href: string; status?: string }> = [];
  outputs.slice(0, 3).forEach((o) => {
    recentActivity.push({
      type: "output",
      title: o.title || o.output_type.replace(/_/g, " "),
      date: o.created_at,
      href: "/dashboard/outputs",
    });
  });
  recentResearch.slice(0, 3).forEach((r) => {
    recentActivity.push({
      type: "research",
      title: r.title,
      date: r.updated_at,
      href: "/dashboard/research/" + r.id,
      status: r.status,
    });
  });
  recentActivity.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return (
    <>
      {/* Executive Summary */}
      <div className="mb-8">
        <h1 className="font-mono text-xl font-bold mb-2">
          {allStrong
            ? "Your knowledge engine is running."
            : hasExpertise
            ? "Your expertise is taking shape."
            : "Let\u2019s capture your expertise."}
        </h1>
        <p className="text-sm text-[#6b6b6b]">
          {allStrong
            ? "Your institutional knowledge is structured and compounding."
            : hasExpertise
            ? fileCompleteness + " of 4 knowledge areas captured. Keep going \u2014 each one makes every output better."
            : "Start with your first knowledge file. 30 years of expertise, structured for AI."}
        </p>
        {error && <p className="font-mono text-xs text-[#ef4444] mt-2">{error}</p>}
      </div>

      {/* Three metric cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-8">
        {/* Context Power Score */}
        <div className="bg-[#111111] border border-[#1a1a1a] p-5">
          <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#4a9eff] block mb-3">
            Knowledge Depth
          </span>
          <div className="flex items-baseline gap-2 mb-2">
            <span className="font-mono text-3xl font-bold tabular-nums">{contextScore}</span>
            <span className="font-mono text-sm text-[#6b6b6b]">/ 100</span>
          </div>
          <div className="font-mono text-[10px] text-[#4a9eff] tracking-wider mb-3">
            {terminalBar(contextScore, 20)}
          </div>
          <div className="flex gap-1.5">
            {CORE_FILES.map((f) => {
              const file = files[f.key];
              const s = fileStatus(file?.wordCount ?? 0, file?.exists ?? false);
              return (
                <div key={f.key} className="flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: s.color }} />
                  <span className="font-mono text-[9px] text-[#6b6b6b]">{f.label}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Outputs This Month */}
        <div className="bg-[#111111] border border-[#1a1a1a] p-5">
          <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#22c55e] block mb-3">
            Outputs This Month
          </span>
          <div className="flex items-baseline gap-2 mb-2">
            <span className="font-mono text-3xl font-bold tabular-nums">{dataLoaded ? outputCount : "\u2014"}</span>
          </div>
          <p className="font-mono text-[10px] text-[#6b6b6b] leading-relaxed">
            {outputCount === 0
              ? "Generate your first output from your knowledge files."
              : "Informed by your expertise. Every output sounds like you."}
          </p>
          <Link href="/dashboard/generate" className="font-mono text-[10px] text-[#22c55e] hover:text-white transition-colors mt-2 inline-block">
            Create output &rarr;
          </Link>
        </div>

        {/* Opportunities */}
        <div className="bg-[#111111] border border-[#1a1a1a] p-5">
          <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#f59e0b] block mb-3">
            Opportunities
          </span>
          <div className="flex items-baseline gap-2 mb-2">
            <span className="font-mono text-3xl font-bold tabular-nums">{dataLoaded ? opportunities.length : "\u2014"}</span>
          </div>
          <p className="font-mono text-[10px] text-[#6b6b6b] leading-relaxed">
            {opportunities.length === 0
              ? "Scout opportunities matched to your expertise."
              : "Matched to your unique knowledge. Review and approve."}
          </p>
          <Link href="/dashboard/queue" className="font-mono text-[10px] text-[#f59e0b] hover:text-white transition-colors mt-2 inline-block">
            View queue &rarr;
          </Link>
        </div>
      </div>

      {/* Smart Next Step */}
      {weakest && (
        <div className="bg-white/[0.03] border border-[#22c55e] p-5 mb-8">
          <div className="flex items-center justify-between">
            <div>
              <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#22c55e] block mb-1">
                Next Step
              </span>
              <p className="font-mono text-sm text-white">
                {files[weakest.key]?.exists
                  ? "Your " + weakest.label.toLowerCase() + " file needs more depth. Enrich it to strengthen every output."
                  : "Capture your " + weakest.label.toLowerCase() + " \u2014 " + weakest.description.toLowerCase() + "."}
              </p>
            </div>
            <Link
              href={files[weakest.key]?.exists ? "/dashboard/files/" + weakest.key + "/edit" : "/interview/" + weakest.key}
              className="shrink-0 font-mono text-sm font-bold px-5 py-2.5 hover:brightness-110 transition-all"
              style={{ backgroundColor: "#22c55e", color: "#000", borderRadius: 0 }}
            >
              {files[weakest.key]?.exists ? "Enrich \u2192" : "Start \u2192"}
            </Link>
          </div>
        </div>
      )}

      {allStrong && recentResearch.length === 0 && (
        <div className="bg-white/[0.03] border border-[#8b5cf6] p-5 mb-8">
          <div className="flex items-center justify-between">
            <div>
              <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#8b5cf6] block mb-1">
                Start Compounding
              </span>
              <p className="font-mono text-sm text-white">
                All 4 knowledge areas captured. Research a topic to start making your files smarter over time.
              </p>
            </div>
            <Link
              href="/dashboard/research"
              className="shrink-0 font-mono text-sm font-bold px-5 py-2.5 hover:brightness-110 transition-all"
              style={{ backgroundColor: "#8b5cf6", color: "#fff", borderRadius: 0 }}
            >
              Research &rarr;
            </Link>
          </div>
        </div>
      )}

      {/* Two-column: Opportunities + Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Opportunities matched to expertise */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#f59e0b]">
              Matched to Your Expertise
            </span>
            {opportunities.length > 0 && (
              <Link href="/dashboard/queue" className="font-mono text-[10px] text-[#6b6b6b] hover:text-white transition-colors">
                View all &rarr;
              </Link>
            )}
          </div>

          {opportunities.length === 0 ? (
            <div className="bg-[#111111] border border-[#1a1a1a] p-6 text-center">
              {hasAnyFile ? (
                <>
                  <p className="font-mono text-xs text-[#6b6b6b] mb-4">
                    Your knowledge files are ready. Let the Opportunity Scout find content gaps matched to your expertise.
                  </p>
                  {scoutError && (
                    <p className="font-mono text-[10px] text-[#ef4444] mb-3">{scoutError}</p>
                  )}
                  <button
                    onClick={runScout}
                    disabled={scouting}
                    className="font-mono text-xs font-bold px-5 py-2.5 transition-all disabled:opacity-50"
                    style={{ backgroundColor: "#f59e0b", color: "#000", borderRadius: 0 }}
                  >
                    {scouting ? "Scouting..." : "Scout My Expertise \u2192"}
                  </button>
                  <p className="font-mono text-[10px] text-[#6b6b6b] mt-3">
                    Research deepens these over time.
                  </p>
                </>
              ) : (
                <>
                  <p className="font-mono text-xs text-[#6b6b6b] mb-3">
                    Complete at least one knowledge file to activate the Opportunity Scout.
                  </p>
                  <Link
                    href="/interview/soul"
                    className="font-mono text-[10px] text-[#f59e0b] hover:text-white transition-colors"
                  >
                    Start with Soul &rarr;
                  </Link>
                </>
              )}
            </div>
          ) : (
            <div className="bg-[#111111] border border-[#1a1a1a] divide-y divide-[#0a0a0a]">
              {opportunities.map((opp) => (
                <Link
                  key={opp.id}
                  href="/dashboard/queue"
                  className="flex items-start gap-3 px-4 py-3 hover:bg-[#1a1a1a] transition-colors"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-[#f59e0b] mt-1.5 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <span className="font-mono text-xs text-white block truncate">{opp.title}</span>
                    {opp.summary && (
                      <span className="font-mono text-[10px] text-[#6b6b6b] block truncate mt-0.5">
                        {opp.summary.substring(0, 100)}
                      </span>
                    )}
                  </div>
                  {opp.relevance_score && (
                    <span className="font-mono text-[10px] text-[#f59e0b] shrink-0">
                      {opp.relevance_score}%
                    </span>
                  )}
                </Link>
              ))}
              <div className="px-4 py-2">
                <button
                  onClick={runScout}
                  disabled={scouting}
                  className="font-mono text-[10px] text-[#6b6b6b] hover:text-[#f59e0b] transition-colors disabled:opacity-50"
                >
                  {scouting ? "Scouting..." : "Scout for more \u2192"}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Recent Activity */}
        <div>
          <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#6b6b6b] block mb-3">
            Recent Activity
          </span>

          {recentActivity.length === 0 ? (
            <div className="bg-[#111111] border border-[#1a1a1a] p-6 text-center">
              <p className="font-mono text-xs text-[#6b6b6b]">
                Activity appears here as you build, research, and generate outputs.
              </p>
            </div>
          ) : (
            <div className="bg-[#111111] border border-[#1a1a1a] divide-y divide-[#0a0a0a]">
              {recentActivity.slice(0, 6).map((item, i) => (
                <Link
                  key={i}
                  href={item.href}
                  className="flex items-center gap-3 px-4 py-3 hover:bg-[#1a1a1a] transition-colors"
                >
                  <span
                    className="w-5 h-5 flex items-center justify-center font-mono text-[10px] border shrink-0"
                    style={{
                      borderColor: item.type === "output" ? "#22c55e" : "#4a9eff",
                      color: item.type === "output" ? "#22c55e" : "#4a9eff",
                    }}
                  >
                    {item.type === "output" ? "\u2713" : "R"}
                  </span>
                  <div className="flex-1 min-w-0">
                    <span className="font-mono text-xs text-white block truncate">{item.title}</span>
                    {item.status && (
                      <span className="font-mono text-[10px] text-[#6b6b6b]">{item.status}</span>
                    )}
                  </div>
                  <span className="font-mono text-[10px] text-[#6b6b6b] shrink-0">
                    {new Date(item.date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                  </span>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Knowledge file detail — below the fold */}
      <div className="mt-8">
        <div className="flex items-center justify-between mb-3">
          <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#6b6b6b]">
            Knowledge Files
          </span>
          <Link href="/dashboard/files" className="font-mono text-[10px] text-[#6b6b6b] hover:text-white transition-colors">
            Manage files &rarr;
          </Link>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {CORE_FILES.map((f) => {
            const file = files[f.key];
            const exists = file?.exists ?? false;
            const wc = file?.wordCount ?? 0;
            const status = fileStatus(wc, exists);

            return (
              <Link
                key={f.key}
                href={exists ? "/dashboard/files/" + f.key + "/edit" : "/interview/" + f.key}
                className="bg-[#111111] border border-[#1a1a1a] p-3 hover:border-[#333] transition-colors"
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-mono text-xs text-white font-bold">{f.label}</span>
                  <span className="font-mono text-[9px] uppercase" style={{ color: status.color }}>
                    {status.label}
                  </span>
                </div>
                <span className="font-mono text-[10px] text-[#6b6b6b]">
                  {exists ? wc + " words" : "Not started"}
                </span>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Upgrade CTA for free users */}
      {tier === "free" && allStrong && (
        <div className="mt-8 bg-white/[0.03] border border-[#8b5cf6] p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-mono text-sm text-white font-bold mb-1">
                Want us to take it from here?
              </p>
              <p className="font-mono text-xs text-[#6b6b6b]">
                Our Focus Engagement extracts 30+ years of expertise and builds your complete knowledge engine.
              </p>
            </div>
            <Link
              href="/dashboard/upgrade"
              className="shrink-0 font-mono text-xs font-bold px-5 py-2.5 border border-[#8b5cf6] text-[#8b5cf6] hover:bg-[#8b5cf6] hover:text-white transition-colors"
            >
              Learn More &rarr;
            </Link>
          </div>
        </div>
      )}
    </>
  );
}
