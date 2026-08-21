export const STYLE_PROFILE_TAXONOMY = [
  "Clean Minimal",
  "Smart Casual",
  "Old Money",
  "Streetwear",
  "Relaxed",
  "Workwear",
  "Contemporary",
  "Classic",
  "Sporty",
  "Elevated Casual",
] as const;

export type StyleProfileTaxonomyName = (typeof STYLE_PROFILE_TAXONOMY)[number];

const TAXONOMY_BY_KEY = new Map(
  STYLE_PROFILE_TAXONOMY.map((name) => [name.toLowerCase().replace(/[\s_-]+/g, ""), name]),
);

export function canonicalizeStyleName(value: string): string {
  const key = value.trim().toLowerCase().replace(/[\s_-]+/g, "");
  return TAXONOMY_BY_KEY.get(key) ?? value.trim();
}
