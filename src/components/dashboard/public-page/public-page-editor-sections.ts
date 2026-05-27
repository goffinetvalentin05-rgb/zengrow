import type { LucideIcon } from "lucide-react";
import { CalendarCheck, FileText, MapPin, Palette, Rocket, Sparkles } from "lucide-react";

export type PublicPageEditorSectionId =
  | "zone-theme"
  | "zone-contenu"
  | "zone-actions"
  | "zone-infos"
  | "zone-publication";

export type PublicPageEditorSection = {
  id: PublicPageEditorSectionId;
  label: string;
  description: string;
  icon: LucideIcon;
};

/** Navigation éditeur Showroom — configuration simple, pas de sections de site web */
export const PUBLIC_PAGE_EDITOR_SECTIONS: PublicPageEditorSection[] = [
  {
    id: "zone-theme",
    label: "Apparence",
    description: "Template, couleurs et typographie",
    icon: Palette,
  },
  {
    id: "zone-contenu",
    label: "Contenu principal",
    description: "Logo, image hero, nom et crédibilité",
    icon: Sparkles,
  },
  {
    id: "zone-actions",
    label: "Actions",
    description: "Réservation, menu et réseaux sociaux",
    icon: CalendarCheck,
  },
  {
    id: "zone-infos",
    label: "Infos pratiques",
    description: "Horaires, adresse et itinéraire",
    icon: MapPin,
  },
  {
    id: "zone-publication",
    label: "Publication",
    description: "Aperçu, lien et mise en ligne",
    icon: Rocket,
  },
];
