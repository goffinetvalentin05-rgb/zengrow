import Link from "next/link";
import { cn } from "@/src/lib/utils";

export function Container({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return <div className={cn("zg-lp-container zg-lp-body", className)}>{children}</div>;
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
    <section id={id} className={cn("zg-lp-section", className)}>
      {children}
    </section>
  );
}

export function SectionHeader({
  title,
  subtitle,
  align = "center",
  className,
}: {
  title: string;
  subtitle?: string;
  align?: "center" | "left";
  className?: string;
}) {
  return (
    <header
      className={cn(
        "max-w-3xl",
        align === "center" && "mx-auto text-center",
        className,
      )}
    >
      <h2 className="zg-lp-title zg-lp-display">{title}</h2>
      {subtitle ? <p className="zg-lp-lead">{subtitle}</p> : null}
    </header>
  );
}

export function GlassCard({
  className,
  strong,
  children,
}: {
  className?: string;
  strong?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className={cn("zg-lp-glass", strong && "zg-lp-glass--strong", className)}>
      {children}
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
    <Link href={href} className={cn("zg-lp-btn-primary zg-lp-body", className)}>
      {children}
    </Link>
  );
}

export function SecondaryButton({
  href,
  children,
  className,
}: {
  href: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <Link href={href} className={cn("zg-lp-btn-secondary zg-lp-body", className)}>
      {children}
    </Link>
  );
}
