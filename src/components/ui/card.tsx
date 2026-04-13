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
        "rounded-2xl border border-zg-border-strong/90 bg-zg-surface/92 p-6 shadow-zg-card backdrop-blur-md md:p-7",
        className,
      )}
    >
      {children}
    </article>
  );
}

export function CardHeader({ className, children }: DivProps) {
  return <header className={cn("mb-6 border-b border-zg-border/85 pb-6", className)}>{children}</header>;
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
  return <p className={cn("mt-2.5 text-sm leading-relaxed text-zg-fg/58", className)}>{children}</p>;
}

export function CardContent({ className, children }: DivProps) {
  return <div className={cn(className)}>{children}</div>;
}
