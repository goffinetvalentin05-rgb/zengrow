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

export function Badge({ children }: { children: React.ReactNode }) {
  return (
    <span className="zg-lp-badge zg-lp-body">
      <span className="zg-lp-badge-dot" aria-hidden />
      {children}
    </span>
  );
}

export function GradientText({ children, className }: { children: React.ReactNode; className?: string }) {
  return <span className={cn("zg-lp-gradient", className)}>{children}</span>;
}

export function SectionHeader({
  badge,
  title,
  subtitle,
  align = "center",
  className,
}: {
  badge?: string;
  title: React.ReactNode;
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
      {badge ? (
        <div className={cn("mb-5", align === "center" && "flex justify-center")}>
          <Badge>{badge}</Badge>
        </div>
      ) : null}
      <h2 className="zg-lp-title zg-lp-display">{title}</h2>
      {subtitle ? <p className="zg-lp-lead">{subtitle}</p> : null}
    </header>
  );
}

export function GlassCard({
  className,
  strong,
  float,
  children,
}: {
  className?: string;
  strong?: boolean;
  float?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div
      className={cn(
        "zg-lp-glass",
        strong && "zg-lp-glass--strong",
        float && "zg-lp-glass--float",
        className,
      )}
    >
      {children}
    </div>
  );
}

export function PrimaryButton({
  href,
  children,
  className,
  showArrow,
  onClick,
}: {
  href: string;
  children: React.ReactNode;
  className?: string;
  showArrow?: boolean;
  onClick?: () => void;
}) {
  return (
    <Link href={href} className={cn("zg-lp-btn-primary zg-lp-body", className)} onClick={onClick}>
      {children}
      {showArrow ? <ArrowRight className="size-4 shrink-0" aria-hidden /> : null}
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

export function IconBox({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <div className={cn("zg-lp-icon-wrap", className)}>{children}</div>;
}
