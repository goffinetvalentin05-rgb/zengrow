import { NextResponse } from "next/server";
import { z } from "zod";
import { generateStructuredAI } from "@/src/lib/ai/openai";
import { runAIGeneration } from "@/src/lib/ai/route-auth";
import {
  asksForCompetitorDiscovery,
  asksForDailyPlan,
  asksForProspectDiscovery,
  asksForTrafficAnalysis,
} from "@/src/lib/sharpz/agent-capabilities";
import { parseJson, requireSharpzApi } from "@/src/lib/sharpz/api-session";
import { logProspectEvent } from "@/src/lib/sharpz/prospect-events";
import { isProspectSearchConfigured } from "@/src/lib/sharpz/prospect-search/providers";
import { searchProspects } from "@/src/lib/sharpz/prospect-search/search-prospects";
import { ProspectSearchError } from "@/src/lib/sharpz/prospect-search/types";
import { loadSharpzContext } from "@/src/lib/sharpz/context";
import {
  clampConfidence,
  clampEffort,
  clampImpact,
  computeSharpzScore,
} from "@/src/lib/sharpz/scoring";
import type { ActionCategory } from "@/src/lib/sharpz/types";

const messageSchema = z.object({
  role: z.enum(["user", "assistant"]),
  content: z.string().min(1).max(4000),
});

const proposedActionSchema = z.object({
  title: z.string(),
  category: z.string(),
  impact: z.number(),
  effort: z.number(),
  confidence: z.number(),
  why: z.string(),
  howTo: z.string().optional(),
});

const replySchema = z.object({
  reply: z.string(),
  proposedActions: z.array(proposedActionSchema).max(5).optional(),
});

const ACTION_CATEGORIES = new Set<ActionCategory>([
  "acquisition",
  "conversion",
  "landing",
  "pricing",
  "content",
  "seo",
  "retention",
  "market",
  "prospection",
  "monetisation",
  "positioning",
]);

function normalizeCategory(value: string): ActionCategory {
  return ACTION_CATEGORIES.has(value as ActionCategory) ? (value as ActionCategory) : "acquisition";
}

function normalizeProposedActions(
  items: z.infer<typeof proposedActionSchema>[] | undefined,
  existingTitles: string[],
) {
  if (!items?.length) return [];
  const seen = new Set(existingTitles.map((title) => title.trim().toLowerCase()));
  const normalized: z.infer<typeof proposedActionSchema>[] = [];

  for (const item of items) {
    const title = item.title?.trim();
    if (!title) continue;
    const key = title.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    normalized.push({
      title,
      category: normalizeCategory(item.category),
      impact: clampImpact(item.impact),
      effort: clampEffort(item.effort),
      confidence: clampConfidence(item.confidence),
      why: item.why?.trim() || "",
      howTo: item.howTo?.trim(),
    });
    if (normalized.length >= 5) break;
  }

  return normalized.map((item) => ({
    ...item,
    score: computeSharpzScore(item.impact, item.effort, item.confidence),
  }));
}

function systemPrompt(mode: "default" | "daily_plan") {
  const base = `Tu es Orion, l'agent Sharpz — Growth OS pour fondateurs SaaS.
Tu reçois un contexte JSON (profil SaaS, objectifs, actions ouvertes, prospects, concurrents suivis, audit vérifié, expérimentations, capacités connectées).

Capacités NON disponibles (ne jamais prétendre les avoir faites) :
- Recherche web de concurrents
- Données Sharpz Analytics / trafic (sauf si capabilities.trafficAnalytics = true)
- MRR / revenue Stripe (sauf si capabilities.revenueData = true)

Règles absolues :
- N'invente aucune métrique, entreprise, email, téléphone ou concurrent.
- La recherche de prospects est gérée par un outil dédié côté serveur — ne renvoie jamais prospects[] toi-même dans cette conversation.
- proposedCompetitors ne sont jamais renvoyés — laisse-les absents.
- proposedActions : uniquement des recommandations concrètes basées sur le contexte réel.
- Ne duplique pas une action déjà ouverte (openActions).
- Si une donnée manque, dis-le explicitement dans reply.
- Réponds en JSON { reply, proposedActions? }.`;

  if (mode === "daily_plan") {
    return `${base}
Mode plan du jour :
- Propose 3 à 5 actions maximum dans proposedActions.
- Priorise selon primaryObjective, openActions, followUpProspects et findings d'audit.
- Chaque action : title, category, impact, effort, confidence, why, howTo.
- Dans reply : résume le focus du jour en 2-3 phrases, sans inventer de chiffres.`;
  }

  return `${base}
- proposedActions : seulement si tu proposes des actions vérifiables à ajouter dans Aujourd'hui (max 3).
- Sinon, omets proposedActions.`;
}

