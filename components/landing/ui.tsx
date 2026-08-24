"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { cn } from "@/src/lib/utils";
import { CTA, ROUTES } from "./config";

export function Container({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return <div className={cn("go-container", className)}>{children}</div>;
}

export function Section({
  id,
  className,
  children,
  tone = "default",
}: {
  id?: string;
  className?: string;
  children: React.ReactNode;
  tone?: "default" | "muted" | "ink";
}) {
  return (
    <section id={id} className={cn("go-section", tone !== "default" && `go-section--${tone}`, className)}>
      {children}
    </section>
  );
}

export function ScrollReveal({
  children,
  className,
  delay = 0,
  y = 18,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  y?: number;
}) {
  const reduce = useReducedMotion();

  if (reduce) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-72px" }}
      transition={{ duration: 0.55, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}

export function Eyebrow({ children }: { children: React.ReactNode }) {
  return <p className="go-eyebrow">{children}</p>;
}

export function SectionTitle({ children, className }: { children: React.ReactNode; className?: string }) {
  return <h2 className={cn("go-title", className)}>{children}</h2>;
}

export function SectionLead({ children, className }: { children: React.ReactNode; className?: string }) {
  return <p className={cn("go-lead", className)}>{children}</p>;
}

export function CtaButton({
  href = ROUTES.signup,
  children = CTA.primary,
  className,
  variant = "primary",
}: {
  href?: string;
  children?: React.ReactNode;
  className?: string;
  variant?: "primary" | "secondary" | "on-ink" | "accent";
}) {
  const classNames = cn(
    "go-btn",
    variant === "primary" && "go-btn--primary",
    variant === "secondary" && "go-btn--secondary",
    variant === "on-ink" && "go-btn--on-ink",
    variant === "accent" && "go-btn--accent",
    className,
  );

  if (href.startsWith("#")) {
    return (
      <a href={href} className={classNames}>
        {children}
      </a>
    );
  }

  return (
    <Link href={href} className={classNames}>
      {children}
    </Link>
  );
}

export function DemoCaption({ children }: { children: React.ReactNode }) {
  return <p className="go-demo-caption">{children}</p>;
}

export function SectionHeader({
  label,
  title,
  lead,
  align = "center",
  className,
}: {
  label?: string;
  title: React.ReactNode;
  lead?: React.ReactNode;
  align?: "center" | "left";
  className?: string;
}) {
  return (
    <header className={cn("go-section-head", align === "left" && "go-section-head--left", className)}>
      {label ? <Eyebrow>{label}</Eyebrow> : null}
      <SectionTitle>{title}</SectionTitle>
      {lead ? <SectionLead>{lead}</SectionLead> : null}
    </header>
  );
}
