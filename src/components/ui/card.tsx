import { cn } from "@/src/lib/utils";

type DivProps = {
  className?: string;
  children: React.ReactNode;
};

export function Card({ className, children }: DivProps) {
  return (
    <article
      className={cn(
        "rounded-xl border border-[rgba(0,0,0,0.07)] bg-[var(--surface)] shadow-sm",
        className,
      )}
    >
      {children}
    </article>
  );
}

export function CardHeader({ className, children }: DivProps) {
  return (
    <header className={cn("border-b border-[rgba(0,0,0,0.06)] px-6 py-5", className)}>
      {children}
    </header>
  );
}

export function CardTitle({ className, children }: DivProps) {
  return (
    <h3 className={cn("text-[1.375rem] font-semibold leading-tight tracking-tight text-[var(--foreground)]", className)}>
      {children}
    </h3>
  );
}

export function CardDescription({ className, children }: DivProps) {
  return (
    <p className={cn("mt-1.5 text-sm font-normal text-[var(--muted-foreground)]", className)}>{children}</p>
  );
}

export function CardContent({ className, children }: DivProps) {
  return <div className={cn("p-6", className)}>{children}</div>;
}