export async function POST(request: Request) {
  const session = await requireSharpzApi();
  if (!session.ok) return session.error;
  const { supabase, user, restaurant } = session;
  const body = await parseJson<{ messages?: unknown }>(request);
  const parsed = z.array(messageSchema).safeParse(body?.messages);
  if (!parsed.success || parsed.data.length === 0) {
    return NextResponse.json({ error: "Message requis." }, { status: 400 });
  }

  const context = await loadSharpzContext(supabase, restaurant.id);
  const lastUser = [...parsed.data].reverse().find((item) => item.role === "user")?.content ?? "";

  if (asksForProspectDiscovery(lastUser)) {
    if (!isProspectSearchConfigured()) {
      return NextResponse.json({
        reply:
          "La recherche web de prospects n’est pas encore configurée côté serveur (clé API manquante). Je ne vais pas inventer d’entreprises, de contacts ou d’emails. Ajoutez des prospects manuellement dans Prospects.",
        proposedActions: [],
        capability: "prospect_search_not_connected",
      });
    }

    try {
      const result = await searchProspects({
        supabase,
        user,
        restaurant,
        userMessage: lastUser,
        context,
      });

      return NextResponse.json({
        reply: result.reply,
        prospects: result.prospects,
        meta: {
          requested: result.requested,
          found: result.found,
          duplicatesRemoved: result.duplicatesRemoved,
          provider: result.provider,
        },
        capability: "prospect_search",
      });
    } catch (error) {
      if (error instanceof ProspectSearchError) {
        return NextResponse.json({
          reply: error.message,
          prospects: [],
          searchError: { message: error.message, retryable: error.retryable },
          capability: "prospect_search_error",
        });
      }
      const { aiErrorResponse } = await import("@/src/lib/ai/route-auth");
      return aiErrorResponse(error);
    }
  }

  if (asksForCompetitorDiscovery(lastUser)) {
    return NextResponse.json({
      reply:
        "La découverte automatique de concurrents n’est pas connectée. Je ne listerai pas de noms inventés. Vous pouvez ajouter des concurrents manuellement dans Réglages ou Analytics → Marché. Je peux en revanche commenter les concurrents déjà suivis dans votre contexte.",
      proposedActions: [],
      capability: "competitor_search_not_connected",
    });
  }

  if (asksForTrafficAnalysis(lastUser) && !context.capabilities.trafficAnalytics) {
    return NextResponse.json({
      reply:
        "Sharpz Analytics n’est pas encore installé sur votre SaaS. Je n’ai donc aucune donnée de trafic réelle à analyser. Installez le snippet depuis Réglages (phase Analytics) — je ne fournirai ni visiteurs, ni sessions, ni taux de conversion estimés.",
      proposedActions: [],
      capability: "traffic_not_connected",
    });
  }

  const dailyPlan = asksForDailyPlan(lastUser);
  const existingTitles = [
    ...context.openActions.map((item) => item.title),
    ...context.actions.filter((item) => item.status === "todo").map((item) => item.title),
  ];

  try {
    const result = (await runAIGeneration({
      supabase,
      user,
      restaurant,
      feature: "sharpz_assistant",
      input: lastUser,
      generate: () =>
        generateStructuredAI({
          system: systemPrompt(dailyPlan ? "daily_plan" : "default"),
          user: JSON.stringify({
            context,
            conversation: parsed.data.slice(-8),
            mode: dailyPlan ? "daily_plan" : "default",
          }),
          maxTokens: dailyPlan ? 2200 : 1600,
          timeoutMs: 25000,
          parse: (raw) => replySchema.parse(raw),
        }),
    })) as { data: z.infer<typeof replySchema> };

    const proposedActions = normalizeProposedActions(result.data.proposedActions, existingTitles);

    return NextResponse.json({
      reply: result.data.reply,
      proposedActions,
    });
  } catch (error) {
    const { aiErrorResponse } = await import("@/src/lib/ai/route-auth");
    return aiErrorResponse(error);
  }
}
