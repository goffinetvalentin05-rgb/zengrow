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
        <div>
          <p className="dashboard-section-kicker">Campagnes marketing</p>
          <h1 className="dashboard-page-title mt-2">{campaign.name}</h1>
          <p className="dashboard-section-subtitle mt-2">Détail et destinataires de cette campagne.</p>
        </div>
        <Link href="/dashboard/marketing" className="dashboard-link-secondary">
          Retour
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Détail de la campagne</CardTitle>
          <CardDescription>Contenu envoyé et statistiques de diffusion.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-5 md:grid-cols-2">
          <div className="space-y-1">
            <p className="dashboard-field-label mb-0">Titre</p>
            <p className="font-semibold text-[var(--foreground)]">{campaign.name}</p>
          </div>
          <div className="space-y-1">
            <p className="dashboard-field-label mb-0">Date d&apos;envoi</p>
            <p className="font-semibold text-[var(--foreground)]">
              {(campaign.sent_at ?? campaign.created_at).slice(0, 10)}
            </p>
          </div>
          <div className="space-y-1 md:col-span-2">
            <p className="dashboard-field-label mb-0">Objet</p>
            <p className="font-semibold text-[var(--foreground)]">{campaign.subject}</p>
          </div>
          <div className="space-y-1 md:col-span-2">
            <p className="dashboard-field-label mb-0">Contenu du message</p>
            <p className="whitespace-pre-wrap rounded-xl border border-[rgba(0,0,0,0.07)] bg-[var(--surface-muted)]/50 p-4 text-sm text-[var(--foreground)]/85 shadow-sm">
              {campaign.content}
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Statistiques</CardTitle>
          <CardDescription>Suivi simplifié des performances de la campagne.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <div className="rounded-xl border border-[rgba(0,0,0,0.07)] bg-[var(--surface-muted)]/50 p-4 shadow-sm">
            <p className="dashboard-section-kicker">Emails envoyés</p>
            <p className="mt-2 text-2xl font-semibold tracking-tight text-[var(--foreground)]">{sentCount}</p>
          </div>
          <div className="rounded-xl border border-[rgba(0,0,0,0.07)] bg-[var(--surface-muted)]/50 p-4 shadow-sm">
            <p className="dashboard-section-kicker">Emails ouverts</p>
            <p className="mt-2 text-2xl font-semibold tracking-tight text-[var(--foreground)]/60">—</p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Destinataires</CardTitle>
          <CardDescription>Liste des adresses e-mail ciblées par cette campagne.</CardDescription>
        </CardHeader>
        <CardContent>
          {emails.length === 0 ? (
            <p className="rounded-xl border border-dashed border-[rgba(0,0,0,0.08)] bg-[var(--surface-muted)]/60 p-5 text-sm text-[var(--muted-foreground)]">
              Aucun destinataire enregistré.
            </p>
          ) : (
            <ul className="space-y-2">
              {emails.map((email) => (
                <li
                  key={email}
                  className="rounded-xl border border-[rgba(0,0,0,0.07)] bg-[var(--surface-muted)]/50 px-3 py-2.5 text-sm shadow-sm"
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
