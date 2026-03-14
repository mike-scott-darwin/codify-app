"use client";

import { useState, useCallback } from "react";

interface UseEnrichmentReturn {
  enrichedContent: string | null;
  isLoading: boolean;
  error: string | null;
  enrich: () => Promise<void>;
  reset: () => void;
  isEnriched: boolean;
}

export function useEnrichment(
  fileType: string,
  answers: Record<string, string>
): UseEnrichmentReturn {
  const [enrichedContent, setEnrichedContent] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const enrich = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/enrich", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fileType, answers }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error ?? `Request failed (${response.status})`);
        return;
      }

      setEnrichedContent(data.enrichedContent);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Network error. Try again.");
    } finally {
      setIsLoading(false);
    }
  }, [fileType, answers]);

  const reset = useCallback(() => {
    setEnrichedContent(null);
    setError(null);
  }, []);

  return {
    enrichedContent,
    isLoading,
    error,
    enrich,
    reset,
    isEnriched: enrichedContent !== null,
  };
}
