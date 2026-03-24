"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth-context";
import { useTier } from "@/lib/tier-context";
import { TierBadge } from "@/components/dashboard/tier-badge";
import { ENRICHMENT_LIMITS } from "@/lib/tier";
import {
  PLATFORM_CONFIGS,
  ALL_PLATFORMS,
  type Platform,
  type IntegrationConnection,
} from "@/lib/integrations/types";

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


  // GitHub state
  const [ghToken, setGhToken] = useState("");
  const [ghOwner, setGhOwner] = useState("");
  const [ghRepo, setGhRepo] = useState("");
  const [ghBranch, setGhBranch] = useState("main");
  const [ghConnected, setGhConnected] = useState(false);
  const [ghSaving, setGhSaving] = useState(false);
  const [ghInitializing, setGhInitializing] = useState(false);
  const [ghFeedback, setGhFeedback] = useState<{ type: "success" | "error"; msg: string } | null>(null);

  // Integration state
  const [integrations, setIntegrations] = useState<IntegrationConnection[]>([]);
  const [intCredentials, setIntCredentials] = useState<Record<Platform, Record<string, string>>>({
    gohighlevel: {},
    postiz: { instanceUrl: "https://app.postiz.com" },
    buffer: {},
    mailchimp: {},
    webhook: {},
  });
  const [intSaving, setIntSaving] = useState<Platform | null>(null);
  const [intTesting, setIntTesting] = useState<Platform | null>(null);
  const [intFeedback, setIntFeedback] = useState<Record<Platform, { type: "success" | "error"; msg: string } | null>>({
    gohighlevel: null,
    postiz: null,
    buffer: null,
    mailchimp: null,
    webhook: null,
  });

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


    // Load GitHub config
    fetch("/api/github/config")
      .then((r) => r.json())
      .then((data) => {
        if (data.config && data.config.connected) {
          setGhOwner(data.config.owner || "");
          setGhRepo(data.config.repo || "");
          setGhBranch(data.config.branch || "main");
          setGhConnected(true);
        }
      })
      .catch(() => {});

    // Load integrations
    fetch("/api/integrations")
      .then((r) => r.json())
      .then((data) => {
        if (data.integrations) {
          setIntegrations(data.integrations);
        }
      })
      .catch(() => {});
  }, []);

  const selected = PROVIDER_OPTIONS.find((p) => p.value === provider) || PROVIDER_OPTIONS[0];

  useEffect(() => {
    if (loaded) {
      queueMicrotask(() => setModel(selected.models[0]));
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

  async function handleGhConnect() {
    setGhSaving(true);
    setGhFeedback(null);
    try {
      const res = await fetch("/api/github/config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: ghToken, owner: ghOwner, repo: ghRepo, branch: ghBranch }),
      });
      const data = await res.json();
      if (res.ok) {
        setGhConnected(true);
        setGhToken("");
        setGhFeedback({ type: "success", msg: data.message || "Connected" });
      } else {
        setGhFeedback({ type: "error", msg: data.error || "Failed to connect" });
      }
    } catch {
      setGhFeedback({ type: "error", msg: "Network error" });
    }
    setGhSaving(false);
  }

  async function handleGhDisconnect() {
    setGhConnected(false);
    setGhOwner("");
    setGhRepo("");
    setGhBranch("main");
    setGhToken("");
    setGhFeedback({ type: "success", msg: "Disconnected. Save new credentials to reconnect." });
  }

  async function handleGhInit() {
    setGhInitializing(true);
    setGhFeedback(null);
    try {
      const res = await fetch("/api/github/init", { method: "POST" });
      const data = await res.json();
      if (data.success) {
        setGhFeedback({ type: "success", msg: data.message });
      } else {
        setGhFeedback({ type: "error", msg: data.message || "Failed to initialize" });
      }
    } catch {
      setGhFeedback({ type: "error", msg: "Network error" });
    }
    setGhInitializing(false);
  }

  function isConnected(platform: Platform): boolean {
    return integrations.some((i) => i.platform === platform && i.enabled);
  }

  function updateCredential(platform: Platform, key: string, value: string) {
    setIntCredentials((prev) => ({
      ...prev,
      [platform]: { ...prev[platform], [key]: value },
    }));
  }

  function setIntPlatformFeedback(platform: Platform, fb: { type: "success" | "error"; msg: string } | null) {
    setIntFeedback((prev) => ({ ...prev, [platform]: fb }));
  }

  async function handleIntConnect(platform: Platform) {
    setIntSaving(platform);
    setIntPlatformFeedback(platform, null);
    try {
      const res = await fetch("/api/integrations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          platform,
          credentials: intCredentials[platform],
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setIntPlatformFeedback(platform, { type: "success", msg: data.message || "Connected" });
        // Reload integrations
        const r = await fetch("/api/integrations");
        const d = await r.json();
        if (d.integrations) setIntegrations(d.integrations);
      } else {
        setIntPlatformFeedback(platform, { type: "error", msg: data.error || "Failed" });
      }
    } catch {
      setIntPlatformFeedback(platform, { type: "error", msg: "Network error" });
    }
    setIntSaving(null);
  }

  async function handleIntTest(platform: Platform) {
    setIntTesting(platform);
    setIntPlatformFeedback(platform, null);
    try {
      const res = await fetch("/api/integrations/test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          platform,
          credentials: intCredentials[platform],
        }),
      });
      const data = await res.json();
      if (data.success) {
        setIntPlatformFeedback(platform, { type: "success", msg: data.message || "Connection works" });
      } else {
        setIntPlatformFeedback(platform, { type: "error", msg: data.message || "Connection failed" });
      }
    } catch {
      setIntPlatformFeedback(platform, { type: "error", msg: "Network error" });
    }
    setIntTesting(null);
  }

  async function handleIntDisconnect(platform: Platform) {
    setIntSaving(platform);
    setIntPlatformFeedback(platform, null);
    try {
      const res = await fetch("/api/integrations", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ platform }),
      });
      if (res.ok) {
        setIntPlatformFeedback(platform, { type: "success", msg: "Disconnected" });
        setIntegrations((prev) => prev.filter((i) => i.platform !== platform));
      }
    } catch {
      setIntPlatformFeedback(platform, { type: "error", msg: "Failed to disconnect" });
    }
    setIntSaving(null);
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


      {/* GitHub Repository */}
      <div className={"bg-[#111111] border p-6 mb-6 " + (ghConnected ? "border-[#22c55e]" : "border-[#1a1a1a]")}>
        <div className="flex items-center justify-between mb-4">
          <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#4a9eff]">
            GitHub Repository
          </p>
          {ghConnected && (
            <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#22c55e] border border-[#22c55e] px-2 py-0.5">
              Connected
            </span>
          )}
        </div>

        {ghConnected ? (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <span className="font-mono text-sm text-white font-bold">GH</span>
              <a
                href={"https://github.com/" + ghOwner + "/" + ghRepo}
                target="_blank"
                rel="noopener noreferrer"
                className="font-mono text-sm text-[#4a9eff] hover:underline"
              >
                {ghOwner}/{ghRepo}
              </a>
              <span className="font-mono text-[10px] text-[#6b6b6b]">({ghBranch})</span>
            </div>
            <div className="flex gap-3">
              <button
                onClick={handleGhInit}
                disabled={ghInitializing}
                className="border border-[#4a9eff] text-[#4a9eff] font-mono text-xs font-bold px-4 py-2 hover:bg-[#4a9eff]/10 disabled:opacity-50 transition-colors"
              >
                {ghInitializing ? "Initializing..." : "Initialize Repo"}
              </button>
              <button
                onClick={handleGhDisconnect}
                className="font-mono text-xs px-3 py-1.5 border border-[#ef4444] text-[#ef4444] hover:bg-[#ef4444] hover:text-white transition-colors"
              >
                Disconnect
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <p className="font-mono text-xs text-[#6b6b6b]">
              Connect a GitHub repo to store reference files. You need a Personal Access Token with &quot;repo&quot; scope.
            </p>
            <div>
              <label className="font-mono text-xs text-[#6b6b6b] block mb-1">Personal Access Token</label>
              <input
                type="password"
                value={ghToken}
                onChange={(e) => setGhToken(e.target.value)}
                placeholder="ghp_..."
                className="w-full bg-[#0a0a0a] border border-[#1a1a1a] text-white font-mono text-sm p-2 focus:border-[#22c55e] focus:outline-none"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="font-mono text-xs text-[#6b6b6b] block mb-1">Owner (username)</label>
                <input
                  type="text"
                  value={ghOwner}
                  onChange={(e) => setGhOwner(e.target.value)}
                  placeholder="your-username"
                  className="w-full bg-[#0a0a0a] border border-[#1a1a1a] text-white font-mono text-sm p-2 focus:border-[#22c55e] focus:outline-none"
                />
              </div>
              <div>
                <label className="font-mono text-xs text-[#6b6b6b] block mb-1">Repository</label>
                <input
                  type="text"
                  value={ghRepo}
                  onChange={(e) => setGhRepo(e.target.value)}
                  placeholder="my-business"
                  className="w-full bg-[#0a0a0a] border border-[#1a1a1a] text-white font-mono text-sm p-2 focus:border-[#22c55e] focus:outline-none"
                />
              </div>
            </div>
            <div>
              <label className="font-mono text-xs text-[#6b6b6b] block mb-1">Branch</label>
              <input
                type="text"
                value={ghBranch}
                onChange={(e) => setGhBranch(e.target.value)}
                placeholder="main"
                className="w-full bg-[#0a0a0a] border border-[#1a1a1a] text-white font-mono text-sm p-2 focus:border-[#22c55e] focus:outline-none"
              />
            </div>
            <button
              onClick={handleGhConnect}
              disabled={ghSaving || !ghToken || !ghOwner || !ghRepo}
              className="bg-[#22c55e] text-black font-mono text-xs font-bold px-4 py-2 hover:bg-[#22c55e]/80 disabled:opacity-50 transition-colors"
            >
              {ghSaving ? "Connecting..." : "Connect"}
            </button>
          </div>
        )}

        {ghFeedback && (
          <p
            className={
              "font-mono text-xs mt-3 " +
              (ghFeedback.type === "success" ? "text-[#22c55e]" : "text-red-400")
            }
          >
            {ghFeedback.msg}
          </p>
        )}
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

      {/* Integrations */}
      <div className="mb-6">
        <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#4a9eff] mb-4">
          Platform Integrations
        </p>
        <p className="font-mono text-xs text-[#6b6b6b] mb-6">
          Connect platforms to publish generated content directly from Codify.
        </p>

        <div className="space-y-4">
          {ALL_PLATFORMS.map((platform) => {
            const config = PLATFORM_CONFIGS[platform];
            const connected = isConnected(platform);
            const fb = intFeedback[platform];

            return (
              <div
                key={platform}
                className={
                  "bg-[#111111] border p-6 transition-colors " +
                  (connected ? "border-[#22c55e]" : "border-[#1a1a1a]")
                }
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <span className="text-xl">{config.icon}</span>
                    <div>
                      <span className="font-mono text-sm font-bold text-white">
                        {config.label}
                      </span>
                      <p className="font-mono text-[10px] text-[#6b6b6b]">
                        {config.description}
                      </p>
                    </div>
                  </div>
                  {connected && (
                    <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#22c55e] border border-[#22c55e] px-2 py-0.5">
                      Connected
                    </span>
                  )}
                </div>

                {/* Supported types */}
                <div className="flex gap-1.5 mb-4">
                  {config.supportedOutputTypes.map((t) => (
                    <span
                      key={t}
                      className="font-mono text-[9px] text-[#6b6b6b] bg-[#0a0a0a] px-1.5 py-0.5"
                    >
                      {t.replace(/_/g, " ")}
                    </span>
                  ))}
                </div>

                {connected ? (
                  <button
                    onClick={() => handleIntDisconnect(platform)}
                    disabled={intSaving === platform}
                    className="font-mono text-xs px-3 py-1.5 border border-[#ef4444] text-[#ef4444] hover:bg-[#ef4444] hover:text-white transition-colors disabled:opacity-50"
                  >
                    {intSaving === platform ? "..." : "Disconnect"}
                  </button>
                ) : (
                  <div className="space-y-3">
                    {config.fields.map((field) => (
                      <div key={field.key}>
                        <label className="font-mono text-xs text-[#6b6b6b] block mb-1">
                          {field.label}
                          {field.required && <span className="text-[#ef4444]"> *</span>}
                        </label>
                        <input
                          type={field.type === "password" ? "password" : "text"}
                          value={intCredentials[platform]?.[field.key] || ""}
                          onChange={(e) => updateCredential(platform, field.key, e.target.value)}
                          placeholder={field.placeholder}
                          className="w-full bg-[#0a0a0a] border border-[#1a1a1a] text-white font-mono text-sm p-2 focus:border-[#4a9eff] focus:outline-none"
                        />
                      </div>
                    ))}

                    <div className="flex gap-3">
                      <button
                        onClick={() => handleIntConnect(platform)}
                        disabled={intSaving === platform}
                        className="bg-[#4a9eff] text-white font-mono text-xs font-bold px-4 py-2 hover:bg-[#4a9eff]/80 disabled:opacity-50 transition-colors"
                      >
                        {intSaving === platform ? "Connecting..." : "Connect"}
                      </button>
                      <button
                        onClick={() => handleIntTest(platform)}
                        disabled={intTesting === platform}
                        className="border border-[#4a9eff] text-[#4a9eff] font-mono text-xs font-bold px-4 py-2 hover:bg-[#4a9eff]/10 disabled:opacity-50 transition-colors"
                      >
                        {intTesting === platform ? "Testing..." : "Test"}
                      </button>
                    </div>
                  </div>
                )}

                {fb && (
                  <p
                    className={
                      "font-mono text-xs mt-3 " +
                      (fb.type === "success" ? "text-[#22c55e]" : "text-red-400")
                    }
                  >
                    {fb.msg}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
}
