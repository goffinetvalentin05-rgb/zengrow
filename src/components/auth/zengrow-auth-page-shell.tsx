"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import type { ReactNode } from "react";
import { AppAmbientBackground } from "@/src/components/app/app-ambient-background";
import { cn } from "@/src/lib/utils";

type AuthShellVariant = "light" | "dark";

type ZenGrowAuthPageShellProps = {
  children: ReactNode;
  showHomeLink?: boolean;
  footerLine?: string | null;
  variant?: AuthShellVariant;
  contentMaxWidthClass?: string;
};

export function ZenGrowAuthPageShell({
  children,
  showHomeLink = true,
  footerLine = "Réservations en ligne, disponibilités et avis clients — tout ZenGrow, rien de superflu.",
  variant = "dark",
  contentMaxWidthClass,
}: ZenGrowAuthPageShellProps) {
  const isDark = variant === "dark";
  const maxW = contentMaxWidthClass ?? (isDark ? "max-w-md" : "max-w-[440px]");

  return (
    <main
      className={cn(
        "relative flex min-h-screen flex-col overflow-hidden font-[family-name:var(--font-zg-body)]",
        isDark ? "bg-landing-bg text-landing-fg" : "bg-landing-bg text-landing-fg",
      )}
    >
      <AppAmbientBackground />

      <div className="relative z-10 flex min-h-screen w-full flex-1 flex-col">
        {showHomeLink ? (
          <div className="flex shrink-0 justify-center px-4 pt-6">
            <Link
              href="/"
              className="inline-flex items-center gap-2 rounded-full border border-landing-border/60 bg-landing-card/50 px-5 py-2 text-sm text-landing-muted shadow-sm backdrop-blur-xl transition hover:border-landing-accent/40 hover:text-landing-fg"
            >
              ← Retour à l&apos;accueil
            </Link>
          </div>
        ) : null}
        <div className="flex flex-1 items-center justify-center px-4 py-8 sm:py-10">
          <div className={cn("relative w-full", maxW)}>{children}</div>
        </div>
        {footerLine && !isDark ? (
          <p className="pb-8 text-center text-xs leading-relaxed text-landing-muted/70">{footerLine}</p>
        ) : null}
      </div>
    </main>
  );
}

type ZenGrowAuthCardProps = {
  children: ReactNode;
  className?: string;
  variant?: AuthShellVariant;
};

export function ZenGrowAuthCard({ children, className, variant = "dark" }: ZenGrowAuthCardProps) {
  return (
    <motion.section
      initial={{ opacity: 0, scale: 0.97 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      className={cn(
        "relative w-full overflow-hidden rounded-2xl border border-landing-border/80 p-8 sm:p-10",
        "bg-gradient-to-br from-landing-card/95 via-landing-section/80 to-landing-card/90",
        "shadow-[0_24px_80px_-28px_rgba(0,0,0,0.65),0_0_60px_-20px_rgba(124,92,255,0.15)]",
        "backdrop-blur-xl",
        className,
      )}
    >
      <div
        className="pointer-events-none absolute inset-0 bg-[linear-gradient(135deg,rgb(255_255_255/0.06)_0%,transparent_42%,rgb(124_92_255/0.04)_100%)]"
        aria-hidden
      />
      <div className="relative z-[1]">{children}</div>
    </motion.section>
  );
}
