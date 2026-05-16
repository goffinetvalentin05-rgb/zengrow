import type { ReactNode } from "react";
import { cn } from "@/src/lib/utils";

export default function CampaignDetailSection({
  title,
  children,
  className,
}: {
  title: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={cn("space-y-3", className)}>
      <h3 className="text-xs font-semibold uppercase tracking-[0.12em] text-zg-text-muted">{title}</h3>
      {children}
    </section>
  );
}
