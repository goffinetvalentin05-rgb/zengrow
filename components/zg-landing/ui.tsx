import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { cn } from "@/src/lib/utils";

export function Container({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return <div className={cn("zg-container", className)}>{children}</div>;
}

export function Section({
  id,
  className,
  children,
}: {
  id: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className={cn("zg-section", className)}>
      {children}
    </section>
  );
}

export function Badge({ children }: { children: React.ReactNode }) {
  return (
    <span className="zg-badge">
      <span className="zg-badge-dot" aria-hidden />
      {children}
    </span>
  );
}

export function GradientText({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <span className={cn("zg-gradient-text", className)}>{children}</span>;
}

export function MegaTitle({
  children,
  className,
  as: Tag = "h2",
}: {
  children: React.ReactNode;
  className?: string;
  as?: "h1" | "h2" | "h3";
}) {
  return <Tag className={cn("zg-title-mega zg-display text-white", className)}>{children}</Tag>;
}

export function BlockHeader({
  title,
  subtitle,
  align = "center",
  className,
}: {
  title: React.ReactNode;
  subtitle?: string;
  align?: "center" | "left";
  className?: string;
}) {
  return (
    <header
      className={cn(
        "max-w-4xl",
        align === "center" && "mx-auto text-center",
        className,
      )}
    >
      <MegaTitle as="h2">{title}</MegaTitle>
      {subtitle ? (
        <p
          className={cn(
            "zg-lead mt-5 max-w-2xl text-balance",
            align === "center" && "mx-auto",
          )}
        >
          {subtitle}
        </p>
      ) : null}
    </header>
  );
}

export function GlassCard({
  className,
  glow,
  featured,
  hover,
  depth,
  danger,
  children,
}: {
  className?: string;
  glow?: boolean;
  featured?: boolean;
  hover?: boolean;
  depth?: boolean;
  danger?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div
      className={cn(
        "zg-glass",
        glow && "zg-glass--glow",
        featured && "zg-glass--featured",
        hover && "zg-glass-interactive",
        depth && "zg-glass--depth",
        danger && "zg-glass--danger",
        className,
      )}
    >
      <div className="zg-glass-shine" aria-hidden />
      <div className="relative z-[1]">{children}</div>
    </div>
  );
}

/** Alias sémantique pour cartes premium avec hover par défaut */
export function PremiumCard({
  hover = true,
  ...props
}: React.ComponentProps<typeof GlassCard>) {
  return <GlassCard hover={hover} {...props} />;
}

export function SectionAmbient({
  variant = "violet",
}: {
  variant?: "violet" | "cyan" | "rose";
}) {
  const colors = {
    violet: "rgb(124 92 255 / 0.2)",
    cyan: "rgb(56 189 248 / 0.15)",
    rose: "rgb(192 38 211 / 0.15)",
  };
  return (
    <div
      className="zg-section-ambient pointer-events-none absolute inset-0 overflow-hidden"
      aria-hidden
    >
      <div
        className="absolute left-1/2 top-0 h-[420px] w-[min(90vw,720px)] -translate-x-1/2 rounded-full blur-[100px]"
        style={{ background: `radial-gradient(circle, ${colors[variant]}, transparent 70%)` }}
      />
    </div>
  );
}

export function PrimaryButton({
  href,
  children,
  className,
}: {
  href: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <Link href={href} className={cn("zg-btn-primary", className)}>
      {children}
      <ArrowRight className="h-4 w-4" aria-hidden />
    </Link>
  );
}

export function GhostButton({
  href,
  children,
  className,
}: {
  href: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <Link href={href} className={cn("zg-btn-ghost", className)}>
      {children}
    </Link>
  );
}
