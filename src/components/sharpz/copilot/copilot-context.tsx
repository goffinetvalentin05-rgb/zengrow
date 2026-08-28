"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { useRouter } from "next/navigation";
import { useDashboardI18n } from "@/src/components/dashboard/i18n/dashboard-locale-provider";
import { useDashboardToast } from "@/src/components/dashboard/dashboard-toast-provider";

export type CopilotProspect = {
  localId: string;
  company: string;
  name?: string | null;
  url?: string | null;
  sourceUrl?: string | null;
  location?: string | null;
  email?: string | null;
  phone?: string | null;
  linkedinUrl?: string | null;
  instagramUrl?: string | null;
  contact?: string | null;
  whyFit?: string | null;
  fitScore?: number | null;
  notes?: string | null;
};

export type CopilotProposedAction = {
  localId: string;
  title: string;
  category: string;
  impact: number;
  effort: number;
  confidence: number;
  score: number;
  why: string;
  howTo?: string;
};

export type CopilotProposedFollowUp = {
  localId: string;
  prospectId: string;
  company: string;
  name?: string | null;
  daysFromNow: number;
  nextFollowUpAt: string;
  note?: string;
};

export type CopilotProposedExperiment = {
  localId: string;
  hypothesis: string;
  title?: string | null;
  actionId?: string | null;
  actionDescription?: string | null;
  metric?: string | null;
  plannedDays?: number | null;
};

export type CopilotSearchError = {
  message: string;
  retryable: boolean;
};

export type CopilotCompetitor = {
  localId: string;
  companyName: string;
  website: string;
  whyCompetitor?: string | null;
  sourceUrl?: string | null;
  confidence?: number | null;
};

export type CopilotMessage = {
  role: "user" | "assistant";
  content: string;
  prospects?: CopilotProspect[];
  competitors?: CopilotCompetitor[];
  searchError?: CopilotSearchError;
};

type CopilotContextValue = {
  messages: CopilotMessage[];
  pending: boolean;
  input: string;
  setInput: (value: string) => void;
  proposed: CopilotProspect[];
  proposedCompetitors: CopilotCompetitor[];
  proposedActions: CopilotProposedAction[];
  proposedFollowUps: CopilotProposedFollowUp[];
  proposedExperiments: CopilotProposedExperiment[];
  selectedProspectIds: Set<string>;
  dockOpen: boolean;
  setDockOpen: (open: boolean) => void;
  inputRef: React.RefObject<HTMLTextAreaElement | null>;
  send: (text?: string) => Promise<void>;
  retrySearch: () => Promise<void>;
  focusInput: () => void;
  toggleProspectSelection: (localId: string) => void;
  dismissProspect: (localId: string) => void;
  acceptProspect: (localId: string) => Promise<void>;
  acceptSelectedProspects: () => Promise<void>;
  acceptAllProspects: () => Promise<void>;
  acceptCompetitor: (localId: string) => Promise<void>;
  dismissCompetitor: (localId: string) => void;
  dismissAction: (localId: string) => void;
  acceptAction: (localId: string) => Promise<void>;
  acceptAllActions: () => Promise<void>;
  dismissFollowUp: (localId: string) => void;
  acceptFollowUp: (localId: string) => Promise<void>;
  dismissExperiment: (localId: string) => void;
  acceptExperiment: (localId: string) => Promise<void>;
  acceptingId: string | null;
  acceptingActions: boolean;
  acceptingProspects: boolean;
  acceptingCompetitorId: string | null;
};

const CopilotContext = createContext<CopilotContextValue | null>(null);

