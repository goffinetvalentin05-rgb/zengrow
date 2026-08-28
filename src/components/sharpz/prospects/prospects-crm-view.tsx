"use client";

import { FormEvent, useMemo, useState } from "react";
import { Building2, ChevronDown, ChevronUp, Search, UserRound, Users } from "lucide-react";
import { useRouter } from "next/navigation";
import PageHeader from "@/src/components/dashboard/page-header";
import DashboardContent from "@/src/components/dashboard/ui/dashboard-content";
import Button from "@/src/components/ui/button";
import Input from "@/src/components/ui/input";
import Select from "@/src/components/ui/select";
import Textarea from "@/src/components/ui/textarea";
import { SharpzEmptyPanel } from "@/src/components/sharpz/empty-panel";
import { useDashboardI18n } from "@/src/components/dashboard/i18n/dashboard-locale-provider";
import { useDashboardToast } from "@/src/components/dashboard/dashboard-toast-provider";
import { useCopilot } from "@/src/components/sharpz/copilot/copilot-context";
import type { Prospect, ProspectStatus, ProspectType } from "@/src/lib/sharpz/types";

const STATUSES: ProspectStatus[] = [
  "new",
  "to_contact",
  "contacted",
  "followed_up",
  "replied",
  "qualified",
  "not_relevant",
  "closed",
];

type ProspectDraft = {
  type: ProspectType;
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
};

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
  };
}

type Props = { prospects: Prospect[] };

