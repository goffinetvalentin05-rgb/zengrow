"use client";

import { FormEvent, useState } from "react";
import { X } from "lucide-react";
import Button from "@/src/components/ui/button";
import Input from "@/src/components/ui/input";
import Select from "@/src/components/ui/select";
import Textarea from "@/src/components/ui/textarea";
import { ProspectContactPanel } from "@/src/components/sharpz/prospects/prospect-contact-panel";
import { PIPELINE_STATUSES, isFollowUpOverdue, isFollowUpToday } from "@/src/lib/sharpz/prospects-pipeline";
import type { OutreachSaasContext, ProspectScript } from "@/src/lib/sharpz/outreach";
import type { Prospect, ProspectEvent, ProspectStatus } from "@/src/lib/sharpz/types";
import { cn } from "@/src/lib/utils";

export type ProspectDraft = {
  type: Prospect["type"];
  name: string;
  company: string;
  email: string;
  phone: string;
  url: string;
  linkedinUrl: string;
  instagramUrl: string;
  contact: string;
  source: string;
  lastAction: string;
  contactedAt: string;
  nextFollowUpAt: string;
  notes: string;
  status: ProspectStatus;
};

type Copy = {
  details: string;
  identity: string;
  tracking: string;
  notes: string;
  history: string;
  noHistory: string;
  quickActions: string;
  saveChanges: string;
  cancel: string;
  name: string;
  company: string;
  email: string;
  phone: string;
  url: string;
  contact: string;
  source: string;
  lastAction: string;
  contactedAt: string;
  nextFollowUp: string;
  companyType: string;
  individualType: string;
  status: string;
  website: string;
  addedAt: string;
  fit: string;
  markContacted: string;
  scheduleFollowUp: string;
  addNote: string;
  closeProspect: string;
  deleteProspect: string;
  deleteConfirm: string;
  notePlaceholder: string;
  saveNote: string;
  eventCreated: string;
  eventCreatedByAgent: string;
  eventFoundByOrion: string;
  eventStatus: string;
  eventNote: string;
  eventContact: string;
  dueToday: string;
  overdue: string;
  linkedinUrl: string;
  instagramUrl: string;
  channelWhatsapp: string;
  channelLinkedin: string;
  channelInstagram: string;
  channelEmail: string;
  channelPhone: string;
};

type Props = {
  prospect: Prospect;
  draft: ProspectDraft;
  events: ProspectEvent[];
  scripts: ProspectScript[];
  saas: OutreachSaasContext | null;
  labels: Record<ProspectStatus, string>;
  dateLocale: string;
  pending: boolean;
  copy: Copy;
  onClose: () => void;
  onChange: (draft: ProspectDraft) => void;
  onSave: () => void;
  onMarkContacted: () => void;
  onAddNote: (note: string) => void;
  onCloseProspect: () => void;
  onDelete: () => void;
  onLogged: (event: ProspectEvent | null, patch: Partial<Prospect>) => void;
  onSchedule: (iso: string) => void;
};

function channelLabel(event: ProspectEvent, copy: Copy) {
  const channel = typeof event.meta?.channel === "string" ? event.meta.channel : "";
  const labels: Record<string, string> = {
    whatsapp: copy.channelWhatsapp,
    linkedin: copy.channelLinkedin,
    instagram: copy.channelInstagram,
    email: copy.channelEmail,
    phone: copy.channelPhone,
  };
  return labels[channel] ?? null;
}

function eventTitle(event: ProspectEvent, copy: Copy, labels: Record<ProspectStatus, string>) {
  if (event.eventType === "created") {
    return /orion|agent/i.test(event.detail ?? "") ? copy.eventFoundByOrion : copy.eventCreated;
  }
  if (event.eventType === "status_change") {
    const match = event.detail?.match(/^(\w+)\s*→\s*(\w+)$/);
    if (match) {
      const from = labels[match[1] as ProspectStatus] ?? match[1];
      const to = labels[match[2] as ProspectStatus] ?? match[2];
      return `${copy.eventStatus} · ${from} → ${to}`;
    }
    return copy.eventStatus;
  }
  if (event.eventType === "note") return copy.eventNote;
  if (event.eventType === "contact") return channelLabel(event, copy) ?? copy.eventContact;
  return event.eventType;
}

