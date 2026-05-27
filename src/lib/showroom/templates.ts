import type { ThemeId } from "@/src/lib/themes/types";

/** Templates de conversion Showroom — mappés sur `restaurants.theme_id`. */
export type ShowroomTemplateId =
  | "premium-dark"
  | "elegant-light"
  | "social-bold"
  | "minimal-chic";

export type ShowroomTemplateDefinition = {
  id: ShowroomTemplateId;
  name: string;
  description: string;
  useCase: string;
  previewImage: string;
  themeId: ThemeId;
  mode: "dark" | "light";
  defaultPrimaryColor: string;
  defaultSecondaryColor: string;
};

export const SHOWROOM_TEMPLATES: ShowroomTemplateDefinition[] = [
  {
    id: "premium-dark",
    name: "Premium Dark",
    description: "Sombre, gastronomique, luxe — photos fortes et typographie élégante.",
    useCase: "Gastronomique, bars à vin, lieux premium",
    previewImage: "/themes/premium-dark/preview.webp",
    themeId: "premium-dark",
    mode: "dark",
    defaultPrimaryColor: "#D4AF7A",
    defaultSecondaryColor: "#8B7355",
  },
  {
    id: "elegant-light",
    name: "Elegant Light",
    description: "Clair, beige et chaleureux — élégance intemporelle.",
    useCase: "Cafés, brunch, cuisine traditionnelle",
    previewImage: "/themes/premium-elegant/preview.webp",
    themeId: "elegant-light",
    mode: "light",
    defaultPrimaryColor: "#B8956C",
    defaultSecondaryColor: "#8B7355",
  },
  {
    id: "social-bold",
    name: "Social Bold",
    description: "Moderne et direct — pensé pour Instagram et TikTok.",
    useCase: "Concepts tendance, food spots, snacks premium",
    previewImage: "/themes/social-bold/preview.webp",
    themeId: "social-bold",
    mode: "dark",
    defaultPrimaryColor: "#FF6B4A",
    defaultSecondaryColor: "#7C5CFF",
  },
  {
    id: "minimal-chic",
    name: "Minimal Chic",
    description: "Épuré et rapide — conversion pure, zéro distraction.",
    useCase: "Page simple, propre et très efficace",
    previewImage: "/themes/minimal-chic/preview.webp",
    themeId: "minimal-chic",
    mode: "light",
    defaultPrimaryColor: "#1C1917",
    defaultSecondaryColor: "#57534E",
  },
];

const LEGACY_THEME_MAP: Record<string, ShowroomTemplateId> = {
  default: "elegant-light",
  "premium-elegant": "elegant-light",
};

export function normalizeShowroomTemplateId(raw: string | null | undefined): ShowroomTemplateId {
  if (!raw?.trim()) return "premium-dark";
  const id = raw.trim() as ShowroomTemplateId;
  if (SHOWROOM_TEMPLATES.some((t) => t.id === id)) return id;
  return LEGACY_THEME_MAP[raw.trim()] ?? "premium-dark";
}

export function getShowroomTemplate(id: string | null | undefined): ShowroomTemplateDefinition {
  const normalized = normalizeShowroomTemplateId(id);
  return SHOWROOM_TEMPLATES.find((t) => t.id === normalized) ?? SHOWROOM_TEMPLATES[0];
}

export function showroomTemplateToThemeId(templateId: ShowroomTemplateId): ThemeId {
  return getShowroomTemplate(templateId).themeId;
}
