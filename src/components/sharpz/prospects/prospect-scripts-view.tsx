"use client";

import { FormEvent, useMemo, useState } from "react";
import { Copy, FileText, Plus, Search } from "lucide-react";
import Button from "@/src/components/ui/button";
import Input from "@/src/components/ui/input";
import Select from "@/src/components/ui/select";
import Textarea from "@/src/components/ui/textarea";
import { SharpzEmptyPanel } from "@/src/components/sharpz/empty-panel";
import { useDashboardI18n } from "@/src/components/dashboard/i18n/dashboard-locale-provider";
import { useDashboardToast } from "@/src/components/dashboard/dashboard-toast-provider";
import {
  SCRIPT_CHANNELS,
  SCRIPT_STAGES,
  type ProspectScript,
  type ScriptChannel,
  type ScriptStage,
} from "@/src/lib/sharpz/outreach";

const EMPTY_FORM = {
  name: "",
  channel: "whatsapp" as ScriptChannel,
  stage: "first_contact" as ScriptStage,
  content: "",
  notes: "",
  isActive: true,
};

type Props = {
  scripts: ProspectScript[];
  onChange: (scripts: ProspectScript[]) => void;
};

export function ProspectScriptsView({ scripts, onChange }: Props) {
  const { t } = useDashboardI18n();
  const showToast = useDashboardToast();
  const [query, setQuery] = useState("");
  const [channelFilter, setChannelFilter] = useState<string>("all");
  const [stageFilter, setStageFilter] = useState<string>("all");
  const [editingId, setEditingId] = useState<string | "new" | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [pending, setPending] = useState(false);

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

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return scripts.filter((item) => {
      if (channelFilter !== "all" && item.channel !== channelFilter) return false;
      if (stageFilter !== "all" && item.stage !== stageFilter) return false;
      if (!needle) return true;
      return `${item.name} ${item.content} ${item.notes ?? ""}`.toLowerCase().includes(needle);
    });
  }, [scripts, query, channelFilter, stageFilter]);

  function startCreate() {
    setEditingId("new");
    setForm(EMPTY_FORM);
  }

  function startEdit(item: ProspectScript) {
    setEditingId(item.id);
    setForm({
      name: item.name,
      channel: item.channel,
      stage: item.stage,
      content: item.content,
      notes: item.notes ?? "",
      isActive: item.isActive,
    });
  }

  async function save(event: FormEvent) {
    event.preventDefault();
    if (!form.name.trim() || !form.content.trim()) return;
    setPending(true);
    const isNew = editingId === "new";
    const response = await fetch(
      isNew ? "/api/sharpz/prospect-scripts" : `/api/sharpz/prospect-scripts/${editingId}`,
      {
        method: isNew ? "POST" : "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name.trim(),
          channel: form.channel,
          stage: form.stage,
          content: form.content.trim(),
          notes: form.notes.trim() || null,
          isActive: form.isActive,
        }),
      },
    );
    const data = (await response.json().catch(() => null)) as { script?: ProspectScript; error?: string } | null;
    setPending(false);
    if (!response.ok || !data?.script) {
      showToast({ message: data?.error ?? t.common.error });
      return;
    }
    onChange(
      isNew
        ? [data.script, ...scripts]
        : scripts.map((item) => (item.id === data.script!.id ? data.script! : item)),
    );
    setEditingId(null);
    showToast({ message: t.common.saved, durationMs: 1800 });
  }

  async function duplicate(item: ProspectScript) {
    setPending(true);
    const response = await fetch("/api/sharpz/prospect-scripts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: `${item.name} (copie)`,
        channel: item.channel,
        stage: item.stage,
        content: item.content,
        notes: item.notes,
        isActive: item.isActive,
      }),
    });
    const data = (await response.json().catch(() => null)) as { script?: ProspectScript; error?: string } | null;
    setPending(false);
    if (!response.ok || !data?.script) {
      showToast({ message: data?.error ?? t.common.error });
      return;
    }
    onChange([data.script, ...scripts]);
    showToast({ message: t.common.saved, durationMs: 1800 });
  }

  async function remove(item: ProspectScript) {
    if (!window.confirm(t.prospectsPage.deleteScriptConfirm)) return;
    setPending(true);
    const response = await fetch(`/api/sharpz/prospect-scripts/${item.id}`, { method: "DELETE" });
    setPending(false);
    if (!response.ok) {
      showToast({ message: t.common.error });
      return;
    }
    onChange(scripts.filter((row) => row.id !== item.id));
    if (editingId === item.id) setEditingId(null);
    showToast({ message: t.common.saved, durationMs: 1800 });
  }

  async function loadTemplates() {
    setPending(true);
    const response = await fetch("/api/sharpz/prospect-scripts");
    const data = (await response.json().catch(() => null)) as { scripts?: ProspectScript[]; error?: string } | null;
    setPending(false);
    if (!response.ok) {
      showToast({ message: data?.error ?? t.common.error });
      return;
    }
    onChange(data?.scripts ?? []);
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 md:flex-row md:items-center">
        <div className="relative min-w-0 flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zg-muted" />
          <Input
            className="pl-9"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={t.prospectsPage.search}
          />
        </div>
        <Select value={channelFilter} onChange={(event) => setChannelFilter(event.target.value)} aria-label={t.prospectsPage.filterChannel}>
          <option value="all">{t.prospectsPage.allChannels}</option>
          {SCRIPT_CHANNELS.map((item) => (
            <option key={item} value={item}>
              {channelLabels[item]}
            </option>
          ))}
        </Select>
        <Select value={stageFilter} onChange={(event) => setStageFilter(event.target.value)} aria-label={t.prospectsPage.filterStage}>
          <option value="all">{t.prospectsPage.allStages}</option>
          {SCRIPT_STAGES.map((item) => (
            <option key={item} value={item}>
              {stageLabels[item]}
            </option>
          ))}
        </Select>
        <Button type="button" onClick={startCreate}>
          <Plus className="h-4 w-4" />
          {t.prospectsPage.newScript}
        </Button>
      </div>

      {editingId ? (
        <form
          onSubmit={save}
          className="rounded-2xl border border-white/[0.08] bg-white/[0.02] p-5"
        >
          <div className="grid gap-3 sm:grid-cols-2">
            <Input
              value={form.name}
              onChange={(event) => setForm({ ...form, name: event.target.value })}
              placeholder={t.prospectsPage.scriptName}
            />
            <Select
              value={form.channel}
              onChange={(event) => setForm({ ...form, channel: event.target.value as ScriptChannel })}
            >
              {SCRIPT_CHANNELS.map((item) => (
                <option key={item} value={item}>
                  {channelLabels[item]}
                </option>
              ))}
            </Select>
            <Select
              value={form.stage}
              onChange={(event) => setForm({ ...form, stage: event.target.value as ScriptStage })}
            >
              {SCRIPT_STAGES.map((item) => (
                <option key={item} value={item}>
                  {stageLabels[item]}
                </option>
              ))}
            </Select>
            <label className="flex items-center gap-2 text-sm text-zg-text-secondary">
              <input
                type="checkbox"
                checked={form.isActive}
                onChange={(event) => setForm({ ...form, isActive: event.target.checked })}
                className="h-4 w-4 accent-white"
              />
              {form.isActive ? t.prospectsPage.scriptActive : t.prospectsPage.scriptInactive}
            </label>
          </div>
          <Textarea
            className="mt-3 min-h-[8rem]"
            rows={6}
            value={form.content}
            onChange={(event) => setForm({ ...form, content: event.target.value })}
            placeholder={t.prospectsPage.scriptContent}
          />
          <p className="mt-2 text-[11px] text-zg-muted">{t.prospectsPage.variablesHint}</p>
          <Input
            className="mt-3"
            value={form.notes}
            onChange={(event) => setForm({ ...form, notes: event.target.value })}
            placeholder={t.prospectsPage.scriptNotes}
          />
          <div className="mt-4 flex justify-end gap-2">
            <Button type="button" variant="ghost" onClick={() => setEditingId(null)}>
              {t.common.cancel}
            </Button>
            <Button type="submit" disabled={pending || !form.name.trim() || !form.content.trim()}>
              {t.common.save}
            </Button>
          </div>
        </form>
      ) : null}

      {filtered.length ? (
        <ul className="divide-y divide-white/[0.06] overflow-hidden rounded-2xl border border-white/[0.07]">
          {filtered.map((item) => (
            <li key={item.id} className="flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-center">
              <button type="button" className="min-w-0 flex-1 text-left" onClick={() => startEdit(item)}>
                <p className="truncate text-sm font-medium text-zg-fg">{item.name}</p>
                <p className="mt-1 text-[12px] text-zg-muted">
                  {stageLabels[item.stage]} · {channelLabels[item.channel]}
                  {item.isActive ? "" : ` · ${t.prospectsPage.scriptInactive}`}
                </p>
              </button>
              <div className="flex flex-wrap gap-1.5">
                <Button type="button" size="sm" variant="ghost" disabled={pending} onClick={() => startEdit(item)}>
                  {t.prospectsPage.edit}
                </Button>
                <Button type="button" size="sm" variant="ghost" disabled={pending} onClick={() => void duplicate(item)}>
                  <Copy className="h-3.5 w-3.5" />
                  {t.prospectsPage.duplicate}
                </Button>
                <Button type="button" size="sm" variant="ghost" disabled={pending} onClick={() => void remove(item)}>
                  {t.prospectsPage.deleteScript}
                </Button>
              </div>
            </li>
          ))}
        </ul>
      ) : scripts.length ? (
        <p className="py-10 text-center text-sm text-zg-muted">{t.prospectsPage.noScriptsFiltered}</p>
      ) : (
        <SharpzEmptyPanel
          title={t.prospectsPage.emptyScriptsTitle}
          description={t.prospectsPage.emptyScriptsDescription}
          icon={FileText}
          action={
            <Button type="button" disabled={pending} onClick={() => void loadTemplates()}>
              {t.prospectsPage.loadTemplates}
            </Button>
          }
        />
      )}
    </div>
  );
}
