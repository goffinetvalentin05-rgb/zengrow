import type { ProspectSearchProvider } from "@/src/lib/sharpz/prospect-search/providers/base";
import type { RawSearchHit } from "@/src/lib/sharpz/prospect-search/types";
import { ProspectSearchError } from "@/src/lib/sharpz/prospect-search/types";

export function createTavilyProvider(apiKey: string): ProspectSearchProvider {
  return {
    name: "tavily",
    async search(query: string, maxResults = 10): Promise<RawSearchHit[]> {
      const response = await fetch("https://api.tavily.com/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          api_key: apiKey,
          query,
          search_depth: "basic",
          max_results: Math.min(maxResults, 20),
          include_answer: false,
        }),
      });

      if (!response.ok) {
        const body = await response.text().catch(() => "");
        console.error("[prospect-search][tavily]", response.status, body.slice(0, 400));
        throw new ProspectSearchError(
          "Sharpz n’a pas pu accéder à la source de recherche.",
          "provider_error",
        );
      }

      const data = (await response.json()) as {
        results?: Array<{ title?: string; url?: string; content?: string }>;
      };

      return (data.results ?? [])
        .filter((item) => item.url?.trim())
        .map((item) => ({
          title: String(item.title ?? "").trim(),
          url: String(item.url).trim(),
          snippet: item.content?.trim() || null,
          sourceQuery: query,
        }));
    },
  };
}
