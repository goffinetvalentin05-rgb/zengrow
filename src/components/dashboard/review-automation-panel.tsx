"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Mail, MessageCircle, Smartphone } from "lucide-react";
import Button from "@/src/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/src/components/ui/card";
import Input from "@/src/components/ui/input";
import Select from "@/src/components/ui/select";
import Textarea from "@/src/components/ui/textarea";
import PanelToggle from "@/src/components/ui/panel-toggle";
import { createClient } from "@/src/lib/supabase/client";
import { cn } from "@/src/lib/utils";

type ReviewAutomationPanelProps = {
  restaurantId: string;
  initialSettings: {
    is_enabled: boolean;
    channel: "email";
    delay_minutes: number;
    google_review_url: string;
    email_subject: string;
    email_message: string;
    button_positive_label: string;
    button_neutral_label: string;
    button_negative_label: string;
    primary_color: string;
  };
  initialFeedback: {
    id: string;
    message: string | null;
    created_at: string;
  }[];
};

const channelOptions = [
  {
    id: "email" as const,
    label: "E-mail",
    icon: Mail,
    badge: "Actif",
    disabled: false,
  },
  {
    id: "sms" as const,
    label: "SMS",
    icon: Smartphone,
    badge: "Bientôt",
    disabled: true,
  },
  {
    id: "whatsapp" as const,
    label: "WhatsApp",
    icon: MessageCircle,
    badge: "Bientôt",
    disabled: true,
  },
];

