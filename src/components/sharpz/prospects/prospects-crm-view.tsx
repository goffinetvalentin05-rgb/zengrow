"use client";

import { FormEvent, useMemo, useState } from "react";
import { Search, Users } from "lucide-react";
import { useRouter } from "next/navigation";
import PageHeader from "@/src/components/dashboard/page-header";
import DashboardContent from "@/src/components/dashboard/ui/dashboard-content";
import Button from "@/src/components/ui/button";
import Input from "@/src/components/ui/input";
import Select from "@/src/components/ui/select";
import Textarea from "@/src/components/ui/textarea";
import { SharpzEmptyPanel } from "@/src/components/sharpz/empty-panel";
import { ProspectDetailPanel, type ProspectDraft } from "@/src/components/sharpz/prospects/prospect-detail-panel";
import { ProspectsKanban } from "@/src/components/sharpz/prospects/prospects-kanban";
import { useDashboardI18n } from "@/src/components/dashboard/i18n/dashboard-locale-provider";
import { useDashboardToast } from "@/src/components/dashboard/dashboard-toast-provider";
import { useCopilot } from "@/src/components/sharpz/copilot/copilot-context";
import { SHARPZ_ROUTES } from "@/src/lib/sharpz/routes";
import { PIPELINE_STATUSES, isPipelineStatus } from "@/src/lib/sharpz/prospects-pipeline";
import type { Prospect, ProspectEvent, ProspectStatus, ProspectType } from "@/src/lib/sharpz/types";

const EMPTY_DRAFT: ProspectDraft = {
  type: "company",
  name: "",
  company: "",
  email: "",
  phone: "",
  url: "",
  source: "",
  lastAction: "",
  contactedAt: "",
  nextFollowUpAt: "",
  notes: "",
  status: "to_contact",
};

function dateInput(value: string | null) {
  return value ? value.slice(0, 10) : "";
}

function draftFromProspect(item: Prospect): ProspectDraft {
  return {
    type: item.type,
    name: item.name ?? item.contact ?? "",
    company: item.company,
    email: item.email ?? "",
    phone: item.phone ?? "",
    url: item.url ?? "",
    source: item.source ?? "",
    lastAction: item.lastAction ?? "",
    contactedAt: dateInput(item.contactedAt),
    nextFollowUpAt: dateInput(item.nextFollowUpAt),
    notes: item.notes ?? "",
    status: isPipelineStatus(item.status) ? item.status : "to_contact",
  };
}

type Props = {
  prospects: Prospect[];
  eventsByProspect: Record<string, ProspectEvent[]>;
};

