"use client";

import { useState } from "react";
import Button from "@/src/components/ui/button";

type PublicLinkCardProps = {
  link: string;
};

export default function PublicLinkCard({ link }: PublicLinkCardProps) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    await navigator.clipboard.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  return (
    <section className="space-y-3">
      <div>
        <h3 className="text-base font-semibold text-[var(--foreground)]">Lien public de réservation</h3>
        <p className="mt-1 text-sm text-[var(--muted-foreground)]">
          Partagez ce lien sur Google, Instagram, Facebook ou votre site.
        </p>
      </div>
      <div className="space-y-3">
        <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface-muted)] px-3 py-2 text-sm text-[var(--foreground)]/80">
          {link}
        </div>
        <div className="flex flex-wrap gap-2">
          <Button type="button" onClick={handleCopy}>
            {copied ? "Lien copié" : "Copier le lien"}
          </Button>
          <a
            href={link}
            target="_blank"
            rel="noreferrer"
            className="inline-flex h-10 items-center rounded-xl border border-[var(--border)] bg-white px-4 text-sm font-semibold text-[var(--foreground)]/80 hover:bg-[var(--surface-muted)]"
          >
            Ouvrir
          </a>
        </div>
      </div>
    </section>
  );
}
