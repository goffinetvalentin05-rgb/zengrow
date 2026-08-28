"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { FileText, LayoutGrid, List, Plus, Search, Users } from "lucide-react";
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
import { ProspectsList } from "@/src/components/sharpz/prospects/prospects-list";
import { ProspectScriptsView } from "@/src/components/sharpz/prospects/prospect-scripts-view";
import { useDashboardI18n } from "@/src/components/dashboard/i18n/dashboard-locale-provider";
import { useDashboardToast } from "@/src/components/dashboard/dashboard-toast-provider";
import { useCopilot } from "@/src/components/sharpz/copilot/copilot-context";
import { useIsMdUp } from "@/src/hooks/use-is-md-up";
import { SHARPZ_ROUTES } from "@/src/lib/sharpz/routes";
import {
  PIPELINE_STATUSES,
  isActivePipelineStatus,
  isFollowUpOverdue,
  isFollowUpToday,
  isPipelineStatus,
} from "@/src/lib/sharpz/prospects-pipeline";
import type { OutreachSaasContext, ProspectScript } from "@/src/lib/sharpz/outreach";
import type { Prospect, ProspectEvent, ProspectStatus, ProspectType } from "@/src/lib/sharpz/types";
import { cn } from "@/src/lib/utils";

const EMPTY_DRAFT: ProspectDraft = {
  type: "company",
  name: "",
  company: "",
  email: "",
  phone: "",
  url: "",
  linkedinUrl: "",
  instagramUrl: "",
  contact: "",
  source: "",
  lastAction: "",
  contactedAt: "",
  nextFollowUpAt: "",
  notes: "",
  status: "to_contact",
};

type QuickFilter = "all" | "due" | "overdue" | "customers";
type FitFilter = "all" | "high" | "mid" | "none";
type ViewMode = "pipeline" | "list" | "scripts";

function fill(template: string, vars: Record<string, string | number>) {
  return Object.entries(vars).reduce(
    (text, [key, value]) => text.replaceAll(`{${key}}`, String(value)),
    template,
  );
}

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
    linkedinUrl: item.linkedinUrl ?? "",
    instagramUrl: item.instagramUrl ?? "",
    contact: item.contact ?? "",
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
  scripts: ProspectScript[];
  saas: OutreachSaasContext | null;
};

