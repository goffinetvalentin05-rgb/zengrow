import Link from "next/link";
import { Check } from "lucide-react";
import { LANDING_PRICING_CARDS } from "@/src/lib/billing/landing-plans";
import { ZENGROW_PLAN_CATALOG, ZENGROW_TRIAL_DAYS } from "@/src/lib/billing/plan-catalog";
import { cn } from "@/src/lib/utils";
import { Container, Section, SectionHeader } from "@/components/landing-v2/ui";

export function PricingSection() {
  const catalogByKey = Object.fromEntries(ZENGROW_PLAN_CATALOG.map((p) => [p.key, p]));

  return (
    <Section id="pricing">
      <Container>
        <SectionHeader title="Choisissez l'offre adaptée à votre restaurant." />
        <p className="-mt-8 mb-12 text-center text-sm text-[#8BA3C7]">
          {ZENGROW_TRIAL_DAYS} jours d&apos;essai gratuit sur les offres en ligne
        </p>

        <div className="mx-auto grid max-w-4xl gap-6 sm:grid-cols-2 lg:items-stretch">
          {LANDING_PRICING_CARDS.filter((card) => card.planKey).map((card) => {
            const catalog = catalogByKey[card.planKey];
            const featured = card.featured;

            return (
              <article
                key={card.id}
                className={cn(
                  "zg-card flex flex-col p-6 sm:p-7",
                  featured && "zg-card--glow lg:-mt-2 lg:mb-2",
                )}
              >
                {card.badge ? (
                  <span className="mb-4 inline-flex w-fit rounded-full bg-[#2B8CFF] px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-white">
                    {card.badge}
                  </span>
                ) : (
                  <span className="mb-4 block h-6" aria-hidden />
                )}

                <h3 className="font-[family-name:var(--font-instrument-serif)] text-xl text-[#EEF6FF]">
                  {card.headline}
                </h3>
                <p className="mt-3 flex-1 text-sm leading-relaxed text-[#8BA3C7]">{card.description}</p>

                {card.priceLabel && catalog ? (
                  <p className="mt-6 font-[family-name:var(--font-instrument-serif)] text-3xl text-[#EEF6FF]">
                    {catalog.priceAmount}
                    <span className="ml-1 text-base font-normal text-[#8BA3C7]">CHF / mois</span>
                  </p>
                ) : (
                  <p className="mt-6 text-sm text-[#8BA3C7]">Tarif sur mesure</p>
                )}

                {catalog ? (
                  <ul className="mt-5 space-y-2 border-t border-[rgba(255,255,255,0.06)] pt-5">
                    {catalog.features.slice(0, 4).map((line) => (
                      <li key={line} className="flex gap-2 text-xs text-[#EEF6FF]/90">
                        <Check className="mt-0.5 size-3.5 shrink-0 text-[#5EB3FF]" strokeWidth={2.5} aria-hidden />
                        {line}
                      </li>
                    ))}
                  </ul>
                ) : null}

                <Link
                  href={card.cta.href}
                  className={cn(
                    "mt-8 flex min-h-11 items-center justify-center rounded-full text-sm font-semibold transition",
                    featured
                      ? "bg-[#2B8CFF] text-white hover:bg-[#5EB3FF]"
                      : "border border-[rgba(255,255,255,0.12)] text-[#EEF6FF] hover:border-[rgba(59,158,255,0.35)] hover:bg-[rgba(43,140,255,0.08)]",
                  )}
                >
                  {card.cta.label}
                </Link>
              </article>
            );
          })}
        </div>
      </Container>
    </Section>
  );
}
