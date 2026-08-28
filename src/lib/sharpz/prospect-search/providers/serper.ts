import type { ProspectSearchProvider } from "@/src/lib/sharpz/prospect-search/providers/base";
import type { RawSearchHit } from "@/src/lib/sharpz/prospect-search/types";
import { ProspectSearchError } from "@/src/lib/sharpz/prospect-search/types";

export function createSerperProvider(apiKey: string): ProspectSearchProvider {
  return {
    name: "serper",
    async search(query: string, maxResults = 10): Promise<RawSearchHit[]> {
      const response = await fetch("https://google.serper.dev/search", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-API-KEY": apiKey,
        },
        body: JSON.stringify({
          q: query,
          num: Math.min(maxResults, 20),
        }),
      });

      if (!response.ok) {
        const body = await response.text().catch(() => "");
        console.error("[prospect-search][serper]", response.status, body.slice(0, 400));
        throw new ProspectSearchError(
          "Sharpz n’a pas pu accéder à la source de recherche.",
          "provider_error",
        );
      }

      const data = (await response.json()) as {
        organic?: Array<{ title?: string; link?: string; snippet?: string }>;
      };

      return (data.organic ?? [])
        .filter((item) => item.link?.trim())
        .map((item) => ({
          title: String(item.title ?? "").trim(),
          url: String(item.link).trim(),
          snippet: item.snippet?.trim() || null,
          sourceQuery: query,
        }));
    },
  };
}
