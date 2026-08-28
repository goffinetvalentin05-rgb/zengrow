import type { ProspectSearchProvider } from "@/src/lib/sharpz/prospect-search/providers/base";
import type { RawSearchHit } from "@/src/lib/sharpz/prospect-search/types";
import { ProspectSearchError } from "@/src/lib/sharpz/prospect-search/types";

export function createBraveProvider(apiKey: string): ProspectSearchProvider {
  return {
    name: "brave",
    async search(query: string, maxResults = 10): Promise<RawSearchHit[]> {
      const params = new URLSearchParams({
        q: query,
        count: String(Math.min(maxResults, 20)),
      });
      const response = await fetch(`https://api.search.brave.com/res/v1/web/search?${params}`, {
        headers: {
          Accept: "application/json",
          "X-Subscription-Token": apiKey,
        },
      });

      if (!response.ok) {
        const body = await response.text().catch(() => "");
        console.error("[prospect-search][brave]", response.status, body.slice(0, 400));
        throw new ProspectSearchError(
          "Sharpz n’a pas pu accéder à la source de recherche.",
          "provider_error",
        );
      }

      const data = (await response.json()) as {
        web?: { results?: Array<{ title?: string; url?: string; description?: string }> };
      };

      return (data.web?.results ?? [])
        .filter((item) => item.url?.trim())
        .map((item) => ({
          title: String(item.title ?? "").trim(),
          url: String(item.url).trim(),
          snippet: item.description?.trim() || null,
          sourceQuery: query,
        }));
    },
  };
}
