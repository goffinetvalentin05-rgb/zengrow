"use client";

import { useOptionalDashboardTheme } from "@/src/components/dashboard/dashboard-theme-provider";

/** Fond dashboard — même noir profond que la landing Sharpz, glow très discret. */
export function AppAmbientBackground() {
  const theme = useOptionalDashboardTheme();
  if (theme && (theme.resolvedTheme === "light" || theme.resolvedCanvas === "light")) return null;

  return (
    <div className="zg-app-backdrop pointer-events-none fixed inset-0 z-0 overflow-hidden" aria-hidden>
      <div
        className="absolute inset-0"
        style={{
          background: "linear-gradient(180deg, #01040f 0%, #020610 42%, #01040c 100%)",
        }}
      />
      <div
        className="absolute left-1/2 top-[-10%] h-[min(560px,72vw)] w-[min(780px,92vw)] -translate-x-1/2 rounded-full"
        style={{
          background:
            "radial-gradient(ellipse 58% 48% at 50% 38%, rgba(226, 232, 240, 0.06) 0%, rgba(148, 163, 184, 0.04) 38%, transparent 72%)",
        }}
      />
      <div
        className="absolute inset-0 opacity-[0.16]"
        style={{
          backgroundImage: "radial-gradient(circle at 1px 1px, rgba(148, 163, 184, 0.18) 1px, transparent 0)",
          backgroundSize: "36px 36px",
          WebkitMaskImage: "radial-gradient(ellipse 70% 55% at 50% 18%, black, transparent 78%)",
          maskImage: "radial-gradient(ellipse 70% 55% at 50% 18%, black, transparent 78%)",
        }}
      />
      <div
        className="absolute inset-0 opacity-[0.035] mix-blend-overlay"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
        }}
      />
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 120% 85% at 50% 0%, transparent 40%, rgba(1, 4, 15, 0.78) 100%)",
        }}
      />
    </div>
  );
}
