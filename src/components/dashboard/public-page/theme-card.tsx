"use client";

import Image from "next/image";
import { useState } from "react";
import { cn } from "@/src/lib/utils";

type ThemeCardProps = {
  name: string;
  description: string;
  previewImage: string;
  selected: boolean;
  onSelect: () => void;
};

function ThemePreviewFallback({ name }: { name: string }) {
  return (
    <div
      className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-zg-surface-elevated via-zg-border/50 to-zg-accent/20 p-6"
      aria-hidden
    >
      <p className="text-center text-xl font-semibold leading-tight tracking-tight text-zg-fg sm:text-2xl">{name}</p>
    </div>
  );
}

export default function ThemeCard({
  name,
  description,
  previewImage,
  selected,
  onSelect,
}: ThemeCardProps) {
  const [imageFailed, setImageFailed] = useState(false);

  return (
    <button
      type="button"
      aria-pressed={selected}
      onClick={onSelect}
      className={cn(
        "group flex flex-col overflow-hidden rounded-2xl border-2 text-left transition-all duration-200",
        selected
          ? "border-zg-accent shadow-lg ring-2 ring-zg-accent/30"
          : "border-zg-border hover:border-zg-accent/50 hover:shadow-md",
      )}
    >
      <div className="relative aspect-[16/10] w-full overflow-hidden bg-zg-border/30">
        {imageFailed ? (
          <ThemePreviewFallback name={name} />
        ) : (
          <Image
            src={previewImage}
            alt={`Aperçu du thème ${name}`}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-[1.02]"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 320px"
            onError={() => setImageFailed(true)}
          />
        )}
      </div>
      <div className="space-y-1 p-4">
        <div className="flex items-center justify-between gap-2">
          <p className="font-semibold text-zg-fg">{name}</p>
          {selected ? (
            <span className="shrink-0 rounded-full bg-zg-accent px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white">
              Sélectionné
            </span>
          ) : null}
        </div>
        <p className="text-xs leading-relaxed text-zg-text-muted">{description}</p>
      </div>
    </button>
  );
}
