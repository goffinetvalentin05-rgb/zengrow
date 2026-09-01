"use client";

import { FormEvent, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Button from "@/src/components/ui/button";
import Input from "@/src/components/ui/input";
import {
  FEATURED_PLATFORM_LABELS,
  FEATURED_PLATFORMS,
  MAX_FEATURED_CONTENT,
  type FeaturedPlatform,
} from "@/src/lib/discovery/constants";
import { resolveFeaturedThumbnail, youtubeThumbnailUrl } from "@/src/lib/discovery/media";
import type { FeaturedContent } from "@/src/lib/discovery/types";
import { FeaturedContentCard } from "@/src/components/discovery/featured-content-card";
import { DiscoverySheet } from "@/src/components/discovery/mobile-sheet";
import { createClient } from "@/src/lib/supabase/client";

export function FeaturedContentEditor({ profileId, items }: { profileId: string; items: FeaturedContent[] }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<FeaturedContent | null>(null);

  async function remove(id: string) {
    await fetch("/api/discovery/featured", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    router.refresh();
  }

  async function move(id: string, direction: -1 | 1) {
    const index = items.findIndex((item) => item.id === id);
    const next = index + direction;
    if (next < 0 || next >= items.length) return;
    const reordered = [...items];
    const [moved] = reordered.splice(index, 1);
    reordered.splice(next, 0, moved);
    await fetch("/api/discovery/featured", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        items: reordered.map((item, i) => ({ id: item.id, sortIndex: i })),
      }),
    });
    router.refresh();
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-white/40">
        Link to content that already lives on YouTube, Instagram, TikTok… Sharpz never rehosts it. Max {MAX_FEATURED_CONTENT}.
      </p>
      {items.map((item, index) => (
        <div key={item.id} className="space-y-2">
          <FeaturedContentCard item={item} />
          <div className="flex flex-wrap gap-1 text-xs text-white/40">
            <button type="button" className="min-h-11 px-2" onClick={() => { setEditing(item); setOpen(true); }}>
              Edit
            </button>
            {index > 0 ? (
              <button type="button" className="min-h-11 px-2" onClick={() => move(item.id, -1)}>
                Up
              </button>
            ) : null}
            {index < items.length - 1 ? (
              <button type="button" className="min-h-11 px-2" onClick={() => move(item.id, 1)}>
                Down
              </button>
            ) : null}
            <button type="button" className="min-h-11 px-2" onClick={() => remove(item.id)}>
              Delete
            </button>
          </div>
        </div>
      ))}
      {items.length < MAX_FEATURED_CONTENT ? (
        <Button
          type="button"
          variant="secondary"
          className="min-h-11"
          onClick={() => {
            setEditing(null);
            setOpen(true);
          }}
        >
          Add content
        </Button>
      ) : null}
      {open ? (
        <FeaturedModal
          profileId={profileId}
          item={editing}
          onClose={() => setOpen(false)}
          onSaved={() => {
            setOpen(false);
            router.refresh();
          }}
        />
      ) : null}
    </div>
  );
}

function FeaturedModal({
  profileId,
  item,
  onClose,
  onSaved,
}: {
  profileId: string;
  item: FeaturedContent | null;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [platform, setPlatform] = useState<FeaturedPlatform>(item?.platform ?? "youtube");
  const [url, setUrl] = useState(item?.url ?? "");
  const [title, setTitle] = useState(item?.title ?? "");
  const [thumbnailUrl, setThumbnailUrl] = useState(item?.thumbnailUrl ?? "");
  const [pending, setPending] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const autoThumb = platform === "youtube" ? youtubeThumbnailUrl(url) : null;
  const preview = resolveFeaturedThumbnail({ platform, url, thumbnailUrl: thumbnailUrl || autoThumb });

  async function uploadThumb(file: File) {
    if (!file.type.startsWith("image/")) {
      setUploadError("Choose an image.");
      return;
    }
    setUploadError(null);
    const supabase = createClient();
    const ext = file.type === "image/png" ? "png" : "jpg";
    const path = `${profileId}/featured/${Date.now()}.${ext}`;
    const { error } = await supabase.storage.from("discovery-media").upload(path, file, {
      upsert: true,
      contentType: file.type,
    });
    if (error) {
      setUploadError(error.message);
      return;
    }
    const { data } = supabase.storage.from("discovery-media").getPublicUrl(path);
    setThumbnailUrl(data.publicUrl);
  }

  async function submit(event: FormEvent) {
    event.preventDefault();
    setPending(true);
    const payload = {
      id: item?.id,
      platform,
      url,
      title,
      thumbnailUrl: thumbnailUrl || autoThumb || "",
    };
    const response = await fetch("/api/discovery/featured", {
      method: item ? "PATCH" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    setPending(false);
    if (response.ok) onSaved();
  }

  return (
    <DiscoverySheet
      open
      title={item ? "Edit content" : "Add content"}
      onClose={onClose}
      labelledBy="sz-featured-title"
      footer={
        <Button type="submit" form="sz-featured-form" className="min-h-11 w-full" disabled={pending}>
          {pending ? "Saving…" : "Save"}
        </Button>
      }
    >
      <form id="sz-featured-form" onSubmit={submit} className="space-y-3 pb-2">
        <label className="mb-2 block text-[11px] uppercase tracking-[0.14em] text-white/40">Platform</label>
        <select
          value={platform}
          onChange={(event) => setPlatform(event.target.value as FeaturedPlatform)}
          className="sz-focus h-11 w-full rounded-2xl border border-white/[0.08] bg-[#0c0c0e] px-3 text-sm text-white outline-none"
        >
          {FEATURED_PLATFORMS.map((value) => (
            <option key={value} value={value}>
              {FEATURED_PLATFORM_LABELS[value]}
            </option>
          ))}
        </select>
        <label className="mb-2 block text-[11px] uppercase tracking-[0.14em] text-white/40">URL</label>
        <Input value={url} onChange={(event) => setUrl(event.target.value)} placeholder="https://" required />
        <label className="mb-2 block text-[11px] uppercase tracking-[0.14em] text-white/40">Title</label>
        <Input value={title} onChange={(event) => setTitle(event.target.value)} placeholder="Optional" />
        <label className="mb-2 block text-[11px] uppercase tracking-[0.14em] text-white/40">
          Thumbnail {platform === "youtube" ? "(auto from YouTube)" : "(optional)"}
        </label>
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(event) => {
            const file = event.target.files?.[0];
            if (file) void uploadThumb(file);
          }}
        />
        <div className="flex gap-2">
          <Input
            value={thumbnailUrl}
            onChange={(event) => setThumbnailUrl(event.target.value)}
            placeholder={autoThumb ? "Using YouTube thumbnail" : "Upload or paste URL"}
          />
          <Button type="button" variant="secondary" className="min-h-11 shrink-0" onClick={() => fileRef.current?.click()}>
            Upload
          </Button>
        </div>
        {uploadError ? <p className="text-sm text-red-300">{uploadError}</p> : null}
        {preview ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={preview} alt="" className="aspect-video w-full rounded-2xl object-cover" />
        ) : null}
      </form>
    </DiscoverySheet>
  );
}
