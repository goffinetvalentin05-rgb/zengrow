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
  "inline-flex min-h-9 items-center justify-center gap-2 rounded-full border border-[#CBE6DF] bg-white px-3.5 py-1.5 text-sm font-semibold text-[#0F3F3A] shadow-sm transition hover:border-[#A3D8CC] hover:bg-[#F0F9F7]";

const ctaGradientClass =
  "inline-flex min-h-9 items-center justify-center gap-2 rounded-full bg-gradient-to-r from-[#1F7A6C] to-[#3DBE9F] px-3.5 py-1.5 text-sm font-semibold text-white shadow-[0_10px_30px_-12px_rgba(31,122,108,0.75)] transition hover:scale-[1.02]";

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
        <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#0F3F3A]/45">Espace restaurant</p>
        <h1 className="mt-2 text-2xl font-bold tracking-tight text-[#0F3F3A] md:text-[1.65rem] md:leading-tight">
          {restaurantName}
        </h1>
      </div>
      <div className="flex flex-wrap items-center gap-2 md:justify-end md:pt-1">
        <Button
          type="button"
          variant="secondary"
          size="sm"
          onClick={copy}
          className="rounded-full border-[#CBE6DF] bg-white font-semibold text-[#0F3F3A] shadow-sm hover:border-[#A3D8CC] hover:bg-[#F0F9F7]"
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
