"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useTier } from "@/lib/tier-context";
import { hasAccess } from "@/lib/tier";
import { UpgradePrompt } from "@/components/dashboard/upgrade-prompt";

interface Topic {
  id: string;
  title: string;
  status: string;
  created_at: string;
  updated_at: string;
}

const STATUS_COLORS: Record<string, string> = {
  research: "#4a9eff",
  decision: "#22c55e",
  decided: "#22c55e",
  codified: "#8b5cf6",
};

export default function ResearchPage() {
  const { tier } = useTier();
  const [topics, setTopics] = useState<Topic[]>([]);
  const [newTitle, setNewTitle] = useState("");
  const [creating, setCreating] = useState(false);

  const canAccess = hasAccess(tier, "think");

  useEffect(() => {
    if (!canAccess) return;
    const load = async () => {
      const res = await fetch("/api/research");
      if (res.ok) {
        const data = await res.json();
        setTopics(data.topics || []);
      }
    };
    load();
  }, [canAccess]);

  if (!canAccess) {
    return (
      <>
        <h1 className="font-mono text-xl font-bold mb-8">Research</h1>
        <UpgradePrompt
          requiredTier="architect"
          feature="Research Workspace"
          description="Explore topics, make decisions, and codify insights into your reference files."
        />
      </>
    );
  }

  const handleCreate = async () => {
    if (!newTitle.trim()) return;
    setCreating(true);
    const res = await fetch("/api/research", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: newTitle }),
    });
    if (res.ok) {
      const data = await res.json();
      setTopics((prev) => [data.topic, ...prev]);
      setNewTitle("");
    }
    setCreating(false);
  };

  return (
    <>
      <h1 className="font-mono text-xl font-bold mb-2">Research</h1>
      <p className="text-sm text-[#6b6b6b] mb-8">
        Explore topics, make decisions, codify into reference.
      </p>

      {/* New topic */}
      <div className="flex gap-2 mb-8">
        <input
          value={newTitle}
          onChange={(e) => setNewTitle(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleCreate()}
          placeholder="New research topic..."
          className="flex-1 bg-[#111111] border border-[#1a1a1a] px-4 py-2 font-mono text-sm text-white focus:outline-none focus:border-[#4a9eff]"
        />
        <button
          onClick={handleCreate}
          disabled={creating || !newTitle.trim()}
          className="font-mono text-sm font-bold px-4 py-2 hover:brightness-110 transition-all disabled:opacity-50"
          style={{ backgroundColor: "#22c55e", color: "#000", borderRadius: 0 }}
        >
          {creating ? "..." : "+ Add"}
        </button>
      </div>

      {/* Status pipeline */}
      <div className="flex gap-2 mb-6">
        {["research", "decision", "codified"].map((s) => {
          const count = s === "decision" ? topics.filter((t) => t.status === "decided" || t.status === "deciding" || t.status === "decision").length : topics.filter((t) => t.status === s).length;
          return (
            <div key={s} className="flex items-center gap-1.5">
              <span
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: STATUS_COLORS[s] }}
              />
              <span className="font-mono text-[10px] uppercase tracking-wider text-[#6b6b6b]">
                {s} ({count})
              </span>
            </div>
          );
        })}
      </div>

      {/* Topics list */}
      {topics.length === 0 ? (
        <div className="bg-[#111111] border border-[#1a1a1a] p-8 text-center">
          <p className="font-mono text-sm text-[#6b6b6b]">
            No research topics yet. Start exploring.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {topics.map((topic) => (
            <Link
              key={topic.id}
              href={"/dashboard/research/" + topic.id}
              className="block bg-[#111111] border border-[#1a1a1a] p-4 hover:border-[#333] transition-colors"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: STATUS_COLORS[topic.status] }}
                  />
                  <span className="font-mono text-sm text-white">{topic.title}</span>
                </div>
                <span className="font-mono text-[10px] text-[#6b6b6b]">
                  {new Date(topic.updated_at).toLocaleDateString()}
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* Compounding nudge */}
      {topics.some((t) => t.status === "codified") && (
        <div className="bg-[#111111] border border-[#22c55e] border-dashed p-4 mt-8">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#22c55e] mb-1">
                Next in the loop
              </p>
              <p className="font-mono text-sm text-[#a0a0a0]">
                Your reference files are stronger. Generate content that uses them.
              </p>
            </div>
            <Link
              href="/dashboard"
              className="font-mono text-xs px-4 py-2 border border-[#22c55e] text-[#22c55e] hover:bg-[#22c55e] hover:text-black transition-colors"
            >
              Generate →
            </Link>
          </div>
        </div>
      )}
    </>
  );
}
