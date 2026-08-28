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
  url?: string | null;
  contact?: string | null;
  whyFit?: string | null;
  fitScore?: number | null;
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
  dockOpen: boolean;
  setDockOpen: (open: boolean) => void;
  inputRef: React.RefObject<HTMLTextAreaElement | null>;
  send: (text?: string) => Promise<void>;
  focusInput: () => void;
  dismissProspect: (localId: string) => void;
  acceptProspect: (localId: string) => Promise<void>;
  acceptingId: string | null;
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
  const [dockOpen, setDockOpen] = useState(false);
  const [acceptingId, setAcceptingId] = useState<string | null>(null);
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
        const timeout = window.setTimeout(() => controller.abort(), 40000);
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
        };
        if (!response.ok) {
          showToast({ message: data.error ?? t.common.error });
          return;
        }
        setMessages((current) => [...current, { role: "assistant", content: data.reply ?? "" }]);
        const incoming = (data.prospects ?? []).filter((item) => item.company?.trim());
        if (incoming.length) {
          setProposed((current) => [
            ...incoming.map((item) => ({ ...item, localId: newLocalId() })),
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
              url: item.url,
              contact: item.contact,
              whyFit: item.whyFit,
              fitScore: item.fitScore,
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

  const value = useMemo(
    () => ({
      messages,
      pending,
      input,
      setInput,
      proposed,
      dockOpen,
      setDockOpen,
      inputRef,
      send,
      focusInput,
      dismissProspect,
      acceptProspect,
      acceptingId,
    }),
    [
      messages,
      pending,
      input,
      proposed,
      dockOpen,
      send,
      focusInput,
      dismissProspect,
      acceptProspect,
      acceptingId,
    ],
  );

  return <CopilotContext.Provider value={value}>{children}</CopilotContext.Provider>;
}

export function useCopilot() {
  const ctx = useContext(CopilotContext);
  if (!ctx) throw new Error("useCopilot must be used within CopilotProvider");
  return ctx;
}
