"use client";

import { useMemo, useState } from "react";
import Button from "@/src/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/src/components/ui/card";
import Input from "@/src/components/ui/input";
import Select from "@/src/components/ui/select";
import Textarea from "@/src/components/ui/textarea";
import Toggle from "@/src/components/ui/toggle";
import { createClient } from "@/src/lib/supabase/client";

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

export default function ReviewAutomationPanel({
  restaurantId,
  initialSettings,
  initialFeedback,
}: ReviewAutomationPanelProps) {
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

  async function saveSettings() {
    setSaving(true);
    setMessage(null);

    const { error } = await supabase.from("review_automation_settings").upsert(
      {
        restaurant_id: restaurantId,
        is_enabled: isEnabled,
        channel,
        delay_minutes: delayMinutes,
        google_review_url: googleReviewUrl || null,
        email_subject: emailSubject,
        email_message: emailMessage,
        button_positive_label: positiveLabel,
        button_neutral_label: neutralLabel,
        button_negative_label: negativeLabel,
        primary_color: primaryColor,
      },
      { onConflict: "restaurant_id" },
    );

    setSaving(false);
    setMessage(error ? error.message : "Automatisation mise a jour.");
  }

  async function sendTestReviewEmail() {
    setSendingTest(true);
    setMessage(null);

    const response = await fetch("/api/reviews/test-email", {
      method: "POST",
    });

    const payload = (await response.json().catch(() => ({}))) as { error?: string };
    if (!response.ok) {
      setMessage(payload.error ?? "Impossible d'envoyer l'email de test.");
      setSendingTest(false);
      return;
    }

    setMessage("Email de test envoye. Verifiez votre boite de reception.");
    setSendingTest(false);
  }

  return (
    <section className="space-y-6">
      <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <Card className="rounded-3xl">
          <CardHeader>
            <CardTitle>Review Automation</CardTitle>
            <CardDescription>Activez, configurez et previsualisez votre message post-visite.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface-muted)] p-3">
              <Toggle checked={isEnabled} onChange={setIsEnabled} label="Automatisation active" />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="mb-1 block text-sm font-medium text-[var(--foreground)]/80">Canal de diffusion</label>
                <div className="space-y-2">
                  <div className="flex items-center justify-between rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-800">
                    <span className="font-medium">Email</span>
                    <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-semibold">Actif</span>
                  </div>
                  <div
                    className="flex cursor-not-allowed items-center justify-between rounded-xl border border-slate-200 bg-slate-100 px-3 py-2 text-sm text-slate-500"
                    aria-disabled="true"
                  >
                    <span>SMS</span>
                    <span className="rounded-full bg-slate-200 px-2 py-0.5 text-xs font-semibold">Bientot</span>
                  </div>
                  <div
                    className="flex cursor-not-allowed items-center justify-between rounded-xl border border-slate-200 bg-slate-100 px-3 py-2 text-sm text-slate-500"
                    aria-disabled="true"
                  >
                    <span>WhatsApp</span>
                    <span className="rounded-full bg-slate-200 px-2 py-0.5 text-xs font-semibold">Bientot</span>
                  </div>
                </div>
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-[var(--foreground)]/80">Delai apres visite</label>
                <Select value={String(delayMinutes)} onChange={(event) => setDelayMinutes(Number(event.target.value))}>
                  <option value="30">30 min</option>
                  <option value="60">1 heure</option>
                  <option value="90">1h30</option>
                  <option value="120">2 heures</option>
                  <option value="1440">24 heures</option>
                </Select>
              </div>
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-[var(--foreground)]/80">Lien Google review</label>
              <Input
                value={googleReviewUrl}
                onChange={(event) => setGoogleReviewUrl(event.target.value)}
                placeholder="https://g.page/..."
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-[var(--foreground)]/80">Email subject</label>
              <Input
                value={emailSubject}
                onChange={(event) => setEmailSubject(event.target.value)}
                placeholder="How was your experience at {{restaurant_name}}?"
              />
              <p className="mt-1 text-xs text-slate-500">Variable supportee: {"{{restaurant_name}}"}</p>
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-[var(--foreground)]/80">Email message</label>
              <Textarea
                className="min-h-32"
                value={emailMessage}
                onChange={(event) => setEmailMessage(event.target.value)}
              />
              <p className="mt-1 text-xs text-slate-500">Variable supportee: {"{{restaurant_name}}"}</p>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              <div>
                <label className="mb-1 block text-sm font-medium text-[var(--foreground)]/80">Excellent label</label>
                <Input value={positiveLabel} onChange={(event) => setPositiveLabel(event.target.value)} />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-[var(--foreground)]/80">Average label</label>
                <Input value={neutralLabel} onChange={(event) => setNeutralLabel(event.target.value)} />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-[var(--foreground)]/80">Not great label</label>
                <Input value={negativeLabel} onChange={(event) => setNegativeLabel(event.target.value)} />
              </div>
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-[var(--foreground)]/80">Primary email color</label>
              <div className="flex items-center gap-2">
                <Input
                  type="color"
                  className="h-10 w-16 p-1"
                  value={primaryColor}
                  onChange={(event) => setPrimaryColor(event.target.value)}
                />
                <Input value={primaryColor} onChange={(event) => setPrimaryColor(event.target.value)} />
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              <Button type="button" onClick={saveSettings} disabled={saving}>
                {saving ? "Enregistrement..." : "Enregistrer la configuration"}
              </Button>
              <Button type="button" variant="secondary" onClick={sendTestReviewEmail} disabled={sendingTest}>
                {sendingTest ? "Envoi du test..." : "Send test review email"}
              </Button>
            </div>
            {message && <p className="text-sm text-[var(--muted-foreground)]">{message}</p>}
          </CardContent>
        </Card>

        <Card className="rounded-3xl">
          <CardHeader>
            <CardTitle>Apercu du message</CardTitle>
            <CardDescription>Ce que le client recevra apres sa visite.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface-muted)] p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--muted-foreground)]">
                {channel.toUpperCase()}
              </p>
              <div className="mt-3 rounded-2xl bg-white p-4 text-sm text-[var(--foreground)]/85 space-y-3">
                <p className="text-base font-semibold text-[var(--foreground)]">{previewSubject}</p>
                <p className="whitespace-pre-line">{previewMessage}</p>
                <div className="grid grid-cols-3 gap-2">
                  <span
                    className="rounded-lg px-2 py-2 text-center text-xs font-semibold text-white"
                    style={{ backgroundColor: primaryColor || "#1F7A6C" }}
                  >
                    {positiveLabel}
                  </span>
                  <span className="rounded-lg border border-[var(--border)] px-2 py-2 text-center text-xs font-semibold">
                    {neutralLabel}
                  </span>
                  <span className="rounded-lg border border-[var(--border)] px-2 py-2 text-center text-xs font-semibold">
                    {negativeLabel}
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="rounded-3xl">
        <CardHeader>
          <CardTitle>Private feedback</CardTitle>
          <CardDescription>Derniers retours prives recus depuis les emails d&apos;avis.</CardDescription>
        </CardHeader>
        <CardContent>
          {initialFeedback.length === 0 ? (
            <p className="rounded-2xl border border-dashed border-[var(--border)] bg-[var(--surface-muted)] p-4 text-sm text-[var(--muted-foreground)]">
              Aucun feedback prive pour le moment.
            </p>
          ) : (
            <div className="space-y-3">
              {initialFeedback.map((item) => (
                <div key={item.id} className="rounded-2xl border border-[var(--border)] bg-[var(--surface-muted)] p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--muted-foreground)]">
                    {item.created_at.slice(0, 10)}
                  </p>
                  <p className="mt-2 text-sm text-[var(--foreground)]/85">{item.message || "(Aucun message)"}</p>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </section>
  );
}
