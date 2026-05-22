import { Check, Sparkles } from "lucide-react";
import { Container, Section, SectionHeader } from "@/components/landing-v2/ui";

const actions = [
  "Remplir un soir calme",
  "Faire revenir les anciens clients",
  "Promouvoir un menu spécial",
  "Demander plus d'avis Google",
] as const;

export function AIConcreteSection() {
  return (
    <Section id="ia">
      <Container>
        <div className="grid items-start gap-10 lg:grid-cols-2 lg:gap-14">
          <div>
            <SectionHeader
              align="left"
              title="L'IA travaille là où vous manquez de temps."
              subtitle="Elle prépare vos relances, vos campagnes et vos textes marketing. Vous gardez la main, vous validez, puis vous envoyez."
            />
            <p className="mt-6 flex items-start gap-3 rounded-xl border border-[rgba(59,158,255,0.22)] bg-[rgba(43,140,255,0.08)] px-4 py-3.5 text-sm font-medium text-[#EEF6FF]">
              <Check className="mt-0.5 size-4 shrink-0 text-[#38D4FF]" strokeWidth={2.5} aria-hidden />
              L&apos;IA propose. Vous gardez toujours le contrôle.
            </p>
          </div>

          <div className="zg-card zg-card--glow p-6 sm:p-7">
            <div className="flex items-center gap-2.5">
              <span className="flex size-9 items-center justify-center rounded-lg bg-[#2B8CFF] text-white">
                <Sparkles className="size-4" aria-hidden />
              </span>
              <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#5EB3FF]">
                Assistant IA ZenGrow
              </p>
            </div>

            <p className="mt-5 font-[family-name:var(--font-instrument-serif)] text-xl text-[#EEF6FF]">
              Que voulez-vous faire aujourd&apos;hui ?
            </p>

            <div className="mt-4 grid gap-2 sm:grid-cols-2">
              {actions.map((label, i) => (
                <span
                  key={label}
                  className={`rounded-lg border px-3 py-2.5 text-xs ${
                    i === 0
                      ? "border-[rgba(43,140,255,0.4)] bg-[rgba(43,140,255,0.12)] text-[#EEF6FF]"
                      : "border-[rgba(255,255,255,0.08)] text-[#8BA3C7]"
                  }`}
                >
                  {label}
                </span>
              ))}
            </div>

            <div className="mt-5 rounded-xl border border-[rgba(255,255,255,0.06)] bg-[rgba(0,0,0,0.25)] p-3">
              <p className="text-[10px] uppercase tracking-wider text-[#8BA3C7]">Brouillon IA</p>
              <p className="mt-2 text-sm text-[#EEF6FF]/90">
                Bonjour Marie, nous serions ravis de vous accueillir à nouveau ce vendredi…
              </p>
            </div>

            <p className="mt-5 w-full rounded-full border border-[rgba(59,158,255,0.3)] bg-[rgba(43,140,255,0.12)] py-3 text-center text-sm font-semibold text-[#EEF6FF]">
              Valider avant envoi
            </p>
          </div>
        </div>
      </Container>
    </Section>
  );
}
