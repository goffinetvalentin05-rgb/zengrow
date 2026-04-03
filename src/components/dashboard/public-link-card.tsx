"use client";

import { useState } from "react";
import { Link2 } from "lucide-react";
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
    <section className="rounded-[20px] border border-[var(--border-soft)] bg-gradient-to-b from-[var(--surface-card)] to-[var(--surface-muted)]/40 p-7 shadow-[var(--card-shadow)]">
      <div className="flex items-start gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[var(--primary-muted)] text-[var(--primary)]">
          <Link2 size={18} strokeWidth={2} />
        </span>
        <div>
          <h3 className="text-lg font-semibold tracking-tight text-[var(--foreground)]">Lien public de réservation</h3>
          <p className="dashboard-section-subtitle mt-1">
            Partagez-le sur Google, Instagram, votre site ou par message.
          </p>
        </div>
      </div>

      <div className="mt-6 space-y-4">
        <div className="rounded-xl border border-[var(--border-soft)] bg-[var(--surface-card)] px-4 py-3.5 text-[13px] leading-relaxed text-[var(--foreground)]/90 shadow-inner">
          {link}
        </div>
        <div className="flex flex-wrap gap-3">
          <Button type="button" onClick={handleCopy}>
            {copied ? "Lien copié" : "Copier le lien"}
          </Button>
          <a href={link} target="_blank" rel="noreferrer" className="dashboard-link-secondary">
            Ouvrir dans un nouvel onglet
          </a>
        </div>
      </div>
    </section>
  );
}
