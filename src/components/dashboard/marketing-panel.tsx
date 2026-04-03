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
    <section className="space-y-14">
      <header className="space-y-2">
        <p className="dashboard-section-kicker">Marketing</p>
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="dashboard-page-title">Campagnes e-mail</h1>
            <p className="dashboard-section-subtitle mt-2 max-w-2xl">
              Un message groupé pour vos anciens clients — soirée spéciale, nouvelle carte, etc.
            </p>
          </div>
          <Button type="button" onClick={() => setShowForm((c) => !c)} variant={showForm ? "secondary" : "primary"}>
            {showForm ? "Fermer" : "Nouvelle campagne"}
          </Button>
        </div>
      </header>

      <Card>
        <CardHeader>
          <CardTitle>Vue d&apos;ensemble</CardTitle>
          <CardDescription>Créez une campagne ou consultez l&apos;historique.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-10">
          {showForm ? (
            <div className="space-y-4 border-t border-gray-100 pt-8">
              <p className="text-sm font-medium text-gray-900">Nouvelle campagne</p>
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
              <Button type="button" onClick={handleCreateCampaign} disabled={submitting}>
                {submitting ? "Envoi..." : "Envoyer la campagne"}
              </Button>
              {message && <p className="text-sm text-gray-600">{message}</p>}
            </div>
          ) : null}

          <div>
            <h3 className="mb-4 text-sm font-medium text-gray-900">Campagnes envoyées</h3>
            {campaigns.length === 0 ? (
              <p className="py-8 text-center text-sm text-gray-500">Aucune campagne pour le moment.</p>
            ) : (
              <ul className="divide-y divide-gray-100">
                {campaigns.map((campaign) => (
                  <li key={campaign.id}>
                    <Link
                      href={`/dashboard/marketing/${campaign.id}`}
                      className="block py-4 transition hover:bg-gray-50/80"
                    >
                      <p className="font-medium text-gray-900">{campaign.name}</p>
                      <p className="mt-0.5 text-sm text-gray-600">{campaign.subject}</p>
                      <p className="mt-2 text-xs text-gray-500">
                        {campaign.sent_at ? `Envoyée le ${campaign.sent_at.slice(0, 10)}` : "Non envoyée"} ·{" "}
                        {campaign.recipients_count} destinataires
                      </p>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </CardContent>
      </Card>
    </section>
  );
}
