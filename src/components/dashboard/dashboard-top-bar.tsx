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

const linkPrimaryClass =
  "inline-flex min-h-9 items-center justify-center gap-2 rounded-lg bg-green-700 px-3.5 py-1.5 text-sm font-medium text-white shadow-sm transition hover:bg-green-800";

const linkSecondaryClass =
  "inline-flex min-h-9 items-center justify-center gap-2 rounded-lg border border-gray-200 bg-white px-3.5 py-1.5 text-sm font-medium text-gray-900 shadow-sm transition hover:bg-gray-50";

export default function DashboardTopBar({ publicLink, restaurantName }: DashboardTopBarProps) {
  const [copied, setCopied] = useState(false);

  function copy() {
    void navigator.clipboard.writeText(publicLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <header className="mb-10 flex flex-col gap-5 border-b border-gray-200/90 pb-8 md:flex-row md:items-center md:justify-between">
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-gray-500">Espace restaurant</p>
        <h1 className="mt-2 text-xl font-semibold tracking-tight text-gray-900 md:text-[22px]">{restaurantName}</h1>
      </div>
      <div className="flex flex-wrap items-center gap-2 md:justify-end">
        <Button type="button" variant="secondary" size="sm" onClick={copy}>
          <Link2 className="h-4 w-4" strokeWidth={2} />
          {copied ? "Copié" : "Copier le lien"}
        </Button>
        <Link href="/dashboard/reservations?new=1" className={cn(linkPrimaryClass)}>
          <Plus className="h-4 w-4" strokeWidth={2} />
          Nouvelle réservation
        </Link>
        <a href={publicLink} target="_blank" rel="noreferrer" className={linkSecondaryClass}>
          <ExternalLink className="h-4 w-4" strokeWidth={2} />
          Page publique
        </a>
      </div>
    </header>
  );
}
