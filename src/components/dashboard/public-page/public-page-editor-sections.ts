import type { LucideIcon } from "lucide-react";
import { FileText, Layers, Palette, Rocket, Sparkles } from "lucide-react";

export type PublicPageEditorSectionId =
  | "zone-identite"
  | "zone-theme"
  | "zone-contenu"
  | "zone-sections"
  | "zone-publication";

export type PublicPageEditorSection = {
  id: PublicPageEditorSectionId;
  label: string;
  description: string;
  icon: LucideIcon;
};

/** Navigation éditeur Showroom — wording orienté marketing */
export const PUBLIC_PAGE_EDITOR_SECTIONS: PublicPageEditorSection[] = [
  {
    id: "zone-identite",
    label: "Présentez votre restaurant",
    description: "Nom, slogan, ville, contact et lien public",
    icon: Sparkles,
  },
  {
    id: "zone-theme",
    label: "Personnalisez l'expérience",
    description: "Template, couleurs et typographie",
    icon: Palette,
  },
  {
    id: "zone-contenu",
    label: "Donnez envie de réserver",
    description: "Photos, ambiance et menu",
    icon: FileText,
  },
  {
    id: "zone-sections",
    label: "Réservation",
    description: "Bouton principal, sections et parcours client",
    icon: Layers,
  },
  {
    id: "zone-publication",
    label: "Publication",
    description: "Aperçu mobile, lien et mise en ligne",
    icon: Rocket,
  },
];
