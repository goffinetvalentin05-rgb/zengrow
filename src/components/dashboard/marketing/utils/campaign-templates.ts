import type { LucideIcon } from "lucide-react";
import { CalendarDays, Gift, PartyPopper, Snowflake, Sparkles, UtensilsCrossed } from "lucide-react";

export type CampaignAudienceFilter =
  | "all_customers"
  | "visited_last_30_days"
  | "visited_last_90_days"
  | "visited_more_than_3_times"
  | "inactive_30_days";

export type CampaignTemplateId =
  | "seasonal-promo"
  | "holidays"
  | "new-menu"
  | "special-offer"
  | "event"
  | "reactivate-buyers";

export type CampaignTemplate = {
  id: CampaignTemplateId;
  icon: LucideIcon;
  title: string;
  description: string;
  draft: {
    name: string;
    subject: string;
    content: string;
    audience: CampaignAudienceFilter;
  };
};

export const CAMPAIGN_TEMPLATES: readonly CampaignTemplate[] = [
  {
    id: "seasonal-promo",
    icon: Sparkles,
    title: "Promotion saisonnière",
    description: "Mettez en avant une offre liée à la saison en cours.",
    draft: {
      name: "Promotion saisonnière",
      subject: "Une offre de saison vous attend",
      content: `Bonjour,

La saison change et nous avons préparé une offre spéciale pour vous.

Profitez-en pour offrir ou utiliser un bon cadeau chez nous.

À bientôt,`,
      audience: "all_customers",
    },
  },
  {
    id: "holidays",
    icon: Snowflake,
    title: "Noël / fêtes",
    description: "Proposez vos bons cadeaux pour les fêtes de fin d’année.",
    draft: {
      name: "Noël / fêtes",
      subject: "Offrez un moment unique pour les fêtes",
      content: `Bonjour,

Les fêtes approchent. Offrez un bon cadeau et faites plaisir à vos proches.

Nous nous occupons du reste.

Joyeuses fêtes,`,
      audience: "all_customers",
    },
  },
  {
    id: "new-menu",
    icon: UtensilsCrossed,
    title: "Nouveau menu",
    description: "Annoncez une nouveauté à vos acheteurs.",
    draft: {
      name: "Nouveau menu",
      subject: "Notre nouveauté est arrivée",
      content: `Bonjour,

Nous avons le plaisir de vous présenter une nouveauté.

Venez la découvrir, éventuellement avec un bon cadeau.

À très bientôt,`,
      audience: "visited_last_90_days",
    },
  },
  {
    id: "special-offer",
    icon: Gift,
    title: "Offre spéciale",
    description: "Créez une campagne courte pour une offre limitée.",
    draft: {
      name: "Offre spéciale",
      subject: "Une offre spéciale rien que pour vous",
      content: `Bonjour,

Nous avons une offre limitée dans le temps, pensée pour nos acheteurs.

Profitez-en avant qu’elle ne se termine.

À bientôt,`,
      audience: "all_customers",
    },
  },
  {
    id: "event",
    icon: PartyPopper,
    title: "Événement",
    description: "Invitez votre base clients à un événement.",
    draft: {
      name: "Événement",
      subject: "Un événement à ne pas manquer",
      content: `Bonjour,

Nous organisons un événement et serions ravis de vous y retrouver.

Réservez votre place dès maintenant.

À très bientôt,`,
      audience: "all_customers",
    },
  },
  {
    id: "reactivate-buyers",
    icon: CalendarDays,
    title: "Relance anciens acheteurs",
    description: "Rappelez-vous aux personnes qui n’ont pas racheté récemment.",
    draft: {
      name: "Relance anciens acheteurs",
      subject: "Vos bons cadeaux vous manquent ?",
      content: `Bonjour,

Cela fait un moment que nous ne vous avons pas vu.

Offrez à nouveau un bon cadeau, ou utilisez celui que vous avez déjà.

À bientôt,`,
      audience: "inactive_30_days",
    },
  },
] as const;

export function getCampaignTemplate(id: CampaignTemplateId): CampaignTemplate | undefined {
  return CAMPAIGN_TEMPLATES.find((template) => template.id === id);
}
