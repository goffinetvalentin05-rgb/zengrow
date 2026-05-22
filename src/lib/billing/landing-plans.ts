import { ZENGROW_PLAN_CATALOG, type PlanKey } from "@/src/lib/billing/plan-catalog";

export type LandingPricingCard = {
  id: string;
  headline: string;
  description: string;
  badge?: string;
  featured?: boolean;
  planKey: PlanKey;
  priceLabel: string;
  cta: { label: string; href: string };
};

const catalogByKey = Object.fromEntries(
  ZENGROW_PLAN_CATALOG.map((p) => [p.key, p]),
) as Record<PlanKey, (typeof ZENGROW_PLAN_CATALOG)[number]>;

/** Landing — uniquement Starter et Pro (pas d’offre « Growth » / contact). */
export const LANDING_PRICING_CARDS: readonly LandingPricingCard[] = ZENGROW_PLAN_CATALOG.map(
  (plan) => ({
    id: plan.key,
    headline: plan.landingHeadline,
    description: plan.landingDescription,
    badge: plan.badge,
    featured: plan.featured,
    planKey: plan.key,
    priceLabel: plan.priceLabel,
    cta: { label: plan.cta, href: "/signup" },
  }),
);
