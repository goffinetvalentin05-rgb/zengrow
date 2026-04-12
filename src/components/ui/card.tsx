import { cn } from "@/src/lib/utils";

type DivProps = {
  className?: string;
  children: React.ReactNode;
};

/** Section dashboard — carte blanche, ombre légère, coins arrondis. */
export function Card({ className, children }: DivProps) {
  return (
    <article
      className={cn(
        "rounded-xl border border-[#DDEFEA]/80 bg-white p-6 shadow-md md:p-6",
        className,
      )}
    >
      {children}
    </article>
  );
}

export function CardHeader({ className, children }: DivProps) {
  return <header className={cn("mb-6 border-b border-[#DDEFEA]/70 pb-5", className)}>{children}</header>;
}

export function CardTitle({ className, children }: DivProps) {
  return (
    <h2
      className={cn(
        "text-xl font-bold tracking-tight text-[#0F3F3A] md:text-[22px] md:leading-snug",
        className,
      )}
    >
      {children}
    </h2>
  );
}

export function CardDescription({ className, children }: DivProps) {
  return <p className={cn("mt-2 text-sm leading-relaxed text-[#0F3F3A]/58", className)}>{children}</p>;
}

export function CardContent({ className, children }: DivProps) {
  return <div className={cn(className)}>{children}</div>;
}
