"use client";

import { FormEvent } from "react";
import { Sparkles, X } from "lucide-react";
import { usePathname } from "next/navigation";
import Button from "@/src/components/ui/button";
import Textarea from "@/src/components/ui/textarea";
import { useCopilot } from "@/src/components/sharpz/copilot/copilot-context";
import { useDashboardI18n } from "@/src/components/dashboard/i18n/dashboard-locale-provider";
import { cn } from "@/src/lib/utils";

export function SharpzAssistant() {
  const { t } = useDashboardI18n();
  const pathname = usePathname();
  const { dockOpen, setDockOpen, messages, pending, input, setInput, send } = useCopilot();
  const onToday = pathname === "/dashboard";

  if (onToday) return null;

  function onSubmit(event: FormEvent) {
    event.preventDefault();
    void send();
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setDockOpen(true)}
        className={cn(
          "fixed bottom-6 right-6 z-40 inline-flex h-11 items-center gap-2 rounded-full px-4 text-[13px] font-semibold text-zinc-950",
          "bg-white shadow-[0_18px_44px_-18px_rgba(0,0,0,0.9)]",
          "hover:bg-zinc-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40",
        )}
        aria-label={t.assistant.open}
      >
        <Sparkles className="h-4 w-4" strokeWidth={2} />
        {t.nav.assistant}
      </button>

      {dockOpen ? (
        <div className="fixed bottom-6 right-6 z-50 flex h-[min(70vh,560px)] w-[min(100vw-2rem,400px)] flex-col overflow-hidden rounded-2xl border border-white/[0.1] bg-zinc-950 shadow-2xl shadow-black/60">
          <div className="flex items-center justify-between border-b border-zg-border px-4 py-3">
            <div>
              <h2 className="text-sm font-semibold text-zg-fg">{t.assistant.title}</h2>
              <p className="text-xs text-zg-text-muted">{t.assistant.contextHint}</p>
            </div>
            <button
              type="button"
              onClick={() => setDockOpen(false)}
              className="rounded-lg p-2 text-zg-muted hover:bg-zg-card-hover hover:text-zg-fg"
              aria-label={t.common.close}
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          <div className="min-h-0 flex-1 space-y-3 overflow-y-auto px-4 py-3">
            {messages.map((message, index) => (
              <div
                key={`${message.role}-${index}`}
                className={cn(
                  "rounded-xl px-3 py-2 text-sm leading-relaxed",
                  message.role === "user"
                    ? "ml-8 bg-white/[0.07] text-zg-fg"
                    : "mr-4 text-zg-text-secondary",
                )}
              >
                <p className="whitespace-pre-wrap">{message.content}</p>
              </div>
            ))}
            {pending ? <p className="text-xs text-zg-text-muted">{t.assistant.thinking}</p> : null}
          </div>
          <form className="border-t border-zg-border p-3" onSubmit={onSubmit}>
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
