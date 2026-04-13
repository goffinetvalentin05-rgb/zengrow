"use client";

import { useState } from "react";

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
    <section className="space-y-4 border-t border-zg-border/80 pt-10">
      <div>
        <h3 className="text-lg font-bold tracking-tight text-zg-fg">Lien public</h3>
        <p className="dashboard-section-subtitle mt-1">À partager sur vos canaux.</p>
      </div>
      <p className="break-all text-sm text-zg-fg/72">{link}</p>
      <div className="flex flex-wrap items-center gap-4">
        <button type="button" className="text-sm font-semibold text-zg-teal hover:underline" onClick={handleCopy}>
          {copied ? "Copié" : "Copier le lien"}
        </button>
        <a href={link} target="_blank" rel="noreferrer" className="text-sm font-semibold text-zg-fg/62 hover:text-zg-fg">
          Ouvrir
        </a>
      </div>
    </section>
  );
}
