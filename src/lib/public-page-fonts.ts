/** Google Fonts used on the public reservation page and dashboard preview. */

export const PUBLIC_PAGE_FONT_OPTIONS = [
  "Inter",
  "Playfair Display",
  "Montserrat",
  "Lora",
  "Poppins",
] as const;

export type PublicPageFontOption = (typeof PUBLIC_PAGE_FONT_OPTIONS)[number];

const FONT_SET = new Set<string>(PUBLIC_PAGE_FONT_OPTIONS);

export function normalizePublicPageFont(value: string | null | undefined, fallback: PublicPageFontOption): string {
  const v = (value ?? "").trim();
  return FONT_SET.has(v) ? v : fallback;
}

export function googleFontsHref(fonts: string[]): string | null {
  const unique = Array.from(new Set(fonts.map((f) => f.trim()).filter(Boolean)));
  const safe = unique.filter((f) => FONT_SET.has(f));
  if (safe.length === 0) return null;
  const families = safe
    .map((fam) => `family=${encodeURIComponent(fam).replace(/%20/g, "+")}:wght@400;500;600;700`)
    .join("&");
  return `https://fonts.googleapis.com/css2?${families}&display=swap`;
}
