import { NextResponse } from "next/server";
import { z } from "zod";
import { generateStructuredAI } from "@/src/lib/ai/openai";
import { runAIGeneration } from "@/src/lib/ai/route-auth";
import { parseJson, requireSharpzApi } from "@/src/lib/sharpz/api-session";
import { loadSharpzContext } from "@/src/lib/sharpz/context";

const messageSchema = z.object({
  role: z.enum(["user", "assistant"]),
  content: z.string().min(1).max(4000),
});

const replySchema = z.object({
  reply: z.string(),
  prospects: z
    .array(
      z.object({
        company: z.string(),
        url: z.string().nullable().optional(),
        contact: z.string().nullable().optional(),
        whyFit: z.string().nullable().optional(),
        fitScore: z.number().nullable().optional(),
      }),
    )
    .optional(),
});

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
  const normalized = lastUser.toLowerCase();
  const asksForProspectDiscovery =
    /(trouve|trouver|cherche|chercher|find|search|liste|list).{0,40}(prospect|lead)/i.test(normalized);
  const asksForTraffic =
    /(trafic|traffic|visiteur|visitor|session|page vue|pageview|utm|referral)/i.test(normalized);

  if (asksForProspectDiscovery) {
    return NextResponse.json({
      reply:
        "La recherche web de prospects n’est pas encore connectée à une source de données vérifiable. Je ne vais pas inventer d’entreprises, de contacts ou d’emails. Vous pouvez ajouter des prospects manuellement dans Prospects ; une source d’enrichissement devra être connectée avant que je puisse en trouver réellement.",
      prospects: [],
      capability: "prospect_search_not_connected",
    });
  }

  if (asksForTraffic) {
    return NextResponse.json({
      reply:
        "Sharpz Analytics n’est pas encore installé sur votre SaaS. Je n’ai donc aucune donnée de trafic réelle à analyser pour le moment. Tant que le snippet de tracking n’est pas connecté, je ne fournirai ni visiteurs, ni sessions, ni taux de conversion estimés.",
      prospects: [],
      capability: "traffic_not_connected",
    });
  }

  try {
    const result = (await runAIGeneration({
      supabase,
      user,
      restaurant,
      feature: "sharpz_assistant",
      input: lastUser,
      generate: () =>
        generateStructuredAI({
          system: `Tu es l'assistant Sharpz, Growth Operating System pour fondateurs SaaS.
Tu connais le contexte JSON fourni (SaaS, objectifs, actions, analyses, prospects, marché, contenus, résultats).
Capacités actuellement disponibles:
- Contexte Supabase fourni ci-dessous.
- Profil SaaS et extrait de site déjà enregistrés, lorsqu'ils existent.
- Aucune navigation web en direct.
- Aucune donnée de trafic Sharpz Analytics.
- Aucune base externe de prospects ou d'emails.
Règles:
- N'invente pas de métriques absentes du contexte.
- Ne prétends jamais avoir recherché le web, trouvé un contact ou observé du trafic.
- Si une donnée manque, dis exactement qu'elle manque.
- N'invente aucun prospect, entreprise, email ou téléphone. Laisse toujours prospects[] vide.
- N'ajoute jamais de prospects en base: l'utilisateur doit confirmer.
- Sois concret et orienté action.
Réponds en JSON { reply, prospects? }.`,
          user: JSON.stringify({
            context,
            conversation: parsed.data.slice(-8),
          }),
          maxTokens: 1600,
          timeoutMs: 20000,
          parse: (raw) => replySchema.parse(raw),
        }),
    })) as { data: z.infer<typeof replySchema> };

    return NextResponse.json({
      reply: result.data.reply,
      // Aucun fournisseur de recherche/enrichissement n'est connecté : on ne transmet
      // jamais au client des prospects générés uniquement par le modèle.
      prospects: [],
    });
  } catch (error) {
    const { aiErrorResponse } = await import("@/src/lib/ai/route-auth");
    return aiErrorResponse(error);
  }
}
