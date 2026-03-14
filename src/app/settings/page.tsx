"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth-context";
import { createClient } from "@/lib/supabase";
import Link from "next/link";
import { useRouter } from "next/navigation";

type Provider = "anthropic" | "openai" | "google";

interface ProviderConfig {
  id: Provider;
  name: string;
  label: string;
  placeholder: string;
  helpUrl: string;
  helpText: string;
  recommended?: boolean;
}

const PROVIDERS: ProviderConfig[] = [
  {
    id: "anthropic",
    name: "Claude (Anthropic)",
    label: "Anthropic API Key",
    placeholder: "sk-ant-...",
    helpUrl: "https://console.anthropic.com/settings/keys",
    helpText: "Sign up at console.anthropic.com, go to API Keys, create a new key.",
    recommended: true,
  },
  {
    id: "openai",
    name: "ChatGPT (OpenAI)",
    label: "OpenAI API Key",
    placeholder: "sk-...",
    helpUrl: "https://platform.openai.com/api-keys",
    helpText: "Sign up at platform.openai.com, go to API Keys, create a new key.",
  },
  {
    id: "google",
    name: "Gemini (Google)",
    label: "Google API Key",
    placeholder: "AIza...",
    helpUrl: "https://aistudio.google.com/apikey",
    helpText: "Go to aistudio.google.com, click Get API Key, create a new key.",
  },
];