export function ProspectsCrmView({ prospects, eventsByProspect, scripts: initialScripts, saas }: Props) {
  const { t, locale } = useDashboardI18n();
  const router = useRouter();
  const showToast = useDashboardToast();
  const { send } = useCopilot();
  const isMdUp = useIsMdUp();
  const dateLocale = locale === "en" ? "en-GB" : "fr-FR";

  const [items, setItems] = useState(prospects);
  const [scriptItems, setScriptItems] = useState(initialScripts);
  const [eventsMap, setEventsMap] = useState(eventsByProspect);
  const [query, setQuery] = useState("");
  const [quick, setQuick] = useState<QuickFilter>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [sourceFilter, setSourceFilter] = useState<string>("all");
  const [fitFilter, setFitFilter] = useState<FitFilter>("all");
  const [view, setView] = useState<ViewMode | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [createDraft, setCreateDraft] = useState<ProspectDraft>(EMPTY_DRAFT);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [editDraft, setEditDraft] = useState<ProspectDraft | null>(null);
  const [pending, setPending] = useState(false);

  useEffect(() => {
    setItems(prospects);
  }, [prospects]);

  useEffect(() => {
    setScriptItems(initialScripts);
  }, [initialScripts]);

  useEffect(() => {
    setEventsMap(eventsByProspect);
  }, [eventsByProspect]);

  const resolvedView: ViewMode = view ?? (isMdUp ? "pipeline" : "list");

  const statusLabels = useMemo(
    () =>
      Object.fromEntries(
        PIPELINE_STATUSES.map((status) => [status, t.prospectStatuses[status]]),
      ) as Record<ProspectStatus, string>,
    [t.prospectStatuses],
  );

  const sources = useMemo(
    () =>
      Array.from(new Set(items.map((item) => item.source?.trim()).filter(Boolean) as string[])).sort(),
    [items],
  );

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return items.filter((item) => {
      if (needle) {
        const hay = [item.name, item.company, item.email, item.phone, item.url, item.source, item.notes, item.contact]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();
        if (!hay.includes(needle)) return false;
      }
      if (quick === "due" && !isFollowUpToday(item.nextFollowUpAt)) return false;
      if (quick === "overdue" && !isFollowUpOverdue(item.nextFollowUpAt)) return false;
      if (quick === "customers" && item.status !== "customer") return false;
      if (statusFilter !== "all" && item.status !== statusFilter) return false;
      if (typeFilter !== "all" && item.type !== typeFilter) return false;
      if (sourceFilter !== "all" && item.source !== sourceFilter) return false;
      if (fitFilter === "high" && (item.fitScore == null || item.fitScore < 70)) return false;
      if (fitFilter === "mid" && (item.fitScore == null || item.fitScore < 50)) return false;
      if (fitFilter === "none" && item.fitScore != null) return false;
      return true;
    });
  }, [items, query, quick, statusFilter, typeFilter, sourceFilter, fitFilter]);

  const kpis = useMemo(() => {
    const followed = items.filter((item) => isActivePipelineStatus(String(item.status))).length;
    const dueToday = items.filter((item) => isFollowUpToday(item.nextFollowUpAt)).length;
    const discussion = items.filter((item) => item.status === "in_discussion").length;
    const customers = items.filter((item) => item.status === "customer").length;
    const closed = items.filter((item) => item.status === "closed").length;
    const conversionBase = customers + closed;
    const conversion = conversionBase > 0 ? Math.round((customers / conversionBase) * 100) : null;
    return { followed, dueToday, discussion, customers, conversion };
  }, [items]);

  const selected = selectedId ? items.find((item) => item.id === selectedId) : null;

  async function patchProspect(id: string, patch: Record<string, unknown>, options?: { toast?: string }) {
    const response = await fetch(`/api/sharpz/prospects/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(patch),
    });
    if (!response.ok) {
      const data = (await response.json().catch(() => null)) as { error?: string } | null;
      showToast({ message: data?.error ?? t.common.error });
      return false;
    }
    if (options?.toast) showToast({ message: options.toast, durationMs: 2200 });
    router.refresh();
    return true;
  }

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

  async function moveProspect(id: string, status: ProspectStatus) {
    const snapshot = items;
    setItems((current) => current.map((item) => (item.id === id ? { ...item, status } : item)));
    const ok = await patchProspect(id, { status }, {
      toast: fill(t.prospectsPage.movedTo, { status: statusLabels[status] }),
    });
    if (!ok) setItems(snapshot);
  }

  function openProspect(item: Prospect) {
    setSelectedId(item.id);
    setEditDraft(draftFromProspect(item));
  }

  async function saveSelected() {
    if (!selectedId || !editDraft) return;
    setPending(true);
    const saved = await patchProspect(selectedId, {
      ...editDraft,
      company: editDraft.company.trim() || editDraft.name.trim(),
      contactedAt: editDraft.contactedAt || null,
      nextFollowUpAt: editDraft.nextFollowUpAt || null,
    });
    setPending(false);
    if (saved) showToast({ message: t.common.saved });
  }

  async function markContacted() {
    if (!selected) return;
    setPending(true);
    const raw = String(selected.status);
    const nextStatus: ProspectStatus =
      raw === "to_contact" ? "follow_up_1" : isPipelineStatus(raw) ? raw : "to_contact";
    const saved = await patchProspect(selected.id, {
      contactedAt: new Date().toISOString(),
      lastAction: t.prospectsPage.markedContacted,
      status: nextStatus,
    });
    setPending(false);
    if (saved) {
      setEditDraft((current) =>
        current
          ? {
              ...current,
              contactedAt: dateInput(new Date().toISOString()),
              lastAction: t.prospectsPage.markedContacted,
              status: nextStatus,
            }
          : current,
      );
      showToast({ message: t.common.saved });
    }
  }

  async function addNote(note: string) {
    if (!selected) return;
    const nextNotes = [selected.notes?.trim(), note].filter(Boolean).join("\n\n");
    setPending(true);
    const saved = await patchProspect(selected.id, { notes: nextNotes });
    setPending(false);
    if (saved) {
      setEditDraft((current) => (current ? { ...current, notes: nextNotes } : current));
      showToast({ message: t.common.saved });
    }
  }

  async function closeProspect() {
    if (!selectedId) return;
    setPending(true);
    const saved = await patchProspect(selectedId, { status: "closed" });
    setPending(false);
    if (saved) {
      setEditDraft((current) => (current ? { ...current, status: "closed" } : current));
      showToast({ message: fill(t.prospectsPage.movedTo, { status: statusLabels.closed }) });
    }
  }

  async function deleteProspect() {
    if (!selectedId) return;
    setPending(true);
    const response = await fetch(`/api/sharpz/prospects/${selectedId}`, { method: "DELETE" });
    setPending(false);
    if (!response.ok) {
      showToast({ message: t.common.error });
      return;
    }
    setSelectedId(null);
    setEditDraft(null);
    showToast({ message: t.common.saved });
    router.refresh();
  }

  async function scheduleFollowUp(iso: string) {
    if (!selected) return;
    setPending(true);
    const saved = await patchProspect(
      selected.id,
      { nextFollowUpAt: iso },
      { toast: t.prospectsPage.followUpScheduled },
    );
    setPending(false);
    if (saved) {
      setEditDraft((current) =>
        current ? { ...current, nextFollowUpAt: dateInput(iso) } : current,
      );
      setItems((current) =>
        current.map((item) => (item.id === selected.id ? { ...item, nextFollowUpAt: iso } : item)),
      );
    }
  }

  function handleLogged(event: ProspectEvent | null, patch: Partial<Prospect>) {
    if (!selected) return;
    if (event) {
      setEventsMap((current) => ({
        ...current,
        [selected.id]: [event, ...(current[selected.id] ?? [])],
      }));
    }
    setItems((current) =>
      current.map((item) => (item.id === selected.id ? { ...item, ...patch } : item)),
    );
    setEditDraft((current) =>
      current
        ? {
            ...current,
            lastAction: patch.lastAction ?? current.lastAction,
            contactedAt: dateInput(patch.contactedAt ?? current.contactedAt),
            status: isPipelineStatus(String(patch.status ?? current.status))
              ? (patch.status as ProspectStatus)
              : current.status,
          }
        : current,
    );
    router.refresh();
  }

  function askAgent() {
    void send(t.today.suggestionProspectsPrompt);
    router.push(SHARPZ_ROUTES.agent);
  }

  const quickFilters: { id: QuickFilter; label: string }[] = [
    { id: "all", label: t.prospectsPage.filterAll },
    { id: "due", label: t.prospectsPage.filterDueToday },
    { id: "overdue", label: t.prospectsPage.filterOverdue },
    { id: "customers", label: t.prospectsPage.filterCustomers },
  ];

  const kpiItems = [
    { label: t.prospectsPage.kpiFollowed, value: kpis.followed },
    { label: t.prospectsPage.kpiDueToday, value: kpis.dueToday },
    { label: t.prospectsPage.kpiDiscussion, value: kpis.discussion },
    { label: t.prospectsPage.kpiCustomers, value: kpis.customers },
    { label: t.prospectsPage.kpiConversion, value: kpis.conversion != null ? `${kpis.conversion}%` : "—" },
  ];

  return (
    <DashboardContent width="wide" className="space-y-7 pb-8">
      <PageHeader
        kicker={t.nav.prospects}
        title={t.prospectsPage.title}
        subtitle={t.prospectsPage.subtitle}
        primaryAction={{
          kind: "button",
          label: t.prospectsPage.newProspect,
          icon: <Plus className="h-4 w-4" />,
          onClick: () => setShowCreate(true),
        }}
        secondaryActions={[{ kind: "button", label: t.prospectsPage.askAgent, onClick: askAgent }]}
      />

      <section className="zg-surface-panel grid grid-cols-2 divide-x divide-y divide-white/[0.06] overflow-hidden sm:grid-cols-5 sm:divide-y-0">
        {kpiItems.map((item) => (
          <div key={item.label} className="px-5 py-4">
            <p className="text-[11px] text-zg-muted">{item.label}</p>
            <p className="mt-1.5 text-xl font-semibold tabular-nums tracking-tight text-zg-fg">{item.value}</p>
          </div>
        ))}
      </section>

      <div className="flex flex-col gap-3">
        <div className="flex flex-wrap items-center gap-2">
          {resolvedView !== "scripts"
            ? quickFilters.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setQuick(item.id)}
                  className={cn(
                    "rounded-full border px-3 py-1.5 text-[12px] transition-colors",
                    quick === item.id
                      ? "border-white/15 bg-white/[0.08] text-zg-fg"
                      : "border-white/[0.07] text-zg-text-secondary hover:border-white/12 hover:text-zg-fg",
                  )}
                >
                  {item.label}
                </button>
              ))
            : (
                <p className="text-sm text-zg-text-secondary">{t.prospectsPage.scriptsSubtitle}</p>
              )}
          <div className="ml-auto flex rounded-full border border-white/[0.08] p-0.5">
            <button
              type="button"
              onClick={() => setView("pipeline")}
              className={cn(
                "inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[12px]",
                resolvedView === "pipeline" ? "bg-white/[0.08] text-zg-fg" : "text-zg-muted hover:text-zg-fg",
              )}
            >
              <LayoutGrid className="h-3.5 w-3.5" />
              {t.prospectsPage.viewPipeline}
            </button>
            <button
              type="button"
              onClick={() => setView("list")}
              className={cn(
                "inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[12px]",
                resolvedView === "list" ? "bg-white/[0.08] text-zg-fg" : "text-zg-muted hover:text-zg-fg",
              )}
            >
              <List className="h-3.5 w-3.5" />
              {t.prospectsPage.viewList}
            </button>
            <button
              type="button"
              onClick={() => setView("scripts")}
              className={cn(
                "inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[12px]",
                resolvedView === "scripts" ? "bg-white/[0.08] text-zg-fg" : "text-zg-muted hover:text-zg-fg",
              )}
            >
              <FileText className="h-3.5 w-3.5" />
              {t.prospectsPage.viewScripts}
            </button>
          </div>
        </div>

        {resolvedView !== "scripts" ? (
        <div className="grid gap-2 md:grid-cols-[minmax(0,1.2fr)_repeat(4,minmax(0,0.7fr))]">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zg-muted" />
            <Input
              className="pl-9"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder={t.prospectsPage.search}
            />
          </div>
          <Select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)} aria-label={t.prospectsPage.filterStatus}>
            <option value="all">{t.prospectsPage.allStatuses}</option>
            {PIPELINE_STATUSES.map((status) => (
              <option key={status} value={status}>
                {statusLabels[status]}
              </option>
            ))}
          </Select>
          <Select value={typeFilter} onChange={(event) => setTypeFilter(event.target.value)} aria-label={t.prospectsPage.filterType}>
            <option value="all">{t.prospectsPage.allTypes}</option>
            <option value="company">{t.prospectsPage.company}</option>
            <option value="individual">{t.prospectsPage.individual}</option>
          </Select>
          <Select value={sourceFilter} onChange={(event) => setSourceFilter(event.target.value)} aria-label={t.prospectsPage.filterSource}>
            <option value="all">{t.prospectsPage.allSources}</option>
            {sources.map((source) => (
              <option key={source} value={source}>
                {source}
              </option>
            ))}
          </Select>
          <Select value={fitFilter} onChange={(event) => setFitFilter(event.target.value as FitFilter)} aria-label={t.prospectsPage.filterFit}>
            <option value="all">{t.prospectsPage.filterFitAll}</option>
            <option value="high">{t.prospectsPage.filterFitHigh}</option>
            <option value="mid">{t.prospectsPage.filterFitMid}</option>
            <option value="none">{t.prospectsPage.filterFitNone}</option>
          </Select>
        </div>
        ) : null}
      </div>

      {resolvedView === "scripts" ? (
        <ProspectScriptsView scripts={scriptItems} onChange={setScriptItems} />
      ) : filtered.length ? (
        resolvedView === "pipeline" ? (
          <ProspectsKanban
            prospects={filtered}
            statusLabels={statusLabels}
            dateLocale={dateLocale}
            copy={{
              company: t.prospectsPage.company,
              individual: t.prospectsPage.individual,
              lastContact: t.prospectsPage.lastContact,
              fit: t.prospectsPage.fit,
              dueToday: t.prospectsPage.dueToday,
              overdue: t.prospectsPage.overdue,
            }}
            onSelect={openProspect}
            onMove={(id, status) => void moveProspect(id, status)}
          />
        ) : (
          <ProspectsList
            prospects={filtered}
            statusLabels={statusLabels}
            dateLocale={dateLocale}
            copy={{
              listName: t.prospectsPage.listName,
              listCompany: t.prospectsPage.listCompany,
              listContact: t.prospectsPage.listContact,
              listStatus: t.prospectsPage.listStatus,
              listFollowUp: t.prospectsPage.listFollowUp,
              listFit: t.prospectsPage.listFit,
              overdue: t.prospectsPage.overdue,
              dueToday: t.prospectsPage.dueToday,
            }}
            onSelect={openProspect}
          />
        )
      ) : items.length ? (
        <p className="py-10 text-center text-sm text-zg-muted">{t.prospectsPage.noProspectsFiltered}</p>
      ) : (
        <SharpzEmptyPanel title={t.empty.noProspectsTitle} description={t.empty.noProspectsDescription} icon={Users} />
      )}

      {showCreate ? (
        <div className="fixed inset-0 z-50 flex items-end justify-center p-4 sm:items-center">
          <button type="button" className="absolute inset-0 bg-black/55" onClick={() => setShowCreate(false)} />
          <form
            onSubmit={createProspect}
            className="relative w-full max-w-xl rounded-2xl border border-white/[0.08] bg-[#0d0c12] p-6 shadow-[0_24px_80px_-28px_rgba(0,0,0,0.9)]"
          >
            <h2 className="text-lg font-semibold text-zg-fg">{t.prospectsPage.newProspect}</h2>
            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              <Select
                value={createDraft.type}
                onChange={(event) => setCreateDraft({ ...createDraft, type: event.target.value as ProspectType })}
              >
                <option value="company">{t.prospectsPage.company}</option>
                <option value="individual">{t.prospectsPage.individual}</option>
              </Select>
              <Select
                value={createDraft.status}
                onChange={(event) => setCreateDraft({ ...createDraft, status: event.target.value as ProspectStatus })}
              >
                {PIPELINE_STATUSES.map((status) => (
                  <option key={status} value={status}>
                    {statusLabels[status]}
                  </option>
                ))}
              </Select>
              <Input value={createDraft.name} onChange={(e) => setCreateDraft({ ...createDraft, name: e.target.value })} placeholder={t.prospectsPage.name} />
              <Input value={createDraft.company} onChange={(e) => setCreateDraft({ ...createDraft, company: e.target.value })} placeholder={t.prospectsPage.company} />
              <Input type="email" value={createDraft.email} onChange={(e) => setCreateDraft({ ...createDraft, email: e.target.value })} placeholder={t.prospectsPage.email} />
              <Input value={createDraft.phone} onChange={(e) => setCreateDraft({ ...createDraft, phone: e.target.value })} placeholder={t.prospectsPage.phone} />
              <Input value={createDraft.url} onChange={(e) => setCreateDraft({ ...createDraft, url: e.target.value })} placeholder={t.prospectsPage.url} />
              <Input value={createDraft.linkedinUrl} onChange={(e) => setCreateDraft({ ...createDraft, linkedinUrl: e.target.value })} placeholder={t.prospectsPage.linkedinUrl} />
              <Input value={createDraft.instagramUrl} onChange={(e) => setCreateDraft({ ...createDraft, instagramUrl: e.target.value })} placeholder={t.prospectsPage.instagramUrl} />
              <Input value={createDraft.source} onChange={(e) => setCreateDraft({ ...createDraft, source: e.target.value })} placeholder={t.prospectsPage.source} />
            </div>
            <Textarea
              className="mt-3"
              rows={3}
              value={createDraft.notes}
              onChange={(e) => setCreateDraft({ ...createDraft, notes: e.target.value })}
              placeholder={t.prospectsPage.notes}
            />
            <div className="mt-5 flex justify-end gap-2">
              <Button type="button" variant="ghost" onClick={() => setShowCreate(false)}>
                {t.common.cancel}
              </Button>
              <Button type="submit" disabled={pending}>
                {pending ? t.prospectsPage.adding : t.prospectsPage.add}
              </Button>
            </div>
          </form>
        </div>
      ) : null}

      {selected && editDraft ? (
        <ProspectDetailPanel
          prospect={selected}
          draft={editDraft}
          events={eventsMap[selected.id] ?? []}
          scripts={scriptItems}
          saas={saas}
          labels={statusLabels}
          dateLocale={dateLocale}
          pending={pending}
          copy={{
            details: t.prospectsPage.details,
            identity: t.prospectsPage.identity,
            tracking: t.prospectsPage.tracking,
            notes: t.prospectsPage.notes,
            history: t.prospectsPage.history,
            noHistory: t.prospectsPage.noHistory,
            quickActions: t.prospectsPage.quickActions,
            saveChanges: t.prospectsPage.saveChanges,
            cancel: t.common.cancel,
            name: t.prospectsPage.name,
            company: t.prospectsPage.company,
            email: t.prospectsPage.email,
            phone: t.prospectsPage.phone,
            url: t.prospectsPage.url,
            contact: t.prospectsPage.contact,
            source: t.prospectsPage.source,
            lastAction: t.prospectsPage.lastAction,
            contactedAt: t.prospectsPage.contactedAt,
            nextFollowUp: t.prospectsPage.nextFollowUp,
            companyType: t.prospectsPage.company,
            individualType: t.prospectsPage.individual,
            status: t.common.status,
            website: t.prospectsPage.website,
            addedAt: t.prospectsPage.addedAt,
            fit: t.prospectsPage.fit,
            markContacted: t.prospectsPage.markContacted,
            scheduleFollowUp: t.prospectsPage.scheduleFollowUp,
            addNote: t.prospectsPage.addNote,
            closeProspect: t.prospectsPage.closeProspect,
            deleteProspect: t.prospectsPage.deleteProspect,
            deleteConfirm: t.prospectsPage.deleteConfirm,
            notePlaceholder: t.prospectsPage.notePlaceholder,
            saveNote: t.prospectsPage.saveNote,
            eventCreated: t.prospectsPage.eventCreated,
            eventCreatedByAgent: t.prospectsPage.eventCreatedByAgent,
            eventFoundByOrion: t.prospectsPage.eventFoundByOrion,
            eventStatus: t.prospectsPage.eventStatus,
            eventNote: t.prospectsPage.eventNote,
            eventContact: t.prospectsPage.eventContact,
            dueToday: t.prospectsPage.dueToday,
            overdue: t.prospectsPage.overdue,
            linkedinUrl: t.prospectsPage.linkedinUrl,
            instagramUrl: t.prospectsPage.instagramUrl,
            channelWhatsapp: t.prospectsPage.channelWhatsapp,
            channelLinkedin: t.prospectsPage.channelLinkedin,
            channelInstagram: t.prospectsPage.channelInstagram,
            channelEmail: t.prospectsPage.channelEmail,
            channelPhone: t.prospectsPage.channelPhone,
          }}
          onClose={() => {
            setSelectedId(null);
            setEditDraft(null);
          }}
          onChange={setEditDraft}
          onSave={() => void saveSelected()}
          onMarkContacted={() => void markContacted()}
          onAddNote={(note) => void addNote(note)}
          onCloseProspect={() => void closeProspect()}
          onDelete={() => void deleteProspect()}
          onLogged={handleLogged}
          onSchedule={(iso) => void scheduleFollowUp(iso)}
        />
      ) : null}
    </DashboardContent>
  );
}
