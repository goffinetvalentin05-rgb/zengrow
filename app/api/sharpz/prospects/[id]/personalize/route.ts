import { NextResponse } from "next/server";
import { z } from "zod";
import { generateStructuredAI } from "@/src/lib/ai/openai";
import { aiErrorResponse, runAIGeneration } from "@/src/lib/ai/route-auth";
import { parseJson, requireSharpzApi } from "@/src/lib/sharpz/api-session";
import { isScriptChannel, isScriptStage } from "@/src/lib/sharpz/outreach";

const replySchema = z.object({
  text: z.string().min(1),
});

export async function POST(request: Request, context: { params: Promise<{ id: string }> }) {
  const session = await requireSharpzApi();
  if (!session.ok) return session.error;
  const { supabase, user, restaurant } = session;
  const { id } = await context.params;
  const body = await parseJson<{
    channel?: string;
    stage?: string;
    content?: string;
    scriptName?: string | null;
  }>(request);

  const content = body?.content?.trim();
  if (!content) return NextResponse.json({ error: "Script requis." }, { status: 400 });
  if (!body?.channel || !isScriptChannel(body.channel)) {
    return NextResponse.json({ error: "Canal invalide." }, { status: 400 });
  }
  if (body.stage && !isScriptStage(body.stage)) {
    return NextResponse.json({ error: "Étape invalide." }, { status: 400 });
  }

  const { data: prospect } = await supabase
    .from("prospects")
    .select(
      "id, name, company, email, phone, url, contact, source, why_fit, notes, status, last_action, linkedin_url, instagram_url, prospect_type",
    )
    .eq("id", id)
    .eq("restaurant_id", restaurant.id)
    .maybeSingle();
  if (!prospect) return NextResponse.json({ error: "Prospect introuvable." }, { status: 404 });

  const [{ data: saas }, { data: objectives }, { data: events }] = await Promise.all([
    supabase
      .from("user_saas")
      .select("name, url, description, pricing_summary")
      .eq("restaurant_id", restaurant.id)
      .maybeSingle(),
    supabase
      .from("user_objectives")
      .select("key, custom_label, is_primary")
      .eq("restaurant_id", restaurant.id)
      .eq("is_primary", true)
      .maybeSingle(),
    supabase
      .from("prospect_events")
      .select("event_type, detail, meta, created_at")
      .eq("prospect_id", id)
      .eq("restaurant_id", restaurant.id)
      .order("created_at", { ascending: false })
      .limit(12),
  ]);

  try {
    const result = (await runAIGeneration({
      supabase,
      user,
      restaurant,
      feature: "sharpz_assistant",
      input: content.slice(0, 1500),
      generate: () =>
        generateStructuredAI({
          system: `Tu es Orion, agent Sharpz. Tu personnalises un script de prospection.
Règles absolues :
- N'invente AUCUNE information sur le prospect (nom, entreprise, email, téléphone, poste, résultat, citation).
- Si une donnée manque, conserve le placeholder {{variable}} ou omets la phrase.
- Ne fabrique pas de preuve sociale, de métrique, de client ou de chiffre.
- Garde le canal, le ton professionnel et une longueur similaire.
- Réponds en JSON { "text": "..." } uniquement, dans la langue du script.`,
          user: JSON.stringify({
            channel: body.channel,
            stage: body.stage ?? null,
            scriptName: body.scriptName ?? null,
            originalScript: content,
            prospect: {
              type: prospect.prospect_type,
              name: prospect.name,
              company: prospect.company,
              email: prospect.email,
              phone: prospect.phone,
              url: prospect.url,
              contact: prospect.contact,
              source: prospect.source,
              whyFit: prospect.why_fit,
              notes: prospect.notes,
              status: prospect.status,
              lastAction: prospect.last_action,
              linkedinUrl: prospect.linkedin_url,
              instagramUrl: prospect.instagram_url,
            },
            saas: saas
              ? {
                  name: saas.name,
                  url: saas.url,
                  description: saas.description,
                  offer: saas.pricing_summary,
                }
              : null,
            objective: objectives
              ? { key: objectives.key, label: objectives.custom_label }
              : null,
            contactHistory: events ?? [],
          }),
          maxTokens: 900,
          timeoutMs: 20000,
          parse: (raw) => replySchema.parse(raw),
        }),
    })) as { data: z.infer<typeof replySchema> };

    return NextResponse.json({ text: result.data.text.trim() });
  } catch (error) {
    return aiErrorResponse(error);
  }
}
