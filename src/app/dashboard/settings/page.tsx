"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth-context";
import { useTier } from "@/lib/tier-context";
import { TierBadge } from "@/components/dashboard/tier-badge";
import { ENRICHMENT_LIMITS } from "@/lib/tier";

const PROVIDER_OPTIONS = [
  {
    label: "Gemini",
    value: "gemini",
    description: "Google Gemini \u2014 uses platform key by default",
    models: ["gemini-2.0-flash", "gemini-2.5-pro", "gemini-2.5-flash"],
    needsKey: false,
    needsUrl: false,
  },
  {
    label: "OpenAI",
    value: "openai",
    description: "OpenAI GPT models \u2014 requires your own API key",
    models: ["gpt-4o-mini", "gpt-4o", "gpt-4.1-mini", "gpt-4.1"],
    needsKey: true,
    needsUrl: false,
  },
  {
    label: "Anthropic",
    value: "anthropic",
    description: "Anthropic Claude models \u2014 requires your own API key",
    models: ["claude-sonnet-4-20250514", "claude-haiku-4-20250514"],
    needsKey: true,
    needsUrl: false,
  },
  {
    label: "Ollama",
    value: "ollama",
    description: "Local Ollama instance \u2014 no API key needed",
    models: ["llama3.1", "llama3.2", "mistral", "mixtral", "codellama", "gemma2"],
    needsKey: false,
    needsUrl: true,
  },
];

