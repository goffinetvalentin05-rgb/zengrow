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
Règles:
- N'invente pas de métriques absentes du contexte.
- Si l'utilisateur demande des prospects, propose uniquement des profils plausibles alignés à l'ICP. Explique le fit. Remplis prospects[].
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
      prospects: result.data.prospects ?? [],
    });
  } catch (error) {
    const { aiErrorResponse } = await import("@/src/lib/ai/route-auth");
    return aiErrorResponse(error);
  }
}
