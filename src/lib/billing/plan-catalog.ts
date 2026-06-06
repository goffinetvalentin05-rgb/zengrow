/**
 * Source unique des offres ZenGrow (landing + dashboard billing).
 * Aligné sur Stripe / checkout : starter | pro.
 */

export type PlanKey = "starter" | "pro";

export type PlanCatalogItem = {
  key: PlanKey;
  title: string;
  priceAmount: string;
  priceLabel: string;
  subtitle: string;
  cta: string;
  featured: boolean;
  badge?: string;
  features: readonly string[];
  /** Textes landing (positionnement) */
  landingHeadline: string;
  landingDescription: string;
};

export const ZENGROW_PLAN_CATALOG: readonly PlanCatalogItem[] = [
  {
    key: "starter",
    title: "Starter",
    priceAmount: "49",
    priceLabel: "49 CHF / mois",
    subtitle: "Pour bien démarrer",
    cta: "Choisir Starter",
    featured: false,
    landingHeadline: "Pour démarrer",
    landingDescription:
      "Base clients, demandes d'avis Google automatiques et relances essentielles pour ne plus perdre vos visiteurs.",
    features: [
      "Base clients",
      "Demandes d'avis Google automatiques",
      "Relances clients automatiques",
      "Feedback privé clients",
      "Suivi des clients inactifs",
    ],
  },
  {
    key: "pro",
    title: "Pro",
    priceAmount: "69",
    priceLabel: "69 CHF / mois",
    subtitle: "Pour accélérer",
    cta: "Choisir Pro",
    featured: true,
    badge: "Le plus choisi",
    landingHeadline: "Pour faire revenir vos clients",
    landingDescription:
      "Relances IA avancées, segmentation et stats pour maximiser le retour de vos clients existants.",
    features: [
      "Tout le plan Starter",
      "Relances IA personnalisées",
      "Segmentation clients",
      "Stats de fidélisation",
      "Export clients",
    ],
  },
] as const;

export const ZENGROW_TRIAL_DAYS = 14;
