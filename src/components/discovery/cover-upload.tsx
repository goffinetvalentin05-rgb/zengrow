"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Button from "@/src/components/ui/button";
import { createClient } from "@/src/lib/supabase/client";

function cropCover(file: File): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    const url = URL.createObjectURL(file);
    image.onload = () => {
      const targetRatio = 1600 / 640;
      let sx = 0;
      let sy = 0;
      let sw = image.width;
      let sh = image.height;
      const srcRatio = image.width / image.height;
      if (srcRatio > targetRatio) {
        sw = image.height * targetRatio;
        sx = (image.width - sw) / 2;
      } else {
        sh = image.width / targetRatio;
        sy = (image.height - sh) / 2;
      }
      const canvas = document.createElement("canvas");
      canvas.width = 1600;
      canvas.height = 640;
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        reject(new Error("Canvas unavailable"));
        return;
      }
      ctx.drawImage(image, sx, sy, sw, sh, 0, 0, 1600, 640);
      canvas.toBlob(
        (blob) => {
          URL.revokeObjectURL(url);
          if (blob) resolve(blob);
          else reject(new Error("Could not crop image"));
        },
        "image/jpeg",
        0.88,
      );
    };
    image.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Could not read image"));
    };
    image.src = url;
  });
}

export function CoverUpload({ userId, currentUrl }: { userId: string; currentUrl: string | null }) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onFile(file: File) {
    if (!file.type.startsWith("image/")) {
      setError("Choose an image.");
      return;
    }
    setError(null);
    const blob = await cropCover(file);
    setPreview(URL.createObjectURL(blob));
    setPending(true);
    const supabase = createClient();
    const path = `${userId}/cover.jpg`;
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
    const coverImageUrl = `${data.publicUrl}?t=${Date.now()}`;
    const response = await fetch("/api/discovery/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ coverImageUrl }),
    });
    setPending(false);
    if (!response.ok) {
      setError("Uploaded, but profile could not be updated.");
      return;
    }
    router.refresh();
  }

  async function remove() {
    setPending(true);
    const response = await fetch("/api/discovery/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ coverImageUrl: "" }),
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
      <div className="overflow-hidden rounded-2xl bg-white/[0.04]">
        {shown ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={shown} alt="" className="h-36 w-full object-cover" />
        ) : (
          <div className="flex h-36 items-center justify-center text-sm text-white/35">No cover yet</div>
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
          {pending ? "Uploading…" : shown ? "Replace cover" : "Upload cover"}
        </Button>
        {currentUrl || preview ? (
          <Button type="button" variant="ghost" disabled={pending} onClick={() => void remove()}>
            Remove
          </Button>
        ) : null}
      </div>
      <p className="mt-2 text-xs text-white/35">Wide crop is applied automatically.</p>
      {error ? <p className="mt-1 text-sm text-red-300">{error}</p> : null}
    </div>
  );
}
