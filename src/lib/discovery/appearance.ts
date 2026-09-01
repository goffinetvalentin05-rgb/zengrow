import type { CSSProperties } from "react";

export const PROFILE_THEME_KEYS = ["obsidian", "electric", "forest", "violet", "crimson"] as const;

export type ProfileThemeKey = (typeof PROFILE_THEME_KEYS)[number];

export type ProfileThemePlan = "free" | "pro";

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
    heroFrom: "rgba(255,255,255,0.10)",
    heroVia: "rgba(24,24,27,0.35)",
    heroTo: "#08070b",
    swatch: "#d4d4d8",
  },
  electric: {
    key: "electric",
    label: "Electric Blue",
    plan: "free",
    accent: "#7dd3fc",
    glow: "rgba(56,189,248,0.28)",
    heroFrom: "rgba(14,165,233,0.28)",
    heroVia: "rgba(12,74,110,0.35)",
    heroTo: "#08070b",
    swatch: "#38bdf8",
  },
  forest: {
    key: "forest",
    label: "Forest",
    plan: "free",
    accent: "#86efac",
    glow: "rgba(52,211,153,0.24)",
    heroFrom: "rgba(16,185,129,0.24)",
    heroVia: "rgba(6,78,59,0.40)",
    heroTo: "#08070b",
    swatch: "#34d399",
  },
  violet: {
    key: "violet",
    label: "Violet",
    plan: "pro",
    accent: "#c4b5fd",
    glow: "rgba(167,139,250,0.28)",
    heroFrom: "rgba(139,92,246,0.28)",
    heroVia: "rgba(76,29,149,0.38)",
    heroTo: "#08070b",
    swatch: "#a78bfa",
  },
  crimson: {
    key: "crimson",
    label: "Crimson",
    plan: "pro",
    accent: "#fda4af",
    glow: "rgba(251,113,133,0.26)",
    heroFrom: "rgba(244,63,94,0.26)",
    heroVia: "rgba(127,29,29,0.38)",
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

export function resolveProfileTheme(key: string | null | undefined): ProfileTheme {
  return isProfileThemeKey(key) ? PROFILE_THEMES[key] : PROFILE_THEMES.obsidian;
}

export function isThemeUnlocked(key: ProfileThemeKey, isPro: boolean) {
  return PROFILE_THEMES[key].plan === "free" || isPro;
}

export function profileThemeVars(theme: ProfileTheme): CSSProperties {
  return {
    "--profile-accent": theme.accent,
    "--profile-glow": theme.glow,
    "--profile-hero-from": theme.heroFrom,
    "--profile-hero-via": theme.heroVia,
    "--profile-hero-to": theme.heroTo,
  } as CSSProperties;
}
