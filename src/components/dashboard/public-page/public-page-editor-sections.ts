import type { LucideIcon } from "lucide-react";
import { FileText, Layers, Palette, Sparkles } from "lucide-react";

export type PublicPageEditorSectionId = "zone-theme" | "zone-identite" | "zone-sections" | "zone-contenu";

export type PublicPageEditorSection = {
  id: PublicPageEditorSectionId;
  label: string;
  icon: LucideIcon;
};

export const PUBLIC_PAGE_EDITOR_SECTIONS: PublicPageEditorSection[] = [
  { id: "zone-theme", label: "Ambiance", icon: Palette },
  { id: "zone-identite", label: "Identité & lien", icon: Sparkles },
  { id: "zone-sections", label: "Parcours", icon: Layers },
  { id: "zone-contenu", label: "Photos & menu", icon: FileText },
];
