"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Button from "@/src/components/ui/button";
import { createClient } from "@/src/lib/supabase/client";
import { useI18n } from "@/src/i18n/provider";

function fitPageBackground(file: File): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    const url = URL.createObjectURL(file);
    image.onload = () => {
      const maxW = 1920;
      const maxH = 2400;
      let width = image.width;
      let height = image.height;
      const scale = Math.min(1, maxW / width, maxH / height);
      width = Math.max(1, Math.round(width * scale));
      height = Math.max(1, Math.round(height * scale));
      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        reject(new Error("Canvas unavailable"));
        return;
      }
      ctx.drawImage(image, 0, 0, width, height);
      canvas.toBlob(
        (blob) => {
          URL.revokeObjectURL(url);
          if (blob) resolve(blob);
          else reject(new Error("Could not process image"));
        },
        "image/jpeg",
        0.86,
      );
    };
    image.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Could not read image"));
    };
    image.src = url;
  });
}

export function PageBackgroundUpload({ userId, currentUrl }: { userId: string; currentUrl: string | null }) {
  const { t } = useI18n();
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onFile(file: File) {
    if (!file.type.startsWith("image/")) {
      setError(t.common.chooseImage);
      return;
    }
    setError(null);
    const blob = await fitPageBackground(file);
    setPreview(URL.createObjectURL(blob));
    setPending(true);
    const supabase = createClient();
    const path = `${userId}/page-bg.jpg`;
    const { error: uploadError } = await supabase.storage.from("covers").upload(path, blob, {
      upsert: true,
      contentType: "image/jpeg",
    });
    if (uploadError) {
      setPending(false);
      setError(uploadError.message);
      return;
    }
    const { data } = supabase.storage.from("covers").getPublicUrl(path);
    const pageBackgroundImageUrl = `${data.publicUrl}?t=${Date.now()}`;
    const response = await fetch("/api/discovery/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ pageBackgroundImageUrl }),
    });
    setPending(false);
    if (!response.ok) {
      setError(t.media.uploadedButNotSaved);
      return;
    }
    router.refresh();
  }

  async function remove() {
    setPending(true);
    const response = await fetch("/api/discovery/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ pageBackgroundImageUrl: "" }),
    });
    setPending(false);
    if (response.ok) {
      setPreview(null);
      router.refresh();
    }
  }

  const shown = preview || currentUrl;

  return (
    <div>
      <div className="overflow-hidden rounded-2xl bg-white/[0.04] ring-1 ring-white/[0.06]">
        {shown ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={shown} alt="" className="h-40 w-full object-cover" />
        ) : (
          <div className="flex h-28 items-center justify-center text-sm text-white/35">{t.media.noBackground}</div>
        )}
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(event) => {
          const file = event.target.files?.[0];
          if (file) void onFile(file);
        }}
      />
      <div className="mt-3 flex flex-wrap gap-2">
        <Button type="button" variant="secondary" disabled={pending} onClick={() => inputRef.current?.click()}>
          {pending ? t.common.uploading : shown ? t.media.replaceImage : t.media.uploadImage}
        </Button>
        {shown ? (
          <Button type="button" variant="ghost" disabled={pending} onClick={() => void remove()}>
            {t.common.remove}
          </Button>
        ) : null}
      </div>
      <p className="mt-2 text-xs text-white/35">{t.media.backgroundHint}</p>
      {error ? <p className="mt-1 text-sm text-red-300">{error}</p> : null}
    </div>
  );
}
