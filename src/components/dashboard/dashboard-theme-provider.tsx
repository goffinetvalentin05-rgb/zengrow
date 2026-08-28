"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  type DashboardResolvedCanvas,
  type DashboardResolvedTheme,
  type DashboardThemePreference,
  getSystemPrefersDark,
  persistDashboardThemePreference,
  readDashboardThemePreferenceFromStorage,
  resolveDashboardCanvas,
  resolveDashboardTheme,
} from "@/src/lib/dashboard/theme";

type DashboardThemeContextValue = {
  preference: DashboardThemePreference;
  resolvedTheme: DashboardResolvedTheme;
  resolvedCanvas: DashboardResolvedCanvas;
  setPreference: (preference: DashboardThemePreference) => void;
};

const DashboardThemeContext = createContext<DashboardThemeContextValue | null>(null);

type DashboardThemeProviderProps = {
  children: ReactNode;
  initialPreference: DashboardThemePreference;
  initialResolvedTheme: DashboardResolvedTheme;
  initialResolvedCanvas: DashboardResolvedCanvas;
};

export function DashboardThemeProvider({
  children,
  initialPreference,
  initialResolvedTheme,
  initialResolvedCanvas,
}: DashboardThemeProviderProps) {
  const [preference, setPreferenceState] = useState<DashboardThemePreference>(initialPreference);
  const [resolvedTheme, setResolvedTheme] = useState<DashboardResolvedTheme>(initialResolvedTheme);
  const [resolvedCanvas, setResolvedCanvas] = useState<DashboardResolvedCanvas>(initialResolvedCanvas);

  const applyResolved = useCallback((pref: DashboardThemePreference, prefersDark: boolean) => {
    setResolvedTheme(resolveDashboardTheme(pref));
    setResolvedCanvas(resolveDashboardCanvas(pref, prefersDark));
  }, []);

  useEffect(() => {
    const stored = readDashboardThemePreferenceFromStorage();
    if (stored && stored !== initialPreference) {
      setPreferenceState(stored);
      persistDashboardThemePreference(stored);
    }
  }, [initialPreference]);

  useEffect(() => {
    applyResolved(preference, getSystemPrefersDark());
  }, [preference, applyResolved]);

  useEffect(() => {
    if (preference !== "auto") return;

    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const onChange = () => applyResolved("auto", media.matches);
    onChange();
    media.addEventListener("change", onChange);
    return () => media.removeEventListener("change", onChange);
  }, [preference, applyResolved]);

  const setPreference = useCallback(
    (next: DashboardThemePreference) => {
      setPreferenceState(next);
      persistDashboardThemePreference(next);
      applyResolved(next, getSystemPrefersDark());
    },
    [applyResolved],
  );

  const value = useMemo(
    () => ({ preference, resolvedTheme, resolvedCanvas, setPreference }),
    [preference, resolvedTheme, resolvedCanvas, setPreference],
  );

  return <DashboardThemeContext.Provider value={value}>{children}</DashboardThemeContext.Provider>;
}

export function useDashboardTheme() {
  const ctx = useContext(DashboardThemeContext);
  if (!ctx) {
    throw new Error("useDashboardTheme must be used within DashboardThemeProvider");
  }
  return ctx;
}

export function useOptionalDashboardTheme() {
  return useContext(DashboardThemeContext);
}
