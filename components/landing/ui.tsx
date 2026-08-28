"use client";

import Link from "next/link";
import { ArrowRight, Link2 } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";
import { cn } from "@/src/lib/utils";
import { ROUTES } from "./config";

export function Container({
  className,
  wide = false,
  children,
}: {
  className?: string;
  wide?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className={cn(wide ? "go-container--wide" : "go-container", className)}>
      {children}
    </div>
  );
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
  tone?: "default" | "soft" | "ink";
}) {
  return (
    <section
      id={id}
      className={cn("go-section", tone !== "default" && `go-section--${tone}`, className)}
    >
      {children}
    </section>
  );
}

export function ScrollReveal({
  children,
  className,
  delay = 0,
  y = 16,
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
      viewport={{ once: true, margin: "-64px" }}
      transition={{ duration: 0.45, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}

export function Eyebrow({ children }: { children: React.ReactNode }) {
  return <p className="go-eyebrow">{children}</p>;
}

export function SectionTitle({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <h2 className={cn("go-title", className)}>{children}</h2>;
}

export function SectionLead({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <p className={cn("go-lead", className)}>{children}</p>;
}

export function CtaButton({
  href = ROUTES.signup,
  children,
  className,
  variant = "primary",
  onClick,
}: {
  href?: string;
  children: React.ReactNode;
  className?: string;
  variant?: "primary" | "secondary" | "on-ink" | "ghost";
  onClick?: () => void;
}) {
  const classNames = cn(
    "go-btn",
    variant === "primary" && "go-btn--primary",
    variant === "secondary" && "go-btn--secondary",
    variant === "on-ink" && "go-btn--on-ink",
    variant === "ghost" && "go-btn--ghost",
    className,
  );

  if (href.startsWith("#")) {
    return (
      <a href={href} className={classNames} onClick={onClick}>
        {children}
      </a>
    );
  }

  return (
    <Link href={href} className={classNames} onClick={onClick}>
      {children}
    </Link>
  );
}

export function UrlAnalyzeField({
  placeholder,
  buttonLabel,
  onInk = false,
  hero = false,
  className,
}: {
  placeholder: string;
  buttonLabel: string;
  onInk?: boolean;
  hero?: boolean;
  className?: string;
}) {
  return (
    <form
      className={cn("go-url", hero && "go-url--hero", onInk && "go-url--on-ink", className)}
      onSubmit={(event) => {
        event.preventDefault();
      }}
    >
      {hero ? <Link2 className="go-url__icon" strokeWidth={1.75} aria-hidden /> : null}
      <input
        type="url"
        name="url"
        className="go-url__input"
        placeholder={placeholder}
        aria-label={placeholder}
        autoComplete="url"
      />
      <button type="submit" className="go-url__btn">
        {buttonLabel}
        {hero ? (
          <span className="go-url__arrow" aria-hidden>
            <ArrowRight strokeWidth={2} />
          </span>
        ) : null}
      </button>
    </form>
  );
}
