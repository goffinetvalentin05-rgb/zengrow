export type CampaignAudienceFilter =
  | "all_customers"
  | "visited_last_30_days"
  | "visited_last_90_days"
  | "visited_more_than_3_times";

export type CampaignTemplateId = "special-evening" | "birthday" | "reactivation";

export type CampaignTemplate = {
  id: CampaignTemplateId;
  emoji: string;
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
    id: "special-evening",
    emoji: "🎉",
    title: "Soirée spéciale",
    description: "Invitez vos clients à un événement",
    draft: {
      name: "Soirée spéciale",
      subject: "Une soirée exceptionnelle vous attend",
      content: `Bonjour,

Nous organisons une soirée spéciale et serions ravis de vous compter parmi nos invités.

Réservez votre table dès maintenant pour ne pas manquer cet événement.

À très bientôt,`,
      audience: "all_customers",
    },
  },
  {
    id: "birthday",
    emoji: "💌",
    title: "Rappel anniversaire",
    description: "Souhaitez les anniversaires de vos habitués",
    draft: {
      name: "Rappel anniversaire",
      subject: "Joyeux anniversaire — une attention vous attend",
      content: `Bonjour,

C'est bientôt votre anniversaire et nous aimerions vous gâter pour l'occasion.

Passez nous voir cette semaine : une petite surprise vous attend à table.

Joyeux anniversaire,`,
      audience: "visited_more_than_3_times",
    },
  },
  {
    id: "reactivation",
    emoji: "🌟",
    title: "Réactivation",
    description: "Faites revenir vos clients inactifs",
    draft: {
      name: "Réactivation clients",
      subject: "Vous nous manquez — revenez nous voir",
      content: `Bonjour,

Cela fait un moment que nous ne vous avons pas vu et votre table nous manque.

Revenez nous rendre visite prochainement : nous serons heureux de vous accueillir à nouveau.

À bientôt,`,
      audience: "all_customers",
    },
  },
] as const;

export function getCampaignTemplate(id: CampaignTemplateId): CampaignTemplate | undefined {
  return CAMPAIGN_TEMPLATES.find((template) => template.id === id);
}
