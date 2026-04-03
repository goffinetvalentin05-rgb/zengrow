import { cn } from "@/src/lib/utils";

type DivProps = {
  className?: string;
  children: React.ReactNode;
};

export function Card({ className, children }: DivProps) {
  return (
    <article
      className={cn(
        "rounded-[20px] border border-[var(--border-soft)] bg-[var(--surface-card)] shadow-[var(--card-shadow)]",
        className,
      )}
    >
      {children}
    </article>
  );
}

export function CardHeader({ className, children }: DivProps) {
  return (
    <header className={cn("border-b border-[var(--border-soft)] px-7 py-6 md:px-8 md:py-7", className)}>
      {children}
    </header>
  );
}

export function CardTitle({ className, children }: DivProps) {
  return (
    <h3
      className={cn(
        "text-xl font-semibold leading-snug tracking-tight text-[var(--foreground)] md:text-[1.35rem]",
        className,
      )}
    >
      {children}
    </h3>
  );
}

export function CardDescription({ className, children }: DivProps) {
  return (
    <p className={cn("mt-2 text-[13px] leading-relaxed text-[var(--muted-foreground)]", className)}>{children}</p>
  );
}

export function CardContent({ className, children }: DivProps) {
  return <div className={cn("p-7 md:p-8", className)}>{children}</div>;
}
