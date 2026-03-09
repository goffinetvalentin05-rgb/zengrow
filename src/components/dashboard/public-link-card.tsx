"use client";

import { useState } from "react";
import Button from "@/src/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/src/components/ui/card";

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
    <Card className="rounded-3xl">
      <CardHeader>
        <CardTitle>Lien public de reservation</CardTitle>
        <CardDescription>Partagez ce lien sur Google, Instagram, Facebook ou votre site.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface-muted)] px-3 py-2 text-sm text-[var(--foreground)]/80">
          {link}
        </div>
        <div className="flex flex-wrap gap-2">
          <Button type="button" onClick={handleCopy}>
            {copied ? "Lien copie" : "Copier le lien"}
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
      </CardContent>
    </Card>
  );
}
