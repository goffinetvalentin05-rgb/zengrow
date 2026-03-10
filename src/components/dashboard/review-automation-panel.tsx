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
    message_template: string;
    google_review_url: string;
  };
  initialFeedback: {
    id: string;
    rating: number;
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
  const [messageTemplate, setMessageTemplate] = useState(initialSettings.message_template);
  const [googleReviewUrl, setGoogleReviewUrl] = useState(initialSettings.google_review_url);
  const [saving, setSaving] = useState(false);
  const [sendingTest, setSendingTest] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const previewMessage = useMemo(
    () =>
      messageTemplate
        .replace("{{restaurant_name}}", "Votre restaurant")
        .replace("{{google_review_url}}", googleReviewUrl || "https://g.page/votre-etablissement/review"),
    [googleReviewUrl, messageTemplate],
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
        message_template: messageTemplate,
        google_review_url: googleReviewUrl || null,
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
              <label className="mb-1 block text-sm font-medium text-[var(--foreground)]/80">Message envoye</label>
              <Textarea
                className="min-h-32"
                value={messageTemplate}
                onChange={(event) => setMessageTemplate(event.target.value)}
              />
              <p className="mt-1 text-xs text-slate-500">
                Variables supportees: {"{{restaurant_name}}"} et {"{{google_review_url}}"}
              </p>
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
              <div className="mt-3 rounded-2xl bg-white p-4 text-sm text-[var(--foreground)]/85">
                {previewMessage}
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
                    Note {item.rating}/5 · {item.created_at.slice(0, 10)}
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
