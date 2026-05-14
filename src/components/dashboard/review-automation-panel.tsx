"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Mail, MessageCircle, Smartphone, Star } from "lucide-react";
import FilterBar from "@/src/components/dashboard/ui/filter-bar";
import ActionMenu from "@/src/components/dashboard/ui/action-menu";
import Button from "@/src/components/ui/button";
import Badge from "@/src/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/src/components/ui/card";
import EmptyState from "@/src/components/ui/empty-state";
import Input from "@/src/components/ui/input";
import Select from "@/src/components/ui/select";
import Textarea from "@/src/components/ui/textarea";
import PanelToggle from "@/src/components/ui/panel-toggle";
import ToastInline from "@/src/components/ui/toast-inline";
import Toggle from "@/src/components/ui/toggle";
import { SettingsAccordion } from "@/src/components/dashboard/settings/settings-accordion";
import { createClient } from "@/src/lib/supabase/client";
import { cn } from "@/src/lib/utils";

type ReviewAutomationPanelProps = {
  restaurantId: string;
  /** Page dédiée (historique + config) ou intégration Paramètres (accordéons). */
  layout?: "page" | "settings";
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

function SoonBadge() {
  return (
    <Badge tone="sand" className="shrink-0 text-[10px] font-semibold uppercase tracking-wide">
      Bientôt disponible
    </Badge>
  );
}

export default function ReviewAutomationPanel({
  restaurantId,
  layout = "page",
  initialSettings,
  initialFeedback,
}: ReviewAutomationPanelProps) {
  const router = useRouter();
  const supabase = createClient();
  const [isEnabled, setIsEnabled] = useState(initialSettings.is_enabled);
  const [channel] = useState<"email">("email");
  const [delayMinutes, setDelayMinutes] = useState(initialSettings.delay_minutes);
  const [delayHoursInput, setDelayHoursInput] = useState(() =>
    Math.round((initialSettings.delay_minutes / 60) * 100) / 100,
  );
  const [emailPreviewOpen, setEmailPreviewOpen] = useState(false);
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

  useEffect(() => {
    setDelayHoursInput(Math.round((initialSettings.delay_minutes / 60) * 100) / 100);
  }, [initialSettings.delay_minutes]);

  const previewSubject = useMemo(
    () => emailSubject.replaceAll("{{restaurant_name}}", "Votre restaurant"),
    [emailSubject],
  );
  const previewMessage = useMemo(
    () => emailMessage.replaceAll("{{restaurant_name}}", "Votre restaurant"),
    [emailMessage],
  );

  function buildAutomationUpsertPayload(enabled: boolean, delayOverride?: number) {
    const dm = delayOverride ?? delayMinutes;
    return {
      restaurant_id: restaurantId,
      is_enabled: enabled,
      channel,
      delay_minutes: dm,
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

    const resolvedDelay =
      layout === "settings"
        ? Math.max(30, Math.round((Number(String(delayHoursInput).replace(",", ".")) || 0.5) * 60))
        : delayMinutes;

    const { error } = await supabase.from("review_automation_settings").upsert(buildAutomationUpsertPayload(isEnabled, resolvedDelay), {
      onConflict: "restaurant_id",
    });

    setSaving(false);
    if (error) {
      setMessage(error.message);
      return;
    }
    if (layout === "settings") {
      setDelayMinutes(resolvedDelay);
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

  const toastBlock =
    message ? (
      <ToastInline
        tone={
          message.toLowerCase().includes("mis à jour") || message.toLowerCase().includes("envoyé")
            ? "success"
            : message.toLowerCase().includes("erreur") || message.toLowerCase().includes("impossible")
              ? "error"
              : "info"
        }
        message={message}
      />
    ) : null;

  if (layout === "settings") {
    return (
      <section className="space-y-4">
        {toastBlock}
        <SettingsAccordion title="Lien Google Reviews">
          <div className="space-y-2">
            <label className="dashboard-field-label">URL de la fiche Google Business</label>
            <Input
              value={googleReviewUrl}
              onChange={(event) => setGoogleReviewUrl(event.target.value)}
              placeholder="https://g.page/… ou lien avis Google"
            />
          </div>
        </SettingsAccordion>

        <SettingsAccordion title="E-mail automatique post-visite">
          <div className="flex flex-col gap-4">
            <PanelToggle
              checked={isEnabled}
              onChange={handleAutomationToggle}
              title="Envoi automatique activé"
              description="Les clients reçoivent un e-mail après leur visite pour collecter un retour puis un lien vers Google."
              disabled={savingToggle || saving}
            />
            {savingToggle ? <p className="text-xs font-medium text-zg-muted">Enregistrement…</p> : null}
            {toggleError ? (
              <p className="text-sm text-red-600" role="alert">
                {toggleError}
              </p>
            ) : null}

            <div>
              <label className="dashboard-field-label">Délai d&apos;envoi après la visite (heures)</label>
              <Input
                type="number"
                className="mt-2 max-w-[200px]"
                min={0.5}
                step={0.5}
                value={delayHoursInput}
                onChange={(event) => setDelayHoursInput(Number(event.target.value))}
              />
              <p className="mt-1 text-xs text-zg-muted">Minimum 30 minutes (0,5 h). Valeur convertie en minutes à l&apos;enregistrement.</p>
            </div>

            <div>
              <label className="dashboard-field-label">Objet de l&apos;e-mail</label>
              <Input
                className="mt-2"
                value={emailSubject}
                onChange={(event) => setEmailSubject(event.target.value)}
                placeholder="Comment s'est passée votre expérience chez {{restaurant_name}} ?"
              />
              <p className="mt-1.5 text-xs text-zg-muted">
                Variables supportées côté envoi : {"{{restaurant_name}}"} (équivalent conceptuel : {"{nom_resto}"}).
              </p>
            </div>

            <div>
              <label className="dashboard-field-label">Corps de l&apos;e-mail</label>
              <Textarea className="mt-2 min-h-36" value={emailMessage} onChange={(event) => setEmailMessage(event.target.value)} />
              <p className="mt-1.5 text-xs text-zg-muted">
                Tu peux t&apos;inspirer de : {"{prenom}"}, {"{nom_resto}"}, {"{lien_avis}"} — le moteur actuel remplace surtout {"{{restaurant_name}}"} dans les modèles existants.
              </p>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              <div>
                <label className="dashboard-field-label">Bouton positif</label>
                <Input className="mt-2" value={positiveLabel} onChange={(event) => setPositiveLabel(event.target.value)} />
              </div>
              <div>
                <label className="dashboard-field-label">Bouton neutre</label>
                <Input className="mt-2" value={neutralLabel} onChange={(event) => setNeutralLabel(event.target.value)} />
              </div>
              <div>
                <label className="dashboard-field-label">Bouton négatif</label>
                <Input className="mt-2" value={negativeLabel} onChange={(event) => setNegativeLabel(event.target.value)} />
              </div>
            </div>

            <div>
              <label className="dashboard-field-label">Couleur principale (boutons)</label>
              <div className="mt-2 flex items-center gap-2">
                <Input type="color" className="h-11 w-14 shrink-0" value={primaryColor} onChange={(event) => setPrimaryColor(event.target.value)} />
                <Input value={primaryColor} onChange={(event) => setPrimaryColor(event.target.value)} />
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <Button type="button" variant="secondary" className="min-h-11" onClick={() => setEmailPreviewOpen((open) => !open)}>
                {emailPreviewOpen ? "Masquer l'aperçu" : "Aperçu de l'e-mail"}
              </Button>
            </div>

            {emailPreviewOpen ? (
              <div className="rounded-2xl border border-zg-border bg-zg-surface-elevated p-4 transition-all duration-200 ease-out">
                <p className="text-xs font-semibold uppercase tracking-wide text-zg-fg-muted">Aperçu</p>
                <p className="mt-3 text-base font-semibold text-zg-fg">{previewSubject}</p>
                <p className="mt-3 whitespace-pre-line text-sm leading-relaxed text-zg-muted">{previewMessage}</p>
                <div className="mt-4 grid grid-cols-3 gap-2">
                  <span
                    className="rounded-lg px-2 py-2 text-center text-xs font-semibold text-white"
                    style={{ backgroundColor: primaryColor || "#15803d" }}
                  >
                    {positiveLabel}
                  </span>
                  <span className="rounded-lg border border-zg-border bg-zg-surface px-2 py-2 text-center text-xs font-semibold text-zg-fg">
                    {neutralLabel}
                  </span>
                  <span className="rounded-lg border border-zg-border bg-zg-surface px-2 py-2 text-center text-xs font-semibold text-zg-fg">
                    {negativeLabel}
                  </span>
                </div>
              </div>
            ) : null}
          </div>
        </SettingsAccordion>

        <SettingsAccordion title="Filtrage intelligent">
          <div className="flex flex-col gap-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="text-sm text-zg-fg">
                Ne demander un avis Google qu&apos;aux clients ayant laissé un feedback privé positif.
              </p>
              <SoonBadge />
            </div>
            <Toggle checked={false} onChange={() => {}} label="Filtrage actif (bientôt)" disabled />
          </div>
        </SettingsAccordion>

        <div className="flex flex-wrap justify-end gap-2 border-t border-zg-border/60 pt-4">
          <ActionMenu
            items={[
              {
                kind: "action",
                label: sendingTest ? "Envoi du test…" : "Envoyer un e-mail de test",
                onClick: sendTestReviewEmail,
                disabled: sendingTest || savingToggle,
              },
            ]}
          />
          <Button type="button" onClick={saveSettings} disabled={saving || savingToggle} className="min-h-11 min-w-[160px]">
            {saving ? "Enregistrement…" : "Enregistrer"}
          </Button>
        </div>
      </section>
    );
  }

  return (
    <section className="space-y-10">
      {toastBlock}

      <Card>
        <CardHeader>
          <CardTitle>Automatisation</CardTitle>
          <CardDescription>Activez l’envoi automatique et personnalisez le message reçu par vos clients.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <FilterBar
            right={
              <>
                <ActionMenu
                  items={[
                    {
                      kind: "action",
                      label: sendingTest ? "Envoi du test…" : "Envoyer un e-mail de test",
                      onClick: sendTestReviewEmail,
                      disabled: sendingTest || savingToggle,
                    },
                  ]}
                />
                <Button type="button" onClick={saveSettings} disabled={saving || savingToggle}>
                  {saving ? "Enregistrement…" : "Enregistrer"}
                </Button>
              </>
            }
          >
            <div className="min-w-[260px] flex-1">
              <PanelToggle
                checked={isEnabled}
                onChange={handleAutomationToggle}
                title="Automatisation active"
                description="Les clients reçoivent un message après leur visite."
                disabled={savingToggle || saving}
              />
              {savingToggle ? <p className="mt-2 text-xs font-medium text-zg-muted">Enregistrement…</p> : null}
              {toggleError ? (
                <p className="mt-2 text-sm text-red-600" role="alert">
                  {toggleError}
                </p>
              ) : null}
            </div>
          </FilterBar>

          <div className="grid gap-6 lg:grid-cols-12 lg:items-start">
            <div className="space-y-6 lg:col-span-7">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-zg-fg-muted">Réglages</p>
                <div className="mt-3 grid gap-6 md:grid-cols-2">
                  <div>
                    <label className="dashboard-field-label">Canal</label>
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
                              "flex min-w-0 flex-1 items-center gap-3 rounded-xl border px-3 py-3 shadow-sm transition-colors sm:min-w-[7.5rem] sm:flex-1",
                              item.disabled && "cursor-not-allowed opacity-50",
                              !item.disabled && selected && "border-l-4 border-l-zg-teal border-zg-border bg-zg-highlight/70 pl-2.5",
                              !item.disabled && !selected && "cursor-pointer border-zg-border bg-zg-surface hover:bg-zg-highlight/50",
                              item.disabled && "border-zg-border/80 bg-zg-surface-elevated/70 shadow-none",
                            )}
                          >
                            <span
                              className={cn(
                                "flex h-9 w-9 shrink-0 items-center justify-center rounded-full",
                                selected && !item.disabled ? "bg-zg-teal text-white" : "bg-zg-surface-soft text-zg-muted",
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
                                selected && !item.disabled ? "bg-emerald-100 text-emerald-900" : "bg-zg-border/40 text-zg-fg-muted",
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
              </div>

              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-zg-fg-muted">Message</p>
                <div className="mt-3 space-y-4">
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
                    <p className="mt-1.5 text-xs text-[var(--muted-foreground)]">Variable : {"{{restaurant_name}}"}</p>
                  </div>

                  <div>
                    <label className="dashboard-field-label">Message de l&apos;e-mail</label>
                    <Textarea className="mt-2 min-h-32" value={emailMessage} onChange={(event) => setEmailMessage(event.target.value)} />
                    <p className="mt-1.5 text-xs text-[var(--muted-foreground)]">Variable : {"{{restaurant_name}}"}</p>
                  </div>

                  <div className="grid gap-4 md:grid-cols-3">
                    <div>
                      <label className="dashboard-field-label">Bouton positif</label>
                      <Input className="mt-2" value={positiveLabel} onChange={(event) => setPositiveLabel(event.target.value)} />
                    </div>
                    <div>
                      <label className="dashboard-field-label">Bouton neutre</label>
                      <Input className="mt-2" value={neutralLabel} onChange={(event) => setNeutralLabel(event.target.value)} />
                    </div>
                    <div>
                      <label className="dashboard-field-label">Bouton négatif</label>
                      <Input className="mt-2" value={negativeLabel} onChange={(event) => setNegativeLabel(event.target.value)} />
                    </div>
                  </div>

                  <div>
                    <label className="dashboard-field-label">Couleur principale</label>
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
                </div>
              </div>
            </div>

            <div className="lg:col-span-5">
              <div className="rounded-2xl border border-zg-border bg-zg-surface-elevated p-6 transition-all duration-200 ease-out">
                <p className="text-xs font-semibold uppercase tracking-wide text-zg-fg-muted">Aperçu</p>
                <p className="mt-4 text-base font-semibold text-zg-fg">{previewSubject}</p>
                <p className="mt-3 whitespace-pre-line text-sm leading-relaxed text-zg-muted">{previewMessage}</p>
                <div className="mt-4 grid grid-cols-3 gap-2">
                  <span
                    className="rounded-lg px-2 py-2 text-center text-xs font-semibold text-white"
                    style={{ backgroundColor: primaryColor || "#15803d" }}
                  >
                    {positiveLabel}
                  </span>
                  <span className="rounded-lg border border-zg-border bg-zg-surface px-2 py-2 text-center text-xs font-semibold text-zg-fg">
                    {neutralLabel}
                  </span>
                  <span className="rounded-lg border border-zg-border bg-zg-surface px-2 py-2 text-center text-xs font-semibold text-zg-fg">
                    {negativeLabel}
                  </span>
                </div>
              </div>
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
            <EmptyState
              icon={Star}
              title="Pas encore de retours"
              description="Pas encore d'avis Google côté messages privés. ZenGrow va commencer à les collecter pour toi."
            />
          ) : (
            <div className="space-y-4">
              {initialFeedback.map((item) => (
                <div
                  key={item.id}
                  className="rounded-xl border border-zg-border bg-zg-surface p-5 shadow-sm transition-all duration-150 md:p-6"
                >
                  <p className="text-xs font-medium uppercase tracking-wider text-zg-text-muted">{item.created_at.slice(0, 10)}</p>
                  <p className="mt-2 text-sm leading-relaxed text-zg-text-secondary">{item.message || "(Aucun message)"}</p>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </section>
  );
}
