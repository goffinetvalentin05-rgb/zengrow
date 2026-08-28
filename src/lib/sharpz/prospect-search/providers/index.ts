import { createBraveProvider } from "@/src/lib/sharpz/prospect-search/providers/brave";
import type {
  ProspectSearchProvider,
  ProspectSearchProviderName,
} from "@/src/lib/sharpz/prospect-search/providers/base";
import { isProspectSearchProviderName } from "@/src/lib/sharpz/prospect-search/providers/base";
import { createSerperProvider } from "@/src/lib/sharpz/prospect-search/providers/serper";
import { createTavilyProvider } from "@/src/lib/sharpz/prospect-search/providers/tavily";
import { ProspectSearchError } from "@/src/lib/sharpz/prospect-search/types";

export function isProspectSearchConfigured() {
  return Boolean(resolveProspectSearchProvider());
}

export function resolveProspectSearchProvider(): ProspectSearchProvider | null {
  const preferred = process.env.PROSPECT_SEARCH_PROVIDER?.trim().toLowerCase();
  const order: ProspectSearchProviderName[] = [];

  if (preferred && isProspectSearchProviderName(preferred)) {
    order.push(preferred);
  }
  for (const name of ["tavily", "serper", "brave"] as const) {
    if (!order.includes(name)) order.push(name);
  }

  for (const name of order) {
    if (name === "tavily" && process.env.TAVILY_API_KEY?.trim()) {
      return createTavilyProvider(process.env.TAVILY_API_KEY.trim());
    }
    if (name === "serper" && process.env.SERPER_API_KEY?.trim()) {
      return createSerperProvider(process.env.SERPER_API_KEY.trim());
    }
    if (name === "brave" && process.env.BRAVE_SEARCH_API_KEY?.trim()) {
      return createBraveProvider(process.env.BRAVE_SEARCH_API_KEY.trim());
    }
  }

  return null;
}

export function requireProspectSearchProvider(): ProspectSearchProvider {
  const provider = resolveProspectSearchProvider();
  if (!provider) {
    throw new ProspectSearchError(
      "La recherche de prospects n’est pas configurée (clé API manquante).",
      "not_configured",
      false,
    );
  }
  return provider;
}