function newLocalId() {
  if (typeof crypto !== "undefined" && crypto.randomUUID) return crypto.randomUUID();
  return `p-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function withLocalIds(items: Omit<CopilotProspect, "localId">[]) {
  return items
    .filter((item) => item.company?.trim())
    .map((item) => ({ ...item, localId: newLocalId() }));
}

function withCompetitorLocalIds(items: Omit<CopilotCompetitor, "localId">[]) {
  return items
    .filter((item) => item.companyName?.trim() && item.website?.trim())
    .map((item) => ({ ...item, localId: newLocalId() }));
}

export function CopilotProvider({ children }: { children: ReactNode }) {
  const { t } = useDashboardI18n();
  const router = useRouter();
  const showToast = useDashboardToast();
  const [messages, setMessages] = useState<CopilotMessage[]>([]);
  const [pending, setPending] = useState(false);
  const [input, setInput] = useState("");
  const [proposed, setProposed] = useState<CopilotProspect[]>([]);
  const [proposedCompetitors, setProposedCompetitors] = useState<CopilotCompetitor[]>([]);
  const [proposedActions, setProposedActions] = useState<CopilotProposedAction[]>([]);
  const [proposedFollowUps, setProposedFollowUps] = useState<CopilotProposedFollowUp[]>([]);
  const [proposedExperiments, setProposedExperiments] = useState<CopilotProposedExperiment[]>([]);
  const [selectedProspectIds, setSelectedProspectIds] = useState<Set<string>>(new Set());
  const [dockOpen, setDockOpen] = useState(false);
  const [acceptingId, setAcceptingId] = useState<string | null>(null);
  const [acceptingActions, setAcceptingActions] = useState(false);
  const [acceptingProspects, setAcceptingProspects] = useState(false);
  const [acceptingCompetitorId, setAcceptingCompetitorId] = useState<string | null>(null);
  const [lastSearchPrompt, setLastSearchPrompt] = useState<string | null>(null);
  const inputRef = useRef<HTMLTextAreaElement | null>(null);
  const lock = useRef(false);

  const focusInput = useCallback(() => {
    document.getElementById("sharpz-copilot")?.scrollIntoView({ behavior: "smooth", block: "center" });
    window.setTimeout(() => inputRef.current?.focus(), 280);
  }, []);

  const runAssistant = useCallback(
    async (nextMessages: CopilotMessage[], userText: string) => {
      const controller = new AbortController();
      const timeout = window.setTimeout(() => controller.abort(), 120000);
      const response = await fetch("/api/sharpz/assistant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: nextMessages }),
        signal: controller.signal,
      });
      window.clearTimeout(timeout);
      const data = (await response.json().catch(() => ({}))) as {
        error?: string;
        reply?: string;
        prospects?: Omit<CopilotProspect, "localId">[];
        competitors?: Omit<CopilotCompetitor, "localId">[];
        proposedActions?: Omit<CopilotProposedAction, "localId">[];
        proposedFollowUps?: Omit<CopilotProposedFollowUp, "localId">[];
        proposedExperiments?: Omit<CopilotProposedExperiment, "localId">[];
        proposedCompetitors?: Omit<CopilotCompetitor, "localId">[];
        searchError?: CopilotSearchError;
        meta?: { toolsCalled?: string[] };
      };

      if (!response.ok) {
        showToast({ message: data.error ?? t.common.error });
        return;
      }

      const mapped = withLocalIds(data.prospects ?? []);
      const mappedCompetitors = withCompetitorLocalIds([
        ...(data.competitors ?? []),
        ...(data.proposedCompetitors ?? []),
      ]);
      const assistantMessage: CopilotMessage = {
        role: "assistant",
        content: data.reply ?? "",
        searchError: data.searchError,
        prospects: mapped.length ? mapped : undefined,
        competitors: mappedCompetitors.length ? mappedCompetitors : undefined,
      };
      setMessages((current) => [...current, assistantMessage]);

      if (mapped.length) {
        setProposed((current) => [...mapped, ...current]);
        setSelectedProspectIds((current) => {
          const next = new Set(current);
          for (const item of mapped) next.add(item.localId);
          return next;
        });
      }

      if (mappedCompetitors.length) {
        setProposedCompetitors((current) => [...mappedCompetitors, ...current]);
      }

      const incomingActions = (data.proposedActions ?? []).filter((item) => item.title?.trim());
      if (incomingActions.length) {
        setProposedActions((current) => [
          ...incomingActions.map((item) => ({ ...item, localId: newLocalId() })),
          ...current,
        ]);
      }

      const incomingFollowUps = (data.proposedFollowUps ?? []).filter((item) => item.prospectId);
      if (incomingFollowUps.length) {
        setProposedFollowUps((current) => [
          ...incomingFollowUps.map((item) => ({ ...item, localId: newLocalId() })),
          ...current,
        ]);
      }

      const incomingExperiments = (data.proposedExperiments ?? []).filter((item) => item.hypothesis?.trim());
      if (incomingExperiments.length) {
        setProposedExperiments((current) => [
          ...incomingExperiments.map((item) => ({ ...item, localId: newLocalId() })),
          ...current,
        ]);
      }

      if (data.meta?.toolsCalled?.includes("search_prospects")) {
        setLastSearchPrompt(userText);
      } else if (/prospect|club|restaurant|lead/i.test(userText)) {
        setLastSearchPrompt(userText);
      }
    },
    [showToast, t.common.error],
  );

  const send = useCallback(
    async (preset?: string) => {
      const text = (preset ?? input).trim();
      if (!text || lock.current) return;
      lock.current = true;
      setInput("");
      const nextMessages: CopilotMessage[] = [...messages, { role: "user", content: text }];
      setMessages(nextMessages);
      setPending(true);
      try {
        await runAssistant(nextMessages, text);
      } catch {
        showToast({ message: t.common.error });
      } finally {
        setPending(false);
        lock.current = false;
      }
    },
    [input, messages, runAssistant, showToast, t.common.error],
  );

  const retrySearch = useCallback(async () => {
    if (!lastSearchPrompt || lock.current) return;
    lock.current = true;
    setPending(true);
    try {
      const response = await fetch("/api/sharpz/prospects/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: lastSearchPrompt }),
      });
      const data = (await response.json().catch(() => ({}))) as {
        error?: string;
        reply?: string;
        prospects?: Omit<CopilotProspect, "localId">[];
        retryable?: boolean;
      };
      if (!response.ok) {
        setMessages((current) => [
          ...current,
          {
            role: "assistant",
            content: data.error ?? t.agentPage.searchError,
            searchError: { message: data.error ?? t.agentPage.searchError, retryable: data.retryable !== false },
          },
        ]);
        return;
      }
      setMessages((current) => [
        ...current,
        {
          role: "assistant",
          content: data.reply ?? "",
          prospects: withLocalIds(data.prospects ?? []),
        },
      ]);
      if (data.prospects?.length) {
        const mapped = withLocalIds(data.prospects);
        setProposed((current) => [...mapped, ...current]);
        setSelectedProspectIds((current) => {
          const next = new Set(current);
          for (const item of mapped) next.add(item.localId);
          return next;
        });
      }
    } catch {
      showToast({ message: t.common.error });
    } finally {
      setPending(false);
      lock.current = false;
    }
  }, [lastSearchPrompt, showToast, t.agentPage.searchError, t.common.error]);

  const toggleProspectSelection = useCallback((localId: string) => {
    setSelectedProspectIds((current) => {
      const next = new Set(current);
      if (next.has(localId)) next.delete(localId);
      else next.add(localId);
      return next;
    });
  }, []);

  const persistProspects = useCallback(
    async (items: CopilotProspect[]) => {
      if (!items.length) return false;
      setAcceptingProspects(true);
      const response = await fetch("/api/sharpz/prospects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prospects: items.map((item) => ({
            type: "company",
            company: item.company,
            name: item.name ?? item.contact ?? null,
            contact: item.contact ?? item.name ?? null,
            url: item.url ?? null,
            email: item.email ?? null,
            phone: item.phone ?? null,
            linkedinUrl: item.linkedinUrl ?? null,
            instagramUrl: item.instagramUrl ?? null,
            source: "sharpz_agent",
            sourceUrl: item.sourceUrl ?? item.url ?? null,
            whyFit: item.whyFit ?? null,
            fitScore: item.fitScore ?? null,
            notes: item.notes ?? null,
            status: "to_contact",
          })),
        }),
      });
      setAcceptingProspects(false);
      if (!response.ok) {
        showToast({ message: t.common.error });
        return false;
      }
      const ids = new Set(items.map((item) => item.localId));
      setProposed((current) => current.filter((item) => !ids.has(item.localId)));
      setSelectedProspectIds((current) => {
        const next = new Set(current);
        for (const id of ids) next.delete(id);
        return next;
      });
      showToast({ message: t.agentPage.prospectsAdded });
      router.refresh();
      return true;
    },
    [router, showToast, t.agentPage.prospectsAdded, t.common.error],
  );

  const dismissProspect = useCallback((localId: string) => {
    setProposed((current) => current.filter((item) => item.localId !== localId));
    setSelectedProspectIds((current) => {
      const next = new Set(current);
      next.delete(localId);
      return next;
    });
  }, []);

  const acceptProspect = useCallback(
    async (localId: string) => {
      const item = proposed.find((prospect) => prospect.localId === localId);
      if (!item) return;
      setAcceptingId(localId);
      await persistProspects([item]);
      setAcceptingId(null);
    },
    [persistProspects, proposed],
  );

  const acceptSelectedProspects = useCallback(async () => {
    const items = proposed.filter((item) => selectedProspectIds.has(item.localId));
    if (!items.length) return;
    await persistProspects(items);
  }, [persistProspects, proposed, selectedProspectIds]);

  const acceptAllProspects = useCallback(async () => {
    if (!proposed.length) return;
    await persistProspects(proposed);
  }, [persistProspects, proposed]);

  const dismissCompetitor = useCallback((localId: string) => {
    setProposedCompetitors((current) => current.filter((item) => item.localId !== localId));
  }, []);

  const acceptCompetitor = useCallback(
    async (localId: string) => {
      const item = proposedCompetitors.find((c) => c.localId === localId);
      if (!item) return;
      setAcceptingCompetitorId(localId);
      const response = await fetch("/api/sharpz/competitors", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: item.companyName,
          url: item.website,
          notes: item.whyCompetitor ?? null,
        }),
      });
      setAcceptingCompetitorId(null);
      if (!response.ok) {
        const data = (await response.json().catch(() => ({}))) as { error?: string };
        showToast({ message: data.error ?? t.common.error });
        return;
      }
      dismissCompetitor(localId);
      showToast({ message: t.common.saved });
      router.refresh();
    },
    [dismissCompetitor, proposedCompetitors, router, showToast, t.common.error, t.common.saved],
  );

  const dismissAction = useCallback((localId: string) => {
    setProposedActions((current) => current.filter((item) => item.localId !== localId));
  }, []);

  const persistActions = useCallback(
    async (items: CopilotProposedAction[]) => {
      if (!items.length) return false;
      setAcceptingActions(true);
      const response = await fetch("/api/sharpz/actions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          actions: items.map((item) => ({
            title: item.title,
            category: item.category,
            impact: item.impact,
            effort: item.effort,
            confidence: item.confidence,
            why: item.why,
            howTo: item.howTo,
          })),
        }),
      });
      setAcceptingActions(false);
      if (!response.ok) {
        showToast({ message: t.common.error });
        return false;
      }
      const ids = new Set(items.map((item) => item.localId));
      setProposedActions((current) => current.filter((item) => !ids.has(item.localId)));
      showToast({ message: t.agentPage.actionsAdded });
      router.refresh();
      return true;
    },
    [router, showToast, t.agentPage.actionsAdded, t.common.error],
  );

  const acceptAction = useCallback(
    async (localId: string) => {
      const item = proposedActions.find((action) => action.localId === localId);
      if (!item) return;
      setAcceptingId(localId);
      await persistActions([item]);
      setAcceptingId(null);
    },
    [persistActions, proposedActions],
  );

  const acceptAllActions = useCallback(async () => {
    if (!proposedActions.length) return;
    await persistActions(proposedActions);
  }, [persistActions, proposedActions]);

  const dismissFollowUp = useCallback((localId: string) => {
    setProposedFollowUps((current) => current.filter((item) => item.localId !== localId));
  }, []);

  const acceptFollowUp = useCallback(
    async (localId: string) => {
      const item = proposedFollowUps.find((followUp) => followUp.localId === localId);
      if (!item) return;
      setAcceptingId(localId);
      const response = await fetch(`/api/sharpz/prospects/${item.prospectId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nextFollowUpAt: item.nextFollowUpAt,
          notes: item.note,
        }),
      });
      setAcceptingId(null);
      if (!response.ok) {
        showToast({ message: t.common.error });
        return;
      }
      dismissFollowUp(localId);
      showToast({ message: "Relance programmée." });
      router.refresh();
    },
    [dismissFollowUp, proposedFollowUps, router, showToast, t.common.error],
  );

  const dismissExperiment = useCallback((localId: string) => {
    setProposedExperiments((current) => current.filter((item) => item.localId !== localId));
  }, []);

  const acceptExperiment = useCallback(
    async (localId: string) => {
      const item = proposedExperiments.find((experiment) => experiment.localId === localId);
      if (!item) return;
      setAcceptingId(localId);
      const response = await fetch("/api/sharpz/experiments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          hypothesis: item.hypothesis,
          title: item.title,
          actionId: item.actionId,
          actionDescription: item.actionDescription,
          metric: item.metric,
          plannedDays: item.plannedDays ?? 14,
          startNow: true,
        }),
      });
      setAcceptingId(null);
      if (!response.ok) {
        showToast({ message: t.common.error });
        return;
      }
      dismissExperiment(localId);
      showToast({ message: "Expérimentation créée." });
      router.refresh();
    },
    [dismissExperiment, proposedExperiments, router, showToast, t.common.error],
  );

  const value = useMemo(
    () => ({
      messages,
      pending,
      input,
      setInput,
      proposed,
      proposedCompetitors,
      proposedActions,
      proposedFollowUps,
      proposedExperiments,
      selectedProspectIds,
      dockOpen,
      setDockOpen,
      inputRef,
      send,
      retrySearch,
      focusInput,
      toggleProspectSelection,
      dismissProspect,
      acceptProspect,
      acceptSelectedProspects,
      acceptAllProspects,
      acceptCompetitor,
      dismissCompetitor,
      dismissAction,
      acceptAction,
      acceptAllActions,
      dismissFollowUp,
      acceptFollowUp,
      dismissExperiment,
      acceptExperiment,
      acceptingId,
      acceptingActions,
      acceptingProspects,
      acceptingCompetitorId,
    }),
    [
      messages,
      pending,
      input,
      proposed,
      proposedCompetitors,
      proposedActions,
      proposedFollowUps,
      proposedExperiments,
      selectedProspectIds,
      dockOpen,
      send,
      retrySearch,
      focusInput,
      toggleProspectSelection,
      dismissProspect,
      acceptProspect,
      acceptSelectedProspects,
      acceptAllProspects,
      acceptCompetitor,
      dismissCompetitor,
      dismissAction,
      acceptAction,
      acceptAllActions,
      dismissFollowUp,
      acceptFollowUp,
      dismissExperiment,
      acceptExperiment,
      acceptingId,
      acceptingActions,
      acceptingProspects,
      acceptingCompetitorId,
    ],
  );

  return <CopilotContext.Provider value={value}>{children}</CopilotContext.Provider>;
}

export function useCopilot() {
  const ctx = useContext(CopilotContext);
  if (!ctx) throw new Error("useCopilot must be used within CopilotProvider");
  return ctx;
}
