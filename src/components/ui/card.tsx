import { cn } from "@/src/lib/utils";

type DivProps = {
  className?: string;
  children: React.ReactNode;
};

/** Section dashboard — surface premium alignée landing ZenGrow. */
export function Card({ className, children }: DivProps) {
  return (
    <article
      className={cn(
        "rounded-2xl border border-zg-border bg-zg-surface p-5 shadow-zg-soft md:p-6",
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
    <h2
      className={cn(
        "text-xl font-bold tracking-[-0.02em] text-zg-fg md:text-[1.375rem] md:leading-snug",
        className,
      )}
    >
      {children}
    </h2>
  );
}

export function CardDescription({ className, children }: DivProps) {
  return <p className={cn("mt-2.5 text-sm leading-relaxed text-zg-muted", className)}>{children}</p>;
}

export function CardContent({ className, children }: DivProps) {
  return <div className={cn(className)}>{children}</div>;
}
