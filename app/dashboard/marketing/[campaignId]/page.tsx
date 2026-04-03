import Link from "next/link";
import { notFound } from "next/navigation";
import { requireRestaurant } from "@/src/lib/auth";
import { createClient } from "@/src/lib/supabase/server";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/src/components/ui/card";

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
      <div className="flex flex-wrap items-start justify-between gap-4">
        <header className="space-y-2">
          <p className="dashboard-section-kicker">Campagne</p>
          <h1 className="dashboard-page-title">{campaign.name}</h1>
          <p className="dashboard-section-subtitle">Envoyée le {(campaign.sent_at ?? campaign.created_at).slice(0, 10)}</p>
        </header>
        <Link href="/dashboard/marketing" className="text-sm font-medium text-green-700 hover:text-green-800">
          ← Retour
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Contenu</CardTitle>
          <CardDescription>Objet et message envoyés.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <p className="dashboard-field-label">Objet</p>
            <p className="mt-1 font-medium text-gray-900">{campaign.subject}</p>
          </div>
          <div>
            <p className="dashboard-field-label">Message</p>
            <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-gray-800">{campaign.content}</p>
          </div>
          <div className="flex flex-wrap gap-10 border-t border-gray-100 pt-6">
            <div>
              <p className="dashboard-field-label">E-mails envoyés</p>
              <p className="mt-1 text-2xl font-semibold tabular-nums text-gray-900">{sentCount}</p>
            </div>
            <div>
              <p className="dashboard-field-label">Ouverts</p>
              <p className="mt-1 text-2xl font-semibold text-gray-400">—</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div>
        <h2 className="text-sm font-medium text-gray-900">Destinataires</h2>
        {emails.length === 0 ? (
          <p className="mt-4 text-sm text-gray-500">Aucune adresse enregistrée.</p>
        ) : (
          <ul className="mt-4 divide-y divide-gray-100">
            {emails.map((email) => (
              <li key={email} className="py-2 text-sm text-gray-800">
                {email}
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
