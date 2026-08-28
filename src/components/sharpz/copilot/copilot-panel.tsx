"use client";

import { FormEvent } from "react";
import { ArrowUp } from "lucide-react";
import { CopilotOrb } from "@/src/components/sharpz/copilot/copilot-orb";
import { useCopilot } from "@/src/components/sharpz/copilot/copilot-context";
import { useDashboardI18n } from "@/src/components/dashboard/i18n/dashboard-locale-provider";
import { cn } from "@/src/lib/utils";

type Suggestion = { id: string; label: string; prompt: string };

type Props = {
  greeting: string;
  question: string;
  subtitle: string;
  suggestions: Suggestion[];
};

export function CopilotHero({ greeting, question, subtitle, suggestions }: Props) {
  const { t } = useDashboardI18n();
  const { input, setInput, inputRef, send, pending, messages } = useCopilot();

  function onSubmit(event: FormEvent) {
    event.preventDefault();
    void send();
  }

  return (
    <section id="sharpz-copilot" className="zg-premium-card overflow-hidden p-6 sm:p-8">
      <div className="flex flex-col items-start gap-8 lg:flex-row lg:items-center">
        <div className="hidden shrink-0 lg:block">
          <CopilotOrb />
        </div>

        <div className="min-w-0 flex-1">
          <p className="text-[13px] font-medium tracking-wide text-zg-muted">{greeting}</p>
          <h1 className="mt-2 max-w-2xl text-[1.85rem] font-semibold leading-[1.12] tracking-[-0.03em] text-zg-fg sm:text-[2.15rem]">
            {question}
          </h1>
          <p className="mt-3 max-w-xl text-sm leading-relaxed text-zg-text-secondary">{subtitle}</p>

          <form onSubmit={onSubmit} className="mt-7 w-full">
            <div
              className={cn(
                "flex items-end gap-2 rounded-2xl border border-white/[0.1] bg-black/25 px-3.5 py-2",
                "shadow-[0_1px_0_rgba(255,255,255,0.05)_inset] transition-colors",
                "focus-within:border-white/22 focus-within:bg-black/35",
              )}
            >
              <textarea
                id="sharpz-command-input"
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
                className="min-h-11 w-full resize-none bg-transparent py-3 text-left text-[15px] leading-relaxed text-zg-fg outline-none placeholder:text-zg-text-placeholder"
              />
              <button
                type="submit"
                disabled={pending || !input.trim()}
                className="mb-1.5 inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white text-zinc-950 transition-colors hover:bg-zinc-200 disabled:opacity-25"
                aria-label={t.assistant.send}
              >
                <ArrowUp className="h-4 w-4" strokeWidth={2.2} />
              </button>
            </div>
          </form>

          <div className="mt-4 flex w-full flex-wrap gap-2">
            {suggestions.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => void send(item.prompt)}
                disabled={pending}
                className="rounded-xl border border-white/[0.09] bg-white/[0.025] px-3.5 py-2 text-[13px] font-medium text-zg-text-secondary shadow-[0_1px_0_rgba(255,255,255,0.04)_inset] transition-colors hover:border-white/18 hover:bg-white/[0.05] hover:text-zg-fg disabled:opacity-40"
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {messages.length || pending ? (
        <div className="mt-7 space-y-3 border-t border-white/[0.07] pt-6">
          {messages.map((message, index) => (
            <div
              key={`${message.role}-${index}`}
              className={cn(
                "rounded-2xl px-4 py-3 text-sm leading-relaxed",
                message.role === "user"
                  ? "ml-auto max-w-[85%] bg-white/[0.08] text-zg-fg"
                  : "max-w-[92%] bg-white/[0.03] text-zg-text-secondary",
              )}
            >
              <p className="whitespace-pre-wrap">{message.content}</p>
            </div>
          ))}
          {pending ? <p className="px-1 text-xs text-zg-muted">{t.assistant.thinking}</p> : null}
        </div>
      ) : null}
    </section>
  );
}
