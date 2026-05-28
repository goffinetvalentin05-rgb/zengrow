"use client";

import { useCallback, useEffect, useState } from "react";

type AIUsageState = {
  used: number;
  limit: number;
  remaining: number;
};

export function useAIUsage(restaurantId: string) {
  const [usage, setUsage] = useState<AIUsageState | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (!restaurantId) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/ai/usage?restaurantId=${encodeURIComponent(restaurantId)}`);
      const data = (await res.json()) as AIUsageState & { error?: string };
      if (!res.ok) {
        setError(data.error ?? "Impossible de charger l'usage IA.");
        return;
      }
      setUsage({ used: data.used, limit: data.limit, remaining: data.remaining });
    } catch {
      setError("Impossible de charger l'usage IA.");
    } finally {
      setLoading(false);
    }
  }, [restaurantId]);

  useEffect(() => {
    if (!restaurantId) {
      setLoading(false);
      setUsage(null);
      return;
    }
    void refresh();
  }, [refresh, restaurantId]);

  return { usage, loading, error, refresh };
}
