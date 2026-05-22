import { ZENGROW_PLAN_CATALOG, type PlanKey } from "@/src/lib/billing/plan-catalog";

export type LandingPricingCard = {
  id: string;
  headline: string;
  description: string;
  badge?: string;
  featured?: boolean;
  planKey?: PlanKey;
  priceLabel?: string;
  cta: { label: string; href: string };
};

const catalogByKey = Object.fromEntries(
  ZENGROW_PLAN_CATALOG.map((p) => [p.key, p]),
) as Record<PlanKey, (typeof ZENGROW_PLAN_CATALOG)[number]>;

/** Affichage landing — prix issus du catalogue (pas de montants inventés). */
export const LANDING_PRICING_CARDS: readonly LandingPricingCard[] = [
  {
    id: "starter",
    headline: "Pour démarrer",
    description:
      "Une page de réservation claire pour présenter votre restaurant et recevoir vos premières réservations en ligne.",
    planKey: "starter",
    priceLabel: catalogByKey.starter.priceLabel,
    cta: { label: catalogByKey.starter.cta, href: "/signup" },
  },
  {
    id: "pro",
    headline: "Pour faire revenir vos clients",
    description:
      "Réservations, base clients, relances IA, campagnes marketing et avis Google.",
    badge: "Le plus choisi",
    featured: true,
    planKey: "pro",
    priceLabel: catalogByKey.pro.priceLabel,
    cta: { label: catalogByKey.pro.cta, href: "/signup" },
  },
  {
    id: "growth",
    headline: "Pour automatiser votre croissance",
    description:
      "Pour les restaurants qui veulent aller plus loin avec les campagnes IA, les relances avancées et l'automatisation.",
    cta: { label: "Nous contacter", href: "mailto:contact@zengrow.ch" },
  },
] as const;
