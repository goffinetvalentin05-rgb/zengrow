import { NextResponse } from "next/server";
import { createClient } from "@/src/lib/supabase/server";
import { generateStructuredAI } from "@/src/lib/ai/openai";
import { buildPrivateFeedbackPrompt, parsePrivateFeedbackAnalysis } from "@/src/lib/ai/prompts";
import type { PrivateFeedbackAIAnalysis } from "@/src/lib/ai/types";
import {
  aiErrorResponse,
  getAuthenticatedUser,
  MAX_FEEDBACK_TEXT_LENGTH,
  parseJsonBody,
  runAIGeneration,
  truncateInput,
  verifyRestaurantAccess,
} from "@/src/lib/ai/route-auth";

type Payload = {
  feedbackText?: string;
  rating?: number;
  restaurantId?: string;
  feedbackId?: string;
  regenerate?: boolean;
};

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const { user, error: authError } = await getAuthenticatedUser(supabase);
    if (authError) return authError;

    const body = parseJsonBody<Payload>(await request.json().catch(() => null));
    const restaurantId = body?.restaurantId?.trim();
    const feedbackId = body?.feedbackId?.trim();
    const regenerate = body?.regenerate === true;

    if (!restaurantId) {
      return NextResponse.json({ error: "restaurantId requis." }, { status: 400 });
    }

    const { restaurant, error: restaurantError } = await verifyRestaurantAccess(
      supabase,
      user!,
      restaurantId,
    );
    if (restaurantError) return restaurantError;

    let feedbackText = body?.feedbackText?.trim() ?? "";
    let rating =
      typeof body?.rating === "number" && body.rating >= 1 && body.rating <= 5
        ? Math.round(body.rating)
        : undefined;

    if (feedbackId) {
      const { data: feedback, error: feedbackError } = await supabase
        .from("feedbacks")
        .select("id, message, rating, ai_analysis, ai_analysis_at")
        .eq("id", feedbackId)
        .eq("restaurant_id", restaurant!.id)
        .maybeSingle();

      if (feedbackError || !feedback) {
        return NextResponse.json({ error: "Retour introuvable." }, { status: 404 });
      }

      if (!regenerate && feedback.ai_analysis) {
        return NextResponse.json({
          analysis: feedback.ai_analysis as PrivateFeedbackAIAnalysis,
          cached: true,
        });
      }

      feedbackText = feedback.message?.trim() ?? feedbackText;
      rating = feedback.rating ?? rating;
    }

    if (!feedbackText) {
      return NextResponse.json({ error: "feedbackText requis." }, { status: 400 });
    }

    if (feedbackText.length > MAX_FEEDBACK_TEXT_LENGTH) {
      return NextResponse.json(
        { error: `Le retour ne peut pas dépasser ${MAX_FEEDBACK_TEXT_LENGTH} caractères.` },
        { status: 400 },
      );
    }

    const { system, user: userPrompt } = buildPrivateFeedbackPrompt({
      feedbackText: truncateInput(feedbackText, MAX_FEEDBACK_TEXT_LENGTH),
      rating,
    });

    const generation = (await runAIGeneration({
      supabase,
      user: user!,
      restaurant: restaurant!,
      feature: "private_feedback_analysis",
      input: feedbackText,
      generate: () =>
        generateStructuredAI({
          system,
          user: userPrompt,
          maxTokens: 700,
          parse: parsePrivateFeedbackAnalysis,
        }),
    })) as { data: PrivateFeedbackAIAnalysis };

    const analysis = generation.data;

    const analyzedAt = new Date().toISOString();
    const stored: PrivateFeedbackAIAnalysis = { ...analysis, analyzedAt };

    if (feedbackId) {
      const { error: updateError } = await supabase
        .from("feedbacks")
        .update({ ai_analysis: stored, ai_analysis_at: analyzedAt })
        .eq("id", feedbackId)
        .eq("restaurant_id", restaurant!.id);

      if (updateError) {
        return NextResponse.json({ error: updateError.message }, { status: 500 });
      }
    }

    return NextResponse.json({ analysis: stored, cached: false });
  } catch (error) {
    return aiErrorResponse(error);
  }
}
