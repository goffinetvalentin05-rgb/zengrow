import { NextResponse } from "next/server";
import { createClient } from "@/src/lib/supabase/server";
import { generateStructuredAI } from "@/src/lib/ai/openai";
import { buildImproveReviewEmailPrompt, parseImproveReviewEmailResult } from "@/src/lib/ai/prompts";
import type { ImproveReviewEmailAIResult } from "@/src/lib/ai/types";
import {
  aiErrorResponse,
  getAuthenticatedUser,
  MAX_CAMPAIGN_FIELD_LENGTH,
  parseJsonBody,
  runAIGeneration,
  truncateInput,
  verifyRestaurantAccess,
} from "@/src/lib/ai/route-auth";

type Payload = {
  currentText?: string;
  restaurantName?: string;
  tone?: string;
  language?: "fr" | "de" | "en";
  restaurantId?: string;
};

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const { user, error: authError } = await getAuthenticatedUser(supabase);
    if (authError) return authError;

    const body = parseJsonBody<Payload>(await request.json().catch(() => null));
    const restaurantId = body?.restaurantId?.trim();

    if (!restaurantId) {
      return NextResponse.json({ error: "restaurantId requis." }, { status: 400 });
    }

    const { restaurant, error: restaurantError } = await verifyRestaurantAccess(
      supabase,
      user!,
      restaurantId,
    );
    if (restaurantError) return restaurantError;

    const language = body?.language ?? "fr";
    const currentText = body?.currentText?.trim();
    const restaurantName = body?.restaurantName?.trim() || restaurant!.name;

    const { system, user: userPrompt } = buildImproveReviewEmailPrompt({
      currentText: currentText ? truncateInput(currentText, 2000) : undefined,
      restaurantName,
      tone: body?.tone ? truncateInput(body.tone, MAX_CAMPAIGN_FIELD_LENGTH) : undefined,
      language,
    });

    const result = (await runAIGeneration({
      supabase,
      user: user!,
      restaurant: restaurant!,
      feature: "improve_review_email",
      input: currentText ?? null,
      generate: () =>
        generateStructuredAI({
          system,
          user: userPrompt,
          maxTokens: 600,
          parse: parseImproveReviewEmailResult,
        }),
    })) as { data: ImproveReviewEmailAIResult };

    return NextResponse.json(result.data);
  } catch (error) {
    return aiErrorResponse(error);
  }
}
