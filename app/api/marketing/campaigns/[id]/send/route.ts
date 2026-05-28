import { NextResponse } from "next/server";
import { canAccessFeatureForUser, isRestaurantExpiredForUser } from "@/src/lib/access";
import {
  isMarketingAudienceFilter,
  sendMarketingCampaign,
} from "@/src/lib/marketing/send-campaign";
import { expireTrialIfNeeded } from "@/src/lib/subscription";
import { createClient } from "@/src/lib/supabase/server";

type SendPayload = {
  audience?: unknown;
};

export async function POST(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const { id: campaignId } = await context.params;
  const payload = (await request.json().catch(() => ({}))) as SendPayload;
  const audience = payload.audience;

  if (!isMarketingAudienceFilter(audience)) {
    return NextResponse.json({ error: "Audience invalide." }, { status: 400 });
  }

  const supabase = await createClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return NextResponse.json({ error: "Non autorisé." }, { status: 401 });
  }

  const { data: restaurant, error: restaurantError } = await supabase
    .from("restaurants")
    .select("id, name, slug, owner_id, subscription_plan, subscription_status, trial_end_date, stripe_subscription_id")
    .eq("owner_id", user.id)
    .single();

  if (restaurantError || !restaurant) {
    return NextResponse.json({ error: "Restaurant introuvable." }, { status: 404 });
  }

  const syncedRestaurant = await expireTrialIfNeeded(supabase, restaurant);
  if (isRestaurantExpiredForUser(user.email, syncedRestaurant)) {
    return NextResponse.json({ error: "Abonnement expiré." }, { status: 402 });
  }

  if (
    !canAccessFeatureForUser(
      user.email,
      syncedRestaurant.subscription_plan,
      "marketing",
      syncedRestaurant.subscription_status,
    )
  ) {
    return NextResponse.json({ error: "Le plan Pro est requis." }, { status: 403 });
  }

  const { data: campaign, error: campaignError } = await supabase
    .from("email_campaigns")
    .select("id, name, subject, content, image_url, sent_at")
    .eq("id", campaignId)
    .eq("restaurant_id", syncedRestaurant.id)
    .maybeSingle();

  if (campaignError || !campaign) {
    return NextResponse.json({ error: "Campagne introuvable." }, { status: 404 });
  }

  if (campaign.sent_at) {
    return NextResponse.json({ error: "Cette campagne a déjà été envoyée." }, { status: 400 });
  }

  try {
    const origin = new URL(request.url).origin;
    const result = await sendMarketingCampaign({
      supabase,
      campaignId: campaign.id,
      restaurant: syncedRestaurant,
      subject: campaign.subject,
      content: campaign.content,
      imageUrl: campaign.image_url,
      audience,
      requestOrigin: origin,
    });

    return NextResponse.json({ ok: true, campaignId: campaign.id, ...result });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Envoi impossible.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
