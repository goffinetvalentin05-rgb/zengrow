import type { Integration } from "@/src/lib/sharpz/types";
import { isProspectSearchConfigured } from "@/src/lib/sharpz/prospect-search/providers";

export type AgentCapabilities = {
  prospectSearch: boolean;
  competitorSearch: boolean;
  trafficAnalytics: boolean;
  revenueData: boolean;
};

export function resolveAgentCapabilities(integrations: Integration[]): AgentCapabilities {
  const connected = new Set(
    integrations.filter((item) => item.status === "connected").map((item) => item.provider),
  );

  return {
    prospectSearch: isProspectSearchConfigured(),
    competitorSearch: false,
    trafficAnalytics:
      connected.has("sharpz_analytics") ||
      connected.has("google_analytics") ||
      connected.has("posthog"),
    revenueData: connected.has("stripe") || connected.has("paddle"),
  };
}

export function asksForProspectDiscovery(text: string) {
  return (
    /(trouve|trouver|cherche|chercher|find|search|liste|list).{0,48}(prospect|lead|client|cible)/i.test(text) ||
    /(trouve|trouver|cherche|chercher|find|search).{0,48}(club|restaurant|entreprise|company|organisation|organization)/i.test(text) ||
    /(prospect|lead|client|cible).{0,40}(cohérent|coherent|icp|similar|similaire)/i.test(text) ||
    /(similaire|similar).{0,40}(prospect|à|to)/i.test(text)
  );
}

export function asksForCompetitorDiscovery(text: string) {
  return /(trouve|trouver|cherche|chercher|find|search|liste|list|surveill).{0,40}(concurrent|competitor|competition)/i.test(
    text,
  );
}

export function asksForTrafficAnalysis(text: string) {
  return /(trafic|traffic|visiteur|visitor|session|page vue|pageview|utm|referral|conversion)/i.test(text);
}

export function asksForDailyPlan(text: string) {
  return /(plan du jour|plan d['’]aujourd|daily plan|mon plan|quoi faire|what should i do|priorit)/i.test(text);
}
