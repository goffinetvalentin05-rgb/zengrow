import { createBraveProvider } from "@/src/lib/sharpz/prospect-search/providers/brave";
import type {
  ProspectSearchProvider,
  ProspectSearchProviderName,
} from "@/src/lib/sharpz/prospect-search/providers/base";
import { isProspectSearchProviderName } from "@/src/lib/sharpz/prospect-search/providers/base";
import { createSerperProvider } from "@/src/lib/sharpz/prospect-search/providers/serper";
import { createTavilyProvider } from "@/src/lib/sharpz/prospect-search/providers/tavily";
import { ProspectSearchError } from "@/src/lib/sharpz/prospect-search/types";

function createProvider(name: ProspectSearchProviderName): ProspectSearchProvider | null {
  if (name === "tavily" && process.env.TAVILY_API_KEY?.trim()) {
    return createTavilyProvider(process.env.TAVILY_API_KEY.trim());
  }
  if (name === "serper" && process.env.SERPER_API_KEY?.trim()) {
    return createSerperProvider(process.env.SERPER_API_KEY.trim());
  }
  if (name === "brave" && process.env.BRAVE_SEARCH_API_KEY?.trim()) {
    return createBraveProvider(process.env.BRAVE_SEARCH_API_KEY.trim());
  }
  return null;
}

export function isProspectSearchConfigured() {
  return Boolean(resolveProspectSearchProvider());
}

/**
 * Si PROSPECT_SEARCH_PROVIDER est défini → uniquement ce provider (pas de fallback silencieux).
 * Sinon → premier provider avec clé (tavily → serper → brave).
 */
export function resolveProspectSearchProvider(): ProspectSearchProvider | null {
  const preferred = process.env.PROSPECT_SEARCH_PROVIDER?.trim().toLowerCase();

  if (preferred) {
    if (!isProspectSearchProviderName(preferred)) {
      return null;
    }
    return createProvider(preferred);
  }

  for (const name of ["tavily", "serper", "brave"] as const) {
    const provider = createProvider(name);
    if (provider) return provider;
  }
  return null;
}

export function requireProspectSearchProvider(): ProspectSearchProvider {
  const preferred = process.env.PROSPECT_SEARCH_PROVIDER?.trim().toLowerCase();

  if (preferred) {
    if (!isProspectSearchProviderName(preferred)) {
      throw new ProspectSearchError(
        `Provider de recherche invalide : « ${preferred} ». Attendu : tavily | serper | brave.`,
        "not_configured",
        false,
      );
    }
    const provider = createProvider(preferred);
    if (!provider) {
      throw new ProspectSearchError(
        `Provider « ${preferred} » sélectionné mais clé API absente.`,
        "not_configured",
        false,
      );
    }
    return provider;
  }

  const provider = resolveProspectSearchProvider();
  if (!provider) {
    throw new ProspectSearchError(
      "La recherche web n’est pas configurée (clé API manquante : Tavily / Serper / Brave).",
      "not_configured",
      false,
    );
  }
  return provider;
}
