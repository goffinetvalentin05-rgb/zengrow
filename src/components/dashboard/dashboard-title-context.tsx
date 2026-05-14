"use client";

import { createContext, useCallback, useContext, useState, type ReactNode } from "react";

export type DashboardTitleMeta = {
  title: string;
  subtitle?: string;
};

const DashboardTitleMetaContext = createContext<DashboardTitleMeta | null>(null);

const SetDashboardTitleContext = createContext<((next: DashboardTitleMeta | null) => void) | null>(null);

export function DashboardTitleProvider({ children }: { children: ReactNode }) {
  const [meta, setMeta] = useState<DashboardTitleMeta | null>(null);

  const setDashboardTitle = useCallback((next: DashboardTitleMeta | null) => {
    setMeta(next);
  }, []);

  return (
    <SetDashboardTitleContext.Provider value={setDashboardTitle}>
      <DashboardTitleMetaContext.Provider value={meta}>{children}</DashboardTitleMetaContext.Provider>
    </SetDashboardTitleContext.Provider>
  );
}

export function useDashboardTitleMeta() {
  return useContext(DashboardTitleMetaContext);
}

export function useSetDashboardTitle() {
  return useContext(SetDashboardTitleContext);
}
