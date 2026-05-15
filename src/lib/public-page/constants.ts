export const PUBLIC_STYLE_PRESETS = [
  { id: "elegant", label: "Élégant", description: "Typographie raffinée, contrastes doux" },
  { id: "modern", label: "Moderne", description: "Lignes nettes, look contemporain" },
  { id: "warm", label: "Chaleureux", description: "Tons accueillants, ambiance conviviale" },
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

export const MAX_GALLERY_PHOTOS = 6;
export const MAX_HIGHLIGHTS = 3;
export const MAX_DESCRIPTION_CHARS = 400;