export default function ReviewAutomationPanel({
  restaurantId,
  initialSettings,
  initialFeedback,
}: ReviewAutomationPanelProps) {
  const router = useRouter();
  const supabase = createClient();
  const [isEnabled, setIsEnabled] = useState(initialSettings.is_enabled);
  const [channel] = useState<"email">("email");
  const [delayMinutes, setDelayMinutes] = useState(initialSettings.delay_minutes);
  const [googleReviewUrl, setGoogleReviewUrl] = useState(initialSettings.google_review_url);
  const [emailSubject, setEmailSubject] = useState(initialSettings.email_subject);
  const [emailMessage, setEmailMessage] = useState(initialSettings.email_message);
  const [positiveLabel, setPositiveLabel] = useState(initialSettings.button_positive_label);
  const [neutralLabel, setNeutralLabel] = useState(initialSettings.button_neutral_label);
  const [negativeLabel, setNegativeLabel] = useState(initialSettings.button_negative_label);
  const [primaryColor, setPrimaryColor] = useState(initialSettings.primary_color);
  const [saving, setSaving] = useState(false);
  const [savingToggle, setSavingToggle] = useState(false);
  const [toggleError, setToggleError] = useState<string | null>(null);
  const [sendingTest, setSendingTest] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const previewSubject = useMemo(
    () => emailSubject.replaceAll("{{restaurant_name}}", "Votre restaurant"),
    [emailSubject],
  );
  const previewMessage = useMemo(
    () => emailMessage.replaceAll("{{restaurant_name}}", "Votre restaurant"),
    [emailMessage],
  );

  function buildAutomationUpsertPayload(enabled: boolean) {
    return {
      restaurant_id: restaurantId,
      is_enabled: enabled,
      channel,
      delay_minutes: delayMinutes,
      google_review_url: googleReviewUrl || null,
      email_subject: emailSubject,
      email_message: emailMessage,
      button_positive_label: positiveLabel,
      button_neutral_label: neutralLabel,
      button_negative_label: negativeLabel,
      primary_color: primaryColor,
    };
  }

  async function saveSettings() {
    setSaving(true);
    setMessage(null);

    const { error } = await supabase.from("review_automation_settings").upsert(buildAutomationUpsertPayload(isEnabled), {
      onConflict: "restaurant_id",
    });

    setSaving(false);
    if (error) {
      setMessage(error.message);
      return;
    }
    setMessage("Automatisation mise à jour.");
    router.refresh();
  }

  async function handleAutomationToggle(next: boolean) {
    const previous = isEnabled;
    setToggleError(null);
    setMessage(null);
    setIsEnabled(next);
    setSavingToggle(true);

    const response = await fetch("/api/reviews/automation-settings", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ is_enabled: next }),
    });

    const payload = (await response.json().catch(() => ({}))) as { error?: string };

    setSavingToggle(false);
    if (!response.ok) {
      setIsEnabled(previous);
      setToggleError(payload.error ?? "Impossible d'enregistrer le réglage.");
      return;
    }

    router.refresh();
  }

  async function sendTestReviewEmail() {
    setSendingTest(true);
    setMessage(null);

    const response = await fetch("/api/reviews/test-email", {
      method: "POST",
    });

    const raw = await response.text();
    let payload: { error?: string } = {};
    try {
      payload = raw ? (JSON.parse(raw) as { error?: string }) : {};
    } catch {
      payload = {};
    }

    if (!response.ok) {
      setMessage(
        payload.error ??
          (response.status >= 500
            ? `Erreur serveur (${response.status}). Vérifiez SUPABASE_SERVICE_ROLE_KEY, les migrations Supabase et RESEND_API_KEY.`
            : `Impossible d'envoyer l'e-mail de test (erreur ${response.status}).`),
      );
      setSendingTest(false);
      return;
    }

    setMessage("E-mail de test envoyé. Vérifiez votre boîte de réception.");
    setSendingTest(false);
  }

  return (
    <section className="space-y-10">
      <Card>
        <CardHeader>
          <CardTitle>Paramètres d&apos;envoi</CardTitle>
          <CardDescription>Activez l&apos;envoi automatique et personnalisez le message reçu par vos clients.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
            <div className="space-y-2">
              <PanelToggle
                checked={isEnabled}
                onChange={handleAutomationToggle}
                title="Automatisation active"
                description="Les clients reçoivent un message après leur visite lorsque cette option est activée."
                disabled={savingToggle || saving}
              />
              {savingToggle ? (
                <p className="text-xs font-medium text-gray-500">Enregistrement…</p>
              ) : null}
              {toggleError ? (
                <p className="text-sm text-red-600" role="alert">
                  {toggleError}
                </p>
              ) : null}
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <div>
                <label className="dashboard-field-label">Canal de diffusion</label>
                <div className="mt-2 flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:gap-2">
                  {channelOptions.map((item) => {
                    const Icon = item.icon;
                    const selected = item.id === channel;
                    return (
                      <div
                        key={item.id}
                        role={item.disabled ? undefined : "button"}
                        tabIndex={item.disabled ? -1 : 0}
                        className={cn(
                          "flex min-w-0 flex-1 items-center gap-3 rounded-lg border px-3 py-3 shadow-sm transition-colors sm:min-w-[7.5rem] sm:flex-1",
                          item.disabled && "cursor-not-allowed opacity-50",
                          !item.disabled && selected && "border-l-4 border-l-green-600 border-gray-200 bg-green-50/50 pl-2.5",
                          !item.disabled && !selected && "cursor-pointer border-gray-200 bg-white hover:bg-gray-50",
                          item.disabled && "border-gray-100 bg-gray-50/80 shadow-none",
                        )}
                      >
                        <span
                          className={cn(
                            "flex h-9 w-9 shrink-0 items-center justify-center rounded-full",
                            selected && !item.disabled ? "bg-green-700 text-white" : "bg-gray-100 text-gray-600",
                          )}
                        >
                          <Icon size={18} strokeWidth={2} />
                        </span>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-semibold text-[var(--foreground)]">{item.label}</p>
                        </div>
                        <span
                          className={cn(
                            "shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider",
                            selected && !item.disabled
                              ? "bg-green-100 text-green-800"
                              : "bg-gray-100 text-gray-500",
                          )}
                        >
                          {item.badge}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
              <div>
                <label className="dashboard-field-label">Délai après visite</label>
                <Select
                  className="mt-2"
                  value={String(delayMinutes)}
                  onChange={(event) => setDelayMinutes(Number(event.target.value))}
                >
                  <option value="30">30 min</option>
                  <option value="60">1 heure</option>
                  <option value="90">1h30</option>
                  <option value="120">2 heures</option>
                  <option value="1440">24 heures</option>
                </Select>
              </div>
            </div>

            <div>
              <label className="dashboard-field-label">Lien Google Avis</label>
              <Input
                className="mt-2"
                value={googleReviewUrl}
                onChange={(event) => setGoogleReviewUrl(event.target.value)}
                placeholder="https://g.page/..."
              />
            </div>

            <div>
              <label className="dashboard-field-label">Objet de l&apos;e-mail</label>
              <Input
                className="mt-2"
                value={emailSubject}
                onChange={(event) => setEmailSubject(event.target.value)}
                placeholder="Comment s'est passée votre expérience chez {{restaurant_name}} ?"
              />
              <p className="mt-1.5 text-xs text-[var(--muted-foreground)]">Variable supportée : {"{{restaurant_name}}"}</p>
            </div>

            <div>
              <label className="dashboard-field-label">Message de l&apos;e-mail</label>
              <Textarea
                className="mt-2 min-h-32"
                value={emailMessage}
                onChange={(event) => setEmailMessage(event.target.value)}
              />
              <p className="mt-1.5 text-xs text-[var(--muted-foreground)]">Variable supportée : {"{{restaurant_name}}"}</p>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              <div>
                <label className="dashboard-field-label">Libellé excellent</label>
                <Input className="mt-2" value={positiveLabel} onChange={(event) => setPositiveLabel(event.target.value)} />
              </div>
              <div>
                <label className="dashboard-field-label">Libellé moyen</label>
                <Input className="mt-2" value={neutralLabel} onChange={(event) => setNeutralLabel(event.target.value)} />
              </div>
              <div>
                <label className="dashboard-field-label">Libellé à améliorer</label>
                <Input className="mt-2" value={negativeLabel} onChange={(event) => setNegativeLabel(event.target.value)} />
              </div>
            </div>

            <div>
              <label className="dashboard-field-label">Couleur principale de l&apos;e-mail</label>
              <div className="mt-2 flex items-center gap-2">
                <Input
                  type="color"
                  className="h-11 w-14 shrink-0"
                  value={primaryColor}
                  onChange={(event) => setPrimaryColor(event.target.value)}
                />
                <Input value={primaryColor} onChange={(event) => setPrimaryColor(event.target.value)} />
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-4">
              <Button type="button" onClick={saveSettings} disabled={saving || savingToggle}>
                {saving ? "Enregistrement…" : "Enregistrer"}
              </Button>
              <button
                type="button"
                className="text-sm font-medium text-green-700 hover:underline disabled:opacity-50"
                onClick={sendTestReviewEmail}
                disabled={sendingTest || savingToggle}
              >
                {sendingTest ? "Envoi du test…" : "E-mail de test"}
              </button>
            </div>
            {message && <p className="text-sm text-gray-600">{message}</p>}

            <div className="rounded-xl border border-gray-100 bg-gray-50/60 p-6 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Aperçu</p>
              <p className="mt-4 text-base font-semibold text-gray-900">{previewSubject}</p>
              <p className="mt-3 whitespace-pre-line text-sm leading-relaxed text-gray-700">{previewMessage}</p>
              <div className="mt-4 grid grid-cols-3 gap-2">
                <span
                  className="rounded-lg px-2 py-2 text-center text-xs font-semibold text-white"
                  style={{ backgroundColor: primaryColor || "#15803d" }}
                >
                  {positiveLabel}
                </span>
                <span className="rounded-lg border border-gray-200 bg-white px-2 py-2 text-center text-xs font-semibold text-gray-800">
                  {neutralLabel}
                </span>
                <span className="rounded-lg border border-gray-200 bg-white px-2 py-2 text-center text-xs font-semibold text-gray-800">
                  {negativeLabel}
                </span>
              </div>
            </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Retours privés</CardTitle>
          <CardDescription>Liés aux e-mails d&apos;avis.</CardDescription>
        </CardHeader>
        <CardContent>
          {initialFeedback.length === 0 ? (
            <p className="rounded-xl border border-dashed border-gray-200 bg-gray-50/80 py-10 text-center text-sm text-gray-500 shadow-sm">
              Aucun retour pour le moment.
            </p>
          ) : (
            <div className="space-y-4">
              {initialFeedback.map((item) => (
                <div
                  key={item.id}
                  className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm md:p-6"
                >
                  <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">{item.created_at.slice(0, 10)}</p>
                  <p className="mt-2 text-sm leading-relaxed text-gray-800">{item.message || "(Aucun message)"}</p>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </section>
  );
}
