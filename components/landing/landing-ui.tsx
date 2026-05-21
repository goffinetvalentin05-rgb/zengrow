"use client";

import { motion } from "framer-motion";
import { cn } from "@/src/lib/utils";

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
        className="pointer-events-none absolute -left-[20%] top-[8%] h-[min(520px,70vw)] w-[min(520px,70vw)] rounded-full bg-[radial-gradient(circle,rgba(255,90,42,0.22),transparent_68%)] blur-3xl"
        animate={{ opacity: [0.55, 0.75, 0.55], scale: [1, 1.04, 1] }}
        transition={{ duration: 9, repeat: Infinity, ease: "easeInOut" }}
        aria-hidden
      />
      <motion.div
        className="pointer-events-none absolute -right-[18%] top-[18%] h-[min(480px,65vw)] w-[min(480px,65vw)] rounded-full bg-[radial-gradient(circle,rgba(246,168,90,0.14),transparent_70%)] blur-3xl"
        animate={{ opacity: [0.4, 0.6, 0.4], scale: [1.02, 1, 1.02] }}
        transition={{ duration: 11, repeat: Infinity, ease: "easeInOut", delay: 1 }}
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
        "rounded-2xl border border-[rgba(255,122,61,0.18)] bg-[rgba(255,255,255,0.04)] p-4 shadow-[0_24px_80px_-40px_rgba(0,0,0,0.85)] backdrop-blur-xl sm:rounded-3xl sm:p-5",
        featured && "border-[rgba(255,90,42,0.28)] bg-[rgba(255,90,42,0.06)] shadow-[0_0_48px_-12px_rgba(255,90,42,0.25)]",
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
