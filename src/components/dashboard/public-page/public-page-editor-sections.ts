import type { LucideIcon } from "lucide-react";
import { FileText, Layers, Palette, Sparkles } from "lucide-react";

export type PublicPageEditorSectionId = "zone-theme" | "zone-identite" | "zone-sections" | "zone-contenu";

export type PublicPageEditorSection = {
  id: PublicPageEditorSectionId;
  label: string;
  icon: LucideIcon;
};

export const PUBLIC_PAGE_EDITOR_SECTIONS: PublicPageEditorSection[] = [
  { id: "zone-theme", label: "Thème", icon: Palette },
  { id: "zone-identite", label: "Identité", icon: Sparkles },
  { id: "zone-sections", label: "Sections", icon: Layers },
  { id: "zone-contenu", label: "Contenu", icon: FileText },
];
