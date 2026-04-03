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
    <section className="space-y-12">
      <header className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="dashboard-page-title">Campagnes</h1>
          <p className="dashboard-section-subtitle mt-2 max-w-2xl">E-mail groupé à vos clients.</p>
        </div>
        <Button type="button" onClick={() => setShowForm((current) => !current)} variant={showForm ? "secondary" : "primary"}>
          {showForm ? "Annuler" : "Nouvelle campagne"}
        </Button>
      </header>

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
              <button
                type="button"
                className="text-sm font-medium text-green-700 hover:underline disabled:opacity-50"
                onClick={() => setShowForm(false)}
                disabled={submitting}
              >
                Fermer
              </button>
            </div>
            {message && <p className="text-sm text-gray-600">{message}</p>}
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Historique</CardTitle>
          <CardDescription>Campagnes envoyées.</CardDescription>
        </CardHeader>
        <CardContent>
          {campaigns.length === 0 ? (
            <p className="py-6 text-sm text-gray-500">Aucune campagne pour le moment.</p>
          ) : (
            <div className="divide-y divide-gray-100 border-t border-gray-100">
              {campaigns.map((campaign) => (
                <Link
                  key={campaign.id}
                  href={`/dashboard/marketing/${campaign.id}`}
                  className="block py-5 transition hover:bg-gray-50/80"
                >
                  <div className="flex flex-wrap items-baseline justify-between gap-2">
                    <p className="font-medium text-gray-900">{campaign.name}</p>
                    <span className="text-xs text-gray-500">
                      {campaign.sent_at ? campaign.sent_at.slice(0, 10) : "Brouillon"}
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-gray-600">{campaign.subject}</p>
                  <p className="mt-1 text-xs text-gray-500">{campaign.recipients_count} destinataires</p>
                </Link>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </section>
  );
}