export function ProspectDetailPanel({
  prospect,
  draft,
  events,
  scripts,
  saas,
  labels,
  dateLocale,
  pending,
  copy,
  onClose,
  onChange,
  onSave,
  onMarkContacted,
  onAddNote,
  onCloseProspect,
  onDelete,
  onLogged,
  onSchedule,
}: Props) {
  const [note, setNote] = useState("");
  const due = isFollowUpToday(draft.nextFollowUpAt || prospect.nextFollowUpAt);
  const overdue = isFollowUpOverdue(draft.nextFollowUpAt || prospect.nextFollowUpAt);

  function onSubmit(event: FormEvent) {
    event.preventDefault();
    onSave();
  }

  function submitNote() {
    const value = note.trim();
    if (!value) return;
    onAddNote(value);
    setNote("");
  }

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <button type="button" className="absolute inset-0 bg-black/55" onClick={onClose} aria-label={copy.cancel} />
      <aside className="relative flex h-full w-full max-w-[32rem] flex-col border-l border-white/[0.07] bg-[#0d0c12] shadow-[0_0_80px_-24px_rgba(0,0,0,0.9)]">
        <div className="flex items-start justify-between gap-3 border-b border-white/[0.06] px-6 py-5">
          <div className="min-w-0">
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-zg-muted">{copy.details}</p>
            <h2 className="mt-1.5 truncate text-xl font-semibold tracking-tight text-zg-fg">
              {prospect.name || prospect.company}
            </h2>
            <p className="mt-1 text-sm text-zg-text-secondary">
              {draft.type === "individual" ? copy.individualType : copy.companyType}
              {prospect.fitScore != null ? ` · ${copy.fit} ${prospect.fitScore}` : ""}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-zg-muted hover:bg-white/[0.05] hover:text-zg-fg"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="flex min-h-0 flex-1 flex-col overflow-y-auto">
          <div className="border-b border-white/[0.06] px-6 py-6">
            <ProspectContactPanel
              prospect={prospect}
              draft={draft}
              scripts={scripts}
              saas={saas}
              pending={pending}
              onLogged={onLogged}
              onSchedule={onSchedule}
            />
          </div>
          <form onSubmit={onSubmit} className="space-y-8 px-6 py-6">
            <section>
              <h3 className="text-[11px] font-semibold uppercase tracking-[0.14em] text-zg-muted">{copy.identity}</h3>
              <div className="mt-3 grid gap-3 sm:grid-cols-2">
                <Select
                  value={draft.type}
                  onChange={(event) => onChange({ ...draft, type: event.target.value as Prospect["type"] })}
                >
                  <option value="company">{copy.companyType}</option>
                  <option value="individual">{copy.individualType}</option>
                </Select>
                <Input value={draft.name} onChange={(e) => onChange({ ...draft, name: e.target.value })} placeholder={copy.name} />
                <Input value={draft.company} onChange={(e) => onChange({ ...draft, company: e.target.value })} placeholder={copy.company} />
                <Input value={draft.contact} onChange={(e) => onChange({ ...draft, contact: e.target.value })} placeholder={copy.contact} />
                <Input value={draft.url} onChange={(e) => onChange({ ...draft, url: e.target.value })} placeholder={copy.website} />
                <Input type="email" value={draft.email} onChange={(e) => onChange({ ...draft, email: e.target.value })} placeholder={copy.email} />
                <Input value={draft.phone} onChange={(e) => onChange({ ...draft, phone: e.target.value })} placeholder={copy.phone} />
                <Input value={draft.linkedinUrl} onChange={(e) => onChange({ ...draft, linkedinUrl: e.target.value })} placeholder={copy.linkedinUrl} />
                <Input value={draft.instagramUrl} onChange={(e) => onChange({ ...draft, instagramUrl: e.target.value })} placeholder={copy.instagramUrl} />
              </div>
            </section>

            <section>
              <h3 className="text-[11px] font-semibold uppercase tracking-[0.14em] text-zg-muted">{copy.tracking}</h3>
              <div className="mt-3 grid gap-3 sm:grid-cols-2">
                <Select
                  value={draft.status}
                  onChange={(event) => onChange({ ...draft, status: event.target.value as ProspectStatus })}
                >
                  {PIPELINE_STATUSES.map((status) => (
                    <option key={status} value={status}>
                      {labels[status]}
                    </option>
                  ))}
                </Select>
                <Input value={draft.source} onChange={(e) => onChange({ ...draft, source: e.target.value })} placeholder={copy.source} />
                <Input type="date" value={draft.contactedAt} onChange={(e) => onChange({ ...draft, contactedAt: e.target.value })} aria-label={copy.contactedAt} />
                <div>
                  <Input type="date" value={draft.nextFollowUpAt} onChange={(e) => onChange({ ...draft, nextFollowUpAt: e.target.value })} aria-label={copy.nextFollowUp} />
                  {draft.nextFollowUpAt ? (
                    <p className={cn("mt-1.5 text-[11px]", overdue ? "text-zg-warning" : due ? "text-zg-fg" : "text-zg-muted")}>
                      {overdue ? copy.overdue : due ? copy.dueToday : copy.nextFollowUp}
                    </p>
                  ) : null}
                </div>
              </div>
              <p className="mt-3 text-xs text-zg-muted">
                {copy.addedAt} {new Date(prospect.createdAt).toLocaleDateString(dateLocale)}
                {prospect.fitScore != null ? ` · ${copy.fit} ${prospect.fitScore}` : ""}
              </p>
              {prospect.whyFit ? (
                <p className="mt-3 text-sm leading-relaxed text-zg-text-secondary">{prospect.whyFit}</p>
              ) : null}
            </section>

            <section>
              <h3 className="text-[11px] font-semibold uppercase tracking-[0.14em] text-zg-muted">{copy.notes}</h3>
              <Textarea
                className="mt-3"
                rows={4}
                value={draft.notes}
                onChange={(e) => onChange({ ...draft, notes: e.target.value })}
                placeholder={copy.notes}
              />
            </section>

            <Button type="submit" disabled={pending} className="w-full">
              {copy.saveChanges}
            </Button>
          </form>

          <section className="border-t border-white/[0.06] px-6 py-6">
            <h3 className="text-[11px] font-semibold uppercase tracking-[0.14em] text-zg-muted">{copy.quickActions}</h3>
            <div className="mt-3 flex flex-wrap gap-2">
              <Button type="button" size="sm" variant="secondary" disabled={pending} onClick={onMarkContacted}>
                {copy.markContacted}
              </Button>
              <Button type="button" size="sm" variant="secondary" disabled={pending} onClick={onCloseProspect}>
                {copy.closeProspect}
              </Button>
              <Button
                type="button"
                size="sm"
                variant="ghost"
                disabled={pending}
                onClick={() => {
                  if (window.confirm(copy.deleteConfirm)) onDelete();
                }}
              >
                {copy.deleteProspect}
              </Button>
            </div>
            <div className="mt-4 flex gap-2">
              <Input
                value={note}
                onChange={(event) => setNote(event.target.value)}
                placeholder={copy.notePlaceholder}
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    event.preventDefault();
                    submitNote();
                  }
                }}
              />
              <Button type="button" size="sm" variant="secondary" disabled={pending || !note.trim()} onClick={submitNote}>
                {copy.saveNote}
              </Button>
            </div>
          </section>

          <section className="border-t border-white/[0.06] px-6 py-6">
            <h3 className="text-[11px] font-semibold uppercase tracking-[0.14em] text-zg-muted">{copy.history}</h3>
            {events.length ? (
              <ol className="mt-4 space-y-4">
                {events.map((event) => (
                  <li key={event.id} className="relative border-l border-white/[0.08] pl-4">
                    <span className="absolute -left-[3px] top-1.5 h-1.5 w-1.5 rounded-full bg-white/35" />
                    <p className="text-[11px] text-zg-muted">
                      {new Date(event.createdAt).toLocaleDateString(dateLocale, {
                        day: "numeric",
                        month: "long",
                      })}
                      {event.eventType === "contact" && channelLabel(event, copy)
                        ? ` · ${channelLabel(event, copy)}`
                        : ""}
                    </p>
                    <p className="mt-0.5 text-sm text-zg-fg">
                      {event.eventType === "contact" && event.detail
                        ? event.detail
                        : eventTitle(event, copy, labels)}
                    </p>
                    {event.detail && event.eventType !== "status_change" && event.eventType !== "created" && event.eventType !== "contact" ? (
                      <p className="mt-1 text-sm leading-relaxed text-zg-text-secondary">{event.detail}</p>
                    ) : event.eventType === "created" && event.detail && !/agent/i.test(event.detail) ? (
                      <p className="mt-1 text-sm text-zg-text-secondary">{event.detail}</p>
                    ) : null}
                  </li>
                ))}
              </ol>
            ) : (
              <p className="mt-3 text-sm text-zg-muted">{copy.noHistory}</p>
            )}
          </section>
        </div>
      </aside>
    </div>
  );
}
