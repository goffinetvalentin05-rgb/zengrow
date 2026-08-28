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

      <p className="text-[13px] font-normal tracking-wide text-zg-muted">{greeting}</p>
      <h1 className="mt-3.5 max-w-2xl text-[2.1rem] font-semibold leading-[1.1] tracking-[-0.03em] text-white sm:text-[2.6rem]">
        {question}
      </h1>
      <p className="mx-auto mt-4 max-w-md text-sm leading-relaxed text-zg-text-secondary">{subtitle}</p>

      <form onSubmit={onSubmit} className="relative mx-auto mt-10 w-full max-w-2xl">
        <div
          className={cn(
            "flex items-end gap-2 rounded-[26px] border border-white/[0.1] bg-white/[0.035] px-4 py-2",
            "transition-colors focus-within:border-white/20 focus-within:bg-white/[0.05]",
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
            className="min-h-11 w-full resize-none bg-transparent py-3 text-left text-[15px] leading-relaxed text-white outline-none placeholder:text-zg-text-placeholder"
          />
          <button
            type="submit"
            disabled={pending || !input.trim()}
            className="mb-1.5 inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white text-zinc-950 transition-colors hover:bg-zinc-200 disabled:opacity-25"
            aria-label={t.assistant.send}
          >
            <ArrowUp className="h-4 w-4" strokeWidth={2.2} />
          </button>
        </div>
      </form>

      <div className="mx-auto mt-4 flex w-full max-w-2xl flex-wrap justify-center gap-2">
        {suggestions.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => void send(item.prompt)}
            disabled={pending}
            className="rounded-full border border-white/[0.09] px-4 py-2 text-[13px] font-normal text-zg-text-secondary transition-colors hover:border-white/20 hover:bg-white/[0.05] hover:text-white disabled:opacity-40"
          >
            {item.label}
          </button>
        ))}
      </div>

      {messages.length || pending ? (
        <div className="relative mx-auto mt-10 max-h-64 w-full max-w-2xl space-y-3 overflow-y-auto text-left">
          {messages.map((message, index) => (
            <div
              key={`${message.role}-${index}`}
              className={cn(
                "rounded-2xl px-4 py-2.5 text-sm leading-relaxed",
                message.role === "user"
                  ? "ml-10 bg-white/[0.07] text-white"
                  : "mr-8 text-zg-text-secondary",
              )}
            >
              <p className="whitespace-pre-wrap">{message.content}</p>
            </div>
          ))}
          {pending ? <p className="px-4 text-xs text-zg-muted">{t.assistant.thinking}</p> : null}
        </div>
      ) : null}
    </section>
  );
}
