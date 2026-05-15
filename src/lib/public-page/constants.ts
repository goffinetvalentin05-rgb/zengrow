export const PUBLIC_STYLE_PRESETS = [
  { id: "elegant", label: "Élégant", description: "Typographie raffinée, contrastes doux" },
  { id: "modern", label: "Moderne", description: "Lignes nettes, look contemporain" },
  { id: "warm", label: "Chaleureux", description: "Tons accueillants, ambiance conviviale" },
  { id: "minimal", label: "Minimal", description: "Épuré, direct, très lisible" },
  { id: "premium_dark", label: "Premium sombre", description: "Ambiance lounge, fond sombre" },
] as const;

export const SECTION_VARIANT_OPTIONS = [
  { id: "inherit", label: "Automatique (selon le style)" },
  { id: "light", label: "Fond clair" },
  { id: "dark", label: "Fond foncé" },
  { id: "muted", label: "Fond doux" },
  { id: "accent", label: "Accent léger" },
  { id: "elevated", label: "Carte surélevée" },
  { id: "transparent", label: "Transparent" },
  { id: "primary", label: "Couleur accent" },
] as const;

export type PublicStylePreset = (typeof PUBLIC_STYLE_PRESETS)[number]["id"];

export const PUBLIC_AMBIANCE_OPTIONS = [
  { id: "gastronomic", label: "Gastronomique" },
  { id: "family", label: "Familial" },
  { id: "bistro", label: "Bistro" },
  { id: "italian", label: "Italien" },
  { id: "asian", label: "Asiatique" },
  { id: "cafe_brunch", label: "Café / brunch" },
  { id: "bar_lounge", label: "Bar / lounge" },
  { id: "other", label: "Autre" },
] as const;

export type PublicAmbiance = (typeof PUBLIC_AMBIANCE_OPTIONS)[number]["id"];

export const HIGHLIGHT_SUGGESTIONS = [
  "Produits frais",
  "Terrasse",
  "Cuisine maison",
  "Parking à proximité",
  "Menu du jour",
  "Idéal en famille",
  "Ambiance romantique",
] as const;

export const MAX_GALLERY_PHOTOS = 8;
export const MAX_HIGHLIGHTS = 6;
export const MAX_DESCRIPTION_CHARS = 400;
