"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { cn } from "@/src/lib/utils";

/** Logo ZenGrow avec halo discret — cohérent navbar / hero */
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

/** Atmosphère locale du hero — halos et reflets derrière le bloc texte */
export function HeroAtmosphere() {
  return (
    <div className="pointer-events-none absolute inset-x-0 top-0 z-[1] h-[min(720px,95vh)] overflow-hidden" aria-hidden>
      <motion.div
        className="absolute left-1/2 top-[18%] h-[min(420px,72vw)] w-[min(520px,88vw)] -translate-x-1/2 rounded-full opacity-90"
        style={{
          background:
            "radial-gradient(ellipse 70% 55% at 50% 45%, rgba(255, 90, 42, 0.2) 0%, rgba(255, 122, 61, 0.08) 42%, transparent 72%)",
        }}
        animate={{ opacity: [0.72, 0.92, 0.72], scale: [1, 1.04, 1] }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute -left-[8%] top-[28%] h-[min(280px,50vw)] w-[min(280px,50vw)] rounded-full blur-2xl"
        style={{
          background: "radial-gradient(circle, rgba(246, 168, 90, 0.12) 0%, transparent 68%)",
        }}
        animate={{ opacity: [0.45, 0.65, 0.45], x: [0, 12, 0] }}
        transition={{ duration: 14, repeat: Infinity, ease: "easeInOut", delay: 1 }}
      />
      <motion.div
        className="absolute -right-[6%] top-[32%] h-[min(240px,44vw)] w-[min(240px,44vw)] rounded-full blur-2xl"
        style={{
          background: "radial-gradient(circle, rgba(255, 90, 42, 0.1) 0%, transparent 70%)",
        }}
        animate={{ opacity: [0.4, 0.58, 0.4], x: [0, -10, 0] }}
        transition={{ duration: 12, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
      />
      <div
        className="absolute inset-x-0 top-0 h-48"
        style={{
          background:
            "linear-gradient(180deg, rgba(255, 122, 61, 0.06) 0%, transparent 100%)",
        }}
      />
      <div
        className="absolute inset-x-0 bottom-0 h-40"
        style={{
          background:
            "linear-gradient(0deg, rgba(5, 4, 3, 0.85) 0%, transparent 100%)",
        }}
      />
    </div>
  );
}

export function LandingDotGrid({ className }: { className?: string }) {
  return (
    <div
      className={cn("pointer-events-none absolute inset-0 opacity-[0.35]", className)}
      aria-hidden
      style={{
        backgroundImage:
          "radial-gradient(circle at 1px 1px, rgba(255, 122, 61, 0.14) 1px, transparent 0)",
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
        className="pointer-events-none absolute -left-[20%] top-[8%] h-[min(520px,70vw)] w-[min(520px,70vw)] rounded-full bg-[radial-gradient(circle,rgba(255,90,42,0.26),transparent_68%)] blur-3xl"
        animate={{ opacity: [0.58, 0.8, 0.58], scale: [1, 1.05, 1] }}
        transition={{ duration: 9, repeat: Infinity, ease: "easeInOut" }}
        aria-hidden
      />
      <motion.div
        className="pointer-events-none absolute -right-[18%] top-[18%] h-[min(480px,65vw)] w-[min(480px,65vw)] rounded-full bg-[radial-gradient(circle,rgba(246,168,90,0.18),transparent_70%)] blur-3xl"
        animate={{ opacity: [0.45, 0.68, 0.45], scale: [1.02, 1, 1.02] }}
        transition={{ duration: 11, repeat: Infinity, ease: "easeInOut", delay: 1 }}
        aria-hidden
      />
      <motion.div
        className="pointer-events-none absolute left-1/2 top-[42%] h-[min(360px,55vw)] w-[min(400px,60vw)] -translate-x-1/2 rounded-full bg-[radial-gradient(circle,rgba(255,122,61,0.08),transparent_72%)] blur-3xl"
        animate={{ opacity: [0.35, 0.52, 0.35] }}
        transition={{ duration: 13, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
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
        "rounded-2xl border border-[rgba(255,122,61,0.2)] bg-[rgba(255,255,255,0.045)] p-4 shadow-[0_24px_80px_-40px_rgba(0,0,0,0.85),inset_0_1px_0_rgba(255,255,255,0.06)] backdrop-blur-xl sm:rounded-3xl sm:p-5",
        featured &&
          "border-[rgba(255,90,42,0.32)] bg-[rgba(255,90,42,0.07)] shadow-[0_0_56px_-10px_rgba(255,90,42,0.32),inset_0_1px_0_rgba(255,180,130,0.12)]",
        className,
      )}
      animate={{ y: [0, -5, 0] }}
      transition={{ duration: 6 + floatDelay, repeat: Infinity, ease: "easeInOut", delay: floatDelay }}
      whileHover={{
        borderColor: "rgba(255, 122, 61, 0.32)",
        boxShadow: "0 0 40px rgba(255, 90, 42, 0.12)",
      }}
    >
      {children}
    </motion.div>
  );
}

export function LandingBadge({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-2 rounded-full border border-[rgba(255,122,61,0.22)] bg-[rgba(255,90,42,0.08)] px-3.5 py-1.5 text-xs font-medium tracking-wide text-[#F6A85A]">
      <span className="size-1.5 rounded-full bg-[#FF7A3D] shadow-[0_0_8px_rgba(255,122,61,0.8)]" aria-hidden />
      {children}
    </span>
  );
}

export function StatusBadge({
  children,
  variant = "default",
}: {
  children: React.ReactNode;
  variant?: "default" | "success";
}) {
  return (
    <span
      className={cn(
        "rounded-full px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider",
        variant === "success"
          ? "bg-[rgba(34,197,94,0.15)] text-emerald-300"
          : "bg-[rgba(255,90,42,0.15)] text-[#FF7A3D]",
      )}
    >
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
}: {
  title: React.ReactNode;
  subtitle?: string;
  className?: string;
}) {
  return (
    <div className={cn("mx-auto mb-12 max-w-3xl text-center sm:mb-16", className)}>
      <h2 className="font-landing-serif text-[clamp(1.75rem,4vw,2.75rem)] font-normal leading-tight text-[#FFF7EF]">
        {title}
      </h2>
      {subtitle ? <p className="mt-4 text-base leading-relaxed text-[#AFA39A] sm:text-lg">{subtitle}</p> : null}
    </div>
  );
}
