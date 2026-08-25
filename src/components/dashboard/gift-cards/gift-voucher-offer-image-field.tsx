"use client";

import { useCallback, useRef, useState } from "react";
import { ImagePlus, Trash2 } from "lucide-react";
import Button from "@/src/components/ui/button";
import { coverCropRect, OFFER_BANNER_HEIGHT, OFFER_BANNER_RATIO, OFFER_BANNER_WIDTH } from "@/src/lib/gift-vouchers/offers/crop-banner";
import {
  imageExtensionForUpload,
  tryRemoveRestaurantPublicObject,
  uploadRestaurantPublicAsset,
  validateRestaurantImageFile,
} from "@/src/lib/restaurant-storage-upload";
import { createClient } from "@/src/lib/supabase/client";
import { cn } from "@/src/lib/utils";

type GiftVoucherOfferImageFieldProps = {
  restaurantId: string;
  imageUrl: string;
  onChange: (url: string) => void;
  onBusyChange?: (busy: boolean) => void;
  onError: (message: string | null) => void;
};

export default function GiftVoucherOfferImageField({
  restaurantId,
  imageUrl,
  onChange,
  onBusyChange,
  onError,
}: GiftVoucherOfferImageFieldProps) {
  const fileRef = useRef<HTMLInputElement>(null);
  const dragRef = useRef<{ x: number; y: number; focalX: number; focalY: number } | null>(null);
  const [source, setSource] = useState<string | null>(null);
  const [natural, setNatural] = useState<{ width: number; height: number } | null>(null);
  const [focalX, setFocalX] = useState(0.5);
  const [focalY, setFocalY] = useState(0.5);
  const [busy, setBusy] = useState(false);

  const setBusyState = useCallback(
    (next: boolean) => {
      setBusy(next);
      onBusyChange?.(next);
    },
    [onBusyChange],
  );

  function resetFileInput() {
    if (fileRef.current) fileRef.current.value = "";
  }

  async function onFile(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    const invalid = validateRestaurantImageFile(file);
    if (invalid) {
      onError(invalid);
      resetFileInput();
      return;
    }
    onError(null);
    const url = URL.createObjectURL(file);
    setSource(url);
    setFocalX(0.5);
    setFocalY(0.5);
  }

  function onPointerDown(event: React.PointerEvent<HTMLDivElement>) {
    if (!source) return;
    event.currentTarget.setPointerCapture(event.pointerId);
    dragRef.current = { x: event.clientX, y: event.clientY, focalX, focalY };
  }

  function onPointerMove(event: React.PointerEvent<HTMLDivElement>) {
    const drag = dragRef.current;
    if (!drag || !natural) return;
    const box = event.currentTarget.getBoundingClientRect();
    const dx = (event.clientX - drag.x) / box.width;
    const dy = (event.clientY - drag.y) / box.height;
    setFocalX(Math.min(1, Math.max(0, drag.focalX - dx)));
    setFocalY(Math.min(1, Math.max(0, drag.focalY - dy)));
  }

  function onPointerUp() {
    dragRef.current = null;
  }

  async function applyCrop() {
    if (!source || !natural) return;
    setBusyState(true);
    onError(null);
    try {
      const image = await loadImage(source);
      const crop = coverCropRect(natural.width, natural.height, OFFER_BANNER_RATIO, focalX, focalY);
      const canvas = document.createElement("canvas");
      canvas.width = OFFER_BANNER_WIDTH;
      canvas.height = OFFER_BANNER_HEIGHT;
      const ctx = canvas.getContext("2d");
      if (!ctx) throw new Error("Impossible de recadrer cette image.");
      ctx.drawImage(image, crop.sx, crop.sy, crop.sw, crop.sh, 0, 0, canvas.width, canvas.height);
      const blob = await new Promise<Blob>((resolve, reject) => {
        canvas.toBlob((next) => (next ? resolve(next) : reject(new Error("Export image impossible."))), "image/jpeg", 0.88);
      });
      const file = new File([blob], "offre.jpg", { type: "image/jpeg" });
      const supabase = createClient();
      const previous = imageUrl;
      const { publicUrl } = await uploadRestaurantPublicAsset(supabase, restaurantId, "gift-voucher-offers", file, {
        extension: imageExtensionForUpload(file),
      });
      onChange(publicUrl);
      if (previous && previous !== publicUrl) {
        void tryRemoveRestaurantPublicObject(supabase, previous);
      }
      if (source.startsWith("blob:")) URL.revokeObjectURL(source);
      setSource(null);
      setNatural(null);
    } catch (error) {
      onError(error instanceof Error ? error.message : "Impossible de charger l’image. Le reste du formulaire est conservé.");
    } finally {
      setBusyState(false);
      resetFileInput();
    }
  }

  async function removeImage() {
    if (!imageUrl) return;
    const supabase = createClient();
    void tryRemoveRestaurantPublicObject(supabase, imageUrl);
    onChange("");
    if (source?.startsWith("blob:")) URL.revokeObjectURL(source);
    setSource(null);
    setNatural(null);
  }

  const previewUrl = source ?? imageUrl;
  const objectPosition = `${Math.round(focalX * 100)}% ${Math.round(focalY * 100)}%`;

  return (
    <div className="space-y-3">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="dashboard-field-label">Image de l’offre</p>
          <p className="mt-1 text-xs text-zg-text-muted">
            JPG, PNG ou WebP · 10 Mo max. Recommandé : 1600 × 1000 px (16:10). L’image est recadrée en bannière, sans étirement.
          </p>
        </div>
        <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp" className="sr-only" onChange={onFile} />
      </div>

      <div
        className={cn(
          "relative overflow-hidden rounded-2xl border border-zg-border bg-zg-surface-elevated",
          source ? "cursor-grab active:cursor-grabbing" : "",
        )}
        style={{ aspectRatio: `${OFFER_BANNER_RATIO}` }}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
      >
        {previewUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={previewUrl}
            alt=""
            className="h-full w-full object-cover"
            style={source ? { objectPosition } : undefined}
            draggable={false}
            onLoad={(event) => {
              setNatural({
                width: event.currentTarget.naturalWidth,
                height: event.currentTarget.naturalHeight,
              });
            }}
          />
        ) : (
          <div className="flex h-full flex-col items-center justify-center gap-2 text-sm text-zg-text-muted">
            <ImagePlus className="h-8 w-8 text-zg-accent" />
            Ajoutez une photo propre à cette offre
          </div>
        )}
      </div>

      {source ? (
        <p className="text-xs text-zg-text-muted">Faites glisser l’image pour choisir le point focal, puis validez le recadrage.</p>
      ) : null}

      <div className="flex flex-wrap gap-2">
        <Button type="button" variant="secondary" size="sm" disabled={busy} onClick={() => fileRef.current?.click()}>
          {imageUrl || source ? "Remplacer" : "Importer une image"}
        </Button>
        {source ? (
          <Button type="button" size="sm" disabled={busy} onClick={() => void applyCrop()}>
            {busy ? "Envoi…" : "Valider le recadrage"}
          </Button>
        ) : null}
        {imageUrl ? (
          <Button type="button" variant="ghost" size="sm" disabled={busy} onClick={() => void removeImage()}>
            <Trash2 className="h-4 w-4" />
            Supprimer
          </Button>
        ) : null}
      </div>
    </div>
  );
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error("Image illisible."));
    image.src = src;
  });
}
