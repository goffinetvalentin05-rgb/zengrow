"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import PageHeader from "@/src/components/dashboard/page-header";
import FilterBar from "@/src/components/dashboard/ui/filter-bar";
import Button from "@/src/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/src/components/ui/card";
import EmptyState from "@/src/components/ui/empty-state";
import Input from "@/src/components/ui/input";
import Select from "@/src/components/ui/select";
import ToastInline from "@/src/components/ui/toast-inline";
import Textarea from "@/src/components/ui/textarea";

type AudienceFilter = "all_customers" | "visited_last_30_days" | "visited_last_90_days" | "visited_more_than_3_times";

type CampaignListItem = {
  id: string;
  name: string;
  subject: string;
  created_at: string;
  sent_at: string | null;
  recipients_count: number;
};

type MarketingPanelProps = {
  campaigns: CampaignListItem[];
};

export default function MarketingPanel({ campaigns }: MarketingPanelProps) {
  const router = useRouter();
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState("");
  const [subject, setSubject] = useState("");
  const [content, setContent] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [audience, setAudience] = useState<AudienceFilter>("all_customers");
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function handleCreateCampaign() {
    if (!name.trim() || !subject.trim() || !content.trim()) {
      setMessage("Veuillez remplir le nom, le sujet et le contenu.");
      return;
    }

    setSubmitting(true);
    setMessage(null);

    const response = await fetch("/api/marketing/campaigns", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name,
        subject,
        content,
        imageUrl,
        audience,
      }),
    });

    const payload = (await response.json().catch(() => ({}))) as {
      error?: string;
      sentRecipients?: number;
      failedRecipients?: number;
    };

    if (!response.ok) {
      setMessage(payload.error ?? "Impossible de créer la campagne.");
      setSubmitting(false);
      return;
    }

    const sentRecipients = payload.sentRecipients ?? 0;
    const failedRecipients = payload.failedRecipients ?? 0;
    setMessage(
      failedRecipients > 0
        ? `Campagne envoyée à ${sentRecipients} clients. ${failedRecipients} envois ont échoué.`
        : `Campagne envoyée à ${sentRecipients} clients.`,
    );
    setName("");
    setSubject("");
    setContent("");
    setImageUrl("");
    setAudience("all_customers");
    setShowForm(false);
    setSubmitting(false);
    router.refresh();
  }

  return (
    <section className="space-y-8 md:space-y-10">
      <PageHeader
        kicker="Marketing"
        title="Campagnes marketing"
        subtitle="Créez un e-mail groupé pour vos clients — soirées spéciales, menus, offres."
        primaryAction={{
          kind: "button",
          label: showForm ? "Annuler" : "Nouvelle campagne",
          onClick: () => setShowForm((c) => !c),
        }}
      />

      {message ? <ToastInline tone={message.toLowerCase().includes("envoy") ? "success" : "info"} message={message} /> : null}

      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>Nouvelle campagne</CardTitle>
            <CardDescription>Message, image optionnelle, destinataires.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="dashboard-field-label">Nom de la campagne</label>
              <Input value={name} onChange={(event) => setName(event.target.value)} placeholder="Promo de mars" />
            </div>

            <div>
              <label className="dashboard-field-label">Objet</label>
              <Input
                value={subject}
                onChange={(event) => setSubject(event.target.value)}
                placeholder="Menu spécial ce week-end"
              />
            </div>

            <div>
              <label className="dashboard-field-label">Contenu de l&apos;e-mail</label>
              <Textarea
                className="min-h-36"
                value={content}
                onChange={(event) => setContent(event.target.value)}
                placeholder="Présentez votre offre à vos clients."
              />
            </div>

            <div>
              <label className="dashboard-field-label">URL de l&apos;image (optionnel)</label>
              <Input
                value={imageUrl}
                onChange={(event) => setImageUrl(event.target.value)}
                placeholder="https://.../flyer.jpg"
              />
            </div>

            <div>
              <label className="dashboard-field-label">Destinataires</label>
              <Select value={audience} onChange={(event) => setAudience(event.target.value as AudienceFilter)}>
                <option value="all_customers">Tous les clients</option>
                <option value="visited_last_30_days">Clients venus ces 30 derniers jours</option>
                <option value="visited_last_90_days">Clients venus ces 90 derniers jours</option>
                <option value="visited_more_than_3_times">Clients venus plus de 3 fois</option>
              </Select>
            </div>

            <div className="flex flex-wrap items-center gap-4">
              <Button type="button" onClick={handleCreateCampaign} disabled={submitting}>
                {submitting ? "Envoi…" : "Envoyer"}
              </Button>
              <Button type="button" variant="secondary" onClick={() => setShowForm(false)} disabled={submitting}>
                Fermer
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Historique</CardTitle>
          <CardDescription>Campagnes envoyées.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <FilterBar
            right={
              <Button type="button" variant="secondary" size="sm" onClick={() => setShowForm(true)}>
                Créer une campagne
              </Button>
            }
          >
            <div className="w-[260px]">
              <label className="dashboard-field-label">Vue</label>
              <Select value="all" onChange={() => {}}>
                <option value="all">Toutes les campagnes</option>
              </Select>
            </div>
          </FilterBar>

          {campaigns.length === 0 ? (
            <EmptyState title="Aucune campagne" description="Créez votre première campagne marketing." />
          ) : (
            <div className="overflow-hidden rounded-2xl border border-zg-border-strong/85 bg-zg-surface/92 shadow-zg-soft backdrop-blur-sm">
              <div className="grid grid-cols-[minmax(180px,1.4fr)_minmax(200px,2fr)_120px_130px] gap-3 border-b border-zg-border/80 bg-zg-surface-elevated/65 px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.12em] text-zg-fg/55">
                <div>Campagne</div>
                <div>Objet</div>
                <div className="text-right">Envois</div>
                <div className="text-right">Date</div>
              </div>
              <div className="divide-y divide-zg-border/75">
                {campaigns.map((campaign) => (
                  <a
                    key={campaign.id}
                    href={`/dashboard/marketing/${campaign.id}`}
                    className="grid grid-cols-[minmax(180px,1.4fr)_minmax(200px,2fr)_120px_130px] items-center gap-3 px-4 py-3 text-sm transition hover:bg-zg-highlight/35"
                  >
                    <div className="min-w-0">
                      <div className="truncate font-semibold text-zg-fg">{campaign.name}</div>
                      <div className="mt-0.5 text-xs text-zg-fg/52">{campaign.sent_at ? "Envoyée" : "Brouillon"}</div>
                    </div>
                    <div className="min-w-0 truncate text-zg-fg/62">{campaign.subject}</div>
                    <div className="text-right tabular-nums text-zg-fg/72">{campaign.recipients_count}</div>
                    <div className="text-right tabular-nums text-zg-fg/62">
                      {(campaign.sent_at ?? campaign.created_at).slice(0, 10)}
                    </div>
                  </a>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </section>
  );
}
