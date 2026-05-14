import { cn } from "@/src/lib/utils";

type DivProps = {
  className?: string;
  children: React.ReactNode;
};

export function Card({ className, children }: DivProps) {
  return (
    <article
      className={cn(
        "h-full rounded-xl border border-zg-border bg-zg-surface p-6 shadow-sm transition-all duration-150",
        className,
      )}
    >
      {children}
    </article>
  );
}

export function CardHeader({ className, children }: DivProps) {
  return <header className={cn("mb-5 border-b border-zg-border pb-5", className)}>{children}</header>;
}

export function CardTitle({ className, children }: DivProps) {
  return (
    <h2 className={cn("text-base font-medium tracking-tight text-zg-fg", className)}>
      {children}
    </h2>
  );
}

export function CardDescription({ className, children }: DivProps) {
  return <p className={cn("mt-1.5 text-sm leading-relaxed text-zg-text-secondary", className)}>{children}</p>;
}

export function CardContent({ className, children }: DivProps) {
  return <div className={cn(className)}>{children}</div>;
}