export default function DashboardSettingsPage() {
  const { user } = useAuth();
  const { tier, enrichmentCount, generationCount } = useTier();

  const [provider, setProvider] = useState("gemini");
  const [apiKey, setApiKey] = useState("");
  const [model, setModel] = useState("");
  const [baseUrl, setBaseUrl] = useState("http://localhost:11434");
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; msg: string } | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    fetch("/api/user/llm-config")
      .then((r) => r.json())
      .then((data) => {
        if (data.config) {
          setProvider(data.config.provider || "gemini");
          setApiKey(data.config.apiKey || "");
          setModel(data.config.model || "");
          setBaseUrl(data.config.baseUrl || "http://localhost:11434");
        }
        setLoaded(true);
      })
      .catch(() => setLoaded(true));
  }, []);

  const selected = PROVIDER_OPTIONS.find((p) => p.value === provider) || PROVIDER_OPTIONS[0];

  useEffect(() => {
    if (loaded) {
      setModel(selected.models[0]);
    }
  }, [provider]);

  async function handleSave() {
    setSaving(true);
    setFeedback(null);
    try {
      const res = await fetch("/api/user/llm-config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          provider,
          apiKey: selected.needsKey ? apiKey : undefined,
          model,
          baseUrl: selected.needsUrl ? baseUrl : undefined,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setFeedback({ type: "success", msg: "AI provider saved." });
      } else {
        setFeedback({ type: "error", msg: data.error || "Failed to save." });
      }
    } catch {
      setFeedback({ type: "error", msg: "Network error." });
    }
    setSaving(false);
  }

  async function handleTest() {
    setTesting(true);
    setFeedback(null);
    try {
      const res = await fetch("/api/user/llm-config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          provider,
          apiKey: selected.needsKey ? apiKey : undefined,
          model,
          baseUrl: selected.needsUrl ? baseUrl : undefined,
          test: true,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setFeedback({ type: "success", msg: "Connection successful." });
      } else {
        setFeedback({ type: "error", msg: data.message || "Connection failed." });
      }
    } catch {
      setFeedback({ type: "error", msg: "Network error." });
    }
    setTesting(false);
  }

  return (
    <>
      <h1 className="font-mono text-xl font-bold mb-8">Settings</h1>

      {/* Account */}
      <div className="bg-[#111111] border border-[#1a1a1a] p-6 mb-6">
        <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#4a9eff] mb-4">
          Account
        </p>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="font-mono text-sm text-[#6b6b6b]">Email</span>
            <span className="font-mono text-sm text-white">{user?.email}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="font-mono text-sm text-[#6b6b6b]">Plan</span>
            <TierBadge tier={tier} />
          </div>
        </div>
      </div>

      {/* Usage */}
      <div className="bg-[#111111] border border-[#1a1a1a] p-6 mb-6">
        <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#4a9eff] mb-4">
          Usage
        </p>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="font-mono text-sm text-[#6b6b6b]">Enrichments</span>
            <span className="font-mono text-sm text-white">
              {enrichmentCount}
              {ENRICHMENT_LIMITS[tier] !== Infinity && (
                <span className="text-[#6b6b6b]"> / {ENRICHMENT_LIMITS[tier]}</span>
              )}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="font-mono text-sm text-[#6b6b6b]">Generations (this month)</span>
            <span className="font-mono text-sm text-white">
              {generationCount}
              {tier === "free" && (
                <span className="text-[#6b6b6b]"> (upgrade to unlock)</span>
              )}
            </span>
          </div>
        </div>
      </div>

      {/* AI Provider */}
      <div className="bg-[#111111] border border-[#1a1a1a] p-6 mb-6">
        <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#4a9eff] mb-4">
          AI Provider
        </p>

        <div className="space-y-4">
          {/* Provider select */}
          <div>
            <label className="font-mono text-xs text-[#6b6b6b] block mb-1">Provider</label>
            <select
              value={provider}
              onChange={(e) => setProvider(e.target.value)}
              className="w-full bg-[#0a0a0a] border border-[#1a1a1a] text-white font-mono text-sm p-2 focus:border-[#22c55e] focus:outline-none"
            >
              {PROVIDER_OPTIONS.map((p) => (
                <option key={p.value} value={p.value}>
                  {p.label}
                </option>
              ))}
            </select>
            <p className="font-mono text-[10px] text-[#6b6b6b] mt-1">{selected.description}</p>
          </div>

          {/* API Key (conditional) */}
          {selected.needsKey && (
            <div>
              <label className="font-mono text-xs text-[#6b6b6b] block mb-1">API Key</label>
              <input
                type="password"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="sk-..."
                className="w-full bg-[#0a0a0a] border border-[#1a1a1a] text-white font-mono text-sm p-2 focus:border-[#22c55e] focus:outline-none"
              />
            </div>
          )}

          {/* Model select */}
          <div>
            <label className="font-mono text-xs text-[#6b6b6b] block mb-1">Model</label>
            <select
              value={model}
              onChange={(e) => setModel(e.target.value)}
              className="w-full bg-[#0a0a0a] border border-[#1a1a1a] text-white font-mono text-sm p-2 focus:border-[#22c55e] focus:outline-none"
            >
              {selected.models.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
          </div>

          {/* Base URL (Ollama only) */}
          {selected.needsUrl && (
            <div>
              <label className="font-mono text-xs text-[#6b6b6b] block mb-1">Base URL</label>
              <input
                type="text"
                value={baseUrl}
                onChange={(e) => setBaseUrl(e.target.value)}
                placeholder="http://localhost:11434"
                className="w-full bg-[#0a0a0a] border border-[#1a1a1a] text-white font-mono text-sm p-2 focus:border-[#22c55e] focus:outline-none"
              />
            </div>
          )}

          {/* Feedback */}
          {feedback && (
            <p
              className={
                "font-mono text-xs " +
                (feedback.type === "success" ? "text-[#22c55e]" : "text-red-400")
              }
            >
              {feedback.msg}
            </p>
          )}

          {/* Buttons */}
          <div className="flex gap-3">
            <button
              onClick={handleSave}
              disabled={saving}
              className="bg-[#22c55e] text-black font-mono text-xs font-bold px-4 py-2 hover:bg-[#22c55e]/80 disabled:opacity-50 transition-colors"
            >
              {saving ? "Saving..." : "Save"}
            </button>
            <button
              onClick={handleTest}
              disabled={testing}
              className="border border-[#4a9eff] text-[#4a9eff] font-mono text-xs font-bold px-4 py-2 hover:bg-[#4a9eff]/10 disabled:opacity-50 transition-colors"
            >
              {testing ? "Testing..." : "Test Connection"}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
