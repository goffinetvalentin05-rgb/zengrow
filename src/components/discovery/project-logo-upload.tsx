"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Button from "@/src/components/ui/button";
import { createClient } from "@/src/lib/supabase/client";

function cropToSquare(file: File): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    const url = URL.createObjectURL(file);
    image.onload = () => {
      const size = Math.min(image.width, image.height);
      const sx = (image.width - size) / 2;
      const sy = (image.height - size) / 2;
      const canvas = document.createElement("canvas");
      canvas.width = 512;
      canvas.height = 512;
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        reject(new Error("Canvas unavailable"));
        return;
      }
      ctx.drawImage(image, sx, sy, size, size, 0, 0, 512, 512);
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

export function ProjectLogoUpload({
  userId,
  projectId,
  currentUrl,
}: {
  userId: string;
  projectId: string;
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
    const path = `${userId}/projects/${projectId}.jpg`;
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
    const logoUrl = `${data.publicUrl}?t=${Date.now()}`;
    const response = await fetch("/api/discovery/projects", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: projectId, logoUrl }),
    });
    setPending(false);
    if (!response.ok) {
      setError("Uploaded, but project could not be updated.");
      return;
    }
    router.refresh();
  }

  async function remove() {
    setPending(true);
    const response = await fetch("/api/discovery/projects", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: projectId, logoUrl: "" }),
    });
    setPending(false);
    if (response.ok) {
      setPreview(null);
      router.refresh();
    }
  }

  const shown = preview || currentUrl;

  return (
    <div className="flex items-center gap-3">
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-white/[0.06] ring-1 ring-white/10"
        aria-label="Upload project logo"
      >
        {shown ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={shown} alt="" className="h-full w-full object-cover" />
        ) : (
          <span className="text-[10px] text-white/35">Logo</span>
        )}
      </button>
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
      <div className="flex flex-wrap gap-2">
        <Button type="button" variant="secondary" size="sm" disabled={pending} onClick={() => inputRef.current?.click()}>
          {pending ? "Uploading…" : shown ? "Replace" : "Add logo"}
        </Button>
        {shown ? (
          <Button type="button" variant="ghost" size="sm" disabled={pending} onClick={() => void remove()}>
            Remove
          </Button>
        ) : null}
      </div>
      {error ? <p className="w-full text-xs text-red-300">{error}</p> : null}
    </div>
  );
}
