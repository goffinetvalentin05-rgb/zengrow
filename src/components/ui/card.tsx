import { cn } from "@/src/lib/utils";

type DivProps = {
  className?: string;
  children: React.ReactNode;
};

/** Dashboard sections — no boxed card chrome (Notion/Linear style). */
export function Card({ className, children }: DivProps) {
  return <article className={cn("mb-16 last:mb-0", className)}>{children}</article>;
}

export function CardHeader({ className, children }: DivProps) {
  return <header className={cn("mb-1", className)}>{children}</header>;
}

export function CardTitle({ className, children }: DivProps) {
  return (
    <h2 className={cn("text-lg font-semibold tracking-tight text-gray-900", className)}>{children}</h2>
  );
}

export function CardDescription({ className, children }: DivProps) {
  return <p className={cn("mt-1.5 text-sm text-gray-500", className)}>{children}</p>;
}

export function CardContent({ className, children }: DivProps) {
  return <div className={cn("pt-8", className)}>{children}</div>;
}
