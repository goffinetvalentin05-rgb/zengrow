import { Calendar, RefreshCw, Star } from "lucide-react";
import { Container, Section, SectionHeader } from "@/components/landing-v2/ui";

const moments = [
  {
    step: "01",
    title: "Avant la réservation",
    text: "Une page claire qui donne envie de réserver.",
    icon: Calendar,
  },
  {
    step: "02",
    title: "Après la visite",
    text: "Des avis Google demandés au bon moment.",
    icon: Star,
  },
  {
    step: "03",
    title: "Quand le client ne revient plus",
    text: "Des relances IA pour le faire revenir.",
    icon: RefreshCw,
  },
] as const;

export function SolutionSection() {
  return (
    <Section id="solution">
      <Container>
        <SectionHeader title="ZenGrow agit sur les 3 moments qui comptent." />

        <div className="mt-12 grid gap-5 lg:grid-cols-12 lg:gap-6">
          <article className="zg-card zg-card--glow flex flex-col justify-between p-6 sm:p-7 lg:col-span-4 lg:min-h-[340px]">
            <div>
              <span className="text-xs font-medium tracking-widest text-[#5EB3FF]">{moments[0].step}</span>
              <Calendar className="mt-4 size-6 text-[#5EB3FF]" strokeWidth={1.5} aria-hidden />
              <h3 className="mt-3 font-[family-name:var(--font-instrument-serif)] text-2xl text-[#EEF6FF]">
                {moments[0].title}
              </h3>
              <p className="mt-2 text-sm text-[#8BA3C7]">{moments[0].text}</p>
            </div>
            <div className="mt-6 rounded-xl border border-[rgba(59,158,255,0.25)] bg-[rgba(0,0,0,0.25)] p-3">
              <div className="h-12 rounded-lg bg-gradient-to-br from-[rgba(43,140,255,0.35)] to-transparent" />
              <div className="mt-2 rounded-md bg-[#2B8CFF] py-2 text-center text-xs font-semibold text-white">
                Réserver
              </div>
            </div>
          </article>

          <div className="flex flex-col gap-5 lg:col-span-8">
            <article className="zg-card flex flex-col justify-between gap-4 p-6 sm:flex-row sm:items-center sm:p-7">
              <div>
                <span className="text-xs font-medium tracking-widest text-[#5EB3FF]">{moments[1].step}</span>
                <h3 className="mt-2 font-[family-name:var(--font-instrument-serif)] text-2xl text-[#EEF6FF]">
                  {moments[1].title}
                </h3>
                <p className="mt-2 text-sm text-[#8BA3C7]">{moments[1].text}</p>
              </div>
              <div className="flex shrink-0 items-center gap-1" aria-hidden>
                {Array.from({ length: 5 }).map((_, n) => (
                  <Star key={n} className="size-5 fill-[#5EB3FF] text-[#5EB3FF]" />
                ))}
              </div>
            </article>

            <article className="zg-card zg-card--glow p-6 sm:p-7">
              <span className="text-xs font-medium tracking-widest text-[#38D4FF]">{moments[2].step}</span>
              <div className="mt-3 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h3 className="font-[family-name:var(--font-instrument-serif)] text-2xl text-[#EEF6FF]">
                    {moments[2].title}
                  </h3>
                  <p className="mt-2 text-sm text-[#8BA3C7]">{moments[2].text}</p>
                </div>
                <div className="rounded-xl border border-[rgba(59,158,255,0.22)] bg-[rgba(0,0,0,0.3)] px-4 py-3 text-sm">
                  <p className="font-medium text-[#5EB3FF]">Relance prête</p>
                  <p className="text-xs text-[#8BA3C7]">À valider avant envoi</p>
                </div>
              </div>
            </article>
          </div>
        </div>
      </Container>
    </Section>
  );
}
