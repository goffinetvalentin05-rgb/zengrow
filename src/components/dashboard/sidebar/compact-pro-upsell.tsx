"use client";

import Link from "next/link";
import { ChevronRight, Sparkles } from "lucide-react";
import { cn } from "@/src/lib/utils";

const PRO_UPSELL_HREF = "/dashboard/settings?section=subscription";

type CompactProUpsellProps = {
  onNavigate?: () => void;
};

export default function CompactProUpsell({ onNavigate }: CompactProUpsellProps) {
  return (
    <Link
      href={PRO_UPSELL_HREF}
      onClick={onNavigate}
      className={cn(
        "flex max-h-[80px] items-center gap-2.5 rounded-xl border border-zg-accent/20 bg-zg-accent/10 px-3 py-2.5",
        "transition-colors duration-150 hover:bg-zg-accent/20",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zg-accent focus-visible:ring-offset-2 focus-visible:ring-offset-zg-sidebar-bg",
      )}
    >
      <Sparkles className="h-4 w-4 shrink-0 text-zg-accent" strokeWidth={1.85} aria-hidden />
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium leading-tight text-zg-on-dark">Passer au Pro</p>
        <p className="text-xs leading-snug text-zg-on-dark-muted">Relances IA & analytics</p>
      </div>
      <ChevronRight className="h-4 w-4 shrink-0 text-zg-on-dark-muted" strokeWidth={2} aria-hidden />
    </Link>
  );
}
