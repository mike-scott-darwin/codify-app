"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { GENERATION_CONFIGS } from "@/lib/generation-types";

export default function GeneratorPage() {
  const params = useParams();
  const router = useRouter();
  const outputType = params.type as string;

  const config = GENERATION_CONFIGS.find((c) => c.type === outputType);

  const [options, setOptions] = useState<Record<string, string>>(() => {
    if (!config) return {};
    const defaults: Record<string, string> = {};
    config.options.forEach((opt) => {
      defaults[opt.id] = opt.defaultValue;
    });
    return defaults;
  });

  const [generating, setGenerating] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  if (!config) {
    return <p className="font-mono text-sm text-[#ef4444]">Invalid generator type.</p>;
  }

  const handleGenerate = async () => {
    setGenerating(true);
    setError(null);
    setResult(null);

    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ outputType, options }),
      });

      const data = await res.json();

      if (!res.ok) {
        if (data.requiredTier) {
          router.push("/dashboard/upgrade");
          return;
        }
        setError(data.error || "Generation failed.");
        return;
      }

      setResult(data.content);
    } catch {
      setError("Network error. Try again.");
    } finally {
      setGenerating(false);
    }
  };

  const handleCopy = async () => {
    if (!result) return;
    await navigator.clipboard.writeText(result);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  const handleDownload = () => {
    if (!result) return;
    const blob = new Blob([result], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = outputType + "-" + new Date().toISOString().split("T")[0] + ".md";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <>
      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <Link
          href="/dashboard/generate"
          className="font-mono text-xs text-[#6b6b6b] hover:text-white transition-colors"
        >
          \u2190 Back
        </Link>
        <span className="text-[#1a1a1a]">/</span>
        <h1 className="font-mono text-xl font-bold">{config.label}</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Options form */}
        <div className="bg-[#111111] border border-[#1a1a1a] p-6">
          <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#4a9eff] mb-5">
            Options
          </p>

          <div className="space-y-4 mb-6">
            {config.options.map((opt) => (
              <div key={opt.id}>
                <label className="block font-mono text-xs text-[#a0a0a0] mb-1.5">
                  {opt.label}
                </label>
                {opt.type === "select" && opt.options ? (
                  <select
                    value={options[opt.id] || opt.defaultValue}
                    onChange={(e) => setOptions((prev) => ({ ...prev, [opt.id]: e.target.value }))}
                    className="w-full bg-[#0a0a0a] border border-[#1a1a1a] px-3 py-2 font-mono text-sm text-white focus:outline-none focus:border-[#4a9eff]"
                  >
                    {opt.options.map((o) => (
                      <option key={o.value} value={o.value}>
                        {o.label}
                      </option>
                    ))}
                  </select>
                ) : (
                  <input
                    type="text"
                    value={options[opt.id] || ""}
                    onChange={(e) => setOptions((prev) => ({ ...prev, [opt.id]: e.target.value }))}
                    placeholder={opt.label}
                    className="w-full bg-[#0a0a0a] border border-[#1a1a1a] px-3 py-2 font-mono text-sm text-white focus:outline-none focus:border-[#4a9eff]"
                  />
                )}
              </div>
            ))}
          </div>

          <button
            onClick={handleGenerate}
            disabled={generating}
            className="w-full font-mono text-sm font-bold py-3 hover:brightness-110 transition-all disabled:opacity-50"
            style={{ backgroundColor: "#22c55e", color: "#000", borderRadius: 0 }}
          >
            {generating ? "Generating..." : "Generate \u2192"}
          </button>

          {error && (
            <p className="font-mono text-xs text-[#ef4444] mt-3">{error}</p>
          )}
        </div>

        {/* Result preview */}
        <div className="bg-[#111111] border border-[#1a1a1a] p-6">
          <div className="flex items-center justify-between mb-4">
            <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#4a9eff]">
              Output
            </p>
            {result && (
              <div className="flex gap-2">
                <button
                  onClick={handleCopy}
                  className="font-mono text-[10px] px-2 py-1 border border-[#1a1a1a] text-[#6b6b6b] hover:text-white transition-colors"
                >
                  {copied ? "Copied!" : "Copy"}
                </button>
                <button
                  onClick={handleDownload}
                  className="font-mono text-[10px] px-2 py-1 border border-[#1a1a1a] text-[#6b6b6b] hover:text-white transition-colors"
                >
                  Download
                </button>
              </div>
            )}
          </div>

          {generating ? (
            <div className="flex items-center justify-center py-20">
              <span className="font-mono text-sm text-[#8b5cf6] animate-pulse">
                Generating with your context...
              </span>
            </div>
          ) : result ? (
            <pre className="whitespace-pre-wrap font-mono text-sm text-[#a0a0a0] leading-relaxed max-h-[60vh] overflow-y-auto">
              {result}
            </pre>
          ) : (
            <div className="flex items-center justify-center py-20">
              <span className="font-mono text-sm text-[#6b6b6b]">
                Configure options and hit Generate
              </span>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
