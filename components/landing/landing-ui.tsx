"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { cn } from "@/src/lib/utils";

export const landingColors = {
  fg: "#EEF6FF",
  muted: "#8BA3C7",
  accent: "#2B8CFF",
  accentSoft: "#5EB3FF",
  cyan: "#38D4FF",
  border: "rgba(59, 158, 255, 0.22)",
  cardBg: "rgba(8, 22, 48, 0.55)",
} as const;

/** Logo ZenGrow avec halo discret */
export function LandingLogo({
  variant = "navbar",
  priority = false,
  className,
}: {
  variant?: "navbar" | "hero";
  priority?: boolean;
  className?: string;
}) {
  const config =
    variant === "hero"
      ? { width: 240, height: 68, img: "h-11 w-auto max-w-[min(260px,78vw)] sm:h-[3.25rem]" }
      : { width: 176, height: 48, img: "h-8 w-auto max-w-[148px] sm:h-9 sm:max-w-[168px]" };

  return (
    <span
      className={cn(
        "landing-logo-wrap relative inline-flex items-center",
        variant === "hero" && "landing-logo-wrap--hero",
        className,
      )}
    >
      <span className="landing-logo-glow" aria-hidden />
      <Image
        src="/logo-zengrow.png"
        alt="ZenGrow"
        width={config.width}
        height={config.height}
        className={cn("relative z-[1] object-contain", config.img)}
        priority={priority}
      />
    </span>
  );
}

