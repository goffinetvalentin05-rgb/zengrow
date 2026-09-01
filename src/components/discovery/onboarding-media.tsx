"use client";

import { useRef, useState } from "react";
import { createClient } from "@/src/lib/supabase/client";
import { FadeImg } from "@/src/components/discovery/sz-ui";
import { DiscoveryAvatar } from "@/src/components/discovery/avatar";
import { cn } from "@/src/lib/utils";

function cropImage(file: File, width: number, height: number, mime: "image/jpeg" | "image/png" = "image/jpeg"): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    const url = URL.createObjectURL(file);
    image.onload = () => {
      const targetRatio = width / height;
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
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        reject(new Error("Canvas unavailable"));
        return;
      }
      if (mime === "image/png") ctx.clearRect(0, 0, width, height);
      ctx.drawImage(image, sx, sy, sw, sh, 0, 0, width, height);
      canvas.toBlob(
        (blob) => {
          URL.revokeObjectURL(url);
          if (blob) resolve(blob);
          else reject(new Error("Could not crop image"));
        },
        mime,
        mime === "image/jpeg" ? 0.88 : undefined,
      );
    };
    image.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Could not read image"));
    };
    image.src = url;
  });
}

async function uploadSquarePng(file: File, path: string) {
  const blob = await cropImage(file, 512, 512, "image/png");
  const supabase = createClient();
  const { error } = await supabase.storage.from("avatars").upload(path, blob, {
    upsert: true,
    contentType: "image/png",
  });
  if (error) throw error;
  const { data } = supabase.storage.from("avatars").getPublicUrl(path);
  return `${data.publicUrl}?t=${Date.now()}`;
}

async function uploadCropped(
  userId: string,
  file: File,
  path: string,
  width: number,
  height: number,
  bucket: "avatars" | "covers",
) {
  const blob = await cropImage(file, width, height);
  const supabase = createClient();
  const { error } = await supabase.storage.from(bucket).upload(path, blob, {
    upsert: true,
    contentType: "image/jpeg",
  });
  if (error) throw error;
  const { data } = supabase.storage.from(bucket).getPublicUrl(path);
  return `${data.publicUrl}?t=${Date.now()}`;
}

function FilePick({
  label,
  onFile,
  pending,
  error,
}: {
  label: string;
  onFile: (file: File) => void;
  pending: boolean;
  error: string | null;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  return (
    <div>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(event) => {
          const file = event.target.files?.[0];
          if (file) onFile(file);
        }}
      />
      <button
        type="button"
        disabled={pending}
        onClick={() => inputRef.current?.click()}
        className="sz-press min-h-11 rounded-full border border-white/[0.1] px-4 text-sm text-white/70 hover:text-white"
      >
        {pending ? "Uploading…" : label}
      </button>
      {error ? <p className="mt-2 text-sm text-red-300">{error}</p> : null}
    </div>
  );
}

export function OnboardingAvatarPick({
  userId,
  name,
  url,
  onChange,
}: {
  userId: string;
  name: string;
  url: string;
  onChange: (url: string) => void;
}) {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onFile(file: File) {
    if (!file.type.startsWith("image/")) {
      setError("Choose an image.");
      return;
    }
    setPending(true);
    setError(null);
    try {
      const next = await uploadCropped(userId, file, `${userId}/avatar.jpg`, 800, 800, "avatars");
      onChange(next);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Upload failed.");
    }
    setPending(false);
  }

  return (
    <div className="flex items-center gap-4">
      <DiscoveryAvatar name={name} src={url || null} size="xl" />
      <FilePick label={url ? "Replace photo" : "Add a photo"} onFile={(file) => void onFile(file)} pending={pending} error={error} />
    </div>
  );
}

export function OnboardingCoverPick({
  userId,
  url,
  onChange,
}: {
  userId: string;
  url: string;
  onChange: (url: string) => void;
}) {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onFile(file: File) {
    if (!file.type.startsWith("image/")) {
      setError("Choose an image.");
      return;
    }
    setPending(true);
    setError(null);
    try {
      const next = await uploadCropped(userId, file, `${userId}/cover.jpg`, 1600, 640, "covers");
      onChange(next);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Upload failed.");
    }
    setPending(false);
  }

  return (
    <div>
      <div className="overflow-hidden rounded-[1.25rem] bg-white/[0.04]">
        {url ? (
          <FadeImg src={url} alt="" className="h-28 w-full object-cover" />
        ) : (
          <div className="flex h-28 items-center justify-center text-sm text-white/35">Optional cover</div>
        )}
      </div>
      <div className="mt-3">
        <FilePick label={url ? "Replace cover" : "Add a cover"} onFile={(file) => void onFile(file)} pending={pending} error={error} />
      </div>
    </div>
  );
}

export function OnboardingLogoPick({
  userId,
  url,
  onChange,
}: {
  userId: string;
  url: string;
  onChange: (url: string) => void;
}) {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onFile(file: File) {
    if (!file.type.startsWith("image/")) {
      setError("Choose an image.");
      return;
    }
    setPending(true);
    setError(null);
    try {
      const next = await uploadSquarePng(file, `${userId}/onboarding/project-logo.png`);
      onChange(next);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Upload failed.");
    }
    setPending(false);
  }

  return (
    <div className="flex items-center gap-3">
      <div className={cn("flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-white/[0.06] ring-1 ring-white/10")}>
        {url ? <FadeImg src={url} alt="" className="h-full w-full object-contain p-1.5" /> : <span className="text-[10px] text-white/35">Logo</span>}
      </div>
      <FilePick label={url ? "Replace logo" : "Add logo"} onFile={(file) => void onFile(file)} pending={pending} error={error} />
    </div>
  );
}
