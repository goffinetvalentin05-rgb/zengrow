import { NextResponse } from "next/server";
import { createClient } from "@/src/lib/supabase/server";
import { generateStructuredAI } from "@/src/lib/ai/openai";
import { buildCampaignPrompt, parseCampaignResult } from "@/src/lib/ai/prompts";
import type { CampaignAIResult } from "@/src/lib/ai/types";
import {
  aiErrorResponse,
  getAuthenticatedUser,
  MAX_CAMPAIGN_FIELD_LENGTH,
  MAX_CAMPAIGN_OBJECTIVE_LENGTH,
  parseJsonBody,
  runAIGeneration,
  truncateInput,
  verifyRestaurantAccess,
} from "@/src/lib/ai/route-auth";

type Payload = {
  objective?: string;
  offer?: string;
  audience?: string;
  channels?: string[];
  tone?: string;
  language?: "fr" | "de" | "en";
  restaurantId?: string;
};

const ALLOWED_CHANNELS = new Set(["email", "sms", "whatsapp", "instagram"]);

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const { user, error: authError } = await getAuthenticatedUser(supabase);
    if (authError) return authError;

    const body = parseJsonBody<Payload>(await request.json().catch(() => null));
    const restaurantId = body?.restaurantId?.trim();
    const objective = body?.objective?.trim();

    if (!restaurantId || !objective) {
      return NextResponse.json({ error: "objective et restaurantId sont requis." }, { status: 400 });
    }

    if (objective.length > MAX_CAMPAIGN_OBJECTIVE_LENGTH) {
      return NextResponse.json({ error: "Objectif trop long." }, { status: 400 });
    }

    const channels = (body?.channels ?? []).filter((c) => ALLOWED_CHANNELS.has(c));
    if (channels.length === 0) {
      return NextResponse.json({ error: "Au moins un canal valide est requis." }, { status: 400 });
    }

    const { restaurant, error: restaurantError } = await verifyRestaurantAccess(
      supabase,
      user!,
      restaurantId,
    );
    if (restaurantError) return restaurantError;

    const language = body?.language ?? "fr";
    const { system, user: userPrompt } = buildCampaignPrompt({
      objective: truncateInput(objective, MAX_CAMPAIGN_OBJECTIVE_LENGTH),
      offer: body?.offer ? truncateInput(body.offer, MAX_CAMPAIGN_FIELD_LENGTH) : undefined,
      audience: body?.audience ? truncateInput(body.audience, MAX_CAMPAIGN_FIELD_LENGTH) : undefined,
      channels,
      tone: body?.tone ? truncateInput(body.tone, MAX_CAMPAIGN_FIELD_LENGTH) : undefined,
      language,
    });

    const result = (await runAIGeneration({
      supabase,
      user: user!,
      restaurant: restaurant!,
      feature: "campaign",
      input: objective,
      generate: () =>
        generateStructuredAI({
          system,
          user: userPrompt,
          maxTokens: 900,
          parse: parseCampaignResult,
        }),
    })) as { data: CampaignAIResult };

    return NextResponse.json(result.data);
  } catch (error) {
    return aiErrorResponse(error);
  }
}
