"use client";

import { useState, useEffect, useRef } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import ReactMarkdown from "react-markdown";
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

          <div className="bg-[#111111] border border-[#1a1a1a] p-6 prose-terminal">
            <ReactMarkdown
              components={{
                h1: ({ children }) => <h1 className="font-mono text-lg font-bold text-white mb-4 mt-6 first:mt-0">{children}</h1>,
                h2: ({ children }) => <h2 className="font-mono text-sm font-bold text-[#4a9eff] uppercase tracking-wider mb-3 mt-6">{children}</h2>,
                h3: ({ children }) => <h3 className="font-mono text-sm font-bold text-[#a0a0a0] mb-2 mt-4">{children}</h3>,
                p: ({ children }) => <p className="font-mono text-sm text-[#a0a0a0] leading-relaxed mb-3">{children}</p>,
                ul: ({ children }) => <ul className="space-y-1 mb-4 ml-4">{children}</ul>,
                ol: ({ children }) => <ol className="space-y-1 mb-4 ml-4 list-decimal">{children}</ol>,
                li: ({ children }) => <li className="font-mono text-sm text-[#a0a0a0] leading-relaxed">{children}</li>,
                strong: ({ children }) => <strong className="text-white font-bold">{children}</strong>,
                em: ({ children }) => <em className="text-[#f59e0b] not-italic">{children}</em>,
                hr: () => <hr className="border-[#1a1a1a] my-6" />,
                table: ({ children }) => <div className="overflow-x-auto mb-4"><table className="w-full border-collapse font-mono text-sm">{children}</table></div>,
                thead: ({ children }) => <thead className="border-b border-[#333]">{children}</thead>,
                th: ({ children }) => <th className="text-left text-[#4a9eff] text-xs uppercase tracking-wider px-3 py-2">{children}</th>,
                td: ({ children }) => <td className="text-[#a0a0a0] px-3 py-2 border-b border-[#1a1a1a]">{children}</td>,
                code: ({ children }) => <code className="bg-[#1a1a1a] text-[#22c55e] px-1.5 py-0.5 text-xs">{children}</code>,
                blockquote: ({ children }) => <blockquote className="border-l-2 border-[#8b5cf6] pl-4 my-4">{children}</blockquote>,
              }}
            >
              {job.result.content}
            </ReactMarkdown>
          </div>
        </>
      )}
    </>
  );
}
