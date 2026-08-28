"use client";

import { FormEvent } from "react";
import { X } from "lucide-react";
import Button from "@/src/components/ui/button";
import Input from "@/src/components/ui/input";
import Select from "@/src/components/ui/select";
import Textarea from "@/src/components/ui/textarea";
import { PIPELINE_STATUSES } from "@/src/lib/sharpz/prospects-pipeline";
import type { Prospect, ProspectEvent, ProspectStatus } from "@/src/lib/sharpz/types";

type ProspectDraft = {
  type: Prospect["type"];
  name: string;
  company: string;
  email: string;
  phone: string;
  url: string;
  source: string;
  lastAction: string;
  contactedAt: string;
  nextFollowUpAt: string;
  notes: string;
  status: ProspectStatus;
};

type Props = {
  prospect: Prospect;
  draft: ProspectDraft;
  events: ProspectEvent[];
  labels: Record<ProspectStatus, string>;
  dateLocale: string;
  pending: boolean;
  copy: {
    details: string;
    saveChanges: string;
    cancel: string;
    history: string;
    noHistory: string;
    name: string;
    company: string;
    email: string;
    phone: string;
    url: string;
    source: string;
    lastAction: string;
    contactedAt: string;
    nextFollowUp: string;
    notes: string;
    companyType: string;
    individualType: string;
    status: string;
  };
  onClose: () => void;
  onChange: (draft: ProspectDraft) => void;
  onSave: () => void;
};

export function ProspectDetailPanel({
  prospect,
  draft,
  events,
  labels,
  dateLocale,
  pending,
  copy,
  onClose,
  onChange,
  onSave,
}: Props) {
  function onSubmit(event: FormEvent) {
    event.preventDefault();
    onSave();
  }

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <button type="button" className="absolute inset-0 bg-black/60" onClick={onClose} aria-label={copy.cancel} />
      <aside className="relative flex h-full w-full max-w-md flex-col border-l border-white/[0.08] bg-zg-sidebar-bg shadow-2xl">
        <div className="flex items-center justify-between border-b border-white/[0.07] px-5 py-4">
          <div className="min-w-0">
            <p className="text-[11px] uppercase tracking-[0.14em] text-zg-muted">{copy.details}</p>
            <h2 className="mt-1 truncate text-lg font-semibold text-zg-fg">{prospect.name || prospect.company}</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-zg-muted hover:bg-white/[0.05] hover:text-zg-fg"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={onSubmit} className="flex min-h-0 flex-1 flex-col overflow-y-auto">
          <div className="space-y-3 p-5">
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
            <Select
              value={draft.type}
              onChange={(event) => onChange({ ...draft, type: event.target.value as Prospect["type"] })}
            >
              <option value="company">{copy.companyType}</option>
              <option value="individual">{copy.individualType}</option>
            </Select>
            <Input value={draft.name} onChange={(e) => onChange({ ...draft, name: e.target.value })} placeholder={copy.name} />
            <Input value={draft.company} onChange={(e) => onChange({ ...draft, company: e.target.value })} placeholder={copy.company} />
            <Input type="email" value={draft.email} onChange={(e) => onChange({ ...draft, email: e.target.value })} placeholder={copy.email} />
            <Input value={draft.phone} onChange={(e) => onChange({ ...draft, phone: e.target.value })} placeholder={copy.phone} />
            <Input value={draft.url} onChange={(e) => onChange({ ...draft, url: e.target.value })} placeholder={copy.url} />
            <Input value={draft.source} onChange={(e) => onChange({ ...draft, source: e.target.value })} placeholder={copy.source} />
            <Input type="date" value={draft.contactedAt} onChange={(e) => onChange({ ...draft, contactedAt: e.target.value })} aria-label={copy.contactedAt} />
            <Input type="date" value={draft.nextFollowUpAt} onChange={(e) => onChange({ ...draft, nextFollowUpAt: e.target.value })} aria-label={copy.nextFollowUp} />
            <Input value={draft.lastAction} onChange={(e) => onChange({ ...draft, lastAction: e.target.value })} placeholder={copy.lastAction} />
            <Textarea rows={3} value={draft.notes} onChange={(e) => onChange({ ...draft, notes: e.target.value })} placeholder={copy.notes} />
          </div>

          <div className="border-t border-white/[0.07] p-5">
            <h3 className="text-sm font-semibold text-zg-fg">{copy.history}</h3>
            {events.length ? (
              <ul className="mt-3 space-y-3">
                {events.map((event) => (
                  <li key={event.id} className="border-l border-white/10 pl-3">
                    <p className="text-xs text-zg-muted">
                      {new Date(event.createdAt).toLocaleString(dateLocale)}
                    </p>
                    <p className="mt-0.5 text-sm text-zg-text-secondary">{event.detail || event.eventType}</p>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-3 text-sm text-zg-muted">{copy.noHistory}</p>
            )}
          </div>

          <div className="mt-auto border-t border-white/[0.07] p-5">
            <Button type="submit" disabled={pending} className="w-full">
              {copy.saveChanges}
            </Button>
          </div>
        </form>
      </aside>
    </div>
  );
}

export type { ProspectDraft };