export function HeroAtmosphere() {
  return (
    <div className="pointer-events-none absolute inset-x-0 top-0 z-[1] h-[min(720px,95vh)] overflow-hidden" aria-hidden>
      <motion.div
        className="absolute left-1/2 top-[16%] h-[min(440px,74vw)] w-[min(540px,90vw)] -translate-x-1/2 rounded-full opacity-90"
        style={{
          background:
            "radial-gradient(ellipse 70% 55% at 50% 45%, rgba(43, 140, 255, 0.22) 0%, rgba(56, 212, 255, 0.08) 42%, transparent 72%)",
        }}
        animate={{ opacity: [0.65, 0.9, 0.65], scale: [1, 1.05, 1] }}
        transition={{ duration: 11, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute -left-[10%] top-[26%] h-[min(300px,52vw)] w-[min(300px,52vw)] rounded-full blur-3xl"
        style={{
          background: "radial-gradient(circle, rgba(56, 212, 255, 0.14) 0%, transparent 68%)",
        }}
        animate={{ opacity: [0.4, 0.62, 0.4], x: [0, 14, 0] }}
        transition={{ duration: 15, repeat: Infinity, ease: "easeInOut", delay: 1 }}
      />
      <motion.div
        className="absolute -right-[8%] top-[30%] h-[min(260px,46vw)] w-[min(260px,46vw)] rounded-full blur-3xl"
        style={{
          background: "radial-gradient(circle, rgba(43, 140, 255, 0.12) 0%, transparent 70%)",
        }}
        animate={{ opacity: [0.35, 0.55, 0.35], x: [0, -12, 0] }}
        transition={{ duration: 13, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
      />
      <div
        className="absolute inset-x-0 top-0 h-48"
        style={{
          background: "linear-gradient(180deg, rgba(43, 140, 255, 0.08) 0%, transparent 100%)",
        }}
      />
      <div
        className="absolute inset-x-0 bottom-0 h-40"
        style={{
          background: "linear-gradient(0deg, rgba(2, 6, 16, 0.9) 0%, transparent 100%)",
        }}
      />
    </div>
  );
}

export function LandingDotGrid({ className }: { className?: string }) {
  return (
    <div
      className={cn("pointer-events-none absolute inset-0 opacity-[0.32]", className)}
      aria-hidden
      style={{
        backgroundImage:
          "radial-gradient(circle at 1px 1px, rgba(59, 158, 255, 0.16) 1px, transparent 0)",
        backgroundSize: "28px 28px",
        maskImage: "radial-gradient(ellipse 70% 60% at 50% 40%, black 20%, transparent 75%)",
      }}
    />
  );
}

export function LandingGlows() {
  return (
    <>
      <motion.div
        className="pointer-events-none absolute -left-[20%] top-[8%] h-[min(520px,70vw)] w-[min(520px,70vw)] rounded-full bg-[radial-gradient(circle,rgba(43,140,255,0.28),transparent_68%)] blur-3xl"
        animate={{ opacity: [0.5, 0.78, 0.5], scale: [1, 1.05, 1] }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        aria-hidden
      />
      <motion.div
        className="pointer-events-none absolute -right-[18%] top-[18%] h-[min(480px,65vw)] w-[min(480px,65vw)] rounded-full bg-[radial-gradient(circle,rgba(56,212,255,0.16),transparent_70%)] blur-3xl"
        animate={{ opacity: [0.4, 0.65, 0.4], scale: [1.02, 1, 1.02] }}
        transition={{ duration: 12, repeat: Infinity, ease: "easeInOut", delay: 1 }}
        aria-hidden
      />
    </>
  );
}

export function GlassCard({
  className,
  children,
  featured,
  floatDelay = 0,
}: {
  className?: string;
  children: React.ReactNode;
  featured?: boolean;
  floatDelay?: number;
}) {
  return (
    <motion.div
      className={cn(
        "rounded-2xl border border-[rgba(59,158,255,0.2)] bg-[rgba(8,22,48,0.5)] p-4 shadow-[0_24px_80px_-40px_rgba(0,0,0,0.9),inset_0_1px_0_rgba(255,255,255,0.07)] backdrop-blur-xl sm:rounded-3xl sm:p-5",
        featured &&
          "border-[rgba(43,140,255,0.35)] bg-[rgba(43,140,255,0.08)] shadow-[0_0_56px_-10px_rgba(43,140,255,0.35),inset_0_1px_0_rgba(180,220,255,0.12)]",
        className,
      )}
      animate={{ y: [0, -5, 0] }}
      transition={{ duration: 6 + floatDelay, repeat: Infinity, ease: "easeInOut", delay: floatDelay }}
      whileHover={{
        borderColor: "rgba(94, 179, 255, 0.38)",
        boxShadow: "0 0 48px rgba(43, 140, 255, 0.16)",
      }}
    >
      {children}
    </motion.div>
  );
}

export function LandingBadge({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-2 rounded-full border border-[rgba(59,158,255,0.28)] bg-[rgba(43,140,255,0.1)] px-3.5 py-1.5 text-xs font-medium tracking-wide text-[#5EB3FF]">
      <span className="size-1.5 rounded-full bg-[#38D4FF] shadow-[0_0_10px_rgba(56,212,255,0.85)]" aria-hidden />
      {children}
    </span>
  );
}

export function SectionShell({
  id,
  className,
  children,
}: {
  id?: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <section
      id={id}
      className={cn("relative w-full overflow-x-hidden px-4 py-20 sm:px-6 sm:py-28", className)}
    >
      {children}
    </section>
  );
}

export function SectionTitle({
  title,
  subtitle,
  className,
  align = "center",
}: {
  title: React.ReactNode;
  subtitle?: string;
  className?: string;
  align?: "center" | "left";
}) {
  return (
    <div
      className={cn(
        "mx-auto mb-12 max-w-3xl sm:mb-16",
        align === "center" ? "text-center" : "text-left",
        className,
      )}
    >
      <h2 className="font-landing-serif text-[clamp(1.75rem,4vw,2.75rem)] font-normal leading-tight text-[#EEF6FF]">
        {title}
      </h2>
      {subtitle ? (
        <p className="mt-4 text-base leading-relaxed text-[#8BA3C7] sm:text-lg">{subtitle}</p>
      ) : null}
    </div>
  );
}

export function LandingPrimaryButton({
  href,
  children,
  className,
}: {
  href: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "inline-flex min-h-12 items-center justify-center rounded-full bg-[#2B8CFF] px-8 text-sm font-semibold text-white shadow-[0_0_48px_-8px_rgba(43,140,255,0.85)] transition hover:bg-[#5EB3FF] hover:shadow-[0_0_56px_-6px_rgba(94,179,255,0.9)]",
        className,
      )}
    >
      {children}
    </Link>
  );
}

export function LandingSecondaryButton({
  href,
  children,
  className,
}: {
  href: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <Link href={href} className={cn("landing-btn-secondary inline-flex min-h-12 items-center justify-center rounded-full px-8 text-sm font-medium", className)}>
      {children}
    </Link>
  );
}
