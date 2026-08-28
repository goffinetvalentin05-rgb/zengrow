"use client";

import { FormEvent } from "react";
import { ArrowUp } from "lucide-react";
import { ProspectSearchCards } from "@/src/components/sharpz/agent/prospect-search-cards";
import { CopilotOrb } from "@/src/components/sharpz/copilot/copilot-orb";
import { useCopilot } from "@/src/components/sharpz/copilot/copilot-context";
import Button from "@/src/components/ui/button";
import { useDashboardI18n } from "@/src/components/dashboard/i18n/dashboard-locale-provider";
import { cn } from "@/src/lib/utils";

type Suggestion = { id: string; label: string; prompt: string };

function ProspectSearchInline({ prospects }: { prospects: import("@/src/components/sharpz/copilot/copilot-context").CopilotProspect[] }) {
  const { t } = useDashboardI18n();
  const {
    selectedProspectIds,
    toggleProspectSelection,
    acceptProspect,
    acceptingId,
  } = useCopilot();

  return (
    <ProspectSearchCards
      prospects={prospects}
      selectedIds={selectedProspectIds}
      onToggle={toggleProspectSelection}
      onAddOne={(id) => void acceptProspect(id)}
      acceptingId={acceptingId}
      compact
      copy={{
        fit: t.agentPage.fitLabel,
        email: t.prospectsPage.email,
        phone: t.prospectsPage.phone,
        location: t.agentPage.locationLabel,
        noContact: t.agentPage.contactNotFound,
        viewSite: t.agentPage.viewSite,
        add: t.today.validate,
        whyFit: t.prospectsPage.whyFit + " :",
      }}
    />
  );
}

type Props = {
  greeting: string;
  firstName?: string | null;
  question: string;
  subtitle: string;
  suggestions: Suggestion[];
};

export function CopilotHero({ greeting, firstName, question, subtitle, suggestions }: Props) {
  const { t } = useDashboardI18n();
  const { input, setInput, inputRef, send, pending, messages, retrySearch } = useCopilot();
  const hasThread = Boolean(messages.length || pending);

  function onSubmit(event: FormEvent) {
    event.preventDefault();
    void send();
  }

  const name = firstName?.trim();
  const greetingLead = name && greeting.includes(name) ? greeting.slice(0, greeting.indexOf(name)) : greeting;

  return (
    <section
      id="sharpz-copilot"
      className={cn(
        "relative mx-auto flex w-full max-w-3xl flex-col items-center px-1 text-center",
        hasThread ? "justify-start pt-2" : "min-h-[min(calc(100dvh-9rem),680px)] justify-center",
      )}
    >
      <div
        className="pointer-events-none absolute left-1/2 top-[12%] h-[360px] w-[540px] -translate-x-1/2 rounded-full"
        style={{
          background:
            "radial-gradient(ellipse, rgba(203, 180, 220, 0.2) 0%, rgba(155, 122, 173, 0.06) 42%, transparent 70%)",
        }}
        aria-hidden
      />

      <CopilotOrb className={cn("mx-auto", hasThread ? "mb-6 scale-[0.72]" : "mb-10")} />

      <p className="relative text-[15px] tracking-wide text-zg-muted">
        {name ? (
          <>
            {greetingLead}
            <span className="font-medium text-[#cbb4dc]">{name}</span>
          </>
        ) : (
          greeting
        )}
      </p>
      <h1 className="relative mt-4 max-w-2xl text-[2.2rem] font-semibold leading-[1.08] tracking-[-0.035em] text-zg-fg sm:text-[2.75rem]">
        {question}
      </h1>
      <p className="relative mx-auto mt-5 max-w-md text-[15px] leading-relaxed text-zg-text-secondary">{subtitle}</p>

      <form onSubmit={onSubmit} className={cn("relative w-full max-w-2xl", hasThread ? "mt-8" : "mt-11")}>
        <div
          className={cn(
            "flex items-end gap-2 rounded-full border border-white/[0.1] bg-white/[0.04] px-5 py-1.5",
            "backdrop-blur-sm transition-colors",
            "focus-within:border-[#cbb4dc]/35 focus-within:bg-white/[0.055]",
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
            className="min-h-11 w-full resize-none bg-transparent py-2.5 text-left text-[15px] leading-relaxed text-zg-fg outline-none placeholder:text-zg-text-placeholder"
          />
          <button
            type="submit"
            disabled={pending || !input.trim()}
            className="mb-1 inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#cbb4dc] to-[#9b7aad] text-[#1a121c] transition-opacity hover:opacity-90 disabled:opacity-25"
            aria-label={t.assistant.send}
          >
            <ArrowUp className="h-4 w-4" strokeWidth={2.2} />
          </button>
        </div>
      </form>

      <div className="relative mt-6 flex w-full max-w-2xl flex-wrap justify-center gap-2">
        {suggestions.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => void send(item.prompt)}
            disabled={pending}
            className="rounded-full border border-white/[0.08] px-4 py-2 text-[13px] text-zg-text-secondary transition-colors hover:border-[#cbb4dc]/30 hover:text-zg-fg disabled:opacity-40"
          >
            {item.label}
          </button>
        ))}
      </div>

      {hasThread ? (
        <div className="relative mt-12 w-full max-w-2xl space-y-3 text-left">
          {messages.map((message, index) => (
            <div key={`${message.role}-${index}`} className="space-y-2">
              <div
                className={cn(
                  "rounded-2xl px-4 py-3 text-sm leading-relaxed",
                  message.role === "user"
                    ? "ml-auto max-w-[85%] bg-white/[0.07] text-zg-fg"
                    : "max-w-[92%] text-zg-text-secondary",
                )}
              >
                <p className="whitespace-pre-wrap">{message.content}</p>
              </div>
              {message.searchError?.retryable ? (
                <div className="max-w-[92%]">
                  <Button type="button" size="sm" variant="secondary" onClick={() => void retrySearch()}>
                    {t.agentPage.retrySearch}
                  </Button>
                </div>
              ) : null}
              {message.prospects?.length ? (
                <div className="max-w-[92%]">
                  <ProspectSearchInline prospects={message.prospects} />
                </div>
              ) : null}
            </div>
          ))}
          {pending ? <p className="px-1 text-xs text-zg-muted">{t.assistant.thinking}</p> : null}
        </div>
      ) : null}
    </section>
  );
}
