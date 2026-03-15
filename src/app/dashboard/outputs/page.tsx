"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

interface Output {
  id: string;
  output_type: string;
  title: string;
  content: string;
  is_favorite: boolean;
  created_at: string;
}

const TYPE_LABELS: Record<string, string> = {
  ad_copy: "Ad Copy",
  social_post: "Social Post",
  email_sequence: "Email Sequence",
  vsl_script: "VSL Script",
  landing_page: "Landing Page",
};

const TYPE_COLORS: Record<string, string> = {
  ad_copy: "#4a9eff",
  social_post: "#22c55e",
  email_sequence: "#f59e0b",
  vsl_script: "#8b5cf6",
  landing_page: "#ef4444",
};

export default function OutputsPage() {
  const [outputs, setOutputs] = useState<Output[]>([]);
  const [filter, setFilter] = useState<string>("all");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const params = new URLSearchParams();
      if (filter !== "all" && filter !== "favorites") params.set("type", filter);
      if (filter === "favorites") params.set("favorites", "true");

      const res = await fetch("/api/outputs?" + params.toString());
      if (res.ok) {
        const data = await res.json();
        setOutputs(data.outputs || []);
      }
      setLoading(false);
    };
    load();
  }, [filter]);

  const toggleFavorite = async (id: string, current: boolean) => {
    await fetch("/api/outputs/" + id, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ is_favorite: !current }),
    });
    setOutputs((prev) =>
      prev.map((o) => (o.id === id ? { ...o, is_favorite: !current } : o))
    );
  };

  return (
    <>
      <h1 className="font-mono text-xl font-bold mb-2">Output History</h1>
      <p className="text-sm text-[#6b6b6b] mb-6">
        Everything you have generated, saved and browsable.
      </p>

      {/* Filters */}
      <div className="flex gap-2 mb-6 flex-wrap">
        {["all", "favorites", "ad_copy", "social_post", "email_sequence", "vsl_script", "landing_page"].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className="font-mono text-[10px] uppercase tracking-wider px-3 py-1.5 border transition-colors"
            style={{
              borderColor: filter === f ? "#4a9eff" : "#1a1a1a",
              color: filter === f ? "#4a9eff" : "#6b6b6b",
            }}
          >
            {f === "all" ? "All" : f === "favorites" ? "★ Favorites" : TYPE_LABELS[f] || f}
          </button>
        ))}
      </div>

      {/* List */}
      {loading ? (
        <p className="font-mono text-sm text-[#6b6b6b] animate-pulse">Loading...</p>
      ) : outputs.length === 0 ? (
        <div className="bg-[#111111] border border-[#1a1a1a] p-8 text-center">
          <p className="font-mono text-sm text-[#6b6b6b] mb-4">No outputs yet</p>
          <Link
            href="/dashboard/generate"
            className="font-mono text-xs text-[#4a9eff] hover:text-white transition-colors"
          >
            Generate your first output →
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {outputs.map((output) => (
            <div key={output.id} className="bg-[#111111] border border-[#1a1a1a] p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-3">
                  <span
                    className="font-mono text-[9px] uppercase tracking-wider px-1.5 py-0.5 border"
                    style={{
                      color: TYPE_COLORS[output.output_type] || "#6b6b6b",
                      borderColor: TYPE_COLORS[output.output_type] || "#1a1a1a",
                    }}
                  >
                    {TYPE_LABELS[output.output_type] || output.output_type}
                  </span>
                  <Link
                    href={"/dashboard/outputs/" + output.id}
                    className="font-mono text-sm text-white hover:text-[#4a9eff] transition-colors"
                  >
                    {output.title}
                  </Link>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => toggleFavorite(output.id, output.is_favorite)}
                    className="font-mono text-sm transition-colors"
                    style={{ color: output.is_favorite ? "#f59e0b" : "#6b6b6b" }}
                  >
                    {output.is_favorite ? "★" : "☆"}
                  </button>
                  <span className="font-mono text-[10px] text-[#6b6b6b]">
                    {new Date(output.created_at).toLocaleDateString()}
                  </span>
                </div>
              </div>
              <p className="font-mono text-xs text-[#6b6b6b] line-clamp-2">
                {output.content.substring(0, 150)}...
              </p>
            </div>
          ))}
        </div>
      )}
    </>
  );
}
