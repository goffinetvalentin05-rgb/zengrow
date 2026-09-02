"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import type { ReactNode } from "react";
import { LandingWordmark } from "@/components/landing/BrandLogo";
import { LanguageSwitch } from "@/src/i18n/language-switch";
import { useI18n } from "@/src/i18n/provider";
import { cn } from "@/src/lib/utils";
import "./auth-layout.css";

export type AuthLayoutIntent = "login" | "signup" | "recover";

type AuthVisualCopy = {
  badge: string;
  title: string;
  subtitle: string;
  steps: readonly string[];
  activeStep: number;
};

type ZenGrowAuthLayoutProps = {
  children: ReactNode;
  intent?: AuthLayoutIntent;
  showHomeLink?: boolean;
  /** Conservé pour compatibilité — le layout premium n’affiche plus cette ligne. */
  footerLine?: string | null;
  /** Conservé pour compatibilité. */
  variant?: "light" | "dark";
  contentMaxWidthClass?: string;
};

export function AuthVisualPanel({ intent = "login" }: { intent?: AuthLayoutIntent }) {
  const { t } = useI18n();
  const copy: AuthVisualCopy =
    intent === "signup"
      ? { badge: t.auth.signup.visualBadge, title: t.auth.signup.visualTitle, subtitle: t.auth.signup.visualSubtitle, steps: t.auth.signup.steps, activeStep: 0 }
      : intent === "recover"
        ? { badge: t.auth.forgot.visualBadge, title: t.auth.forgot.visualTitle, subtitle: t.auth.forgot.visualSubtitle, steps: t.auth.forgot.steps, activeStep: 0 }
        : { badge: t.auth.login.visualBadge, title: t.auth.login.visualTitle, subtitle: t.auth.login.visualSubtitle, steps: t.auth.login.steps, activeStep: 0 };

  return (
    <aside className="zg-auth-visual hidden flex-col justify-start gap-6 px-6 py-5 sm:gap-8 sm:px-9 sm:py-10 lg:flex lg:gap-8 lg:px-11 lg:py-14">
      <div className="zg-auth-visual__inner flex flex-col items-start">
        <Link href="/" className="inline-flex w-fit items-center" aria-label={t.auth.home}>
          <LandingWordmark className="zg-auth-visual__logo" priority />
        </Link>
        <span className="mt-5 inline-flex rounded-full border border-white/20 bg-white/10 px-3 py-1 text-[11px] font-medium uppercase tracking-[0.16em] text-white/90 backdrop-blur-md">
          {copy.badge}
        </span>
        <h2 className="mt-5 max-w-md font-[family-name:var(--font-zg-display)] text-[1.45rem] font-semibold leading-[1.15] tracking-tight text-white sm:text-[1.85rem] lg:mt-6 lg:text-[2.05rem]">
          {copy.title}
        </h2>
        <p className="mt-3 hidden max-w-sm text-sm leading-relaxed text-white/72 lg:block lg:text-[0.9375rem]">
          {copy.subtitle}
        </p>
      </div>

      <ol className="zg-auth-visual__inner hidden flex-col gap-2.5 lg:flex">
        {copy.steps.map((label, index) => {
          const active = index === copy.activeStep;
          return (
            <li key={label} className={cn("zg-auth-step", active && "is-active")}>
              <span className="zg-auth-step__n">{String(index + 1).padStart(2, "0")}</span>
              <span className="text-sm font-medium leading-snug">{label}</span>
            </li>
          );
        })}
      </ol>
    </aside>
  );
}

export function AuthCard({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn("mx-auto w-full max-w-[440px] lg:mx-0", className)}>{children}</div>;
}

export function ZenGrowAuthLayout({
  children,
  intent = "login",
  showHomeLink = true,
}: ZenGrowAuthLayoutProps) {
  const { t } = useI18n();
  return (
    <main className="zg-auth-page relative flex min-h-dvh flex-col overflow-x-hidden font-[family-name:var(--font-zg-body)]">
      <div className="zg-auth-page__glow" aria-hidden />

      <div className="relative z-10 flex min-h-dvh w-full items-center justify-center p-4 sm:p-6 lg:p-8">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
          className="zg-auth-frame mx-auto grid w-full max-w-[1080px] grid-cols-1 rounded-[1.5rem] sm:rounded-[1.75rem] lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)]"
        >
          <AuthVisualPanel intent={intent} />

          <section className="zg-auth-form relative flex flex-col justify-start px-5 py-8 sm:px-10 sm:py-10 lg:px-12 lg:py-14 lg:pt-[4.25rem]">
            <div className="mb-4 flex items-center justify-between gap-3 lg:absolute lg:top-8 lg:right-12 lg:mb-0">
              <LanguageSwitch variant="auth" />
            </div>
            {showHomeLink ? (
              <Link
                href="/"
                className="mb-6 inline-flex w-fit items-center gap-1.5 text-sm text-white/45 transition hover:text-white/80 lg:absolute lg:top-8 lg:left-12 lg:mb-0"
              >
                ← {t.auth.home}
              </Link>
            ) : null}
            {children}
          </section>
        </motion.div>
      </div>
    </main>
  );
}

/** @deprecated Utiliser ZenGrowAuthLayout */
export const ZenGrowAuthPageShell = ZenGrowAuthLayout;

/** @deprecated Utiliser AuthCard */
export const ZenGrowAuthCard = AuthCard;