export function ProspectsCrmView({ prospects, eventsByProspect }: Props) {
  const { t, locale } = useDashboardI18n();
  const router = useRouter();
  const showToast = useDashboardToast();
  const { send } = useCopilot();
  const [query, setQuery] = useState("");
  const [showCreate, setShowCreate] = useState(false);
  const [createDraft, setCreateDraft] = useState<ProspectDraft>(EMPTY_DRAFT);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [editDraft, setEditDraft] = useState<ProspectDraft | null>(null);
  const [pending, setPending] = useState(false);
  const dateLocale = locale === "en" ? "en-GB" : "fr-FR";

  const statusLabels = useMemo(
    () =>
      Object.fromEntries(
        PIPELINE_STATUSES.map((status) => [status, t.prospectStatuses[status]]),
      ) as Record<ProspectStatus, string>,
    [t.prospectStatuses],
  );

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) return prospects;
    return prospects.filter((item) =>
      [item.name, item.company, item.email, item.phone, item.url, item.source, item.notes]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(needle)),
    );
  }, [prospects, query]);

  const selected = selectedId ? prospects.find((item) => item.id === selectedId) : null;

  async function createProspect(event: FormEvent) {
    event.preventDefault();
    const company = createDraft.company.trim() || createDraft.name.trim();
    if (!company) return;
    setPending(true);
    const response = await fetch("/api/sharpz/prospects", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        prospects: [
          {
            ...createDraft,
            company,
            contactedAt: createDraft.contactedAt || null,
            nextFollowUpAt: createDraft.nextFollowUpAt || null,
          },
        ],
      }),
    });
    setPending(false);
    if (!response.ok) {
      const data = (await response.json().catch(() => null)) as { error?: string } | null;
      showToast({ message: data?.error ?? t.common.error });
      return;
    }
    setCreateDraft(EMPTY_DRAFT);
    setShowCreate(false);
    showToast({ message: t.common.saved });
    router.refresh();
  }

  async function patchProspect(id: string, patch: Record<string, unknown>) {
    setPending(true);
    const response = await fetch(`/api/sharpz/prospects/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(patch),
    });
    setPending(false);
    if (!response.ok) {
      const data = (await response.json().catch(() => null)) as { error?: string } | null;
      showToast({ message: data?.error ?? t.common.error });
      return false;
    }
    router.refresh();
    return true;
  }

  function openProspect(item: Prospect) {
    setSelectedId(item.id);
    setEditDraft(draftFromProspect(item));
  }

  async function saveSelected() {
    if (!selectedId || !editDraft) return;
    const saved = await patchProspect(selectedId, {
      ...editDraft,
      company: editDraft.company.trim() || editDraft.name.trim(),
      contactedAt: editDraft.contactedAt || null,
      nextFollowUpAt: editDraft.nextFollowUpAt || null,
    });
    if (saved) showToast({ message: t.common.saved });
  }

  function askAgent() {
    void send(t.today.suggestionProspectsPrompt);
    router.push(SHARPZ_ROUTES.agent);
  }

  return (
    <DashboardContent width="wide" className="space-y-8 pb-8">
      <PageHeader title={t.prospectsPage.title} subtitle={t.prospectsPage.subtitle}>
        <div className="flex flex-wrap gap-2">
          <Button type="button" variant="secondary" onClick={askAgent}>
            {t.prospectsPage.askAgent}
          </Button>
          <Button type="button" onClick={() => setShowCreate((current) => !current)}>
            {t.prospectsPage.add}
          </Button>
        </div>
      </PageHeader>

      <div className="rounded-xl border border-white/[0.07] bg-white/[0.02] px-4 py-3 text-xs text-zg-text-secondary">
        {t.prospectsPage.searchUnavailable}
      </div>

      {showCreate ? (
        <form onSubmit={createProspect} className="rounded-2xl border border-white/[0.08] bg-white/[0.025] p-5">
          <CreateFields
            draft={createDraft}
            onChange={setCreateDraft}
            t={t}
          />
          <div className="mt-4 flex gap-2">
            <Button type="submit" disabled={pending}>
              {pending ? t.prospectsPage.adding : t.prospectsPage.add}
            </Button>
            <Button type="button" variant="ghost" onClick={() => setShowCreate(false)}>
              {t.common.cancel}
            </Button>
          </div>
        </form>
      ) : null}

      <div className="relative max-w-md">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zg-muted" />
        <Input
          className="pl-9"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder={t.prospectsPage.search}
        />
      </div>

      <p className="text-xs text-zg-muted">{t.prospectsPage.kanbanHint}</p>

      {filtered.length ? (
        <ProspectsKanban
          prospects={filtered}
          labels={statusLabels}
          dateLocale={dateLocale}
          pending={pending}
          onSelect={openProspect}
          onMove={(id, status) => void patchProspect(id, { status })}
        />
      ) : (
        <SharpzEmptyPanel title={t.empty.noProspectsTitle} description={t.empty.noProspectsDescription} icon={Users} />
      )}

      {selected && editDraft ? (
        <ProspectDetailPanel
          prospect={selected}
          draft={editDraft}
          events={eventsByProspect[selected.id] ?? []}
          labels={statusLabels}
          dateLocale={dateLocale}
          pending={pending}
          copy={{
            details: t.prospectsPage.details,
            saveChanges: t.prospectsPage.saveChanges,
            cancel: t.common.cancel,
            history: t.prospectsPage.history,
            noHistory: t.prospectsPage.noHistory,
            name: t.prospectsPage.name,
            company: t.prospectsPage.company,
            email: t.prospectsPage.email,
            phone: t.prospectsPage.phone,
            url: t.prospectsPage.url,
            source: t.prospectsPage.source,
            lastAction: t.prospectsPage.lastAction,
            contactedAt: t.prospectsPage.contactedAt,
            nextFollowUp: t.prospectsPage.nextFollowUp,
            notes: t.prospectsPage.notes,
            companyType: t.prospectsPage.company,
            individualType: t.prospectsPage.individual,
            status: t.common.status,
          }}
          onClose={() => {
            setSelectedId(null);
            setEditDraft(null);
          }}
          onChange={setEditDraft}
          onSave={() => void saveSelected()}
        />
      ) : null}
    </DashboardContent>
  );
}

function CreateFields({
  draft,
  onChange,
  t,
}: {
  draft: ProspectDraft;
  onChange: (draft: ProspectDraft) => void;
  t: ReturnType<typeof useDashboardI18n>["t"];
}) {
  return (
    <>
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        <Select
          value={draft.type}
          onChange={(event) => onChange({ ...draft, type: event.target.value as ProspectType })}
        >
          <option value="company">{t.prospectsPage.company}</option>
          <option value="individual">{t.prospectsPage.individual}</option>
        </Select>
        <Input value={draft.name} onChange={(e) => onChange({ ...draft, name: e.target.value })} placeholder={t.prospectsPage.name} />
        <Input value={draft.company} onChange={(e) => onChange({ ...draft, company: e.target.value })} placeholder={t.prospectsPage.company} />
        <Input type="email" value={draft.email} onChange={(e) => onChange({ ...draft, email: e.target.value })} placeholder={t.prospectsPage.email} />
        <Input value={draft.phone} onChange={(e) => onChange({ ...draft, phone: e.target.value })} placeholder={t.prospectsPage.phone} />
        <Input value={draft.url} onChange={(e) => onChange({ ...draft, url: e.target.value })} placeholder={t.prospectsPage.url} />
        <Input value={draft.source} onChange={(e) => onChange({ ...draft, source: e.target.value })} placeholder={t.prospectsPage.source} />
        <Input type="date" value={draft.nextFollowUpAt} onChange={(e) => onChange({ ...draft, nextFollowUpAt: e.target.value })} aria-label={t.prospectsPage.nextFollowUp} />
      </div>
      <Textarea rows={2} className="mt-3" value={draft.notes} onChange={(e) => onChange({ ...draft, notes: e.target.value })} placeholder={t.prospectsPage.notes} />
    </>
  );
}
