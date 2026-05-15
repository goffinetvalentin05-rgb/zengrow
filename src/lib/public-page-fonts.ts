/** Bibliothèque de polices premium utilisées sur la page publique. */

/** Toutes les familles disponibles (Google Fonts). */
export const PUBLIC_PAGE_FONT_OPTIONS = [
  // Sans-serif modernes
  "Inter",
  "Montserrat",
  "Poppins",
  "DM Sans",
  "Manrope",
  // Serif éditoriales / haut de gamme
  "Playfair Display",
  "Cormorant Garamond",
  "Fraunces",
  "DM Serif Display",
  "Marcellus",
  "EB Garamond",
  "Lora",
  // Display chaleureux / unique
  "Italiana",
] as const;

export type PublicPageFontOption = (typeof PUBLIC_PAGE_FONT_OPTIONS)[number];

const FONT_SET = new Set<string>(PUBLIC_PAGE_FONT_OPTIONS);

/** Catégorie pour aider à présenter les polices dans le dashboard. */
export type FontCategory = "sans" | "serif" | "display";

export type FontDescriptor = {
  family: PublicPageFontOption;
  label: string;
  category: FontCategory;
  /** Légende à afficher dans le dashboard (mood / suggestion d'usage). */
  caption: string;
  /** Fallback CSS si la police ne charge pas. */
  fallback: string;
};

export const PUBLIC_PAGE_FONT_LIBRARY: FontDescriptor[] = [
  // Sans-serif
  {
    family: "Inter",
    label: "Inter",
    category: "sans",
    caption: "Neutre, contemporain, ultra lisible",
    fallback: "system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif",
  },
  {
    family: "Montserrat",
    label: "Montserrat",
    category: "sans",
    caption: "Géométrique, urbain, énergique",
    fallback: "system-ui, sans-serif",
  },
  {
    family: "Poppins",
    label: "Poppins",
    category: "sans",
    caption: "Rond, amical, lisible",
    fallback: "system-ui, sans-serif",
  },
  {
    family: "DM Sans",
    label: "DM Sans",
    category: "sans",
    caption: "Minimaliste, premium, technique",
    fallback: "system-ui, sans-serif",
  },
  {
    family: "Manrope",
    label: "Manrope",
    category: "sans",
    caption: "Moderne, éditorial, élégant",
    fallback: "system-ui, sans-serif",
  },
  // Serif
  {
    family: "Playfair Display",
    label: "Playfair Display",
    category: "serif",
    caption: "Classique, théâtral, gastronomique",
    fallback: "Georgia, serif",
  },
  {
    family: "Cormorant Garamond",
    label: "Cormorant Garamond",
    category: "serif",
    caption: "Luxueux, étiré, raffiné",
    fallback: "Georgia, serif",
  },
  {
    family: "Fraunces",
    label: "Fraunces",
    category: "serif",
    caption: "Éditorial, contemporain, fort caractère",
    fallback: "Georgia, serif",
  },
  {
    family: "DM Serif Display",
    label: "DM Serif Display",
    category: "serif",
    caption: "Affirmé, magazine, chaleureux",
    fallback: "Georgia, serif",
  },
  {
    family: "Marcellus",
    label: "Marcellus",
    category: "serif",
    caption: "Lapidaire, pierre gravée, sobre",
    fallback: "Georgia, serif",
  },
  {
    family: "EB Garamond",
    label: "EB Garamond",
    category: "serif",
    caption: "Lettré, intemporel, lectur facile",
    fallback: "Georgia, serif",
  },
  {
    family: "Lora",
    label: "Lora",
    category: "serif",
    caption: "Doux, narratif, accueillant",
    fallback: "Georgia, serif",
  },
  // Display
  {
    family: "Italiana",
    label: "Italiana",
    category: "display",
    caption: "Couture, fashion, grande échelle",
    fallback: "Georgia, serif",
  },
];

const FONT_DESCRIPTORS = new Map<string, FontDescriptor>(
  PUBLIC_PAGE_FONT_LIBRARY.map((f) => [f.family, f]),
);

export function getFontDescriptor(family: string): FontDescriptor | null {
  return FONT_DESCRIPTORS.get(family) ?? null;
}

export function normalizePublicPageFont(
  value: string | null | undefined,
  fallback: PublicPageFontOption,
): string {
  const v = (value ?? "").trim();
  return FONT_SET.has(v) ? v : fallback;
}

/**
 * Construit une URL Google Fonts CSS2 pour les familles demandées.
 * Retourne null si aucune famille valide n'a été fournie.
 */
export function googleFontsHref(fonts: string[]): string | null {
  const unique = Array.from(new Set(fonts.map((f) => f.trim()).filter(Boolean)));
  const safe = unique.filter((f) => FONT_SET.has(f));
  if (safe.length === 0) return null;
  const families = safe
    .map((fam) => `family=${encodeURIComponent(fam).replace(/%20/g, "+")}:wght@400;500;600;700`)
    .join("&");
  return `https://fonts.googleapis.com/css2?${families}&display=swap`;
}

/** Paires de polices recommandées (raccourci pour les utilisateurs pressés). */
export type FontPairing = {
  id: string;
  label: string;
  description: string;
  headingFont: PublicPageFontOption;
  bodyFont: PublicPageFontOption;
};

export const FONT_PAIRINGS: FontPairing[] = [
  {
    id: "editorial-luxe",
    label: "Éditorial luxe",
    description: "Cormorant pour les titres, Inter pour le texte — classique magazine.",
    headingFont: "Cormorant Garamond",
    bodyFont: "Inter",
  },
  {
    id: "premium-dark",
    label: "Premium sombre",
    description: "Playfair Display avec DM Sans — gastronomie, ambiance lounge.",
    headingFont: "Playfair Display",
    bodyFont: "DM Sans",
  },
  {
    id: "modern-contrast",
    label: "Moderne tranché",
    description: "Fraunces caractère + Manrope clarté.",
    headingFont: "Fraunces",
    bodyFont: "Manrope",
  },
  {
    id: "warm-bistro",
    label: "Bistro chaleureux",
    description: "DM Serif Display + Lora — pour les concepts familiaux.",
    headingFont: "DM Serif Display",
    bodyFont: "Lora",
  },
  {
    id: "minimal-urban",
    label: "Minimal urbain",
    description: "Tout en sans-serif : Manrope + Inter.",
    headingFont: "Manrope",
    bodyFont: "Inter",
  },
  {
    id: "couture-show",
    label: "Couture",
    description: "Italiana pour les très grands titres, EB Garamond pour la lecture.",
    headingFont: "Italiana",
    bodyFont: "EB Garamond",
  },
];
