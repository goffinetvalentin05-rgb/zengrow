"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { X } from "lucide-react";
import DashboardPortal from "@/src/components/dashboard/ui/dashboard-portal";
import CopyTextButton from "@/src/components/dashboard/ai/copy-text-button";
import Button from "@/src/components/ui/button";
import Input from "@/src/components/ui/input";
import Select from "@/src/components/ui/select";
import Textarea from "@/src/components/ui/textarea";
import type { CampaignAudienceFilter } from "@/src/components/dashboard/marketing/utils/campaign-templates";
import type { CampaignAIResult } from "@/src/lib/ai/types";
import { cn } from "@/src/lib/utils";

const CHANNEL_OPTIONS = [
  { id: "email", label: "E-mail" },
  { id: "sms", label: "SMS" },
  { id: "whatsapp", label: "WhatsApp" },
  { id: "instagram", label: "Instagram" },
] as const;

const TONE_OPTIONS = [
  { id: "chaleureux", label: "Chaleureux" },
  { id: "professionnel", label: "Professionnel" },
  { id: "premium", label: "Premium" },
  { id: "direct", label: "Direct" },
] as const;

type Step = "brief" | "content" | "recipients";

type MarketingAICampaignModalProps = {
  open: boolean;
  restaurantId: string;
  onClose: () => void;
  onSuccess?: (message: string) => void;
};

type RecipientOption = {
  id: CampaignAudienceFilter | "manual";
  label: string;
  description: string;
  disabled?: boolean;
  soon?: boolean;
};

const RECIPIENT_OPTIONS: RecipientOption[] = [
  { id: "all_customers", label: "Tous les clients", description: "Tous les contacts avec e-mail enregistré." },
  {
    id: "visited_last_30_days",
    label: "Clients venus récemment",
    description: "Visite dans les 30 derniers jours.",
  },
  {
    id: "inactive_30_days",
    label: "Clients inactifs depuis 30 jours",
    description: "Aucune visite depuis plus de 30 jours.",
  },
  {
    id: "visited_more_than_3_times",
    label: "Clients fidèles",
    description: "Plus de 3 visites enregistrées.",
  },
  {
    id: "manual",
    label: "Sélection manuelle",
    description: "Choisissez client par client.",
    disabled: true,
    soon: true,
  },
];

