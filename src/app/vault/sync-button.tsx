"use client";

import { useState } from "react";

export default function SyncButton() {
  const [state, setState] = useState<"idle" | "syncing" | "done" | "error">("idle");
  const [result, setResult] = useState("");

  async function handleSync() {
    setState("syncing");
    try {
      const res = await fetch("/api/vault/sync", { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Sync failed");
      setResult(`${data.files} files, ${data.dirs} folders`);
      setState("done");
      setTimeout(() => setState("idle"), 4000);
    } catch (e) {
      setResult(e instanceof Error ? e.message : "Failed");
      setState("error");
      setTimeout(() => setState("idle"), 4000);
    }
  }

  return (
    <button
      onClick={handleSync}
      disabled={state === "syncing"}
      className={`flex items-center gap-2 px-3 py-2 text-xs rounded-lg border transition-colors ${
        state === "syncing"
          ? "text-dim border-border cursor-wait"
          : state === "done"
          ? "text-green border-green/20 bg-green/5"
          : state === "error"
          ? "text-red border-red/20 bg-red/5"
          : "text-muted border-border hover:text-foreground hover:border-blue/30"
      }`}
    >
      {state === "syncing" && (
        <svg className="w-3.5 h-3.5 animate-spin" viewBox="0 0 16 16" fill="none">
          <circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="2" opacity="0.3" />
          <path d="M14 8a6 6 0 00-6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
      )}
      {state === "idle" && (
        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 16 16" stroke="currentColor" strokeWidth="1.5">
          <path d="M2 8a6 6 0 0110.5-4M14 8a6 6 0 01-10.5 4M12.5 4H14V2M3.5 12H2v2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      )}
      {state === "syncing" ? "Syncing..." : state === "done" ? `Synced — ${result}` : state === "error" ? result : "Sync vault"}
    </button>
  );
}
