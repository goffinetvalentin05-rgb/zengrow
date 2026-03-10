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
    <section className="space-y-6">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-sm text-[var(--muted-foreground)]">Campagnes marketing</p>
          <h1 className="text-2xl font-semibold text-[var(--foreground)]">{campaign.name}</h1>
        </div>
        <Link
          href="/dashboard/marketing"
          className="inline-flex h-10 items-center rounded-xl border border-[var(--border)] bg-white px-4 text-sm font-semibold text-[var(--foreground)]/80 hover:bg-[var(--surface-muted)]"
        >
          Retour
        </Link>
      </div>

      <Card className="rounded-3xl">
        <CardHeader>
          <CardTitle>Détail de la campagne</CardTitle>
          <CardDescription>Contenu envoyé et statistiques de diffusion.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <div className="space-y-1">
            <p className="text-sm text-[var(--muted-foreground)]">Titre</p>
            <p className="font-semibold text-[var(--foreground)]">{campaign.name}</p>
          </div>
          <div className="space-y-1">
            <p className="text-sm text-[var(--muted-foreground)]">Date d&apos;envoi</p>
            <p className="font-semibold text-[var(--foreground)]">{(campaign.sent_at ?? campaign.created_at).slice(0, 10)}</p>
          </div>
          <div className="space-y-1 md:col-span-2">
            <p className="text-sm text-[var(--muted-foreground)]">Objet</p>
            <p className="font-semibold text-[var(--foreground)]">{campaign.subject}</p>
          </div>
          <div className="space-y-1 md:col-span-2">
            <p className="text-sm text-[var(--muted-foreground)]">Contenu du message</p>
            <p className="whitespace-pre-wrap rounded-2xl border border-[var(--border)] bg-[var(--surface-muted)] p-4 text-sm text-[var(--foreground)]/85">
              {campaign.content}
            </p>
          </div>
        </CardContent>
      </Card>

      <Card className="rounded-3xl">
        <CardHeader>
          <CardTitle>Statistiques</CardTitle>
          <CardDescription>Suivi simplifié des performances de la campagne.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface-muted)] p-4">
            <p className="text-sm text-[var(--muted-foreground)]">Emails envoyés</p>
            <p className="mt-1 text-2xl font-semibold text-[var(--foreground)]">{sentCount}</p>
          </div>
          <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface-muted)] p-4">
            <p className="text-sm text-[var(--muted-foreground)]">Emails ouverts</p>
            <p className="mt-1 text-2xl font-semibold text-[var(--foreground)]/70">--</p>
          </div>
        </CardContent>
      </Card>

      <Card className="rounded-3xl">
        <CardHeader>
          <CardTitle>Destinataires</CardTitle>
          <CardDescription>Liste des adresses e-mail ciblées par cette campagne.</CardDescription>
        </CardHeader>
        <CardContent>
          {emails.length === 0 ? (
            <p className="rounded-2xl border border-dashed border-[var(--border)] bg-[var(--surface-muted)] p-4 text-sm text-[var(--muted-foreground)]">
              Aucun destinataire enregistré.
            </p>
          ) : (
            <ul className="space-y-2">
              {emails.map((email) => (
                <li key={email} className="rounded-xl border border-[var(--border)] bg-[var(--surface-muted)] px-3 py-2 text-sm">
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
