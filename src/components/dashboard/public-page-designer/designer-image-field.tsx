"use client";

import { useRef, useState } from "react";
import { ImagePlus, Trash2 } from "lucide-react";
import Button from "@/src/components/ui/button";
import { coverCropRect } from "@/src/lib/gift-vouchers/offers/crop-banner";
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
  ratio?: number;
};

export default function DesignerImageField({
  restaurantId,
  value,
  onChange,
  folder,
  label,
  ratio = 16 / 10,
}: DesignerImageFieldProps) {
  const fileRef = useRef<HTMLInputElement>(null);
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
      const cropped = await cropToCover(file, ratio);
      const supabase = createClient();
      const uploaded = await uploadRestaurantPublicAsset(supabase, restaurantId, folder, cropped, {
        extension: imageExtensionForUpload(cropped),
      });
      if (value) await tryRemoveRestaurantPublicObject(supabase, value);
      onChange(uploaded.publicUrl);
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
        <div className="relative overflow-hidden rounded-xl border border-zg-border">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={value} alt="" className="aspect-[16/10] w-full object-cover" />
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

async function cropToCover(file: File, ratio: number): Promise<File> {
  const bitmap = await createImageBitmap(file);
  const rect = coverCropRect(bitmap.width, bitmap.height, ratio, 0.5, 0.5);
  const width = 1600;
  const height = Math.round(width / ratio);
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) return file;
  ctx.drawImage(bitmap, rect.sx, rect.sy, rect.sw, rect.sh, 0, 0, width, height);
  const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/jpeg", 0.88));
  if (!blob) return file;
  return new File([blob], "cover.jpg", { type: "image/jpeg" });
}
