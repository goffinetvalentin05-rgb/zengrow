import Link from "next/link";
import { Check } from "lucide-react";
import { LANDING_PRICING_CARDS } from "@/src/lib/billing/landing-plans";
import { ZENGROW_PLAN_CATALOG, ZENGROW_TRIAL_DAYS } from "@/src/lib/billing/plan-catalog";
import { cn } from "@/src/lib/utils";
import {
  BlockHeader,
  Container,
  PremiumCard,
  PrimaryButton,
  Section,
  SectionAmbient,
} from "../ui";
import { ScrollReveal } from "../ScrollReveal";

const catalogByKey = Object.fromEntries(ZENGROW_PLAN_CATALOG.map((p) => [p.key, p]));

/** Exactement 2 offres : Starter + Pro */
const LANDING_PLANS = LANDING_PRICING_CARDS.filter((card) => card.planKey in catalogByKey);

export function PricingSection() {
  return (
    <Section id="tarifs" className="relative overflow-hidden">
      <SectionAmbient />
      <Container>
        <ScrollReveal>
          <div className="mx-auto max-w-2xl text-center">
            <BlockHeader
              title="Choisissez l'offre adaptée à votre restaurant."
              subtitle="Deux formules simples en CHF / mois — Starter pour bien démarrer, Pro pour accélérer avec le marketing et l’IA."
            />
            <p className="mt-4 text-sm font-medium text-violet-200/90">
              {ZENGROW_TRIAL_DAYS} jours d&apos;essai gratuit · Sans carte bancaire pour commencer
            </p>
          </div>
        </ScrollReveal>

        <ScrollReveal delay={0.1}>
          <div className="mx-auto mt-12 grid max-w-5xl grid-cols-1 gap-6 sm:grid-cols-2 sm:items-stretch">
            {LANDING_PLANS.map((card) => {
              const plan = catalogByKey[card.planKey];
              const featured = card.featured ?? plan.featured;

              const cardBody = (
                <div className="flex h-full flex-col p-7 md:p-8">
                  {card.badge ? (
                    <span className="mb-4 inline-flex w-fit rounded-full border border-violet-400/35 bg-violet-500/20 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-violet-100">
                      {card.badge}
                    </span>
                  ) : (
                    <span className="mb-4 block h-6" aria-hidden />
                  )}

                  <p className="zg-display text-lg font-bold text-white">{plan.title}</p>
                  <p className="mt-2 text-sm leading-relaxed text-[#9b8fb8]">{card.description}</p>

                  <p className="zg-display mt-6 text-4xl font-bold tracking-tight text-white md:text-5xl">
                    {plan.priceAmount}
                    <span className="ml-1 text-base font-medium text-[#9b8fb8]">CHF / mois</span>
                  </p>
                  <p className="mt-1 text-xs text-[#9b8fb8]/80">{plan.subtitle}</p>

                  <ul className="mt-6 flex-1 space-y-2.5 border-t border-white/[0.06] pt-6">
                    {plan.features.map((item) => (
                      <li key={item} className="flex items-start gap-2.5 text-sm text-white/90">
                        <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-violet-500/25">
                          <Check className="h-3 w-3 text-violet-200" strokeWidth={2.5} aria-hidden />
                        </span>
                        {item}
                      </li>
                    ))}
                  </ul>

                  {featured ? (
                    <PrimaryButton href={card.cta.href} className="mt-8 w-full justify-center">
                      {card.cta.label}
                    </PrimaryButton>
                  ) : (
                    <Link
                      href={card.cta.href}
                      className={cn("zg-btn-ghost mt-8 w-full justify-center text-center")}
                    >
                      {card.cta.label}
                    </Link>
                  )}
                </div>
              );

              if (featured) {
                return (
                  <div key={card.id} className="zg-pricing-shell relative sm:-mt-1">
                    <div className="zg-pricing-glow" aria-hidden />
                    <div className="zg-pricing-card-inner h-full">
                      <PremiumCard className="h-full overflow-hidden !border-0 !shadow-none">
                        {cardBody}
                      </PremiumCard>
                    </div>
                  </div>
                );
              }

              return (
                <PremiumCard key={card.id} glow className="h-full">
                  {cardBody}
                </PremiumCard>
              );
            })}
          </div>
        </ScrollReveal>
      </Container>
    </Section>
  );
}
