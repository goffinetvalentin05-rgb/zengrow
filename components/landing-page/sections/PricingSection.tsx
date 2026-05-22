import Link from "next/link";
import { Check } from "lucide-react";
import { LANDING_PRICING_CARDS } from "@/src/lib/billing/landing-plans";
import { ZENGROW_PLAN_CATALOG, ZENGROW_TRIAL_DAYS } from "@/src/lib/billing/plan-catalog";
import { Container, PrimaryButton, Section } from "@/components/landing-page/ui";
import { ScrollReveal } from "@/components/landing-page/ScrollReveal";

const catalogByKey = Object.fromEntries(ZENGROW_PLAN_CATALOG.map((p) => [p.key, p]));

export function PricingSection() {
  return (
    <Section id="tarifs" className="relative">
      <Container>
        <ScrollReveal>
          <h2 className="zg-lp-title zg-lp-display mx-auto max-w-2xl text-center">
            Choisissez l&apos;offre adaptée à votre restaurant.
          </h2>
          <p className="mx-auto mt-4 max-w-lg text-center text-sm text-[var(--zg-muted)]">
            {ZENGROW_TRIAL_DAYS} jours d&apos;essai gratuit · Deux formules en CHF / mois
          </p>
        </ScrollReveal>

        <ScrollReveal delay={0.1}>
          <div className="mx-auto mt-12 grid max-w-4xl grid-cols-1 gap-6 sm:grid-cols-2">
            {LANDING_PRICING_CARDS.map((card) => {
              const plan = catalogByKey[card.planKey];
              const featured = card.featured ?? plan.featured;

              return (
                <div
                  key={card.id}
                  className={`zg-lp-pricing-card relative p-7 sm:p-8 ${featured ? "ring-2 ring-violet-500/30" : ""}`}
                >
                  {card.badge ? (
                    <span className="mb-4 inline-flex rounded-full bg-violet-500/20 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-violet-200">
                      {card.badge}
                    </span>
                  ) : null}
                  <p className="text-sm font-semibold uppercase tracking-wider text-violet-300">
                    {plan.title}
                  </p>
                  <p className="mt-2 text-sm text-[var(--zg-muted)]">{card.description}</p>
                  <div className="mt-4 flex items-baseline gap-1">
                    <span className="zg-lp-display text-4xl font-bold tracking-tight sm:text-5xl">
                      {plan.priceAmount}
                    </span>
                    <span className="text-base text-[var(--zg-muted)]">CHF / mois</span>
                  </div>
                  <ul className="mt-6 space-y-2 border-t border-white/6 pt-5">
                    {plan.features.map((item) => (
                      <li key={item} className="flex items-center gap-2 text-sm text-[var(--zg-muted)]">
                        <Check className="size-4 shrink-0 text-violet-400" />
                        {item}
                      </li>
                    ))}
                  </ul>
                  {featured ? (
                    <PrimaryButton href={card.cta.href} className="mt-8 w-full justify-center" showArrow>
                      {card.cta.label}
                    </PrimaryButton>
                  ) : (
                    <Link
                      href={card.cta.href}
                      className="mt-8 flex min-h-11 w-full items-center justify-center rounded-full border border-white/12 text-sm font-semibold text-[var(--zg-fg)] transition hover:border-violet-400/40 hover:bg-white/5"
                    >
                      {card.cta.label}
                    </Link>
                  )}
                </div>
              );
            })}
          </div>
        </ScrollReveal>
      </Container>
    </Section>
  );
}
