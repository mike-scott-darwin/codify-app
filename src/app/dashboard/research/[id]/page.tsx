"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";

interface Topic {
  id: string;
  title: string;
  status: string;
  content: string;
  findings: Array<{ source: string; summary: string; date: string }>;
  decision: string | null;
}

const STATUSES = ["research", "deciding", "decided", "codified"];

export default function ResearchDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [topic, setTopic] = useState<Topic | null>(null);
  const [saving, setSaving] = useState(false);
  const [question, setQuestion] = useState("");
  const [aiAnswer, setAiAnswer] = useState("");
  const [asking, setAsking] = useState(false);

  useEffect(() => {
    const load = async () => {
      const res = await fetch("/api/research/" + id);
      if (res.ok) {
        const data = await res.json();
        setTopic(data.topic);
      }
    };
    load();
  }, [id]);

  if (!topic) return <p className="font-mono text-sm text-[#6b6b6b] animate-pulse">Loading...</p>;

  const save = async (updates: Partial<Topic>) => {
    setSaving(true);
    await fetch("/api/research/" + id, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updates),
    });
    setTopic((prev) => prev ? { ...prev, ...updates } : prev);
    setSaving(false);
  };

  const askAI = async () => {
    if (!question.trim()) return;
    setAsking(true);
    setAiAnswer("");
    const res = await fetch("/api/research/" + id + "/ai", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ question }),
    });
    if (res.ok) {
      const data = await res.json();
      setAiAnswer(data.answer);
    }
    setAsking(false);
  };

  const handleDelete = async () => {
    await fetch("/api/research/" + id, { method: "DELETE" });
    router.push("/dashboard/research");
  };

  return (
    <>
      <div className="flex items-center gap-3 mb-6">
        <Link href="/dashboard/research" className="font-mono text-xs text-[#6b6b6b] hover:text-white transition-colors">
          ← Back
        </Link>
        <span className="text-[#1a1a1a]">/</span>
        <span className="font-mono text-xs text-[#4a9eff]">{topic.title}</span>
      </div>

      <div className="flex items-center justify-between mb-6">
        <h1 className="font-mono text-xl font-bold">{topic.title}</h1>
        <div className="flex gap-2 items-center">
          {/* Status selector */}
          <select
            value={topic.status}
            onChange={(e) => save({ status: e.target.value })}
            className="bg-[#0a0a0a] border border-[#1a1a1a] px-3 py-1.5 font-mono text-xs text-white focus:outline-none"
          >
            {STATUSES.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
          <button
            onClick={handleDelete}
            className="font-mono text-xs px-3 py-1.5 border border-[#1a1a1a] text-[#ef4444] hover:bg-[#ef4444] hover:text-white transition-colors"
          >
            Delete
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Notes editor */}
        <div>
          <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#4a9eff] mb-3">
            Notes
          </p>
          <textarea
            value={topic.content}
            onChange={(e) => setTopic((prev) => prev ? { ...prev, content: e.target.value } : prev)}
            onBlur={() => save({ content: topic.content })}
            className="w-full min-h-[40vh] bg-[#111111] border border-[#1a1a1a] p-4 font-mono text-sm text-[#a0a0a0] leading-relaxed resize-y focus:outline-none focus:border-[#4a9eff]"
            placeholder="Write your research notes here..."
          />
          {saving && <p className="font-mono text-[10px] text-[#4a9eff] mt-1">Saving...</p>}

          {/* Decision field */}
          {(topic.status === "deciding" || topic.status === "decided" || topic.status === "codified") && (
            <div className="mt-4">
              <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#22c55e] mb-2">
                Decision
              </p>
              <textarea
                value={topic.decision || ""}
                onChange={(e) => setTopic((prev) => prev ? { ...prev, decision: e.target.value } : prev)}
                onBlur={() => save({ decision: topic.decision })}
                className="w-full min-h-[100px] bg-[#111111] border border-[#22c55e] p-4 font-mono text-sm text-[#a0a0a0] resize-y focus:outline-none"
                placeholder="What did you decide?"
              />
            </div>
          )}
        </div>

        {/* AI Research Assistant */}
        <div>
          <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#8b5cf6] mb-3">
            AI Research Assistant
          </p>
          <div className="bg-[#111111] border border-[#1a1a1a] p-4">
            <div className="flex gap-2 mb-4">
              <input
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && askAI()}
                placeholder="Ask a research question..."
                className="flex-1 bg-[#0a0a0a] border border-[#1a1a1a] px-3 py-2 font-mono text-sm text-white focus:outline-none focus:border-[#8b5cf6]"
              />
              <button
                onClick={askAI}
                disabled={asking || !question.trim()}
                className="font-mono text-xs font-bold px-4 py-2 hover:brightness-110 transition-all disabled:opacity-50"
                style={{ backgroundColor: "#8b5cf6", color: "#fff", borderRadius: 0 }}
              >
                {asking ? "..." : "Ask"}
              </button>
            </div>

            {asking && (
              <p className="font-mono text-sm text-[#8b5cf6] animate-pulse">Researching...</p>
            )}

            {aiAnswer && (
              <div className="bg-[#0a0a0a] border border-[#1a1a1a] p-4 max-h-[50vh] overflow-y-auto">
                <pre className="whitespace-pre-wrap font-mono text-sm text-[#a0a0a0] leading-relaxed">
                  {aiAnswer}
                </pre>
                <button
                  onClick={() => {
                    const updated = topic.content + "\n\n---\n\n**Q: " + question + "**\n\n" + aiAnswer;
                    setTopic((prev) => prev ? { ...prev, content: updated } : prev);
                    save({ content: updated });
                    setAiAnswer("");
                    setQuestion("");
                  }}
                  className="font-mono text-[10px] text-[#8b5cf6] hover:text-white mt-3 transition-colors"
                >
                  + Add to notes
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
