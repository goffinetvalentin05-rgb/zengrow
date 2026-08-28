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
import { SHARPZ_ROUTES } from "@/src/lib/sharpz/routes";

export type CopilotProspect = {
  localId: string;
  company: string;
  url?: string | null;
  contact?: string | null;
  whyFit?: string | null;
  fitScore?: number | null;
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

export type CopilotMessage = {
  role: "user" | "assistant";
  content: string;
};

type CopilotContextValue = {
  messages: CopilotMessage[];
  pending: boolean;
  input: string;
  setInput: (value: string) => void;
  proposed: CopilotProspect[];
  proposedActions: CopilotProposedAction[];
  dockOpen: boolean;
  setDockOpen: (open: boolean) => void;
  inputRef: React.RefObject<HTMLTextAreaElement | null>;
  send: (text?: string) => Promise<void>;
  focusInput: () => void;
  dismissProspect: (localId: string) => void;
  acceptProspect: (localId: string) => Promise<void>;
  dismissAction: (localId: string) => void;
  acceptAction: (localId: string) => Promise<void>;
  acceptAllActions: () => Promise<void>;
  acceptingId: string | null;
  acceptingActions: boolean;
};

const CopilotContext = createContext<CopilotContextValue | null>(null);

function newLocalId() {
  if (typeof crypto !== "undefined" && crypto.randomUUID) return crypto.randomUUID();
  return `p-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

export function CopilotProvider({ children }: { children: ReactNode }) {
  const { t } = useDashboardI18n();
  const router = useRouter();
  const showToast = useDashboardToast();
  const [messages, setMessages] = useState<CopilotMessage[]>([]);
  const [pending, setPending] = useState(false);
  const [input, setInput] = useState("");
  const [proposed, setProposed] = useState<CopilotProspect[]>([]);
  const [proposedActions, setProposedActions] = useState<CopilotProposedAction[]>([]);
  const [dockOpen, setDockOpen] = useState(false);
  const [acceptingId, setAcceptingId] = useState<string | null>(null);
  const [acceptingActions, setAcceptingActions] = useState(false);
  const inputRef = useRef<HTMLTextAreaElement | null>(null);
  const lock = useRef(false);

  const focusInput = useCallback(() => {
    document.getElementById("sharpz-copilot")?.scrollIntoView({ behavior: "smooth", block: "center" });
    window.setTimeout(() => inputRef.current?.focus(), 280);
  }, []);

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
        const controller = new AbortController();
        const timeout = window.setTimeout(() => controller.abort(), 45000);
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
          proposedActions?: Omit<CopilotProposedAction, "localId">[];
        };
        if (!response.ok) {
          showToast({ message: data.error ?? t.common.error });
          return;
        }
        setMessages((current) => [...current, { role: "assistant", content: data.reply ?? "" }]);
        const incomingProspects = (data.prospects ?? []).filter((item) => item.company?.trim());
        if (incomingProspects.length) {
          setProposed((current) => [
            ...incomingProspects.map((item) => ({ ...item, localId: newLocalId() })),
            ...current,
          ]);
        }
        const incomingActions = (data.proposedActions ?? []).filter((item) => item.title?.trim());
        if (incomingActions.length) {
          setProposedActions((current) => [
            ...incomingActions.map((item) => ({ ...item, localId: newLocalId() })),
            ...current,
          ]);
        }
      } catch {
        showToast({ message: t.common.error });
      } finally {
        setPending(false);
        lock.current = false;
      }
    },
    [input, messages, showToast, t.common.error],
  );

  const dismissProspect = useCallback((localId: string) => {
    setProposed((current) => current.filter((item) => item.localId !== localId));
  }, []);

  const acceptProspect = useCallback(
    async (localId: string) => {
      const item = proposed.find((prospect) => prospect.localId === localId);
      if (!item) return;
      setAcceptingId(localId);
      const response = await fetch("/api/sharpz/prospects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prospects: [
            {
              company: item.company,
              name: item.contact,
              contact: item.contact,
              url: item.url,
              whyFit: item.whyFit,
              fitScore: item.fitScore,
              source: "Sharpz Agent",
              status: "to_contact",
            },
          ],
        }),
      });
      setAcceptingId(null);
      if (!response.ok) {
        showToast({ message: t.common.error });
        return;
      }
      setProposed((current) => current.filter((prospect) => prospect.localId !== localId));
      showToast({ message: t.common.saved });
      router.refresh();
    },
    [proposed, router, showToast, t.common.error, t.common.saved],
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
    router.push(SHARPZ_ROUTES.today);
  }, [persistActions, proposedActions, router]);

  const value = useMemo(
    () => ({
      messages,
      pending,
      input,
      setInput,
      proposed,
      proposedActions,
      dockOpen,
      setDockOpen,
      inputRef,
      send,
      focusInput,
      dismissProspect,
      acceptProspect,
      dismissAction,
      acceptAction,
      acceptAllActions,
      acceptingId,
      acceptingActions,
    }),
    [
      messages,
      pending,
      input,
      proposed,
      proposedActions,
      dockOpen,
      send,
      focusInput,
      dismissProspect,
      acceptProspect,
      dismissAction,
      acceptAction,
      acceptAllActions,
      acceptingId,
      acceptingActions,
    ],
  );

  return <CopilotContext.Provider value={value}>{children}</CopilotContext.Provider>;
}

export function useCopilot() {
  const ctx = useContext(CopilotContext);
  if (!ctx) throw new Error("useCopilot must be used within CopilotProvider");
  return ctx;
}
