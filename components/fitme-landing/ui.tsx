"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { cn } from "@/src/lib/utils";
import { CTA, ROUTES } from "./config";
import { trackFitmeEvent } from "@/src/lib/fitme/analytics";

export function Container({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return <div className={cn("fitme-container", className)}>{children}</div>;
}

export function Section({
  id,
  className,
  children,
}: {
  id?: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className={cn("fitme-section", className)}>
      {children}
    </section>
  );
}

export function ScrollReveal({
  children,
  className,
  delay = 0,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}) {
  const reduce = useReducedMotion();

  if (reduce) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 22 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-64px" }}
      transition={{ duration: 0.5, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}

export function CtaButton({
  href = ROUTES.start,
  children = CTA.primaryArrow,
  className,
  compact = false,
  ghost = false,
}: {
  href?: string;
  children?: React.ReactNode;
  className?: string;
  compact?: boolean;
  ghost?: boolean;
}) {
  return (
    <Link
      href={href}
      onClick={() => {
        if (href === ROUTES.start) {
          trackFitmeEvent("landing_cta_clicked");
        }
      }}
      className={cn(
        "fitme-cta",
        compact && "fitme-cta--compact",
        ghost && "fitme-cta--ghost",
        className,
      )}
    >
      {children}
    </Link>
  );
}

export function DemoCaption({ children }: { children: React.ReactNode }) {
  return <p className="fitme-demo-caption">{children}</p>;
}
