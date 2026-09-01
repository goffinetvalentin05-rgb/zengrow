"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Button from "@/src/components/ui/button";
import { createClient } from "@/src/lib/supabase/client";
import { DiscoveryAvatar } from "@/src/components/discovery/avatar";

function cropToSquare(file: File): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    const url = URL.createObjectURL(file);
    image.onload = () => {
      const size = Math.min(image.width, image.height);
      const sx = (image.width - size) / 2;
      const sy = (image.height - size) / 2;
      const canvas = document.createElement("canvas");
      canvas.width = 800;
      canvas.height = 800;
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        reject(new Error("Canvas unavailable"));
        return;
      }
      ctx.drawImage(image, sx, sy, size, size, 0, 0, 800, 800);
      canvas.toBlob(
        (blob) => {
          URL.revokeObjectURL(url);
          if (blob) resolve(blob);
          else reject(new Error("Could not crop image"));
        },
        "image/jpeg",
        0.9,
      );
    };
    image.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Could not read image"));
    };
    image.src = url;
  });
}

export function AvatarUpload({
  userId,
  name,
  currentUrl,
}: {
  userId: string;
  name: string;
  currentUrl: string | null;
}) {
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
    const blob = await cropToSquare(file);
    setPreview(URL.createObjectURL(blob));
    setPending(true);
    const supabase = createClient();
    const path = `${userId}/avatar.jpg`;
    const { error: uploadError } = await supabase.storage.from("avatars").upload(path, blob, {
      upsert: true,
      contentType: "image/jpeg",
    });
    if (uploadError) {
      setPending(false);
      setError(uploadError.message);
      return;
    }
    const { data } = supabase.storage.from("avatars").getPublicUrl(path);
    const avatarUrl = `${data.publicUrl}?t=${Date.now()}`;
    const response = await fetch("/api/discovery/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ avatarUrl }),
    });
    setPending(false);
    if (!response.ok) {
      setError("Uploaded, but profile could not be updated.");
      return;
    }
    router.refresh();
  }

  return (
    <div className="flex items-center gap-4">
      <DiscoveryAvatar name={name} src={preview || currentUrl} size="xl" />
      <div>
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
        <Button type="button" variant="secondary" disabled={pending} onClick={() => inputRef.current?.click()}>
          {pending ? "Uploading…" : "Upload photo"}
        </Button>
        <p className="mt-2 text-xs text-white/35">Square crop is applied automatically.</p>
        {error ? <p className="mt-1 text-sm text-red-300">{error}</p> : null}
      </div>
    </div>
  );
}
