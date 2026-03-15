"use client";

import { useState, useEffect, useRef } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { AGENT_CONFIGS } from "@/lib/agents/types";
import type { AgentType } from "@/lib/agents/types";

interface Job {
  id: string;
  agent_type: AgentType;
  status: "pending" | "running" | "complete" | "failed";
  progress: { step: number; totalSteps: number; currentAction: string };
  result: { title: string; content: string } | null;
  error: string | null;
  created_at: string;
}

export default function AgentJobPage() {
  const params = useParams();
  const id = params.id as string;
  const [job, setJob] = useState<Job | null>(null);
  const [copied, setCopied] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const poll = async () => {
      const res = await fetch("/api/agent/status/" + id);
      if (res.ok) {
        const data = await res.json();
        setJob(data.job);

        if (data.job.status === "complete" || data.job.status === "failed") {
          if (intervalRef.current) clearInterval(intervalRef.current);
        }
      }
    };

    poll();
    intervalRef.current = setInterval(poll, 2000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [id]);

  if (!job) {
    return <p className="font-mono text-sm text-[#6b6b6b] animate-pulse">Loading...</p>;
  }

  const config = AGENT_CONFIGS[job.agent_type];
  const progress = job.progress || { step: 0, totalSteps: 1, currentAction: "" };
  const pct = Math.round((progress.step / progress.totalSteps) * 100);

  const handleCopy = async () => {
    if (!job.result?.content) return;
    await navigator.clipboard.writeText(job.result.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  const handleDownload = () => {
    if (!job.result?.content) return;
    const blob = new Blob([job.result.content], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = job.agent_type + "-" + new Date(job.created_at).toISOString().split("T")[0] + ".md";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <>
      <div className="flex items-center gap-3 mb-6">
        <Link href="/dashboard/agents" className="font-mono text-xs text-[#6b6b6b] hover:text-white transition-colors">
          ← Agents
        </Link>
        <span className="text-[#1a1a1a]">/</span>
        <span className="font-mono text-xs text-[#4a9eff]">{config?.label || job.agent_type}</span>
      </div>

      <h1 className="font-mono text-xl font-bold mb-6">
        {config?.icon} {config?.label || job.agent_type}
      </h1>

      {/* Progress */}
      {(job.status === "pending" || job.status === "running") && (
        <div className="bg-[#111111] border border-[#4a9eff] p-6 mb-6">
          <div className="flex items-center justify-between mb-3">
            <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#4a9eff]">
              Running
            </span>
            <span className="font-mono text-xs text-[#6b6b6b]">
              Step {progress.step} of {progress.totalSteps}
            </span>
          </div>

          {/* Progress bar */}
          <div className="w-full h-2 bg-[#1a1a1a] mb-3">
            <div
              className="h-full bg-[#4a9eff] transition-all duration-500"
              style={{ width: pct + "%" }}
            />
          </div>

          <p className="font-mono text-sm text-[#a0a0a0] animate-pulse">
            {progress.currentAction || "Starting..."}
          </p>
        </div>
      )}

      {/* Failed */}
      {job.status === "failed" && (
        <div className="bg-[#111111] border border-[#ef4444] p-6 mb-6">
          <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#ef4444] mb-2">
            Failed
          </p>
          <p className="font-mono text-sm text-[#a0a0a0]">{job.error || "Unknown error"}</p>
        </div>
      )}

      {/* Result */}
      {job.status === "complete" && job.result && (
        <>
          <div className="flex items-center justify-between mb-4">
            <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#22c55e]">
              Complete
            </span>
            <div className="flex gap-2">
              <button
                onClick={handleCopy}
                className="font-mono text-xs px-3 py-1.5 border border-[#1a1a1a] text-[#a0a0a0] hover:text-white transition-colors"
              >
                {copied ? "Copied!" : "Copy"}
              </button>
              <button
                onClick={handleDownload}
                className="font-mono text-xs px-3 py-1.5 border border-[#1a1a1a] text-[#a0a0a0] hover:text-white transition-colors"
              >
                Download
              </button>
            </div>
          </div>

          <div className="bg-[#111111] border border-[#1a1a1a] p-6">
            <pre className="whitespace-pre-wrap font-mono text-sm text-[#a0a0a0] leading-relaxed">
              {job.result.content}
            </pre>
          </div>
        </>
      )}
    </>
  );
}
