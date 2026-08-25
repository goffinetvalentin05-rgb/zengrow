"use client";

import { useRef, useState } from "react";
import { ImagePlus, Trash2 } from "lucide-react";
import Button from "@/src/components/ui/button";
import {
  imageExtensionForUpload,
  tryRemoveRestaurantPublicObject,
  uploadRestaurantPublicAsset,
  validateRestaurantImageFile,
  type RestaurantAssetFolder,
} from "@/src/lib/restaurant-storage-upload";
import { createClient } from "@/src/lib/supabase/client";

type DesignerImageFieldProps = {
  restaurantId: string;
  value: string;
  onChange: (url: string) => void;
  folder: RestaurantAssetFolder;
  label: string;
  focalX?: number;
  focalY?: number;
  onFocalChange?: (focalX: number, focalY: number) => void;
};

export default function DesignerImageField({
  restaurantId,
  value,
  onChange,
  folder,
  label,
  focalX = 0.5,
  focalY = 0.5,
  onFocalChange,
}: DesignerImageFieldProps) {
  const fileRef = useRef<HTMLInputElement>(null);
  const dragRef = useRef<{ x: number; y: number; focalX: number; focalY: number } | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onFile(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (fileRef.current) fileRef.current.value = "";
    if (!file) return;
    const invalid = validateRestaurantImageFile(file);
    if (invalid) {
      setError(invalid);
      return;
    }
    setError(null);
    setBusy(true);
    try {
      const supabase = createClient();
      const uploaded = await uploadRestaurantPublicAsset(supabase, restaurantId, folder, file, {
        extension: imageExtensionForUpload(file),
      });
      if (value) await tryRemoveRestaurantPublicObject(supabase, value);
      onChange(uploaded.publicUrl);
      onFocalChange?.(0.5, 0.5);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Import impossible.");
    } finally {
      setBusy(false);
    }
  }

  async function remove() {
    setBusy(true);
    try {
      const supabase = createClient();
      await tryRemoveRestaurantPublicObject(supabase, value);
      onChange("");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-2">
      <p className="text-xs font-semibold text-zg-fg">{label}</p>
      {value ? (
        <div
          className="relative overflow-hidden rounded-xl border border-zg-border"
          onPointerDown={(event) => {
            if (!onFocalChange) return;
            event.currentTarget.setPointerCapture(event.pointerId);
            dragRef.current = { x: event.clientX, y: event.clientY, focalX, focalY };
          }}
          onPointerMove={(event) => {
            const drag = dragRef.current;
            if (!drag || !onFocalChange) return;
            const box = event.currentTarget.getBoundingClientRect();
            const dx = (event.clientX - drag.x) / box.width;
            const dy = (event.clientY - drag.y) / box.height;
            onFocalChange(Math.min(1, Math.max(0, drag.focalX - dx)), Math.min(1, Math.max(0, drag.focalY - dy)));
          }}
          onPointerUp={() => {
            dragRef.current = null;
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={value}
            alt=""
            className="aspect-[16/10] w-full object-cover"
            style={{ objectPosition: `${Math.round(focalX * 100)}% ${Math.round(focalY * 100)}%` }}
          />
          {onFocalChange ? (
            <p className="absolute bottom-1.5 left-1.5 rounded bg-black/55 px-1.5 py-0.5 text-[10px] text-white">Glisser pour le point focal</p>
          ) : null}
        </div>
      ) : (
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          className="flex min-h-[88px] w-full flex-col items-center justify-center gap-1 rounded-xl border border-dashed border-zg-border text-xs text-zg-text-muted hover:border-zg-border-hover"
        >
          <ImagePlus className="h-4 w-4" />
          Ajouter une image
        </button>
      )}
      <div className="flex gap-2">
        <Button type="button" variant="secondary" size="sm" disabled={busy} onClick={() => fileRef.current?.click()}>
          {value ? "Remplacer" : "Importer"}
        </Button>
        {value ? (
          <Button type="button" variant="ghost" size="sm" disabled={busy} onClick={() => void remove()}>
            <Trash2 className="h-4 w-4" />
            Retirer
          </Button>
        ) : null}
      </div>
      {error ? <p className="text-xs text-zg-danger">{error}</p> : null}
      <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={(e) => void onFile(e)} />
    </div>
  );
}
