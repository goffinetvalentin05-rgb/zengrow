import type { CSSProperties } from "react";

export const PROFILE_THEME_KEYS = ["obsidian", "electric", "forest", "violet", "crimson"] as const;

export type ProfileThemeKey = (typeof PROFILE_THEME_KEYS)[number];

export type ProfileThemePlan = "free" | "pro";

export const PROFILE_LAYOUT_VARIANTS = ["default", "content_first", "project_first"] as const;

export type ProfileLayoutVariant = (typeof PROFILE_LAYOUT_VARIANTS)[number];

export const PROFILE_LAYOUT_LABELS: Record<ProfileLayoutVariant, string> = {
  default: "Default",
  content_first: "Content first",
  project_first: "Project first",
};

export const ACCENT_COLOR_PATTERN = /^#[0-9a-fA-F]{6}$/;

export type ProfileTheme = {
  key: ProfileThemeKey;
  label: string;
  plan: ProfileThemePlan;
  accent: string;
  glow: string;
  heroFrom: string;
  heroVia: string;
  heroTo: string;
  swatch: string;
};

export const PROFILE_THEMES: Record<ProfileThemeKey, ProfileTheme> = {
  obsidian: {
    key: "obsidian",
    label: "Obsidian",
    plan: "free",
    accent: "#f4f4f5",
    glow: "rgba(255,255,255,0.22)",
    heroFrom: "rgba(255,255,255,0.16)",
    heroVia: "rgba(24,24,27,0.42)",
    heroTo: "#08070b",
    swatch: "#d4d4d8",
  },
  electric: {
    key: "electric",
    label: "Blue",
    plan: "free",
    accent: "#7dd3fc",
    glow: "rgba(56,189,248,0.32)",
    heroFrom: "rgba(14,165,233,0.34)",
    heroVia: "rgba(12,74,110,0.42)",
    heroTo: "#08070b",
    swatch: "#38bdf8",
  },
  forest: {
    key: "forest",
    label: "Forest",
    plan: "free",
    accent: "#86efac",
    glow: "rgba(52,211,153,0.28)",
    heroFrom: "rgba(16,185,129,0.30)",
    heroVia: "rgba(6,78,59,0.44)",
    heroTo: "#08070b",
    swatch: "#34d399",
  },
  violet: {
    key: "violet",
    label: "Violet",
    plan: "pro",
    accent: "#c4b5fd",
    glow: "rgba(167,139,250,0.32)",
    heroFrom: "rgba(139,92,246,0.34)",
    heroVia: "rgba(76,29,149,0.42)",
    heroTo: "#08070b",
    swatch: "#a78bfa",
  },
  crimson: {
    key: "crimson",
    label: "Crimson",
    plan: "pro",
    accent: "#fda4af",
    glow: "rgba(251,113,133,0.30)",
    heroFrom: "rgba(244,63,94,0.32)",
    heroVia: "rgba(127,29,29,0.42)",
    heroTo: "#08070b",
    swatch: "#fb7185",
  },
};

export const FREE_PROFILE_THEME_KEYS: ProfileThemeKey[] = PROFILE_THEME_KEYS.filter(
  (key) => PROFILE_THEMES[key].plan === "free",
);

export function isProfileThemeKey(value: string | null | undefined): value is ProfileThemeKey {
  return Boolean(value && PROFILE_THEME_KEYS.includes(value as ProfileThemeKey));
}

export function isProfileLayoutVariant(value: string | null | undefined): value is ProfileLayoutVariant {
  return Boolean(value && PROFILE_LAYOUT_VARIANTS.includes(value as ProfileLayoutVariant));
}

export function resolveProfileTheme(key: string | null | undefined): ProfileTheme {
  return isProfileThemeKey(key) ? PROFILE_THEMES[key] : PROFILE_THEMES.obsidian;
}

export function resolveProfileLayout(
  variant: string | null | undefined,
  featuredFirst?: boolean,
): ProfileLayoutVariant {
  if (isProfileLayoutVariant(variant)) return variant;
  return featuredFirst ? "content_first" : "default";
}

export function profileSectionOrder(
  layout: ProfileLayoutVariant,
  hasProject: boolean,
  hasContent: boolean,
): Array<"building" | "featured"> {
  if (!hasProject && hasContent) return ["featured"];
  if (hasProject && !hasContent) return ["building"];
  if (!hasProject && !hasContent) return [];
  if (layout === "content_first") return ["featured", "building"];
  return ["building", "featured"];
}

export function isThemeUnlocked(key: ProfileThemeKey, isPro: boolean) {
  return PROFILE_THEMES[key].plan === "free" || isPro;
}

export function sanitizeAccentColor(value: string | null | undefined) {
  if (value == null) return null;
  const trimmed = value.trim();
  if (!trimmed) return null;
  const hex = trimmed.startsWith("#") ? trimmed : `#${trimmed}`;
  return ACCENT_COLOR_PATTERN.test(hex) ? hex.toLowerCase() : null;
}

function hexLuminance(hex: string) {
  const raw = hex.replace("#", "");
  const r = Number.parseInt(raw.slice(0, 2), 16);
  const g = Number.parseInt(raw.slice(2, 4), 16);
  const b = Number.parseInt(raw.slice(4, 6), 16);
  return (r * 299 + g * 587 + b * 114) / 1000;
}

export function profileThemeVars(theme: ProfileTheme, accentOverride?: string | null): CSSProperties {
  const accent = sanitizeAccentColor(accentOverride) ?? theme.accent;
  const onAccent = hexLuminance(accent) > 168 ? "#08070b" : "#fafafa";
  return {
    "--profile-accent": accent,
    "--profile-on-accent": onAccent,
    "--profile-glow": theme.glow,
    "--profile-hero-from": theme.heroFrom,
    "--profile-hero-via": theme.heroVia,
    "--profile-hero-to": theme.heroTo,
    "--profile-ring": `${accent}33`,
  } as CSSProperties;
}
