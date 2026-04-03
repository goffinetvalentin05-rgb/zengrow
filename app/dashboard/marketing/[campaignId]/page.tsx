import Link from "next/link";
import { notFound } from "next/navigation";
import { requireRestaurant } from "@/src/lib/auth";
import { createClient } from "@/src/lib/supabase/server";

type CampaignDetailPageProps = {
  params: Promise<{ campaignId: string }>;
};

export default async function CampaignDetailPage({ params }: CampaignDetailPageProps) {
  const { campaignId } = await params;
  const supabase = await createClient();
  const restaurant = await requireRestaurant();

  const { data: campaign, error: campaignError } = await supabase
    .from("email_campaigns")
    .select("id, name, subject, content, created_at, sent_at")
    .eq("id", campaignId)
    .eq("restaurant_id", restaurant.id)
    .single();

  if (campaignError || !campaign) {
    notFound();
  }

  const { data: recipients } = await supabase
    .from("email_campaign_recipients")
    .select("email")
    .eq("campaign_id", campaign.id)
    .order("sent_at", { ascending: false });

  const emails = (recipients ?? []).map((item) => item.email);
  const sentCount = emails.length;

  return (
    <section className="space-y-12">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Campagne</p>
          <h1 className="dashboard-page-title mt-2">{campaign.name}</h1>
          <p className="dashboard-section-subtitle mt-2">
            {(campaign.sent_at ?? campaign.created_at).slice(0, 10)} · {sentCount} envoi{sentCount > 1 ? "s" : ""}
          </p>
        </div>
        <Link href="/dashboard/marketing" className="text-sm font-medium text-green-700 hover:underline">
          ← Retour
        </Link>
      </header>

      <div className="space-y-8 border-t border-gray-100 pt-10">
        <div>
          <p className="dashboard-field-label">Objet</p>
          <p className="mt-1 text-sm font-medium text-gray-900">{campaign.subject}</p>
        </div>
        <div>
          <p className="dashboard-field-label">Message</p>
          <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-gray-800">{campaign.content}</p>
        </div>
      </div>

      <div className="border-t border-gray-100 pt-10">
        <p className="dashboard-field-label">Destinataires</p>
        {emails.length === 0 ? (
          <p className="mt-3 text-sm text-gray-500">Aucun destinataire enregistré.</p>
        ) : (
          <ul className="mt-4 space-y-2 text-sm text-gray-700">
            {emails.map((email) => (
              <li key={email}>{email}</li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
