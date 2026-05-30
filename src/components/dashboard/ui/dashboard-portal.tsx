"use client";

import { useEffect, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { useDashboardTheme } from "@/src/components/dashboard/dashboard-theme-provider";

type DashboardPortalProps = {
  children: ReactNode;
};

/** Monte les overlays (modales, drawers) sur `document.body` pour éviter les bugs de `position: fixed` dans `main`. */
export default function DashboardPortal({ children }: DashboardPortalProps) {
  const [mounted, setMounted] = useState(false);
  const { resolvedTheme } = useDashboardTheme();

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;
  return createPortal(
    <div data-dashboard-theme={resolvedTheme} className="contents">
      {children}
    </div>,
    document.body,
  );
}
