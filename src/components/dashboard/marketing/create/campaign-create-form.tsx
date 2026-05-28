"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useMarketing } from "@/src/components/dashboard/marketing/context/use-marketing";
import type { CampaignAudienceFilter } from "@/src/components/dashboard/marketing/utils/campaign-templates";
import { getCampaignTemplate } from "@/src/components/dashboard/marketing/utils/campaign-templates";
import Button from "@/src/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/src/components/ui/card";
import Input from "@/src/components/ui/input";
import Select from "@/src/components/ui/select";
import Textarea from "@/src/components/ui/textarea";

export default function CampaignCreateForm() {
  const router = useRouter();
  const { createDraft, closeCreateForm, setCreateMessage } = useMarketing();
  const [name, setName] = useState(createDraft.name);
  const [subject, setSubject] = useState(createDraft.subject);
  const [content, setContent] = useState(createDraft.content);
  const [imageUrl, setImageUrl] = useState(createDraft.imageUrl);
  const [audience, setAudience] = useState<CampaignAudienceFilter>(createDraft.audience);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    setName(createDraft.name);
    setSubject(createDraft.subject);
    setContent(createDraft.content);
    setImageUrl(createDraft.imageUrl);
    setAudience(createDraft.audience);
  }, [createDraft]);

  const templateLabel = createDraft.templateId
    ? getCampaignTemplate(createDraft.templateId)?.title
    : null;

  async function handleSaveDraft() {
    if (!name.trim() || !subject.trim() || !content.trim()) {
      setCreateMessage("Veuillez remplir le nom, le sujet et le contenu.");
      return;
    }

    setSubmitting(true);
    setCreateMessage(null);

    const response = await fetch("/api/marketing/campaigns", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, subject, content, imageUrl, saveAsDraft: true }),
    });

    const payload = (await response.json().catch(() => ({}))) as { error?: string };
    if (!response.ok) {
      setCreateMessage(payload.error ?? "Impossible d'enregistrer le brouillon.");
      setSubmitting(false);
      return;
    }

    setCreateMessage("Campagne enregistrée en brouillon.");
    closeCreateForm();
    setSubmitting(false);
    router.refresh();
  }

  async function handleCreateCampaign() {
    if (!name.trim() || !subject.trim() || !content.trim()) {
      setCreateMessage("Veuillez remplir le nom, le sujet et le contenu.");
      return;
    }

    setSubmitting(true);
    setCreateMessage(null);

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
      setCreateMessage(payload.error ?? "Impossible de créer la campagne.");
      setSubmitting(false);
      return;
    }

    const sentRecipients = payload.sentRecipients ?? 0;
    const failedRecipients = payload.failedRecipients ?? 0;
    setCreateMessage(
      failedRecipients > 0
        ? `Campagne envoyée à ${sentRecipients} clients. ${failedRecipients} envois ont échoué.`
        : `Campagne envoyée à ${sentRecipients} clients.`,
    );
    closeCreateForm();
    setSubmitting(false);
    router.refresh();
  }

  return (
    <div id="marketing-create-form">
    <Card>
      <CardHeader>
        <CardTitle>{templateLabel ? `Nouvelle campagne — ${templateLabel}` : "Nouvelle campagne"}</CardTitle>
        <CardDescription>
          {templateLabel
            ? "Contenu pré-rempli depuis un modèle. Ajustez le message avant l'envoi."
            : "Message, image optionnelle, destinataires."}
        </CardDescription>
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
          <Select value={audience} onChange={(event) => setAudience(event.target.value as CampaignAudienceFilter)}>
            <option value="all_customers">Tous les clients</option>
            <option value="visited_last_30_days">Clients venus ces 30 derniers jours</option>
            <option value="visited_last_90_days">Clients venus ces 90 derniers jours</option>
            <option value="visited_more_than_3_times">Clients fidèles (plus de 3 visites)</option>
            <option value="inactive_30_days">Clients inactifs depuis 30 jours</option>
          </Select>
          <p className="mt-1.5 text-xs text-zg-muted">
            Segments avancés (VIP, inactifs, anniversaires) — bientôt disponibles.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-4">
          <Button type="button" onClick={handleCreateCampaign} disabled={submitting}>
            {submitting ? "Envoi…" : "Envoyer"}
          </Button>
          <Button type="button" variant="secondary" onClick={() => void handleSaveDraft()} disabled={submitting}>
            {submitting ? "Enregistrement…" : "Enregistrer en brouillon"}
          </Button>
          <Button type="button" variant="ghost" onClick={closeCreateForm} disabled={submitting}>
            Fermer
          </Button>
        </div>
      </CardContent>
    </Card>
    </div>
  );
}
