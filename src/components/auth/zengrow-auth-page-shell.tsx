"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import type { ReactNode } from "react";
import { cn } from "@/src/lib/utils";

type AuthShellVariant = "light" | "dark";

type ZenGrowAuthPageShellProps = {
  children: ReactNode;
  showHomeLink?: boolean;
  footerLine?: string | null;
  variant?: AuthShellVariant;
  /** Largeur max du bloc central (card + alignement). */
  contentMaxWidthClass?: string;
};

export function ZenGrowAuthPageShell({
  children,
  showHomeLink = true,
  footerLine = "Réservations en ligne, disponibilités et avis clients — tout ZenGrow, rien de superflu.",
  variant = "light",
  contentMaxWidthClass,
}: ZenGrowAuthPageShellProps) {
  const isDark = variant === "dark";
  const maxW = contentMaxWidthClass ?? (isDark ? "max-w-md" : "max-w-[440px]");

  return (
    <main
      className={cn(
        "relative flex min-h-screen flex-col overflow-hidden font-[family-name:var(--font-inter)]",
        isDark
          ? "bg-landing-bg text-landing-fg"
          : "items-center justify-center bg-[#F6FBFA] px-4 py-10 text-[#0F3F3A] sm:px-6 lg:px-8",
      )}
    >
      {isDark ? (
        <>
          <div
            className="pointer-events-none absolute left-1/2 top-1/2 z-0 h-[min(100vw,520px)] w-[min(100vw,520px)] -translate-x-1/2 -translate-y-1/2 rounded-full bg-landing-accent/20 blur-[100px] opacity-[0.18]"
            aria-hidden
          />
        </>
      ) : (
        <>
          <div
            className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_120%_80%_at_50%_-20%,rgba(61,190,159,0.22),transparent_55%),radial-gradient(ellipse_90%_60%_at_100%_50%,rgba(31,122,108,0.12),transparent_50%),radial-gradient(ellipse_70%_50%_at_0%_80%,rgba(31,122,108,0.1),transparent_45%)]"
            aria-hidden
          />
          <div
            className="pointer-events-none absolute -left-32 top-1/4 h-[420px] w-[420px] rounded-full bg-gradient-to-br from-[#3DBE9F]/35 via-[#1F7A6C]/20 to-transparent blur-3xl"
            aria-hidden
          />
          <div
            className="pointer-events-none absolute -right-24 bottom-0 h-[380px] w-[380px] rounded-full bg-gradient-to-tl from-[#1F7A6C]/25 via-[#3DBE9F]/15 to-transparent blur-3xl"
            aria-hidden
          />
          <div
            className="pointer-events-none absolute left-1/2 top-[18%] h-[min(70vw,520px)] w-[min(70vw,520px)] -translate-x-1/2 rounded-full border border-[#CBE6DF]/40 bg-white/5 shadow-[0_0_120px_40px_rgba(61,190,159,0.08)] blur-2xl"
            aria-hidden
          />
          <div
            className="pointer-events-none absolute inset-0 opacity-[0.35] [background-image:radial-gradient(rgba(15,63,58,0.06)_1px,transparent_1px)] [background-size:22px_22px]"
            aria-hidden
          />
        </>
      )}

      {isDark ? (
        <div className="relative z-10 flex min-h-screen w-full flex-1 flex-col">
          {showHomeLink ? (
            <div className="flex shrink-0 justify-center px-4 pt-6">
              <Link
                href="/"
                className="inline-flex items-center gap-2 rounded-full border border-landing-border/50 bg-landing-card/60 px-5 py-2 text-sm text-landing-muted shadow-sm backdrop-blur-xl transition hover:border-landing-accent/30 hover:text-landing-fg"
              >
                ← Retour à l&apos;accueil
              </Link>
            </div>
          ) : null}
          <div className="flex flex-1 items-center justify-center px-4 py-8 sm:py-10">
            <div className={cn("relative w-full", maxW)}>{children}</div>
          </div>
        </div>
      ) : (
        <div className={cn("relative z-10 w-full", maxW)}>
          {showHomeLink ? (
            <div className="mb-6 flex justify-center sm:mb-8">
              <Link
                href="/"
                className="inline-flex items-center gap-2 rounded-full border border-[#CBE6DF]/80 bg-white/60 px-3 py-1.5 text-xs font-medium text-[#0F3F3A]/70 shadow-sm backdrop-blur-md transition hover:border-[#A3D8CC] hover:bg-white/90 hover:text-[#0F3F3A] sm:text-sm"
              >
                <span aria-hidden className="text-[#1F7A6C]">
                  ←
                </span>
                Retour à l&apos;accueil
              </Link>
            </div>
          ) : null}

          {children}

          {footerLine ? (
            <p className="mt-8 text-center text-[11px] leading-relaxed text-[#0F3F3A]/40 sm:text-xs">{footerLine}</p>
          ) : null}
        </div>
      )}
    </main>
  );
}

type ZenGrowAuthCardProps = {
  children: ReactNode;
  className?: string;
  variant?: AuthShellVariant;
};

export function ZenGrowAuthCard({ children, className, variant = "light" }: ZenGrowAuthCardProps) {
  const isDark = variant === "dark";

  if (isDark) {
    return (
      <motion.section
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className={cn(
          "relative w-full overflow-hidden rounded-2xl border border-landing-border bg-landing-card/95 p-8 shadow-2xl shadow-landing-accent/5 backdrop-blur-sm sm:p-10",
          className,
        )}
      >
        <div className="relative">{children}</div>
      </motion.section>
    );
  }

  return (
    <section className="relative overflow-hidden rounded-[1.75rem] border border-[#DDEFEA]/90 bg-white/80 p-8 shadow-[0_24px_80px_-28px_rgba(15,63,58,0.28),0_0_1px_rgba(15,63,58,0.06)] backdrop-blur-2xl sm:p-10">
      <div
        className="pointer-events-none absolute -right-20 -top-20 h-56 w-56 rounded-full bg-gradient-to-br from-[#3DBE9F]/20 to-transparent blur-2xl"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -bottom-16 -left-16 h-48 w-48 rounded-full bg-gradient-to-tr from-[#1F7A6C]/12 to-transparent blur-2xl"
        aria-hidden
      />
      <div className={cn("relative", className)}>{children}</div>
    </section>
  );
}