export default function SettingsPage() {
  const { user, loading, signOut } = useAuth();
  const router = useRouter();
  const [keys, setKeys] = useState<Record<Provider, string>>({
    anthropic: "",
    openai: "",
    google: "",
  });
  const [savedProviders, setSavedProviders] = useState<Provider[]>([]);
  const [saving, setSaving] = useState<Provider | null>(null);
  const [removing, setRemoving] = useState<Provider | null>(null);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
      return;
    }
    if (user) {
      loadSavedKeys();
    }
  }, [user, loading, router]);

  const loadSavedKeys = async () => {
    try {
      const supabase = createClient();
      const { data } = await supabase
        .from("user_api_keys")
        .select("provider")
        .eq("user_id", user!.id);

      if (data) {
        setSavedProviders(data.map((row) => row.provider as Provider));
      }
    } catch {
      // Table might not exist yet
    }
  };

  const saveKey = async (provider: Provider) => {
    const key = keys[provider].trim();
    if (!key) return;

    setSaving(provider);
    setMessage(null);

    try {
      const supabase = createClient();
      const { error } = await supabase.from("user_api_keys").upsert(
        {
          user_id: user!.id,
          provider,
          api_key: key,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "user_id,provider" }
      );

      if (error) {
        setMessage({ type: "error", text: error.message });
      } else {
        setMessage({ type: "success", text: `${provider} key saved.` });
        setSavedProviders((prev) => [...new Set([...prev, provider])]);
        setKeys((prev) => ({ ...prev, [provider]: "" }));
      }
    } catch {
      setMessage({ type: "error", text: "Failed to save key." });
    }
    setSaving(null);
  };

  const removeKey = async (provider: Provider) => {
    setRemoving(provider);
    setMessage(null);

    try {
      const supabase = createClient();
      await supabase
        .from("user_api_keys")
        .delete()
        .eq("user_id", user!.id)
        .eq("provider", provider);

      setSavedProviders((prev) => prev.filter((p) => p !== provider));
      setMessage({ type: "success", text: `${provider} key removed.` });
    } catch {
      setMessage({ type: "error", text: "Failed to remove key." });
    }
    setRemoving(null);
  };

  if (loading || !user) return null;

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white flex flex-col">
      <nav className="border-b border-[#1a1a1a] px-6 py-4">
        <div className="mx-auto flex max-w-3xl items-center justify-between">
          <Link href="/" className="font-mono text-lg text-white">
            <span className="text-[#22c55e]">&#10095;</span> codify
          </Link>
          <div className="flex items-center gap-4">
            <span className="font-mono text-xs text-[#6b6b6b]">{user.email}</span>
            <button
              onClick={signOut}
              className="font-mono text-xs text-[#6b6b6b] hover:text-[#ef4444] transition-colors"
            >
              Sign out
            </button>
          </div>
        </div>
      </nav>

      <div className="mx-auto max-w-3xl px-6 py-12 flex-1">
        <h1 className="font-mono text-xl font-bold mb-2">Settings</h1>
        <p className="text-sm text-[#a0a0a0] mb-10">
          Connect your own AI account for unlimited enrichment. Your key is stored
          securely and only used server-side.
        </p>

        {message && (
          <div
            className="font-mono text-xs px-4 py-3 mb-6 border"
            style={{
              borderColor: message.type === "success" ? "#22c55e" : "#ef4444",
              color: message.type === "success" ? "#22c55e" : "#ef4444",
              backgroundColor: "#111111",
            }}
          >
            {message.text}
          </div>
        )}

        <p className="font-mono text-xs uppercase tracking-[0.2em] text-[#4a9eff] mb-4">
          Connect Your AI
        </p>

        <div className="space-y-4">
          {PROVIDERS.map((provider) => {
            const isSaved = savedProviders.includes(provider.id);
            return (
              <div
                key={provider.id}
                className="bg-[#111111] border border-[#1a1a1a] p-6"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-sm text-white font-bold">
                      {provider.name}
                    </span>
                    {provider.recommended && (
                      <span className="font-mono text-[10px] uppercase tracking-[0.1em] text-[#22c55e] border border-[#22c55e] px-2 py-0.5">
                        Recommended
                      </span>
                    )}
                  </div>
                  {isSaved && (
                    <span className="font-mono text-xs text-[#22c55e]">
                      &#10003; Connected
                    </span>
                  )}
                </div>

                {isSaved ? (
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs text-[#6b6b6b]">
                      Key saved securely
                    </span>
                    <button
                      onClick={() => removeKey(provider.id)}
                      disabled={removing === provider.id}
                      className="font-mono text-xs text-[#ef4444] hover:text-[#ff6b6b] transition-colors disabled:opacity-50"
                    >
                      {removing === provider.id ? "Removing..." : "Remove"}
                    </button>
                  </div>
                ) : (
                  <>
                    <p className="text-xs text-[#6b6b6b] mb-3">{provider.helpText}</p>
                    <div className="flex gap-2">
                      <input
                        type="password"
                        value={keys[provider.id]}
                        onChange={(e) =>
                          setKeys((prev) => ({ ...prev, [provider.id]: e.target.value }))
                        }
                        placeholder={provider.placeholder}
                        className="flex-1 bg-[#0a0a0a] border border-[#1a1a1a] px-3 py-2 font-mono text-xs text-white placeholder-[#6b6b6b] focus:outline-none focus:border-[#4a9eff]"
                        style={{ borderRadius: 0 }}
                      />
                      <button
                        onClick={() => saveKey(provider.id)}
                        disabled={!keys[provider.id].trim() || saving === provider.id}
                        className="font-mono text-xs font-bold px-4 py-2 hover:brightness-110 transition-all disabled:opacity-50"
                        style={{
                          backgroundColor: "#22c55e",
                          color: "#000000",
                          borderRadius: 0,
                        }}
                      >
                        {saving === provider.id ? "..." : "Save"}
                      </button>
                    </div>
                    <a
                      href={provider.helpUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-block mt-2 font-mono text-[10px] text-[#4a9eff] hover:text-white transition-colors"
                    >
                      Get your API key &#8594;
                    </a>
                  </>
                )}
              </div>
            );
          })}
        </div>

        <div className="mt-10 pt-6 border-t border-[#1a1a1a]">
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-[#6b6b6b] mb-3">
            How It Works
          </p>
          <div className="space-y-2 text-xs text-[#6b6b6b]">
            <p>&#10095; Your key is stored securely and used only for enrichment requests</p>
            <p>&#10095; Without a key, you get 10 free enrichments on us</p>
            <p>&#10095; With your own key, enrichments are unlimited</p>
            <p>&#10095; You can connect multiple providers and switch anytime</p>
            <p>&#10095; Keys are never exposed to the browser — all calls are server-side</p>
          </div>
        </div>

        <div className="mt-8">
          <Link href="/assessment">
            <button className="font-mono text-sm px-6 py-3 border border-[#1a1a1a] text-[#a0a0a0] hover:text-white hover:border-[#333] transition-colors">
              &#8592; Back to Assessment
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}
