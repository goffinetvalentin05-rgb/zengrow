"use client";

import { FormEvent, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Users } from "lucide-react";
import PageHeader from "@/src/components/dashboard/page-header";
import DashboardContent from "@/src/components/dashboard/ui/dashboard-content";
import { Card } from "@/src/components/ui/card";
import Badge from "@/src/components/ui/badge";
import Button from "@/src/components/ui/button";
import Input from "@/src/components/ui/input";
import Select from "@/src/components/ui/select";
import Textarea from "@/src/components/ui/textarea";
import { SharpzEmptyPanel } from "@/src/components/sharpz/empty-panel";
import { useDashboardI18n } from "@/src/components/dashboard/i18n/dashboard-locale-provider";
import { useDashboardToast } from "@/src/components/dashboard/dashboard-toast-provider";
import { useCopilot } from "@/src/components/sharpz/copilot/copilot-context";
import type { Prospect, ProspectStatus } from "@/src/lib/sharpz/types";

const STATUSES: ProspectStatus[] = [
  "new",
  "to_contact",
  "contacted",
  "replied",
  "qualified",
  "customer",
  "refused",
];

type Props = {
  prospects: Prospect[];
};

export function ProspectsView({ prospects }: Props) {
  const { t, locale } = useDashboardI18n();
  const router = useRouter();
  const showToast = useDashboardToast();
  const { send, setDockOpen } = useCopilot();
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("all");
  const [company, setCompany] = useState("");
  const [url, setUrl] = useState("");
  const [contact, setContact] = useState("");
  const [whyFit, setWhyFit] = useState("");
  const [adding, setAdding] = useState(false);
  const [notesDraft, setNotesDraft] = useState<Record<string, string>>({});
  const dateLocale = locale === "en" ? "en-GB" : "fr-FR";

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return prospects.filter((item) => {
      if (status !== "all" && item.status !== status) return false;
      if (!needle) return true;
      return [item.company, item.url, item.contact, item.whyFit, item.notes]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(needle));
    });
  }, [prospects, query, status]);

  async function updateStatus(id: string, next: string) {
    setPendingId(id);
    const response = await fetch(`/api/sharpz/prospects/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: next }),
    });
    setPendingId(null);
    if (!response.ok) {
      showToast({ message: t.common.error });
      return;
    }
    router.refresh();
  }

  async function saveNotes(id: string) {
    const notes = notesDraft[id];
    if (notes == null) return;
    setPendingId(id);
    const response = await fetch(`/api/sharpz/prospects/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ notes }),
    });
    setPendingId(null);
    if (!response.ok) {
      showToast({ message: t.common.error });
      return;
    }
    showToast({ message: t.common.saved });
    router.refresh();
  }

  async function addManual(event: FormEvent) {
    event.preventDefault();
    if (!company.trim()) return;
    setAdding(true);
    const response = await fetch("/api/sharpz/prospects", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        prospects: [{ company: company.trim(), url: url.trim() || null, contact: contact.trim() || null, whyFit: whyFit.trim() || null }],
      }),
    });
    setAdding(false);
    if (!response.ok) {
      showToast({ message: t.common.error });
      return;
    }
    setCompany("");
    setUrl("");
    setContact("");
    setWhyFit("");
    showToast({ message: t.common.saved });
    router.refresh();
  }

  return (
    <DashboardContent>
      <PageHeader title={t.prospectsPage.title} subtitle={t.prospectsPage.subtitle} />

      <form className="grid gap-3 rounded-2xl border border-white/10 bg-white/[0.03] p-5 sm:grid-cols-2" onSubmit={addManual}>
        <Input value={company} onChange={(event) => setCompany(event.target.value)} placeholder={t.prospectsPage.company} required />
        <Input value={url} onChange={(event) => setUrl(event.target.value)} placeholder={t.prospectsPage.url} />
        <Input value={contact} onChange={(event) => setContact(event.target.value)} placeholder={t.prospectsPage.contact} />
        <Input value={whyFit} onChange={(event) => setWhyFit(event.target.value)} placeholder={t.prospectsPage.whyFit} />
        <div className="flex flex-wrap gap-2 sm:col-span-2">
          <Button type="submit" disabled={adding}>
            {adding ? t.prospectsPage.adding : t.prospectsPage.add}
          </Button>
          <Button
            type="button"
            variant="secondary"
            onClick={() => {
              setDockOpen(true);
              void send(t.today.suggestionProspectsPrompt);
            }}
          >
            {t.today.suggestionProspects}
          </Button>
        </div>
      </form>

      <div className="flex flex-col gap-3 sm:flex-row">
        <Input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder={t.prospectsPage.search}
        />
        <Select value={status} onChange={(event) => setStatus(event.target.value)} className="sm:max-w-[220px]">
          <option value="all">{t.prospectsPage.allStatuses}</option>
          {STATUSES.map((item) => (
            <option key={item} value={item}>
              {t.prospectStatuses[item]}
            </option>
          ))}
        </Select>
      </div>

      {filtered.length ? (
        <div className="grid gap-4">
          {filtered.map((item) => (
            <Card key={item.id} className="space-y-3 p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h3 className="text-base font-semibold text-zg-fg">{item.company}</h3>
                  {item.url ? (
                    <a href={item.url} target="_blank" rel="noreferrer" className="mt-1 block text-sm text-zg-accent hover:underline">
                      {item.url}
                    </a>
                  ) : null}
                  <p className="mt-1 text-xs text-zg-text-muted">
                    {t.prospectsPage.addedOn} {item.createdAt ? new Date(item.createdAt).toLocaleDateString(dateLocale) : "—"}
                  </p>
                </div>
                <Select
                  value={item.status}
                  disabled={pendingId === item.id}
                  onChange={(event) => updateStatus(item.id, event.target.value)}
                  className="max-w-[180px]"
                >
                  {STATUSES.map((statusOption) => (
                    <option key={statusOption} value={statusOption}>
                      {t.prospectStatuses[statusOption]}
                    </option>
                  ))}
                </Select>
              </div>
              {item.fitScore != null ? (
                <Badge tone="accent">
                  {t.prospectsPage.fitScore} {item.fitScore}/100
                </Badge>
              ) : null}
              {item.whyFit ? <p className="text-sm leading-relaxed text-zg-text-secondary">{item.whyFit}</p> : null}
              {item.contact ? (
                <p className="text-sm text-zg-text-muted">
                  {t.prospectsPage.contact}: {item.contact}
                </p>
              ) : null}
              <Textarea
                rows={2}
                value={notesDraft[item.id] ?? item.notes ?? ""}
                onChange={(event) => setNotesDraft((current) => ({ ...current, [item.id]: event.target.value }))}
                placeholder={t.prospectsPage.notes}
              />
              <Button type="button" size="sm" variant="secondary" disabled={pendingId === item.id} onClick={() => void saveNotes(item.id)}>
                {t.prospectsPage.saveNotes}
              </Button>
            </Card>
          ))}
        </div>
      ) : (
        <SharpzEmptyPanel title={t.empty.noProspectsTitle} description={t.empty.noProspectsDescription} icon={Users} />
      )}
    </DashboardContent>
  );
}
