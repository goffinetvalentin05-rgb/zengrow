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
      "Une page de réservation claire pour présenter votre restaurant et recevoir vos premières réservations en ligne.",
    features: [
      "Réservations en ligne",
      "Gestion des disponibilités",
      "Page de réservation personnalisable",
      "Demandes d'avis Google automatiques",
      "Feedback privé clients",
      "Base clients",
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
      "Réservations, base clients, relances IA, campagnes marketing et avis Google.",
    features: [
      "Tout le plan Starter",
      "Campagnes e-mail marketing",
      "Segmentation clients",
      "Stats clients",
      "Export clients",
    ],
  },
] as const;

export const ZENGROW_TRIAL_DAYS = 14;
