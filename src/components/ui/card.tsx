import { cn } from "@/src/lib/utils";

type DivProps = {
  className?: string;
  children: React.ReactNode;
};

export function Card({ className, children }: DivProps) {
  return (
    <article
      className={cn(
        "rounded-2xl border border-[var(--border)] bg-[var(--surface)]",
        className,
      )}
    >
      {children}
    </article>
  );
}

export function CardHeader({ className, children }: DivProps) {
  return <header className={cn("border-b border-[var(--border)] p-5", className)}>{children}</header>;
}

export function CardTitle({ className, children }: DivProps) {
  return <h3 className={cn("text-lg font-semibold text-slate-900", className)}>{children}</h3>;
}

export function CardDescription({ className, children }: DivProps) {
  return <p className={cn("mt-1 text-sm text-[var(--muted-foreground)]", className)}>{children}</p>;
}

export function CardContent({ className, children }: DivProps) {
  return <div className={cn("p-5", className)}>{children}</div>;
}
