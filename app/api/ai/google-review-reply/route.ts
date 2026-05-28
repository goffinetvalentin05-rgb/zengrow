import { NextResponse } from "next/server";
import { createClient } from "@/src/lib/supabase/server";
import { generateAIText } from "@/src/lib/ai/openai";
import { buildGoogleReviewReplyPrompt } from "@/src/lib/ai/prompts";
import {
  aiErrorResponse,
  getAuthenticatedUser,
  MAX_REVIEW_TEXT_LENGTH,
  parseJsonBody,
  runAIGeneration,
  truncateInput,
  verifyRestaurantAccess,
} from "@/src/lib/ai/route-auth";

type Payload = {
  reviewText?: string;
  rating?: number;
  tone?: "professional" | "warm" | "premium" | "simple";
  language?: "fr" | "de" | "en";
  length?: "short" | "medium";
  restaurantId?: string;
};

const TONE_LABELS: Record<NonNullable<Payload["tone"]>, string> = {
  professional: "professionnel",
  warm: "chaleureux",
  premium: "premium et soigné",
  simple: "simple et direct",
};

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const { user, error: authError } = await getAuthenticatedUser(supabase);
    if (authError) return authError;

    const body = parseJsonBody<Payload>(await request.json().catch(() => null));
    const restaurantId = body?.restaurantId?.trim();
    const reviewText = body?.reviewText?.trim();

    if (!restaurantId || !reviewText) {
      return NextResponse.json({ error: "reviewText et restaurantId sont requis." }, { status: 400 });
    }

    if (reviewText.length > MAX_REVIEW_TEXT_LENGTH) {
      return NextResponse.json(
        { error: `L'avis ne peut pas dépasser ${MAX_REVIEW_TEXT_LENGTH} caractères.` },
        { status: 400 },
      );
    }

    const { restaurant, error: restaurantError } = await verifyRestaurantAccess(
      supabase,
      user!,
      restaurantId,
    );
    if (restaurantError) return restaurantError;

    const tone = body?.tone ?? "professional";
    const language = body?.language ?? "fr";
    const length = body?.length ?? "medium";
    const rating =
      typeof body?.rating === "number" && body.rating >= 1 && body.rating <= 5
        ? Math.round(body.rating)
        : undefined;

    const { system, user: userPrompt } = buildGoogleReviewReplyPrompt({
      reviewText: truncateInput(reviewText, MAX_REVIEW_TEXT_LENGTH),
      rating,
      tone: TONE_LABELS[tone],
      language,
      length,
    });

    const generation = (await runAIGeneration({
      supabase,
      user: user!,
      restaurant: restaurant!,
      feature: "google_review_reply",
      input: reviewText,
      generate: () => generateAIText({ system, user: userPrompt, maxTokens: 450 }),
    })) as { text: string };

    return NextResponse.json({ reply: generation.text });
  } catch (error) {
    return aiErrorResponse(error);
  }
}
