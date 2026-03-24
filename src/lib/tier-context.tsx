"use client";

import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { useAuth } from "@/lib/auth-context";
import type { Tier } from "@/lib/tier";

interface TierContextType {
  tier: Tier;
  mode: "diy" | "dfy";
  loading: boolean;
  enrichmentCount: number;
  generationCount: number;
  refresh: () => Promise<void>;
}

const TierContext = createContext<TierContextType>({
  tier: "explore",
  mode: "diy",
  loading: true,
  enrichmentCount: 0,
  generationCount: 0,
  refresh: async () => {},
});

export function TierProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [tier, setTier] = useState<Tier>("explore");
  const [mode, setMode] = useState<"diy" | "dfy">("diy");
  const [loading, setLoading] = useState(true);
  const [enrichmentCount, setEnrichmentCount] = useState(0);
  const [generationCount, setGenerationCount] = useState(0);

  const refresh = useCallback(async () => {
    if (!user) {
      setTier("explore");
      setMode("diy");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/user/tier");
      if (res.ok) {
        const data = await res.json();
        setTier(data.tier || "explore");
        setMode(data.mode || "diy");
        setEnrichmentCount(data.enrichmentCount || 0);
        setGenerationCount(data.generationCount || 0);
      }
    } catch {
      // Default to free on error
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return (
    <TierContext.Provider value={{ tier, mode, loading, enrichmentCount, generationCount, refresh }}>
      {children}
    </TierContext.Provider>
  );
}

export const useTier = () => useContext(TierContext);
