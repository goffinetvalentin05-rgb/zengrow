"use client";

import { useEffect, useMemo, useState } from "react";
import { Copy, Instagram, Linkedin, Mail, Phone, Sparkles } from "lucide-react";
import Button from "@/src/components/ui/button";
import Select from "@/src/components/ui/select";
import Textarea from "@/src/components/ui/textarea";
import Input from "@/src/components/ui/input";
import { useDashboardI18n } from "@/src/components/dashboard/i18n/dashboard-locale-provider";
import { useDashboardToast } from "@/src/components/dashboard/dashboard-toast-provider";
import {
  SCRIPT_STAGES,
  availableOutreachChannels,
  followUpIso,
  followUpIsoFromDateInput,
  instagramHref,
  interpolateScript,
  linkedinHref,
  mailtoHref,
  pickScript,
  pipelineStatusToScriptStage,
  scriptVarsFromProspect,
  telHref,
  whatsappHref,
  type OutreachSaasContext,
  type ProspectScript,
  type ScriptChannel,
  type ScriptStage,
} from "@/src/lib/sharpz/outreach";
import type { Prospect, ProspectEvent, ProspectStatus } from "@/src/lib/sharpz/types";
import { cn } from "@/src/lib/utils";

function WhatsAppGlyph({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden>
      <path
        fill="currentColor"
        d="M12.04 2c-5.46 0-9.91 4.44-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.44 9.91-9.91C21.95 6.44 17.5 2 12.04 2zm5.79 14.07c-.24.68-1.4 1.3-1.94 1.34-.5.04-1.12.06-1.81-.11-.42-.11-.95-.31-1.64-.61-2.89-1.25-4.77-4.16-4.92-4.35-.14-.19-1.18-1.57-1.18-3 0-1.42.75-2.12 1.01-2.41.27-.29.58-.36.78-.36h.56c.18 0 .42-.07.66.5.24.59.82 2.03.89 2.18.07.15.12.32.02.52-.1.19-.14.32-.28.49-.14.17-.3.38-.42.51-.14.14-.29.29-.12.56.16.27.73 1.2 1.56 1.94 1.07.96 1.97 1.26 2.24 1.4.27.14.43.12.59-.07.16-.19.68-.79.86-1.06.18-.27.36-.22.61-.13.24.08 1.55.73 1.82.86.27.14.45.2.51.31.07.11.07.64-.17 1.32z"
      />
    </svg>
  );
}

function openHref(href: string) {
  if (href.startsWith("mailto:") || href.startsWith("tel:")) {
    window.location.href = href;
    return;
  }
  window.open(href, "_blank", "noopener,noreferrer");
}

type ContactDraft = {
  type: Prospect["type"];
  name: string;
  company: string;
  email: string;
  phone: string;
  url: string;
  contact: string;
  linkedinUrl: string;
  instagramUrl: string;
  status: ProspectStatus;
  nextFollowUpAt: string;
};

type Props = {
  prospect: Prospect;
  draft: ContactDraft;
  scripts: ProspectScript[];
  saas: OutreachSaasContext | null;
  pending: boolean;
  onLogged: (event: ProspectEvent | null, patch: Partial<Prospect>) => void;
  onSchedule: (iso: string) => void;
};