export function ProspectsCrmView({ prospects }: Props) {
  const { t, locale } = useDashboardI18n();
  const router = useRouter();
  const showToast = useDashboardToast();
  const { send } = useCopilot();
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [showCreate, setShowCreate] = useState(false);
  const [createDraft, setCreateDraft] = useState<ProspectDraft>(EMPTY_DRAFT);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editDraft, setEditDraft] = useState<ProspectDraft | null>(null);
  const [pending, setPending] = useState(false);
  const dateLocale = locale === "en" ? "en-GB" : "fr-FR";

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return prospects.filter((item) => {
      if (statusFilter !== "all" && item.status !== statusFilter) return false;
      if (!needle) return true;
      return [
        item.name,
        item.company,
        item.email,
        item.phone,
        item.url,
        item.source,
        item.lastAction,
        item.notes,
      ]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(needle));
    });
  }, [prospects, query, statusFilter]);

  const statusCounts = useMemo(
    () =>
      STATUSES.map((status) => ({
        status,
        count: prospects.filter((item) => item.status === status).length,
      })),
    [prospects],
  );

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

  function openEdit(item: Prospect) {
    if (editingId === item.id) {
      setEditingId(null);
      setEditDraft(null);
      return;
    }
    setEditingId(item.id);
    setEditDraft(draftFromProspect(item));
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

  async function saveEdit(id: string) {
    if (!editDraft) return;
    const saved = await patchProspect(id, {
      ...editDraft,
      company: editDraft.company.trim() || editDraft.name.trim(),
      contactedAt: editDraft.contactedAt || null,
      nextFollowUpAt: editDraft.nextFollowUpAt || null,
    });
    if (saved) {
      setEditingId(null);
      setEditDraft(null);
      showToast({ message: t.common.saved });
    }
  }

  function askAgent() {
    void send(t.today.suggestionProspectsPrompt);
    router.push("/dashboard");
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
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
            <Select
              value={createDraft.type}
              onChange={(event) =>
                setCreateDraft((current) => ({ ...current, type: event.target.value as ProspectType }))
              }
            >
              <option value="company">{t.prospectsPage.company}</option>
              <option value="individual">{t.prospectsPage.individual}</option>
            </Select>
            <Input
              value={createDraft.name}
              onChange={(event) => setCreateDraft((current) => ({ ...current, name: event.target.value }))}
              placeholder={t.prospectsPage.name}
            />
            <Input
              value={createDraft.company}
              onChange={(event) => setCreateDraft((current) => ({ ...current, company: event.target.value }))}
              placeholder={t.prospectsPage.company}
            />
            <Input
              type="email"
              value={createDraft.email}
              onChange={(event) => setCreateDraft((current) => ({ ...current, email: event.target.value }))}
              placeholder={t.prospectsPage.email}
            />
            <Input
              value={createDraft.phone}
              onChange={(event) => setCreateDraft((current) => ({ ...current, phone: event.target.value }))}
              placeholder={t.prospectsPage.phone}
            />
            <Input
              value={createDraft.url}
              onChange={(event) => setCreateDraft((current) => ({ ...current, url: event.target.value }))}
              placeholder={t.prospectsPage.url}
            />
            <Input
              value={createDraft.source}
              onChange={(event) => setCreateDraft((current) => ({ ...current, source: event.target.value }))}
              placeholder={t.prospectsPage.source}
            />
            <Input
              type="date"
              value={createDraft.nextFollowUpAt}
              onChange={(event) =>
                setCreateDraft((current) => ({ ...current, nextFollowUpAt: event.target.value }))
              }
              aria-label={t.prospectsPage.nextFollowUp}
            />
          </div>
          <Textarea
            rows={2}
            className="mt-3"
            value={createDraft.notes}
            onChange={(event) => setCreateDraft((current) => ({ ...current, notes: event.target.value }))}
            placeholder={t.prospectsPage.notes}
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

      <section>
        <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-zg-muted">
          {t.prospectsPage.pipeline}
        </p>
        <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
          {statusCounts.map(({ status, count }) => (
            <button
              key={status}
              type="button"
              onClick={() => setStatusFilter(statusFilter === status ? "all" : status)}
              className={`shrink-0 rounded-full border px-3 py-1.5 text-xs transition-colors ${
                statusFilter === status
                  ? "border-white/20 bg-white/[0.1] text-zg-fg"
                  : "border-white/[0.07] text-zg-text-secondary hover:border-white/15"
              }`}
            >
              {t.prospectStatuses[status]} <span className="ml-1 tabular-nums text-zg-muted">{count}</span>
            </button>
          ))}
        </div>
      </section>

      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zg-muted" />
          <Input
            className="pl-9"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={t.prospectsPage.search}
          />
        </div>
        <Select
          value={statusFilter}
          onChange={(event) => setStatusFilter(event.target.value)}
          className="sm:max-w-[220px]"
        >
          <option value="all">{t.prospectsPage.allStatuses}</option>
          {STATUSES.map((status) => (
            <option key={status} value={status}>
              {t.prospectStatuses[status]}
            </option>
          ))}
        </Select>
      </div>

      {filtered.length ? (
        <div className="overflow-hidden rounded-2xl border border-white/[0.08] bg-white/[0.015]">
          <div className="hidden grid-cols-[1.4fr_1fr_0.8fr_0.8fr_42px] gap-4 border-b border-white/[0.07] px-5 py-3 text-[11px] uppercase tracking-wider text-zg-muted md:grid">
            <span>{t.prospectsPage.name}</span>
            <span>{t.prospectsPage.contact}</span>
            <span>{t.prospectsPage.source}</span>
            <span>{t.common.status}</span>
            <span />
          </div>
          <div className="divide-y divide-white/[0.06]">
            {filtered.map((item) => {
              const expanded = editingId === item.id;
              return (
                <article key={item.id}>
                  <div className="grid gap-4 px-5 py-4 md:grid-cols-[1.4fr_1fr_0.8fr_0.8fr_42px] md:items-center">
                    <div className="flex min-w-0 items-center gap-3">
                      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-white/[0.08] bg-white/[0.035]">
                        {item.type === "individual" ? (
                          <UserRound className="h-4 w-4 text-zg-text-secondary" />
                        ) : (
                          <Building2 className="h-4 w-4 text-zg-text-secondary" />
                        )}
                      </span>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-zg-fg">{item.name || item.company}</p>
                        {item.name && item.company ? (
                          <p className="mt-0.5 truncate text-xs text-zg-muted">{item.company}</p>
                        ) : null}
                      </div>
                    </div>
                    <div className="min-w-0 text-xs text-zg-text-secondary">
                      <p className="truncate">{item.email || item.contact || t.prospectsPage.noContact}</p>
                      {item.phone ? <p className="mt-0.5 truncate text-zg-muted">{item.phone}</p> : null}
                    </div>
                    <p className="truncate text-xs text-zg-text-secondary">{item.source || "—"}</p>
                    <Select
                      value={item.status}
                      disabled={pending}
                      onChange={(event) => void patchProspect(item.id, { status: event.target.value })}
                      className="min-h-8 py-1 text-xs"
                    >
                      {STATUSES.map((status) => (
                        <option key={status} value={status}>
                          {t.prospectStatuses[status]}
                        </option>
                      ))}
                    </Select>
                    <button
                      type="button"
                      onClick={() => openEdit(item)}
                      className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-zg-muted hover:bg-white/[0.05] hover:text-zg-fg"
                      aria-label={expanded ? t.prospectsPage.cancelEdit : t.prospectsPage.details}
                    >
                      {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                    </button>
                  </div>

                  {expanded && editDraft ? (
                    <div className="border-t border-white/[0.06] bg-white/[0.018] px-5 py-5">
                      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                        <Input
                          value={editDraft.name}
                          onChange={(event) => setEditDraft({ ...editDraft, name: event.target.value })}
                          placeholder={t.prospectsPage.name}
                        />
                        <Input
                          value={editDraft.company}
                          onChange={(event) => setEditDraft({ ...editDraft, company: event.target.value })}
                          placeholder={t.prospectsPage.company}
                        />
                        <Input
                          type="email"
                          value={editDraft.email}
                          onChange={(event) => setEditDraft({ ...editDraft, email: event.target.value })}
                          placeholder={t.prospectsPage.email}
                        />
                        <Input
                          value={editDraft.phone}
                          onChange={(event) => setEditDraft({ ...editDraft, phone: event.target.value })}
                          placeholder={t.prospectsPage.phone}
                        />
                        <Input
                          value={editDraft.url}
                          onChange={(event) => setEditDraft({ ...editDraft, url: event.target.value })}
                          placeholder={t.prospectsPage.url}
                        />
                        <Input
                          value={editDraft.source}
                          onChange={(event) => setEditDraft({ ...editDraft, source: event.target.value })}
                          placeholder={t.prospectsPage.source}
                        />
                        <Input
                          type="date"
                          value={editDraft.contactedAt}
                          onChange={(event) => setEditDraft({ ...editDraft, contactedAt: event.target.value })}
                          aria-label={t.prospectsPage.contactedAt}
                        />
                        <Input
                          type="date"
                          value={editDraft.nextFollowUpAt}
                          onChange={(event) => setEditDraft({ ...editDraft, nextFollowUpAt: event.target.value })}
                          aria-label={t.prospectsPage.nextFollowUp}
                        />
                      </div>
                      <Input
                        className="mt-3"
                        value={editDraft.lastAction}
                        onChange={(event) => setEditDraft({ ...editDraft, lastAction: event.target.value })}
                        placeholder={t.prospectsPage.lastAction}
                      />
                      <Textarea
                        rows={3}
                        className="mt-3"
                        value={editDraft.notes}
                        onChange={(event) => setEditDraft({ ...editDraft, notes: event.target.value })}
                        placeholder={t.prospectsPage.notes}
                      />
                      <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
                        <p className="text-xs text-zg-muted">
                          {t.prospectsPage.addedOn}{" "}
                          {item.createdAt ? new Date(item.createdAt).toLocaleDateString(dateLocale) : "—"}
                        </p>
                        <Button type="button" size="sm" disabled={pending} onClick={() => void saveEdit(item.id)}>
                          {t.prospectsPage.saveChanges}
                        </Button>
                      </div>
                    </div>
                  ) : null}
                </article>
              );
            })}
          </div>
        </div>
      ) : (
        <SharpzEmptyPanel title={t.empty.noProspectsTitle} description={t.empty.noProspectsDescription} icon={Users} />
      )}
    </DashboardContent>
  );
}
