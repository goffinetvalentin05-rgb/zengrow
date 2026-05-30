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
  type DashboardThemePreference,
  getSystemPrefersDark,
  persistDashboardThemePreference,
  readDashboardThemePreferenceFromStorage,
  resolveDashboardCanvas,
} from "@/src/lib/dashboard/theme";

type LandingCanvasContextValue = {
  preference: DashboardThemePreference;
  resolvedCanvas: DashboardResolvedCanvas;
  setPreference: (preference: DashboardThemePreference) => void;
};

const LandingCanvasContext = createContext<LandingCanvasContextValue | null>(null);

export function LandingCanvasProvider({ children }: { children: ReactNode }) {
  const [preference, setPreferenceState] = useState<DashboardThemePreference>("dark");
  const [resolvedCanvas, setResolvedCanvas] = useState<DashboardResolvedCanvas>("dark");

  const applyResolved = useCallback((pref: DashboardThemePreference, prefersDark: boolean) => {
    setResolvedCanvas(resolveDashboardCanvas(pref, prefersDark));
  }, []);

  useEffect(() => {
    const stored = readDashboardThemePreferenceFromStorage();
    const pref = stored ?? "dark";
    setPreferenceState(pref);
    applyResolved(pref, getSystemPrefersDark());
  }, [applyResolved]);

  useEffect(() => {
    applyResolved(preference, getSystemPrefersDark());
  }, [preference, applyResolved]);

  useEffect(() => {
    if (preference !== "auto") return;

    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const onChange = () => applyResolved("auto", media.matches);
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
    () => ({ preference, resolvedCanvas, setPreference }),
    [preference, resolvedCanvas, setPreference],
  );

  return <LandingCanvasContext.Provider value={value}>{children}</LandingCanvasContext.Provider>;
}

export function useLandingCanvas() {
  const ctx = useContext(LandingCanvasContext);
  if (!ctx) {
    throw new Error("useLandingCanvas must be used within LandingCanvasProvider");
  }
  return ctx;
}