export function ProspectContactPanel({
  prospect,
  draft,
  scripts,
  saas,
  pending,
  onLogged,
  onSchedule,
}: Props) {
  const { t } = useDashboardI18n();
  const showToast = useDashboardToast();
  const channelLabels: Record<ScriptChannel, string> = {
    whatsapp: t.prospectsPage.channelWhatsapp,
    linkedin: t.prospectsPage.channelLinkedin,
    instagram: t.prospectsPage.channelInstagram,
    email: t.prospectsPage.channelEmail,
    phone: t.prospectsPage.channelPhone,
  };
  const stageLabels: Record<ScriptStage, string> = {
    first_contact: t.prospectsPage.stageFirstContact,
    follow_up_1: t.prospectsPage.stageFollowUp1,
    follow_up_2: t.prospectsPage.stageFollowUp2,
    in_discussion: t.prospectsPage.stageInDiscussion,
    closing: t.prospectsPage.stageClosing,
    custom: t.prospectsPage.stageCustom,
  };

  const liveProspect = useMemo(
    () => ({
      ...prospect,
      name: draft.name || prospect.name,
      company: draft.company || prospect.company,
      email: draft.email || prospect.email,
      phone: draft.phone || prospect.phone,
      url: draft.url || prospect.url,
      linkedinUrl: draft.linkedinUrl || prospect.linkedinUrl,
      instagramUrl: draft.instagramUrl || prospect.instagramUrl,
    }),
    [
      prospect,
      draft.name,
      draft.company,
      draft.email,
      draft.phone,
      draft.url,
      draft.linkedinUrl,
      draft.instagramUrl,
    ],
  );

  const channels = useMemo(() => availableOutreachChannels(liveProspect), [liveProspect]);
  const defaultStage = pipelineStatusToScriptStage(draft.status);
  const [channel, setChannel] = useState<ScriptChannel | null>(channels[0] ?? null);
  const [stage, setStage] = useState<ScriptStage>(defaultStage);
  const [message, setMessage] = useState("");
  const [dirty, setDirty] = useState(false);
  const [comment, setComment] = useState("");
  const [personalizing, setPersonalizing] = useState(false);
  const [logging, setLogging] = useState(false);
  const [showCustomDate, setShowCustomDate] = useState(false);

  useEffect(() => {
    setChannel(channels[0] ?? null);
    setStage(pipelineStatusToScriptStage(draft.status));
    setDirty(false);
    setComment("");
    setShowCustomDate(false);
    // Reset only when switching prospects — draft.status is read from the newly opened card.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [prospect.id]);

  useEffect(() => {
    if (!channel) {
      setChannel(channels[0] ?? null);
      return;
    }
    if (!channels.includes(channel)) setChannel(channels[0] ?? null);
  }, [channels, channel]);

  const script = useMemo(
    () => (channel ? pickScript(scripts, channel, stage) : null),
    [scripts, channel, stage],
  );

  const interpolated = useMemo(() => {
    if (!script) return "";
    return interpolateScript(
      script.content,
      scriptVarsFromProspect(
        {
          type: draft.type,
          name: draft.name || prospect.name,
          contact: draft.contact || prospect.contact,
          company: draft.company || prospect.company,
          url: draft.url || prospect.url,
        },
        saas,
      ),
    );
  }, [script, draft, prospect, saas]);

  useEffect(() => {
    if (!dirty) setMessage(interpolated);
  }, [interpolated, dirty]);

  useEffect(() => {
    setDirty(false);
  }, [channel, stage, script?.id]);

  const openLabel =
    channel === "whatsapp"
      ? t.prospectsPage.openWhatsApp
      : channel === "linkedin"
        ? t.prospectsPage.openLinkedIn
        : channel === "instagram"
          ? t.prospectsPage.openInstagram
          : channel === "email"
            ? t.prospectsPage.openEmail
            : t.prospectsPage.callNow;

  function hrefFor(current: ScriptChannel, text: string) {
    if (current === "whatsapp") return whatsappHref(liveProspect.phone, text);
    if (current === "email") {
      const subject = saas?.name ? saas.name : null;
      return mailtoHref(liveProspect.email, text, subject);
    }
    if (current === "linkedin") return linkedinHref(liveProspect.linkedinUrl, liveProspect.url);
    if (current === "instagram") return instagramHref(liveProspect.instagramUrl, liveProspect.url);
    return telHref(liveProspect.phone);
  }

  async function logOutreach(detail: string) {
    if (!channel) return;
    setLogging(true);
    const nextStatus: ProspectStatus | undefined =
      draft.status === "to_contact" ? "follow_up_1" : undefined;
    const response = await fetch(`/api/sharpz/prospects/${prospect.id}/outreach`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        channel,
        scriptId: script?.id ?? null,
        scriptName: script?.name ?? null,
        stage,
        detail,
        comment: comment.trim() || null,
        lastAction: `${channelLabels[channel]} · ${stageLabels[stage]}`,
        nextStatus,
      }),
    });
    const data = (await response.json().catch(() => null)) as
      | { error?: string; event?: ProspectEvent; status?: ProspectStatus }
      | null;
    setLogging(false);
    if (!response.ok) {
      showToast({ message: data?.error ?? t.common.error });
      return;
    }
    onLogged(data?.event ?? null, {
      lastAction: `${channelLabels[channel]} · ${stageLabels[stage]}`,
      contactedAt: prospect.contactedAt || new Date().toISOString(),
      status: data?.status ?? nextStatus ?? prospect.status,
    });
    setComment("");
    showToast({ message: t.prospectsPage.outreachLogged, durationMs: 2200 });
  }

  async function copyMessage() {
    const text = message.trim();
    if (!text) return;
    try {
      await navigator.clipboard.writeText(text);
      showToast({ message: t.prospectsPage.copied, durationMs: 1600 });
    } catch {
      showToast({ message: t.common.error });
    }
  }

  async function personalize() {
    if (!channel || !message.trim()) return;
    setPersonalizing(true);
    const response = await fetch(`/api/sharpz/prospects/${prospect.id}/personalize`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        channel,
        stage,
        content: message,
        scriptName: script?.name ?? null,
      }),
    });
    const data = (await response.json().catch(() => null)) as { text?: string; error?: string } | null;
    setPersonalizing(false);
    if (!response.ok || !data?.text) {
      showToast({ message: data?.error ?? t.prospectsPage.orionUnavailable });
      return;
    }
    setMessage(data.text);
    setDirty(true);
  }

  async function openChannel() {
    if (!channel) return;
    const href = hrefFor(channel, message);
    if (!href) return;
    openHref(href);
    await logOutreach(stageLabels[stage]);
  }

  return (
    <section>
      <h3 className="text-[11px] font-semibold uppercase tracking-[0.14em] text-zg-muted">
        {t.prospectsPage.contactSection}
      </h3>

      {channels.length ? (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {channels.map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => setChannel(item)}
              className={cn(
                "inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-[12px] transition-colors",
                channel === item
                  ? "border-white/15 bg-white/[0.08] text-zg-fg"
                  : "border-white/[0.07] text-zg-text-secondary hover:border-white/12 hover:text-zg-fg",
              )}
            >
              {item === "whatsapp" ? <WhatsAppGlyph className="h-3.5 w-3.5 text-[#25D366]" /> : null}
              {item === "email" ? <Mail className="h-3.5 w-3.5" /> : null}
              {item === "linkedin" ? <Linkedin className="h-3.5 w-3.5 text-[#0A66C2]" /> : null}
              {item === "instagram" ? <Instagram className="h-3.5 w-3.5 text-[#E4405F]" /> : null}
              {item === "phone" ? <Phone className="h-3.5 w-3.5" /> : null}
              {channelLabels[item]}
            </button>
          ))}
        </div>
      ) : (
        <p className="mt-3 text-sm text-zg-muted">{t.prospectsPage.noChannel}</p>
      )}

      {channel ? (
        <div className="mt-4 space-y-3">
          <Select
            value={stage}
            onChange={(event) => setStage(event.target.value as ScriptStage)}
            aria-label={t.prospectsPage.scriptStage}
          >
            {SCRIPT_STAGES.map((item) => (
              <option key={item} value={item}>
                {stageLabels[item]}
              </option>
            ))}
          </Select>

          <div className="rounded-2xl border border-white/[0.07] bg-white/[0.025] p-4">
            <div className="flex items-baseline justify-between gap-3">
              <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-zg-muted">
                {t.prospectsPage.recommendedMessage}
              </p>
              <p className="truncate text-[12px] text-zg-text-secondary">
                {script ? script.name : stageLabels[stage]}
              </p>
            </div>
            {channel === "phone" ? (
              <p className="mt-2 text-[12px] text-zg-muted">{t.prospectsPage.scriptPhoneHint}</p>
            ) : null}
            {script || message ? (
              <Textarea
                className="mt-3 min-h-[9rem]"
                rows={channel === "phone" ? 8 : 6}
                value={message}
                onChange={(event) => {
                  setMessage(event.target.value);
                  setDirty(true);
                }}
              />
            ) : (
              <p className="mt-3 text-sm text-zg-muted">{t.prospectsPage.noScript}</p>
            )}
            <div className="mt-3 flex flex-wrap gap-2">
              <Button type="button" size="sm" variant="secondary" disabled={!message.trim()} onClick={() => void copyMessage()}>
                <Copy className="h-3.5 w-3.5" />
                {t.prospectsPage.copyMessage}
              </Button>
              <Button
                type="button"
                size="sm"
                variant="secondary"
                disabled={!message.trim() || personalizing || pending}
                onClick={() => void personalize()}
              >
                <Sparkles className="h-3.5 w-3.5" />
                {personalizing ? t.prospectsPage.personalizing : t.prospectsPage.personalizeOrion}
              </Button>
              <Button type="button" size="sm" disabled={!hrefFor(channel, message) || logging || pending} onClick={() => void openChannel()}>
                {openLabel}
              </Button>
            </div>
          </div>

          <Input
            value={comment}
            onChange={(event) => setComment(event.target.value)}
            placeholder={t.prospectsPage.commentPlaceholder}
          />

          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              size="sm"
              variant="ghost"
              disabled={logging || pending || !channel}
              onClick={() => void logOutreach(stageLabels[stage])}
            >
              {t.prospectsPage.logContact}
            </Button>
          </div>

          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-zg-muted">
              {t.prospectsPage.scheduleFollowUp}
            </p>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {[
                { label: t.prospectsPage.followUpTomorrow, days: 1 },
                { label: t.prospectsPage.followUp3, days: 3 },
                { label: t.prospectsPage.followUp7, days: 7 },
              ].map((item) => (
                <button
                  key={item.days}
                  type="button"
                  disabled={pending}
                  onClick={() => onSchedule(followUpIso(item.days))}
                  className="rounded-full border border-white/[0.07] px-3 py-1.5 text-[12px] text-zg-text-secondary transition-colors hover:border-white/12 hover:text-zg-fg disabled:opacity-50"
                >
                  {item.label}
                </button>
              ))}
              <button
                type="button"
                disabled={pending}
                onClick={() => setShowCustomDate((current) => !current)}
                className="rounded-full border border-white/[0.07] px-3 py-1.5 text-[12px] text-zg-text-secondary transition-colors hover:border-white/12 hover:text-zg-fg"
              >
                {t.prospectsPage.followUpCustom}
              </button>
            </div>
            {showCustomDate ? (
              <Input
                className="mt-2 max-w-[12rem]"
                type="date"
                onChange={(event) => {
                  const iso = followUpIsoFromDateInput(event.target.value);
                  if (iso) onSchedule(iso);
                }}
              />
            ) : null}
            {draft.nextFollowUpAt ? (
              <p className="mt-2 text-[12px] text-zg-muted">
                {t.prospectsPage.nextFollowUp} · {draft.nextFollowUpAt}
              </p>
            ) : null}
          </div>
        </div>
      ) : null}
    </section>
  );
}
