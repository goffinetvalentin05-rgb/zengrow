"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Sparkles, X } from "lucide-react";
import Button from "@/src/components/ui/button";
import Textarea from "@/src/components/ui/textarea";
import { useDashboardI18n } from "@/src/components/dashboard/i18n/dashboard-locale-provider";
import { useDashboardToast } from "@/src/components/dashboard/dashboard-toast-provider";
import { cn } from "@/src/lib/utils";

type ChatMessage = {
  role: "user" | "assistant";
  content: string;
  prospects?: {
    company: string;
    url?: string | null;
    contact?: string | null;
    whyFit?: string | null;
    fitScore?: number | null;
  }[];
};

type Props = {
  hidden?: boolean;
  openSignal?: number;
};

export function SharpzAssistant({ hidden, openSignal = 0 }: Props) {
  const { t } = useDashboardI18n();
  const router = useRouter();
  const showToast = useDashboardToast();
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [pending, setPending] = useState(false);
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (openSignal > 0) setOpen(true);
  }, [openSignal]);

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, open]);

  if (hidden) return null;

  async function send(event: FormEvent) {
    event.preventDefault();
    const text = input.trim();
    if (!text || pending) return;
    setInput("");
    const nextMessages: ChatMessage[] = [...messages, { role: "user", content: text }];
    setMessages(nextMessages);
    setPending(true);
    const response = await fetch("/api/sharpz/assistant", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ messages: nextMessages.map(({ role, content }) => ({ role, content })) }),
    });
    const data = (await response.json().catch(() => ({}))) as {
      error?: string;
      reply?: string;
      prospects?: ChatMessage["prospects"];
    };
    setPending(false);
    if (!response.ok) {
      showToast({ message: data.error ?? t.common.error });
      return;
    }
    setMessages((current) => [
      ...current,
      { role: "assistant", content: data.reply ?? "", prospects: data.prospects },
    ]);
  }

  async function addProspects(prospects: NonNullable<ChatMessage["prospects"]>) {
    const response = await fetch("/api/sharpz/prospects", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prospects }),
    });
    if (!response.ok) {
      showToast({ message: t.common.error });
      return;
    }
    showToast({ message: t.common.saved });
    router.push("/dashboard/prospects");
    router.refresh();
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={cn(
          "fixed bottom-5 right-5 z-40 inline-flex h-12 items-center gap-2 rounded-2xl px-4 text-sm font-semibold text-white",
          "bg-gradient-to-br from-[#7c5cff] to-[#6366f1] shadow-[0_0_28px_-8px_rgba(124,92,255,0.55)]",
          "hover:brightness-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zg-accent",
        )}
        aria-label={t.assistant.open}
      >
        <Sparkles className="h-4 w-4" strokeWidth={2} />
        {t.nav.assistant}
      </button>

      {open ? (
        <div className="fixed bottom-5 right-5 z-50 flex h-[min(70vh,560px)] w-[min(100vw-2rem,400px)] flex-col overflow-hidden rounded-2xl border border-zg-border bg-zg-surface shadow-2xl shadow-black/35">
          <div className="flex items-center justify-between border-b border-zg-border px-4 py-3">
            <div>
              <h2 className="text-sm font-semibold text-zg-fg">{t.assistant.title}</h2>
              <p className="text-xs text-zg-text-muted">{t.assistant.contextHint}</p>
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="rounded-lg p-2 text-zg-muted hover:bg-zg-card-hover hover:text-zg-fg"
              aria-label={t.common.close}
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          <div ref={listRef} className="min-h-0 flex-1 space-y-3 overflow-y-auto px-4 py-3">
            {messages.map((message, index) => (
              <div
                key={`${message.role}-${index}`}
                className={cn(
                  "rounded-xl px-3 py-2 text-sm leading-relaxed",
                  message.role === "user"
                    ? "ml-8 bg-zg-accent-soft-bg text-zg-fg"
                    : "mr-4 bg-zg-surface-elevated text-zg-text-secondary",
                )}
              >
                <p className="whitespace-pre-wrap">{message.content}</p>
                {message.prospects?.length ? (
                  <div className="mt-3 space-y-2">
                    {message.prospects.map((prospect) => (
                      <div key={prospect.company} className="rounded-lg border border-zg-border p-2">
                        <p className="font-medium text-zg-fg">{prospect.company}</p>
                        {prospect.whyFit ? <p className="mt-1 text-xs">{prospect.whyFit}</p> : null}
                      </div>
                    ))}
                    <Button type="button" size="sm" onClick={() => addProspects(message.prospects ?? [])}>
                      {t.common.addTheseProspects}
                    </Button>
                  </div>
                ) : null}
              </div>
            ))}
            {pending ? <p className="text-xs text-zg-text-muted">{t.assistant.thinking}</p> : null}
          </div>
          <form className="border-t border-zg-border p-3" onSubmit={send}>
            <Textarea
              rows={2}
              value={input}
              onChange={(event) => setInput(event.target.value)}
              placeholder={t.assistant.placeholder}
            />
            <Button type="submit" size="sm" className="mt-2 w-full" disabled={pending}>
              {t.assistant.send}
            </Button>
          </form>
        </div>
      ) : null}
    </>
  );
}
