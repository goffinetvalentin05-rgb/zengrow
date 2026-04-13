"use client";

import Link from "next/link";
import { useState } from "react";
import { ExternalLink, Link2, Plus } from "lucide-react";
import Button from "@/src/components/ui/button";
import { cn } from "@/src/lib/utils";

type DashboardTopBarProps = {
  publicLink: string;
  restaurantName: string;
};

const outlineBtnClass =
  "inline-flex min-h-10 items-center justify-center gap-2 rounded-full border border-zg-border-accent bg-zg-surface/90 px-4 py-2 text-sm font-semibold text-zg-fg shadow-zg-soft backdrop-blur-sm transition hover:border-zg-mint/45 hover:bg-zg-surface-elevated hover:shadow-zg-card";

const ctaGradientClass =
  "inline-flex min-h-10 items-center justify-center gap-2 rounded-full bg-gradient-to-r from-zg-teal to-zg-mint px-4 py-2 text-sm font-semibold text-white shadow-[0_12px_32px_-14px_rgba(31,122,108,0.82)] transition hover:scale-[1.02] active:scale-[0.99]";

export default function DashboardTopBar({ publicLink, restaurantName }: DashboardTopBarProps) {
  const [copied, setCopied] = useState(false);

  function copy() {
    void navigator.clipboard.writeText(publicLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <header className="mb-8 flex flex-col gap-6 md:mb-10 md:flex-row md:items-start md:justify-between">
      <div>
        <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-zg-fg/46">Espace restaurant</p>
        <h1 className="mt-2.5 text-[1.65rem] font-bold tracking-[-0.03em] text-zg-fg md:text-[1.85rem] md:leading-[1.15]">
          {restaurantName}
        </h1>
      </div>
      <div className="flex flex-wrap items-center gap-2.5 md:justify-end md:pt-1">
        <Button
          type="button"
          variant="secondary"
          size="sm"
          onClick={copy}
          className="rounded-full shadow-zg-soft"
        >
          <Link2 className="h-4 w-4" strokeWidth={2} />
          {copied ? "Copié" : "Copier le lien"}
        </Button>
        <Link href="/dashboard/reservations?new=1" className={cn(ctaGradientClass)}>
          <Plus className="h-4 w-4" strokeWidth={2} />
          Nouvelle réservation
        </Link>
        <a href={publicLink} target="_blank" rel="noreferrer" className={outlineBtnClass}>
          <ExternalLink className="h-4 w-4" strokeWidth={2} />
          Page publique
        </a>
      </div>
    </header>
  );
}
