import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { requireRestaurantSession } from "@/src/lib/auth";
import { createClient } from "@/src/lib/supabase/server";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/src/components/ui/card";
import EmptyState from "@/src/components/ui/empty-state";
import PageHeader from "@/src/components/dashboard/page-header";
import DashboardContent from "@/src/components/dashboard/ui/dashboard-content";

type CampaignDetailPageProps = {
  params: Promise<{ campaignId: string }>;
};

export default async function CampaignDetailPage({ params }: CampaignDetailPageProps) {
  const { campaignId } = await params;
  const supabase = await createClient();
  const { restaurant, access } = await requireRestaurantSession();
  const hasMarketingAccess = access.canUseProFeatures;
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
    .select("email, opened_at")
    .eq("campaign_id", campaign.id)
    .order("sent_at", { ascending: false });

  const emails = (recipients ?? []).map((item) => item.email);
  const sentCount = emails.length;
  const openedCount = (recipients ?? []).filter((r) => r.opened_at != null).length;

  return (
    <DashboardContent>
      <section className="space-y-10">
        <PageHeader
          kicker="Marketing"
          title={campaign.name}
          subtitle={`${(campaign.sent_at ?? campaign.created_at).slice(0, 10)} · ${sentCount} envoi${sentCount > 1 ? "s" : ""}`}
          secondaryActions={[{ kind: "link", href: "/dashboard/marketing", label: "Retour" }]}
        />

        <div className="grid gap-6 lg:grid-cols-12 lg:items-start">
          <Card className="lg:col-span-7">
            <CardHeader>
              <CardTitle>Contenu</CardTitle>
              <CardDescription>Message envoyé aux destinataires.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <p className="dashboard-field-label">Objet</p>
                <p className="mt-1 text-sm font-semibold text-zg-fg">{campaign.subject}</p>
              </div>
              <div>
                <p className="dashboard-field-label">Corps du message</p>
                <p className="mt-3 whitespace-pre-wrap rounded-xl border border-zg-border bg-zg-surface-soft/80 p-5 text-sm leading-relaxed text-zg-fg shadow-zg-soft">
                  {campaign.content}
                </p>
              </div>
            </CardContent>
          </Card>

          <div className="space-y-6 lg:col-span-5">
            <Card>
              <CardHeader>
                <CardTitle>Statistiques</CardTitle>
                <CardDescription>Suivi simplifié.</CardDescription>
              </CardHeader>
              <CardContent className="grid gap-4 md:grid-cols-2 lg:grid-cols-1">
                <div className="rounded-2xl border border-zg-border bg-zg-surface p-5 shadow-zg-soft">
                  <p className="text-xs font-semibold uppercase tracking-wide text-zg-fg-muted">E-mails envoyés</p>
                  <p className="mt-2 text-3xl font-bold tabular-nums text-zg-fg">{sentCount}</p>
                </div>
                <div className="rounded-2xl border border-zg-border bg-zg-surface p-5 shadow-zg-soft">
                  <p className="text-xs font-semibold uppercase tracking-wide text-zg-fg-muted">E-mails ouverts</p>
                  <p className="mt-2 text-3xl font-bold tabular-nums text-zg-fg">{openedCount}</p>
                  <p className="mt-2 text-xs text-zg-muted">
                    Comptage via pixel de suivi (désactivez les images pour une mesure partielle).
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Destinataires</CardTitle>
            <CardDescription>Adresses ciblées par cette campagne.</CardDescription>
          </CardHeader>
          <CardContent>
            {emails.length === 0 ? (
              <EmptyState title="Aucun destinataire" description="Aucun destinataire enregistré pour cette campagne." />
            ) : (
              <ul className="space-y-2">
                {emails.map((email) => (
                  <li
                    key={email}
                    className="rounded-xl border border-zg-border bg-zg-surface-soft/70 px-4 py-2.5 text-sm text-zg-fg shadow-zg-soft"
                  >
                    {email}
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </section>
    </DashboardContent>
  );
}