export default function MarketingAICampaignModal({
  open,
  restaurantId,
  onClose,
  onSuccess,
}: MarketingAICampaignModalProps) {
  const router = useRouter();
  const panelRef = useRef<HTMLDivElement>(null);
  const [step, setStep] = useState<Step>("brief");
  const [objective, setObjective] = useState("");
  const [offer, setOffer] = useState("");
  const [audienceHint, setAudienceHint] = useState("");
  const [channels, setChannels] = useState<string[]>(["email"]);
  const [tone, setTone] = useState("chaleureux");
  const [language, setLanguage] = useState("fr");
  const [campaignName, setCampaignName] = useState("");
  const [emailSubject, setEmailSubject] = useState("");
  const [emailBody, setEmailBody] = useState("");
  const [sms, setSms] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [instagramPost, setInstagramPost] = useState("");
  const [cta, setCta] = useState("");
  const [recipientAudience, setRecipientAudience] = useState<CampaignAudienceFilter>("all_customers");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);

  useEffect(() => {
    if (open) return;
    setStep("brief");
    setError(null);
    setLoading(false);
    setSaving(false);
  }, [open]);

  function toggleChannel(id: string) {
    setChannels((prev) => (prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]));
  }

  function applyAiResult(data: CampaignAIResult) {
    setEmailSubject(data.emailSubject ?? "");
    setEmailBody(data.emailBody ?? "");
    setSms(data.sms ?? "");
    setWhatsapp(data.whatsapp ?? "");
    setInstagramPost(data.instagramPost ?? "");
    setCta(data.cta ?? "");
    if (!campaignName.trim() && objective.trim()) {
      setCampaignName(objective.trim().slice(0, 80));
    }
    setStep("content");
  }

  async function generateContent() {
    if (!objective.trim()) {
      setError("Indiquez l'objectif de la campagne.");
      return;
    }
    if (channels.length === 0) {
      setError("Sélectionnez au moins un canal.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/ai/campaign", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          objective,
          offer: offer || undefined,
          audience: audienceHint || undefined,
          channels,
          tone,
          language,
          restaurantId,
        }),
      });
      const data = (await res.json()) as CampaignAIResult & { error?: string };
      if (!res.ok) {
        setError(data.error ?? "Génération impossible.");
        return;
      }
      applyAiResult(data);
    } catch {
      setError("Génération impossible. Réessayez.");
    } finally {
      setLoading(false);
    }
  }

  async function saveDraft() {
    if (!campaignName.trim() || !emailSubject.trim() || !emailBody.trim()) {
      setError("Nom, objet et corps e-mail requis pour enregistrer le brouillon.");
      return;
    }

    setSaving(true);
    setError(null);

    const res = await fetch("/api/marketing/campaigns", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: campaignName,
        subject: emailSubject,
        content: emailBody,
        saveAsDraft: true,
      }),
    });

    const payload = (await res.json().catch(() => ({}))) as { error?: string; campaignId?: string };
    setSaving(false);

    if (!res.ok) {
      setError(payload.error ?? "Impossible d'enregistrer le brouillon.");
      return;
    }

    onSuccess?.("Campagne enregistrée en brouillon.");
    onClose();
    router.refresh();
  }

  async function sendCampaign() {
    if (!campaignName.trim() || !emailSubject.trim() || !emailBody.trim()) {
      setError("Nom, objet et corps e-mail requis.");
      return;
    }

    setSaving(true);
    setError(null);

    const createRes = await fetch("/api/marketing/campaigns", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: campaignName,
        subject: emailSubject,
        content: emailBody,
        saveAsDraft: true,
      }),
    });

    const created = (await createRes.json().catch(() => ({}))) as {
      error?: string;
      campaignId?: string;
    };

    if (!createRes.ok || !created.campaignId) {
      setError(created.error ?? "Impossible de créer la campagne.");
      setSaving(false);
      return;
    }

    const sendRes = await fetch(`/api/marketing/campaigns/${created.campaignId}/send`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ audience: recipientAudience }),
    });

    const sent = (await sendRes.json().catch(() => ({}))) as {
      error?: string;
      sentRecipients?: number;
      failedRecipients?: number;
    };

    setSaving(false);

    if (!sendRes.ok) {
      setError(sent.error ?? "Envoi impossible.");
      return;
    }

    const sentCount = sent.sentRecipients ?? 0;
    const failed = sent.failedRecipients ?? 0;
    onSuccess?.(
      failed > 0
        ? `Campagne envoyée à ${sentCount} clients. ${failed} envois ont échoué.`
        : `Campagne envoyée à ${sentCount} clients.`,
    );
    onClose();
    router.refresh();
  }

  if (!open) return null;

  return (
    <DashboardPortal>
      <div
        className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-0 sm:items-center sm:p-4"
        role="presentation"
        onClick={onClose}
      >
        <div
          ref={panelRef}
          role="dialog"
          aria-modal="true"
          aria-labelledby="marketing-ai-modal-title"
          className={cn(
            "flex max-h-[min(92dvh,800px)] w-full max-w-2xl flex-col overflow-hidden border-zg-border bg-zg-surface shadow-2xl",
            "rounded-t-2xl border-t sm:rounded-2xl sm:border",
          )}
          onClick={(e) => e.stopPropagation()}
        >
          <header className="flex items-start justify-between gap-4 border-b border-zg-border px-5 py-4">
            <div>
              <h2 id="marketing-ai-modal-title" className="text-lg font-semibold text-zg-fg">
                Campagne IA
              </h2>
              <p className="mt-1 text-sm text-zg-text-muted">
                {step === "brief"
                  ? "Étape 1 — Brief"
                  : step === "content"
                    ? "Étape 2 — Contenus"
                    : "Étape 3 — Destinataires"}
              </p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg p-2 text-zg-text-muted hover:bg-zg-card-hover"
              aria-label="Fermer"
            >
              <X className="h-5 w-5" />
            </button>
          </header>

          <div className="flex-1 overflow-y-auto px-5 py-5">
            {error ? (
              <p className="mb-4 text-sm text-red-600" role="alert">
                {error}
              </p>
            ) : null}

            {step === "brief" ? (
              <div className="space-y-4">
                <div>
                  <label className="dashboard-field-label">Objectif de la campagne</label>
                  <Textarea
                    className="mt-2 min-h-20"
                    value={objective}
                    onChange={(e) => setObjective(e.target.value)}
                  />
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="dashboard-field-label">Offre ou événement</label>
                    <Input className="mt-2" value={offer} onChange={(e) => setOffer(e.target.value)} />
                  </div>
                  <div>
                    <label className="dashboard-field-label">Audience souhaitée</label>
                    <Input
                      className="mt-2"
                      value={audienceHint}
                      onChange={(e) => setAudienceHint(e.target.value)}
                    />
                  </div>
                </div>
                <div>
                  <label className="dashboard-field-label">Canaux</label>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {CHANNEL_OPTIONS.map((ch) => (
                      <button
                        key={ch.id}
                        type="button"
                        onClick={() => toggleChannel(ch.id)}
                        className={
                          channels.includes(ch.id)
                            ? "rounded-lg bg-gradient-to-br from-[#7c5cff] to-[#6366f1] px-3 py-1.5 text-sm font-semibold text-white"
                            : "rounded-lg border border-zg-border px-3 py-1.5 text-sm text-zg-text-muted"
                        }
                      >
                        {ch.label}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="dashboard-field-label">Ton</label>
                    <Select className="mt-2" value={tone} onChange={(e) => setTone(e.target.value)}>
                      {TONE_OPTIONS.map((t) => (
                        <option key={t.id} value={t.id}>
                          {t.label}
                        </option>
                      ))}
                    </Select>
                  </div>
                  <div>
                    <label className="dashboard-field-label">Langue</label>
                    <Select className="mt-2" value={language} onChange={(e) => setLanguage(e.target.value)}>
                      <option value="fr">Français</option>
                      <option value="de">Allemand</option>
                      <option value="en">Anglais</option>
                    </Select>
                  </div>
                </div>
              </div>
            ) : null}

            {step === "content" ? (
              <div className="space-y-4">
                <div>
                  <label className="dashboard-field-label">Nom de la campagne</label>
                  <Input className="mt-2" value={campaignName} onChange={(e) => setCampaignName(e.target.value)} />
                </div>
                <div>
                  <label className="dashboard-field-label">Objet e-mail</label>
                  <Input className="mt-2" value={emailSubject} onChange={(e) => setEmailSubject(e.target.value)} />
                </div>
                <div>
                  <label className="dashboard-field-label">Corps e-mail</label>
                  <Textarea className="mt-2 min-h-28" value={emailBody} onChange={(e) => setEmailBody(e.target.value)} />
                </div>
                {channels.includes("sms") ? (
                  <EditableChannel label="SMS" value={sms} onChange={setSms} />
                ) : null}
                {channels.includes("whatsapp") ? (
                  <EditableChannel label="WhatsApp" value={whatsapp} onChange={setWhatsapp} />
                ) : null}
                {channels.includes("instagram") ? (
                  <EditableChannel label="Instagram" value={instagramPost} onChange={setInstagramPost} />
                ) : null}
                {cta ? (
                  <EditableChannel label="Appel à l'action" value={cta} onChange={setCta} />
                ) : null}
              </div>
            ) : null}

            {step === "recipients" ? (
              <div className="space-y-3">
                <p className="text-sm text-zg-text-muted">
                  Choisissez qui recevra l&apos;e-mail. Les textes SMS / réseaux restent à copier depuis
                  l&apos;étape précédente.
                </p>
                {RECIPIENT_OPTIONS.map((option) => (
                  <label
                    key={option.id}
                    className={cn(
                      "flex cursor-pointer gap-3 rounded-xl border p-4 transition-colors",
                      option.disabled
                        ? "cursor-not-allowed opacity-60"
                        : recipientAudience === option.id
                          ? "border-[#7c5cff]/50 bg-[#7c5cff]/10"
                          : "border-zg-border hover:bg-white/5",
                    )}
                  >
                    <input
                      type="radio"
                      name="recipient-audience"
                      className="mt-1"
                      disabled={option.disabled}
                      checked={recipientAudience === option.id}
                      onChange={() => {
                        if (!option.disabled && option.id !== "manual") {
                          setRecipientAudience(option.id);
                        }
                      }}
                    />
                    <span>
                      <span className="text-sm font-semibold text-zg-fg">
                        {option.label}
                        {option.soon ? (
                          <span className="ml-2 text-xs font-medium text-zg-text-muted">Bientôt disponible</span>
                        ) : null}
                      </span>
                      <span className="mt-1 block text-xs text-zg-text-muted">{option.description}</span>
                    </span>
                  </label>
                ))}
              </div>
            ) : null}
          </div>

          <footer className="flex flex-col gap-2 border-t border-zg-border px-5 py-4 sm:flex-row sm:flex-wrap sm:justify-end">
            {step === "brief" ? (
              <>
                <Button type="button" variant="secondary" onClick={onClose}>
                  Annuler
                </Button>
                <Button type="button" disabled={loading} onClick={() => void generateContent()}>
                  {loading ? "Génération…" : "Générer la campagne"}
                </Button>
              </>
            ) : null}
            {step === "content" ? (
              <>
                <Button type="button" variant="ghost" onClick={() => setStep("brief")}>
                  Retour
                </Button>
                <Button type="button" variant="secondary" disabled={saving} onClick={() => void saveDraft()}>
                  {saving ? "Enregistrement…" : "Enregistrer en brouillon"}
                </Button>
                <Button type="button" onClick={() => setStep("recipients")}>
                  Continuer vers l&apos;envoi
                </Button>
              </>
            ) : null}
            {step === "recipients" ? (
              <>
                <Button type="button" variant="ghost" onClick={() => setStep("content")}>
                  Retour
                </Button>
                <Button type="button" variant="secondary" disabled={saving} onClick={() => void saveDraft()}>
                  Enregistrer en brouillon
                </Button>
                <Button type="button" disabled={saving} onClick={() => void sendCampaign()}>
                  {saving ? "Envoi…" : "Envoyer la campagne"}
                </Button>
              </>
            ) : null}
          </footer>
        </div>
      </div>
    </DashboardPortal>
  );
}

function EditableChannel({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div className="space-y-2 rounded-xl border border-zg-border bg-zg-surface-elevated p-3">
      <div className="flex items-center justify-between gap-2">
        <p className="text-sm font-semibold text-zg-fg">{label}</p>
        {value.trim() ? <CopyTextButton text={value} label="Copier" /> : null}
      </div>
      <Textarea className="min-h-20" value={value} onChange={(e) => onChange(e.target.value)} />
    </div>
  );
}
