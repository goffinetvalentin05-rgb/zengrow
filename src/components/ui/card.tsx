import { cn } from "@/src/lib/utils";

type DivProps = {
  className?: string;
  children: React.ReactNode;
};

/** Section dashboard — carte blanche, ombre légère, coins arrondis. */
export function Card({ className, children }: DivProps) {
  return (
    <article className={cn("rounded-xl border border-gray-100 bg-white p-6 shadow-sm md:p-8", className)}>
      {children}
    </article>
  );
}

export function CardHeader({ className, children }: DivProps) {
  return <header className={cn("mb-6 border-b border-gray-100 pb-5", className)}>{children}</header>;
}

export function CardTitle({ className, children }: DivProps) {
  return (
    <h2
      className={cn(
        "text-xl font-semibold tracking-tight text-gray-900 md:text-[22px] md:leading-snug",
        className,
      )}
    >
      {children}
    </h2>
  );
}

export function CardDescription({ className, children }: DivProps) {
  return <p className={cn("mt-2 text-sm leading-relaxed text-gray-500", className)}>{children}</p>;
}

export function CardContent({ className, children }: DivProps) {
  return <div className={cn(className)}>{children}</div>;
}
