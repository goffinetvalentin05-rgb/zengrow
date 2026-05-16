"use client";

import Image from "next/image";
import type { ChangeEvent } from "react";
import { ImageIcon, Trash2, Upload } from "lucide-react";
import Button from "@/src/components/ui/button";

type PublicPageLogoFieldProps = {
  logoUrl: string;
  isUploading: boolean;
  onUpload: (event: ChangeEvent<HTMLInputElement>) => void;
  onRemove: () => void;
};

export default function PublicPageLogoField({
  logoUrl,
  isUploading,
  onUpload,
  onRemove,
}: PublicPageLogoFieldProps) {
  return (
    <div className="rounded-2xl border border-zg-border bg-zg-surface-elevated/40 p-4">
      <h4 className="text-sm font-semibold text-zg-fg">Logo</h4>
      <p className="mt-1 text-xs text-zg-text-muted">
        Format PNG ou JPG, fond transparent recommandé. Taille idéale : 400×400 px (carré) ou 800×200 px
        (horizontal).
      </p>
      <div className="mt-3 flex flex-wrap items-center gap-3">
        <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-zg-border bg-zg-surface px-3 py-2 text-sm font-medium hover:border-zg-accent/60">
          <Upload className="h-4 w-4" />
          {logoUrl ? "Remplacer" : "Importer un logo"}
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp,.jpg,.jpeg,.png,.webp"
            className="hidden"
            onChange={onUpload}
          />
        </label>
        {logoUrl ? (
          <Button type="button" variant="secondary" className="min-h-9" onClick={onRemove}>
            <Trash2 className="mr-1.5 h-3.5 w-3.5" />
            Supprimer
          </Button>
        ) : null}
        {isUploading ? <span className="text-xs text-zg-muted">Envoi…</span> : null}
      </div>
      <div className="mt-3 flex h-24 w-24 items-center justify-center overflow-hidden rounded-xl border border-zg-border bg-zg-surface">
        {logoUrl ? (
          <div className="relative h-full w-full">
            <Image src={logoUrl} alt="" fill className="object-contain p-2" unoptimized sizes="96px" />
          </div>
        ) : (
          <ImageIcon className="h-7 w-7 text-zg-muted" />
        )}
      </div>
    </div>
  );
}
