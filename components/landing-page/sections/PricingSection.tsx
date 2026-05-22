import Link from "next/link";
import { LANDING_PRICING_CARDS } from "@/src/lib/billing/landing-plans";
import { ZENGROW_PLAN_CATALOG, ZENGROW_TRIAL_DAYS } from "@/src/lib/billing/plan-catalog";
import { Container, GlassCard, PrimaryButton, Section, SectionHeader } from "@/components/landing-page/ui";
import { ScrollReveal } from "@/components/landing-page/ScrollReveal";

export function PricingSection() {
  const catalogByKey = Object.fromEntries(ZENGROW_PLAN_CATALOG.map((p) => [p.key, p]));

  return (
    <Section id="tarifs">
      <Container>
        <ScrollReveal>
          <SectionHeader title="Choisissez l'offre adaptée à votre restaurant." />
          <p className="mx-auto mt-3 max-w-lg text-center text-sm text-[#8BA3C7]">
            Essai gratuit {ZENGROW_TRIAL_DAYS} jours sur les offres payantes.
          </p>
        </ScrollReveal>

        <div className="mt-12 grid gap-5 lg:grid-cols-3 lg:items-stretch">
          {LANDING_PRICING_CARDS.map((card, i) => {
            const catalog = card.planKey ? catalogByKey[card.planKey] : null;
            const featured = card.featured;

            return (
              <ScrollReveal key={card.id} delay={i * 0.08} className="h-full">
                <GlassCard
                  strong={featured}
                  className={`relative flex h-full flex-col p-6 sm:p-7 ${
                    featured ? "ring-1 ring-[rgba(47,92,255,0.5)]" : ""
                  }`}
                >
                  {card.badge ? (
                    <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-gradient-to-r from-[#1b4fff] to-[#2f5cff] px-3 py-1 text-[10px] font-bold uppercase tracking-wide text-white">
                      {card.badge}
                    </span>
                  ) : null}

                  <h3 className="zg-lp-display text-lg font-semibold text-[#EEF6FF]">
                    {card.headline}
                  </h3>
                  <p className="mt-3 flex-1 text-sm leading-relaxed text-[#8BA3C7]">
                    {card.description}
                  </p>

                  {card.priceLabel && catalog ? (
                    <p className="zg-lp-display mt-6 text-3xl font-bold tabular-nums tracking-tight text-[#EEF6FF]">
                      {catalog.priceAmount}
                      <span className="ml-1 text-base font-medium text-[#8BA3C7]">
                        CHF / mois
                      </span>
                    </p>
                  ) : (
                    <p className="mt-6 text-sm text-[#8BA3C7]">Tarif sur mesure</p>
                  )}

                  {featured ? (
                    <PrimaryButton href={card.cta.href} className="mt-6 w-full">
                      {card.cta.label}
                    </PrimaryButton>
                  ) : (
                    <Link
                      href={card.cta.href}
                      className="zg-lp-btn-secondary zg-lp-body mt-6 w-full text-center"
                    >
                      {card.cta.label}
                    </Link>
                  )}
                </GlassCard>
              </ScrollReveal>
            );
          })}
        </div>
      </Container>
    </Section>
  );
}
