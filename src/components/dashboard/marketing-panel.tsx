"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Button from "@/src/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/src/components/ui/card";
import Input from "@/src/components/ui/input";
import Select from "@/src/components/ui/select";
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
    <section className="space-y-6">
      <Card className="rounded-3xl">
        <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle>Campagnes marketing</CardTitle>
            <CardDescription>Créez et envoyez des campagnes e-mail à vos anciens clients.</CardDescription>
          </div>
          <Button type="button" onClick={() => setShowForm((current) => !current)} variant={showForm ? "secondary" : "primary"}>
            {showForm ? "Fermer" : "Créer une campagne"}
          </Button>
        </CardHeader>
      </Card>

      {showForm && (
        <Card className="rounded-3xl">
          <CardHeader>
            <CardTitle>Créer une campagne</CardTitle>
            <CardDescription>Configurez le message, l&apos;image et le segment de destinataires.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-[var(--foreground)]/80">Nom de la campagne</label>
              <Input value={name} onChange={(event) => setName(event.target.value)} placeholder="Promo de mars" />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-[var(--foreground)]/80">Objet</label>
              <Input
                value={subject}
                onChange={(event) => setSubject(event.target.value)}
                placeholder="Menu spécial ce week-end"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-[var(--foreground)]/80">Contenu de l&apos;e-mail</label>
              <Textarea
                className="min-h-36"
                value={content}
                onChange={(event) => setContent(event.target.value)}
                placeholder="Présentez votre offre à vos clients."
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-[var(--foreground)]/80">URL de l&apos;image (optionnel)</label>
              <Input
                value={imageUrl}
                onChange={(event) => setImageUrl(event.target.value)}
                placeholder="https://.../flyer.jpg"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-[var(--foreground)]/80">Destinataires</label>
              <Select value={audience} onChange={(event) => setAudience(event.target.value as AudienceFilter)}>
                <option value="all_customers">Tous les clients</option>
                <option value="visited_last_30_days">Clients venus ces 30 derniers jours</option>
                <option value="visited_last_90_days">Clients venus ces 90 derniers jours</option>
                <option value="visited_more_than_3_times">Clients venus plus de 3 fois</option>
              </Select>
            </div>

            <div className="flex flex-wrap gap-2">
              <Button type="button" onClick={handleCreateCampaign} disabled={submitting}>
                {submitting ? "Envoi..." : "Envoyer la campagne"}
              </Button>
              <Button type="button" variant="secondary" onClick={() => setShowForm(false)} disabled={submitting}>
                Annuler
              </Button>
            </div>
            {message && <p className="text-sm text-[var(--muted-foreground)]">{message}</p>}
          </CardContent>
        </Card>
      )}

      <Card className="rounded-3xl">
        <CardHeader>
          <CardTitle>Campagnes envoyées</CardTitle>
          <CardDescription>Historique de vos campagnes e-mail envoyées depuis ZenGrow.</CardDescription>
        </CardHeader>
        <CardContent>
          {campaigns.length === 0 ? (
            <p className="rounded-2xl border border-dashed border-[var(--border)] bg-[var(--surface-muted)] p-4 text-sm text-[var(--muted-foreground)]">
              Aucune campagne envoyée pour le moment.
            </p>
          ) : (
            <div className="space-y-3">
              {campaigns.map((campaign) => (
                <Link
                  key={campaign.id}
                  href={`/dashboard/marketing/${campaign.id}`}
                  className="block rounded-2xl border border-[var(--border)] bg-[var(--surface-muted)] p-4 transition hover:border-[#b7ddd4] hover:bg-[#f4fbf9]"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="font-semibold text-[var(--foreground)]">{campaign.name}</p>
                    <p className="text-xs text-[var(--muted-foreground)]">
                      {campaign.sent_at ? `Envoyée le ${campaign.sent_at.slice(0, 10)}` : "Non envoyée"}
                    </p>
                  </div>
                  <p className="mt-1 text-sm text-[var(--foreground)]/80">{campaign.subject}</p>
                  <p className="mt-2 text-xs text-[var(--muted-foreground)]">
                    Créée le {campaign.created_at.slice(0, 10)} - Destinataires {campaign.recipients_count}
                  </p>
                </Link>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </section>
  );
}
