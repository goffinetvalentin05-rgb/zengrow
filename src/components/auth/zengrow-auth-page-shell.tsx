"use client";

import Link from "next/link";
import type { ReactNode } from "react";

type ZenGrowAuthPageShellProps = {
  children: ReactNode;
  showHomeLink?: boolean;
  footerLine?: string | null;
};

export function ZenGrowAuthPageShell({
  children,
  showHomeLink = true,
  footerLine = "Réservations en ligne, disponibilités et avis clients — tout ZenGrow, rien de superflu.",
}: ZenGrowAuthPageShellProps) {
  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-[#F6FBFA] px-4 py-10 text-[#0F3F3A] sm:px-6 lg:px-8">
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

      <div className="relative z-10 w-full max-w-[440px]">
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
    </main>
  );
}

export function ZenGrowAuthCard({ children }: { children: ReactNode }) {
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
      <div className="relative">{children}</div>
    </section>
  );
}
