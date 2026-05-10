"use client";

import type { ReactNode } from "react";
import { Navbar } from "@/components/sections/Navbar";
import { WaveBackground } from "@/components/sections/WaveBackground";

type LandingPageShellProps = {
  children: ReactNode;
  /** Largeur max du contenu (formulaires plus étroits, démo plus large) */
  maxWidthClass?: string;
};

export function LandingPageShell({
  children,
  maxWidthClass = "max-w-lg",
}: LandingPageShellProps) {
  return (
    <div
      className="relative min-h-screen overflow-x-hidden bg-landing-bg text-landing-fg"
      style={{ fontFamily: "var(--font-inter), ui-sans-serif, system-ui, sans-serif" }}
    >
      <div className="absolute inset-0 z-0 min-h-screen">
        <WaveBackground />
      </div>
      <Navbar />
      <div className={`relative z-10 mx-auto w-full px-4 pb-24 pt-32 sm:px-6 sm:pt-36 ${maxWidthClass}`}>
        {children}
      </div>
    </div>
  );
}
