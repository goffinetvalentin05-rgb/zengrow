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
    <section className="space-y-4">
      <div>
        <h3 className="dashboard-page-title">Lien public de réservation</h3>
        <p className="mt-1.5 text-sm text-[var(--muted-foreground)]">
          Partagez ce lien sur Google, Instagram, Facebook ou votre site.
        </p>
      </div>
      <div className="space-y-3">
        <div className="rounded-xl border border-[rgba(0,0,0,0.07)] bg-[var(--surface-muted)]/80 px-4 py-3 text-sm text-[var(--foreground)]/85 shadow-sm">
          {link}
        </div>
        <div className="flex flex-wrap gap-2">
          <Button type="button" onClick={handleCopy}>
            {copied ? "Lien copié" : "Copier le lien"}
          </Button>
          <a href={link} target="_blank" rel="noreferrer" className="dashboard-link-secondary">
            Ouvrir
          </a>
        </div>
      </div>
    </section>
  );
}
