"use client";

import { useState, useEffect } from "react";
import type { ScoreBreakdown, ScoreResult } from "@/lib/score-types";
import { SCORE_DIMENSIONS } from "@/lib/score-types";

interface ScoreCardProps {
  outputId: string;
  score?: number | null;
  breakdown?: ScoreBreakdown | null;
  autoScore?: boolean;
  onScored?: (result: ScoreResult) => void;
}

function getScoreColor(score: number): string {
  if (score >= 85) return "#22c55e";
  if (score >= 70) return "#4a9eff";
  if (score >= 50) return "#f59e0b";
  return "#ef4444";
}

function getScoreLabel(score: number): string {
  if (score >= 85) return "Excellent";
  if (score >= 70) return "Good";
  if (score >= 50) return "Needs Work";
  return "Rework";
}

export default function ScoreCard({ outputId, score: initialScore, breakdown: initialBreakdown, autoScore, onScored }: ScoreCardProps) {
  const [score, setScore] = useState<number | null>(initialScore ?? null);
  const [breakdown, setBreakdown] = useState<ScoreBreakdown | null>(initialBreakdown ?? null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchScore = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/score", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ outputId }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Scoring failed.");
        return;
      }
      setScore(data.score);
      setBreakdown(data.breakdown);
      onScored?.({ score: data.score, breakdown: data.breakdown });
    } catch {
      setError("Network error. Try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (autoScore && score === null) {
      fetchScore();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoScore, outputId]);

  if (loading) {
    return (
      <div className="bg-[#111111] border border-[#1a1a1a] p-6 mt-6">
        <div className="flex items-center justify-center py-8">
          <span className="font-mono text-sm text-[#8b5cf6] animate-pulse">
            Analyzing performance...
          </span>
        </div>
      </div>
    );
  }

  if (score === null || !breakdown) {
    return (
      <div className="bg-[#111111] border border-[#1a1a1a] p-6 mt-6">
        <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#4a9eff] mb-4">
          Performance Score
        </p>
        {error && (
          <p className="font-mono text-xs text-[#ef4444] mb-3">{error}</p>
        )}
        <button
          onClick={fetchScore}
          className="font-mono text-sm font-bold py-2.5 px-6 hover:brightness-110 transition-all"
          style={{ backgroundColor: "#8b5cf6", color: "#fff" }}
        >
          Score Content
        </button>
      </div>
    );
  }

  const color = getScoreColor(score);
  const label = getScoreLabel(score);

  return (
    <div className="bg-[#111111] border border-[#1a1a1a] p-6 mt-6">
      <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#4a9eff] mb-5">
        Performance Score
      </p>

      {/* Score number + label */}
      <div className="flex items-end gap-3 mb-6">
        <span className="font-mono text-5xl font-bold" style={{ color }}>
          {score}
        </span>
        <span className="font-mono text-sm mb-1" style={{ color }}>
          {label}
        </span>
      </div>

      {/* Dimension bars */}
      <div className="space-y-3 mb-6">
        {SCORE_DIMENSIONS.map((dim) => {
          const val = breakdown[dim.key];
          return (
            <div key={dim.key}>
              <div className="flex items-center justify-between mb-1">
                <span className="font-mono text-xs text-[#a0a0a0]">{dim.label}</span>
                <span className="font-mono text-xs" style={{ color: dim.color }}>{val}</span>
              </div>
              <div className="w-full h-1.5 bg-[#1a1a1a]">
                <div
                  className="h-full transition-all duration-500"
                  style={{ width: val + "%", backgroundColor: dim.color }}
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* Summary */}
      {breakdown.summary && (
        <p className="font-mono text-sm text-[#a0a0a0] mb-4">{breakdown.summary}</p>
      )}

      {/* Improvements */}
      {breakdown.improvements && breakdown.improvements.length > 0 && (
        <div>
          <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#6b6b6b] mb-2">
            Improvements
          </p>
          <ul className="space-y-1.5">
            {breakdown.improvements.map((imp, i) => (
              <li key={i} className="font-mono text-xs text-[#a0a0a0] flex gap-2">
                <span className="text-[#8b5cf6]">{String.fromCharCode(8250)}</span>
                {imp}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
