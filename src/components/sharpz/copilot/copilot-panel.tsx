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
    <section
      id="sharpz-copilot"
      className="relative mx-auto flex min-h-[min(calc(100dvh-12rem),640px)] w-full max-w-3xl flex-col items-center justify-center px-1 pb-6 pt-2 text-center"
    >
      <CopilotOrb />

      <p className="text-[13px] font-medium tracking-wide text-slate-400">{greeting}</p>
      <h1 className="mt-3 max-w-2xl text-[2rem] font-semibold leading-[1.12] tracking-tight text-white sm:text-[2.5rem]">
        {question}
      </h1>
      <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-slate-400">{subtitle}</p>

      <form onSubmit={onSubmit} className="relative mx-auto mt-8 w-full max-w-2xl">
        <div
          className={cn(
            "flex items-end gap-2 rounded-[28px] border border-white/10 bg-white/[0.045] px-4 py-2.5",
            "shadow-[0_1px_0_rgba(255,255,255,0.04)_inset,0_18px_50px_-28px_rgba(0,0,0,0.85)]",
            "transition-colors focus-within:border-white/18",
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
            className="min-h-11 w-full resize-none bg-transparent py-2.5 text-left text-[15px] leading-relaxed text-white outline-none placeholder:text-slate-500"
          />
          <button
            type="submit"
            disabled={pending || !input.trim()}
            className="mb-0.5 inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white text-zinc-950 transition-opacity disabled:opacity-30"
            aria-label={t.assistant.send}
          >
            <ArrowUp className="h-4 w-4" strokeWidth={2.4} />
          </button>
        </div>
      </form>

      <div className="mx-auto mt-6 grid w-full max-w-2xl grid-cols-1 gap-2.5 sm:grid-cols-2">
        {suggestions.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => void send(item.prompt)}
            disabled={pending}
            className="rounded-2xl border border-white/[0.08] bg-white/[0.03] px-4 py-3.5 text-left text-sm font-medium text-slate-200 transition-colors hover:border-white/16 hover:bg-white/[0.055] hover:text-white disabled:opacity-50"
          >
            {item.label}
          </button>
        ))}
      </div>

      {messages.length || pending ? (
        <div className="relative mx-auto mt-8 max-h-64 w-full max-w-2xl space-y-2.5 overflow-y-auto text-left">
          {messages.map((message, index) => (
            <div
              key={`${message.role}-${index}`}
              className={cn(
                "rounded-2xl px-4 py-2.5 text-sm leading-relaxed",
                message.role === "user"
                  ? "ml-10 bg-white/[0.07] text-white"
                  : "mr-8 text-slate-300",
              )}
            >
              <p className="whitespace-pre-wrap">{message.content}</p>
            </div>
          ))}
          {pending ? <p className="px-4 text-xs text-slate-500">{t.assistant.thinking}</p> : null}
        </div>
      ) : null}
    </section>
  );
}
