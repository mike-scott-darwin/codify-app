"use client";

import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { useAuth } from "@/lib/auth-context";
import type { Tier } from "@/lib/tier";

interface TierContextType {
  tier: Tier;
  loading: boolean;
  enrichmentCount: number;
  generationCount: number;
  refresh: () => Promise<void>;
}

const TierContext = createContext<TierContextType>({
  tier: "vip",
  loading: true,
  enrichmentCount: 0,
  generationCount: 0,
  refresh: async () => {},
});

export function TierProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [tier, setTier] = useState<Tier>("vip");
  const [loading, setLoading] = useState(true);
  const [enrichmentCount, setEnrichmentCount] = useState(0);
  const [generationCount, setGenerationCount] = useState(0);

  const refresh = useCallback(async () => {
    if (!user) {
      setTier("vip");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/user/tier");
      if (res.ok) {
        const data = await res.json();
        setTier(data.tier || "free");
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
    <TierContext.Provider value={{ tier, loading, enrichmentCount, generationCount, refresh }}>
      {children}
    </TierContext.Provider>
  );
}

export const useTier = () => useContext(TierContext);
