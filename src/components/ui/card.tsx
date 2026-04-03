import { cn } from "@/src/lib/utils";

type DivProps = {
  className?: string;
  children: React.ReactNode;
};

/** Flat section — no card chrome; use border-b between sections only */
export function Card({ className, children }: DivProps) {
  return (
    <article className={cn("border-b border-gray-100 pb-12 pt-2 last:border-b-0 last:pb-8", className)}>
      {children}
    </article>
  );
}

export function CardHeader({ className, children }: DivProps) {
  return <header className={cn("mb-6", className)}>{children}</header>;
}

export function CardTitle({ className, children }: DivProps) {
  return <h3 className={cn("text-lg font-semibold text-gray-900", className)}>{children}</h3>;
}

export function CardDescription({ className, children }: DivProps) {
  return <p className={cn("mt-1 text-sm text-gray-500", className)}>{children}</p>;
}

export function CardContent({ className, children }: DivProps) {
  return <div className={cn(className)}>{children}</div>;
}
