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
    <section className="space-y-4">
      <div>
        <h3 className="text-base font-semibold text-gray-900">Lien de réservation</h3>
        <p className="mt-1 text-sm text-gray-500">À partager sur Google, Instagram ou par message.</p>
      </div>
      <p className="text-sm leading-relaxed text-gray-700">{link}</p>
      <button
        type="button"
        onClick={handleCopy}
        className="text-sm font-medium text-green-700 hover:text-green-800"
      >
        {copied ? "Copié" : "Copier le lien"}
      </button>
    </section>
  );
}
