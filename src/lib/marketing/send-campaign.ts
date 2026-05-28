import { sendMarketingCampaignEmail } from "@/lib/email";
import { signMarketingRecipientOpenToken } from "@/src/lib/marketing/open-pixel-token";
import type { SupabaseClient } from "@supabase/supabase-js";

export type MarketingAudienceFilter =
  | "all_customers"
  | "visited_last_30_days"
  | "visited_last_90_days"
  | "visited_more_than_3_times"
  | "inactive_30_days";

type CustomerRecipient = {
  id: string;
  full_name: string;
  email: string | null;
  total_visits: number | null;
  last_visit_at: string | null;
};

export function isMarketingAudienceFilter(value: unknown): value is MarketingAudienceFilter {
  return (
    value === "all_customers" ||
    value === "visited_last_30_days" ||
    value === "visited_last_90_days" ||
    value === "visited_more_than_3_times" ||
    value === "inactive_30_days"
  );
}

export function selectMarketingRecipients(customers: CustomerRecipient[], audience: MarketingAudienceFilter) {
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
      return audience === "inactive_30_days";
    }

    const lastVisitMs = new Date(customer.last_visit_at).getTime();
    if (Number.isNaN(lastVisitMs)) {
      return false;
    }

    if (audience === "visited_last_30_days") {
      return nowMs - lastVisitMs <= thirtyDaysMs;
    }

    if (audience === "visited_last_90_days") {
      return nowMs - lastVisitMs <= ninetyDaysMs;
    }

    if (audience === "inactive_30_days") {
      return nowMs - lastVisitMs > thirtyDaysMs;
    }

    return false;
  });
}

type SendCampaignParams = {
  supabase: SupabaseClient;
  campaignId: string;
  restaurant: { id: string; name: string; slug: string };
  subject: string;
  content: string;
  imageUrl: string | null;
  audience: MarketingAudienceFilter;
  requestOrigin: string;
};

export async function sendMarketingCampaign({
  supabase,
  campaignId,
  restaurant,
  subject,
  content,
  imageUrl,
  audience,
  requestOrigin,
}: SendCampaignParams) {
  const [{ data: restaurantUi }, { data: customers, error: customersError }] = await Promise.all([
    supabase.from("restaurant_settings").select("logo_url").eq("restaurant_id", restaurant.id).maybeSingle(),
    supabase
      .from("customers")
      .select("id, full_name, email, total_visits, last_visit_at")
      .eq("restaurant_id", restaurant.id),
  ]);

  if (customersError) {
    throw new Error(customersError.message);
  }

  const recipients = selectMarketingRecipients((customers ?? []) as CustomerRecipient[], audience);
  if (recipients.length === 0) {
    throw new Error("Aucun destinataire trouvé pour cette audience.");
  }

  const ctaUrl = `${requestOrigin}/r/${restaurant.slug}`;
  const sentAtIso = new Date().toISOString();
  let sentCount = 0;

  for (const recipient of recipients) {
    if (!recipient.email) continue;

    const { data: row, error: recipientInsertError } = await supabase
      .from("email_campaign_recipients")
      .insert({
        campaign_id: campaignId,
        customer_id: recipient.id,
        email: recipient.email,
        sent_at: sentAtIso,
      })
      .select("id")
      .single();

    if (recipientInsertError || !row) {
      console.error("Marketing campaign recipient insert failed", {
        campaignId,
        customerId: recipient.id,
        error: recipientInsertError,
      });
      continue;
    }

    const openToken = signMarketingRecipientOpenToken(row.id);
    const openTrackingPixelUrl =
      openToken.length > 0
        ? `${requestOrigin}/api/marketing/open?id=${encodeURIComponent(row.id)}&t=${encodeURIComponent(openToken)}`
        : null;

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
        openTrackingPixelUrl,
      });
      sentCount += 1;
    } catch (error) {
      await supabase.from("email_campaign_recipients").delete().eq("id", row.id);
      console.error("Marketing campaign email failed", { campaignId, customerId: recipient.id, error });
    }
  }

  const { error: campaignUpdateError } = await supabase
    .from("email_campaigns")
    .update({ sent_at: sentAtIso })
    .eq("id", campaignId);

  if (campaignUpdateError) {
    throw new Error(campaignUpdateError.message);
  }

  return {
    requestedRecipients: recipients.length,
    sentRecipients: sentCount,
    failedRecipients: recipients.length - sentCount,
  };
}
