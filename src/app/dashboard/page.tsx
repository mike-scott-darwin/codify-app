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
  suggested_formats?: string[];
  status: string;
  created_at: string;
}

interface ResearchTopic {
  id: string;
  title: string;
  status: string;
  updated_at: string;
}

const FORMAT_LABELS: Record<string, string> = {
  social_post: "Social Post",
  newsletter: "Newsletter",
  email_sequence: "Email Sequence",
  ad_copy: "Ad Copy",
  landing_page: "Landing Page",
  vsl_script: "VSL Script",
};

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
  const [expandedOpp, setExpandedOpp] = useState<string | null>(null);

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
            ? "Your business brain is compounding."
            : hasExpertise
            ? "Your business brain is taking shape."
            : "Let\u2019s build your business brain."}
        </h1>
        <p className="text-sm text-[#6b6b6b]">
          {allStrong
            ? "Every output is informed by who you actually are."
            : hasExpertise
            ? fileCompleteness + " of 4 areas codified. Each one makes your business brain sharper."
            : "Start codifying. 30 years of expertise, structured into your business brain."}
        </p>
        {error && <p className="font-mono text-xs text-[#ef4444] mt-2">{error}</p>}
      </div>

      {/* Three metric cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-8">
        {/* Context Power Score */}
        <div className="bg-[#111111] border border-[#1a1a1a] p-5">
          <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#4a9eff] block mb-3">
            Business Brain
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
          {weakest && (
            <Link
              href={files[weakest.key]?.exists ? "/dashboard/files/" + weakest.key + "/edit" : "/interview/" + weakest.key}
              className="font-mono text-[10px] text-[#22c55e] hover:text-white transition-colors mt-3 block"
            >
              {files[weakest.key]?.exists
                ? "Strengthen " + weakest.label.toLowerCase() + " →"
                : "Add " + weakest.label.toLowerCase() + " →"}
            </Link>
          )}
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
              ? "Your business brain generates outputs that sound like you."
              : "Every output sounds like you. Your brain is working."}
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
              ? "Your brain spots opportunities others miss."
              : "Matched to your brain. Review and approve."}
          </p>
          <Link href="/dashboard/queue" className="font-mono text-[10px] text-[#f59e0b] hover:text-white transition-colors mt-2 inline-block">
            View queue &rarr;
          </Link>
        </div>
      </div>


      {/* Opportunities — full width with summary + detail */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-3">
          <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#f59e0b]">
            Matched to Your Expertise
          </span>
          {opportunities.length > 0 && (
            <Link href="/dashboard/queue" className="font-mono text-[10px] text-[#6b6b6b] hover:text-white transition-colors">
              Manage queue &rarr;
            </Link>
          )}
        </div>

        {opportunities.length === 0 ? (
          <div className="bg-[#111111] border border-[#1a1a1a] p-8 text-center">
            {hasAnyFile ? (
              <>
                <p className="font-mono text-sm text-white mb-2">
                  Your business brain is ready.
                </p>
                <p className="font-mono text-xs text-[#6b6b6b] mb-5">
                  The Opportunity Scout cross-references your brain against market gaps only you can fill.
                </p>
                {scoutError && (
                  <p className="font-mono text-[10px] text-[#ef4444] mb-3">{scoutError}</p>
                )}
                <button
                  onClick={runScout}
                  disabled={scouting}
                  className="font-mono text-sm font-bold px-6 py-3 transition-all disabled:opacity-50"
                  style={{ backgroundColor: "#f59e0b", color: "#000", borderRadius: 0 }}
                >
                  {scouting ? "Scanning your brain..." : "Scout My Brain \u2192"}
                </button>
                <p className="font-mono text-[10px] text-[#6b6b6b] mt-4">
                  Research deepens and refines these over time.
                </p>
              </>
            ) : (
              <>
                <p className="font-mono text-xs text-[#6b6b6b] mb-3">
                  Codify at least one area to activate the Opportunity Scout.
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
          <>
            <div className="space-y-3">
              {opportunities.map((opp) => {
                const isExpanded = expandedOpp === opp.id;
                return (
                  <div
                    key={opp.id}
                    className="bg-[#111111] border border-[#1a1a1a] transition-colors"
                  >
                    {/* Summary row — always visible */}
                    <button
                      onClick={() => setExpandedOpp(isExpanded ? null : opp.id)}
                      className="w-full text-left px-5 py-4 flex items-start gap-4 hover:bg-[#1a1a1a]/50 transition-colors"
                    >
                      <span className="w-2 h-2 rounded-full bg-[#f59e0b] mt-1.5 shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="font-mono text-sm text-white font-bold mb-1">{opp.title}</p>
                        <p className="font-mono text-xs text-[#6b6b6b] leading-relaxed">
                          {isExpanded
                            ? opp.summary
                            : opp.summary
                            ? opp.summary.substring(0, 150) + (opp.summary.length > 150 ? "..." : "")
                            : ""}
                        </p>
                      </div>
                      <div className="flex items-center gap-3 shrink-0 mt-0.5">
                        {opp.relevance_score && opp.relevance_score > 0 && (
                          <span
                            className="font-mono text-xs font-bold"
                            style={{ color: opp.relevance_score > 70 ? "#22c55e" : "#f59e0b" }}
                          >
                            {opp.relevance_score}%
                          </span>
                        )}
                        <span className="font-mono text-[10px] text-[#6b6b6b]">
                          {isExpanded ? "\u25B2" : "\u25BC"}
                        </span>
                      </div>
                    </button>

                    {/* Expanded detail */}
                    {isExpanded && (
                      <div className="px-5 pb-4 border-t border-[#1a1a1a]">
                        <div className="pt-4">
                          {/* Suggested formats */}
                          {opp.suggested_formats && opp.suggested_formats.length > 0 && (
                            <div className="mb-4">
                              <span className="font-mono text-[9px] uppercase tracking-wider text-[#6b6b6b] block mb-2">
                                Suggested formats
                              </span>
                              <div className="flex flex-wrap gap-2">
                                {opp.suggested_formats.map((fmt, i) => (
                                  <span
                                    key={i}
                                    className="font-mono text-[10px] px-2.5 py-1 border border-[#1a1a1a] text-[#a0a0a0]"
                                  >
                                    {FORMAT_LABELS[fmt] || fmt}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Source + date */}
                          <div className="flex items-center gap-4 mb-4">
                            {opp.source && (
                              <span className="font-mono text-[9px] uppercase tracking-wider text-[#4a9eff]">
                                {opp.source === "opportunity_scout" ? "Opportunity Scout" :
                                 opp.source === "research_scout" ? "Research Scout" :
                                 opp.source === "trend_monitor" ? "Trend Monitor" :
                                 opp.source}
                              </span>
                            )}
                            <span className="font-mono text-[9px] text-[#6b6b6b]">
                              {new Date(opp.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                            </span>
                          </div>

                          {/* Actions */}
                          <div className="flex gap-2">
                            <Link
                              href="/dashboard/queue"
                              className="font-mono text-[10px] font-bold px-4 py-2 hover:brightness-110 transition-all"
                              style={{ backgroundColor: "#22c55e", color: "#000", borderRadius: 0 }}
                            >
                              Approve &amp; Create &rarr;
                            </Link>
                            <Link
                              href={"/dashboard/research?topic=" + encodeURIComponent(opp.title)}
                              className="font-mono text-[10px] px-4 py-2 border border-[#4a9eff] text-[#4a9eff] hover:bg-[#4a9eff] hover:text-black transition-colors"
                            >
                              Research First &rarr;
                            </Link>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Scout for more */}
            <div className="mt-3 flex items-center justify-between">
              <button
                onClick={runScout}
                disabled={scouting}
                className="font-mono text-[10px] text-[#6b6b6b] hover:text-[#f59e0b] transition-colors disabled:opacity-50"
              >
                {scouting ? "Scanning..." : "Scout for more opportunities \u2192"}
              </button>
              <span className="font-mono text-[10px] text-[#6b6b6b]">
                Research deepens these over time
              </span>
            </div>
          </>
        )}
      </div>

      {/* Recent Activity */}
      <div className="mb-8">
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

      {/* Brain files — below the fold */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-3">
          <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#6b6b6b]">
            Your Brain
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
        <div className="bg-white/[0.03] border border-[#8b5cf6] p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-mono text-sm text-white font-bold mb-1">
                Want us to take it from here?
              </p>
              <p className="font-mono text-xs text-[#6b6b6b]">
                Our Focus Engagement extracts 30+ years of expertise and builds your complete business brain.
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
