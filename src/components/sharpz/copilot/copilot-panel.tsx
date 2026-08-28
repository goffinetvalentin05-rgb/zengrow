"use client";

import { FormEvent } from "react";
import { ArrowUp, Paperclip, Sparkles } from "lucide-react";
import { useCopilot } from "@/src/components/sharpz/copilot/copilot-context";
import { useDashboardI18n } from "@/src/components/dashboard/i18n/dashboard-locale-provider";
import { cn } from "@/src/lib/utils";

type Suggestion = { id: string; label: string; prompt: string };

type Props = {
  greeting: string;
  question: string;
  objectiveLabel?: string | null;
  suggestions: Suggestion[];
};

export function CopilotHero({ greeting, question, objectiveLabel, suggestions }: Props) {
  const { t } = useDashboardI18n();
  const { input, setInput, inputRef, send, pending, messages } = useCopilot();

  function onSubmit(event: FormEvent) {
    event.preventDefault();
    void send();
  }

  return (
    <section id="sharpz-copilot" className="relative mx-auto w-full max-w-3xl pt-4 text-center">
      <div
        className="pointer-events-none absolute left-1/2 top-0 h-40 w-40 -translate-x-1/2 rounded-full opacity-70"
        style={{
          background: "radial-gradient(circle, rgb(124 92 255 / 0.28) 0%, transparent 70%)",
          filter: "blur(8px)",
        }}
        aria-hidden
      />
      <p className="relative text-sm text-zg-text-muted">{greeting}</p>
      <h1 className="relative mt-3 text-[1.75rem] font-semibold leading-tight tracking-tight text-zg-fg sm:text-[2.15rem]">
        {question}
      </h1>
      {objectiveLabel ? (
        <p className="relative mt-3 text-sm text-zg-text-secondary">
          {t.today.objectiveLabel} · {objectiveLabel}
        </p>
      ) : null}

      <form onSubmit={onSubmit} className="relative mt-8">
        <div className="flex items-end gap-2 rounded-2xl border border-white/12 bg-zg-surface/80 px-3 py-2 shadow-[0_0_48px_-18px_rgba(124,92,255,0.55)] backdrop-blur-md">
          <Sparkles className="mb-2.5 h-4 w-4 shrink-0 text-zg-accent" strokeWidth={2} />
          <textarea
            ref={inputRef}
            rows={1}
            value={input}
            onChange={(event) => setInput(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter" && !event.shiftKey) {
                event.preventDefault();
                void send();
              }
            }}
            placeholder={t.today.inputPlaceholder}
            className="min-h-11 w-full resize-none bg-transparent py-2.5 text-sm text-zg-fg outline-none placeholder:text-zg-text-placeholder"
          />
          <span className="mb-1.5 hidden text-zg-text-muted sm:inline" aria-hidden>
            <Paperclip className="h-4 w-4 opacity-30" />
          </span>
          <button
            type="submit"
            disabled={pending || !input.trim()}
            className="mb-1 inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[#7c5cff] to-[#6366f1] text-white disabled:opacity-40"
            aria-label={t.assistant.send}
          >
            <ArrowUp className="h-4 w-4" strokeWidth={2.4} />
          </button>
        </div>
      </form>

      <div className="relative mt-5 flex flex-wrap justify-center gap-2">
        {suggestions.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => void send(item.prompt)}
            disabled={pending}
            className="rounded-full border border-white/10 bg-white/[0.03] px-3.5 py-1.5 text-xs font-medium text-zg-text-secondary transition-colors hover:border-white/20 hover:bg-white/[0.06] hover:text-zg-fg disabled:opacity-50"
          >
            {item.label}
          </button>
        ))}
      </div>

      {messages.length || pending ? (
        <div className="relative mt-8 max-h-72 space-y-3 overflow-y-auto rounded-2xl border border-white/8 bg-black/20 p-4 text-left">
          {messages.map((message, index) => (
            <div
              key={`${message.role}-${index}`}
              className={cn(
                "rounded-xl px-3 py-2 text-sm leading-relaxed",
                message.role === "user"
                  ? "ml-8 bg-zg-accent/15 text-zg-fg"
                  : "mr-6 bg-white/[0.04] text-zg-text-secondary",
              )}
            >
              <p className="whitespace-pre-wrap">{message.content}</p>
            </div>
          ))}
          {pending ? <p className="text-xs text-zg-text-muted">{t.assistant.thinking}</p> : null}
        </div>
      ) : null}
    </section>
  );
}
