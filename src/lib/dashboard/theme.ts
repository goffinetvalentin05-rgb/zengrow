export const DASHBOARD_THEME_STORAGE_KEY = "zengrow_dashboard_theme";
export const DASHBOARD_THEME_COOKIE = "zengrow_dashboard_theme";

export type DashboardThemePreference = "auto" | "light" | "dark";
export type DashboardResolvedTheme = "light" | "dark";
/** Fond de page uniquement (mode auto : suit l’OS sans changer textes / cartes). */
export type DashboardResolvedCanvas = "light" | "dark";

export const DASHBOARD_THEME_PREFERENCES: DashboardThemePreference[] = ["auto", "light", "dark"];

export function isDashboardThemePreference(value: string | null | undefined): value is DashboardThemePreference {
  return value === "auto" || value === "light" || value === "dark";
}

/** Thème UI complet (textes, cartes, sidebar…) — le mode auto reste sur le thème sombre. */
export function resolveDashboardTheme(preference: DashboardThemePreference): DashboardResolvedTheme {
  if (preference === "light") return "light";
  return "dark";
}

/** Fond d’écran Sharpz — toujours noir. Le mode clair ne blanchit plus le canvas. */
export function resolveDashboardCanvas(
  _preference: DashboardThemePreference,
  _prefersDark: boolean,
): DashboardResolvedCanvas {
  return "dark";
}

export function readDashboardThemePreferenceFromStorage(): DashboardThemePreference | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(DASHBOARD_THEME_STORAGE_KEY);
    return isDashboardThemePreference(raw) ? raw : null;
  } catch {
    return null;
  }
}

export function persistDashboardThemePreference(preference: DashboardThemePreference): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(DASHBOARD_THEME_STORAGE_KEY, preference);
  } catch {
    /* ignore */
  }
  try {
    const maxAge = 60 * 60 * 24 * 365;
    document.cookie = `${DASHBOARD_THEME_COOKIE}=${preference}; path=/; max-age=${maxAge}; SameSite=Lax`;
  } catch {
    /* ignore */
  }
}

export function getSystemPrefersDark(): boolean {
  if (typeof window === "undefined") return true;
  return window.matchMedia("(prefers-color-scheme: dark)").matches;
}
