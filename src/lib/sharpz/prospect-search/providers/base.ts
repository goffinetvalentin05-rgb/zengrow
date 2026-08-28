import type { RawSearchHit } from "@/src/lib/sharpz/prospect-search/types";

export type ProspectSearchProviderName = "tavily" | "serper" | "brave";

export interface ProspectSearchProvider {
  name: ProspectSearchProviderName;
  search(query: string, maxResults?: number): Promise<RawSearchHit[]>;
}

export function isProspectSearchProviderName(value: string): value is ProspectSearchProviderName {
  return value === "tavily" || value === "serper" || value === "brave";
}
