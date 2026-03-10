import { NextResponse } from "next/server";
import { sendMarketingCampaignEmail } from "@/lib/email";
import { createClient } from "@/src/lib/supabase/server";

type AudienceFilter = "all_customers" | "visited_last_30_days" | "visited_last_90_days" | "visited_more_than_3_times";

type CreateCampaignPayload = {
  name?: string;
  subject?: string;
  content?: string;
  imageUrl?: string;
  audience?: AudienceFilter;
};

type CustomerRecipient = {
  id: string;
  full_name: string;
  email: string | null;
  total_visits: number | null;
  last_visit_at: string | null;
};

function isAudienceFilter(value: unknown): value is AudienceFilter {
  return (
    value === "all_customers" ||
    value === "visited_last_30_days" ||
    value === "visited_last_90_days" ||
    value === "visited_more_than_3_times"
  );
}

function selectRecipients(customers: CustomerRecipient[], audience: AudienceFilter) {
  const nowMs = Date.now();
  const thirtyDaysMs = 30 * 24 * 60 * 60 * 1000;
  const ninetyDaysMs = 90 * 24 * 60 * 60 * 1000;

  return customers.filter((customer) => {
    if (!customer.email) {
      return false;
    }

    if (audience === "all_customers") {
      return true;
    }

    if (audience === "visited_more_than_3_times") {
      return (customer.total_visits ?? 0) > 3;
    }

    if (!customer.last_visit_at) {
      return false;
    }

    const lastVisitMs = new Date(customer.last_visit_at).getTime();
    if (Number.isNaN(lastVisitMs)) {
      return false;
    }

    if (audience === "visited_last_30_days") {
      return nowMs - lastVisitMs <= thirtyDaysMs;
    }

    return nowMs - lastVisitMs <= ninetyDaysMs;
  });
}

export async function POST(request: Request) {
  const payload = (await request.json().catch(() => ({}))) as CreateCampaignPayload;
  const name = (payload.name ?? "").trim();
  const subject = (payload.subject ?? "").trim();
  const content = (payload.content ?? "").trim();
  const imageUrl = (payload.imageUrl ?? "").trim() || null;
  const audience = payload.audience;

  if (!name || !subject || !content || !isAudienceFilter(audience)) {
    return NextResponse.json({ error: "Données invalides." }, { status: 400 });
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
    .select("id, name, slug, owner_id")
    .eq("owner_id", user.id)
    .single();

  if (restaurantError || !restaurant) {
    return NextResponse.json({ error: "Restaurant introuvable." }, { status: 404 });
  }

  const [{ data: restaurantUi }, { data: customers, error: customersError }] = await Promise.all([
    supabase.from("restaurant_settings").select("logo_url").eq("restaurant_id", restaurant.id).maybeSingle(),
    supabase
      .from("customers")
      .select("id, full_name, email, total_visits, last_visit_at")
      .eq("restaurant_id", restaurant.id),
  ]);

  if (customersError) {
    return NextResponse.json({ error: customersError.message }, { status: 500 });
  }

  const recipients = selectRecipients((customers ?? []) as CustomerRecipient[], audience);
  if (recipients.length === 0) {
    return NextResponse.json({ error: "Aucun destinataire trouvé pour cette audience." }, { status: 400 });
  }

  const { data: campaign, error: campaignInsertError } = await supabase
    .from("email_campaigns")
    .insert({
      restaurant_id: restaurant.id,
      name,
      subject,
      content,
      image_url: imageUrl,
    })
    .select("id")
    .single();

  if (campaignInsertError || !campaign) {
    return NextResponse.json({ error: campaignInsertError?.message ?? "Impossible de créer la campagne." }, { status: 500 });
  }

  const origin = new URL(request.url).origin;
  const ctaUrl = `${origin}/r/${restaurant.slug}`;
  const sentAtIso = new Date().toISOString();
  const successfulRecipients: { campaign_id: string; customer_id: string; email: string; sent_at: string }[] = [];

  for (const recipient of recipients) {
    if (!recipient.email) {
      continue;
    }

    try {
      await sendMarketingCampaignEmail({
        to: recipient.email,
        restaurantName: restaurant.name,
        restaurantLogoUrl: restaurantUi?.logo_url ?? null,
        subject,
        content,
        imageUrl,
        ctaLabel: "Réserver une table",
        ctaUrl,
      });

      successfulRecipients.push({
        campaign_id: campaign.id,
        customer_id: recipient.id,
        email: recipient.email,
        sent_at: sentAtIso,
      });
    } catch (error) {
      console.error("Marketing campaign email failed", {
        campaignId: campaign.id,
        customerId: recipient.id,
        email: recipient.email,
        error,
      });
    }
  }

  if (successfulRecipients.length > 0) {
    const { error: recipientsInsertError } = await supabase
      .from("email_campaign_recipients")
      .insert(successfulRecipients);

    if (recipientsInsertError) {
      return NextResponse.json({ error: recipientsInsertError.message }, { status: 500 });
    }
  }

  const { error: campaignUpdateError } = await supabase
    .from("email_campaigns")
    .update({ sent_at: sentAtIso })
    .eq("id", campaign.id);

  if (campaignUpdateError) {
    return NextResponse.json({ error: campaignUpdateError.message }, { status: 500 });
  }

  return NextResponse.json({
    ok: true,
    campaignId: campaign.id,
    requestedRecipients: recipients.length,
    sentRecipients: successfulRecipients.length,
    failedRecipients: recipients.length - successfulRecipients.length,
  });
}
