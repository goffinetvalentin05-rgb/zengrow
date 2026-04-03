import Link from "next/link";
import { notFound, redirect } from "next/navigation";
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
  const hasMarketingAccess =
    restaurant.subscription_status === "trial" || restaurant.subscription_plan === "pro";
  if (!hasMarketingAccess) {
    redirect("/dashboard/marketing");
  }

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
    <section className="space-y-10">
      <header className="flex flex-wrap items-start justify-between gap-4 border-b border-gray-100 pb-6">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Campagne</p>
          <h1 className="dashboard-section-heading mt-2">{campaign.name}</h1>
          <p className="dashboard-section-subtitle mt-2">
            {(campaign.sent_at ?? campaign.created_at).slice(0, 10)} · {sentCount} envoi{sentCount > 1 ? "s" : ""}
          </p>
        </div>
        <Link href="/dashboard/marketing" className="text-sm font-semibold text-green-700 hover:underline">
          ← Retour
        </Link>
      </header>

      <Card>
        <CardHeader>
          <CardTitle>Contenu</CardTitle>
          <CardDescription>Message envoyé aux destinataires.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <p className="dashboard-field-label">Objet</p>
            <p className="mt-1 text-sm font-semibold text-gray-900">{campaign.subject}</p>
          </div>
          <div>
            <p className="dashboard-field-label">Corps du message</p>
            <p className="mt-3 whitespace-pre-wrap rounded-lg border border-gray-100 bg-gray-50/80 p-5 text-sm leading-relaxed text-gray-800 shadow-sm">
              {campaign.content}
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Statistiques</CardTitle>
          <CardDescription>Suivi simplifié.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">E-mails envoyés</p>
            <p className="mt-2 text-3xl font-bold tabular-nums text-gray-900">{sentCount}</p>
          </div>
          <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">E-mails ouverts</p>
            <p className="mt-2 text-3xl font-bold tabular-nums text-gray-400">—</p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Destinataires</CardTitle>
          <CardDescription>Adresses ciblées par cette campagne.</CardDescription>
        </CardHeader>
        <CardContent>
          {emails.length === 0 ? (
            <p className="rounded-xl border border-dashed border-gray-200 bg-gray-50/80 py-8 text-center text-sm text-gray-500 shadow-sm">
              Aucun destinataire enregistré.
            </p>
          ) : (
            <ul className="space-y-2">
              {emails.map((email) => (
                <li
                  key={email}
                  className="rounded-lg border border-gray-100 bg-gray-50/60 px-4 py-2.5 text-sm text-gray-800 shadow-sm"
                >
                  {email}
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </section>
  );
}
