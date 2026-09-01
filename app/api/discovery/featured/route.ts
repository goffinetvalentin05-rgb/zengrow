import { NextResponse } from "next/server";
import { requireDiscoverySession } from "@/src/lib/discovery/auth";
import { FEATURED_PLATFORMS, MAX_FEATURED_CONTENT } from "@/src/lib/discovery/constants";
import { youtubeThumbnailUrl, normalizeHttpUrl } from "@/src/lib/discovery/media";
import { createClient } from "@/src/lib/supabase/server";

function normalizePlatform(value: unknown) {
  return FEATURED_PLATFORMS.includes(value as (typeof FEATURED_PLATFORMS)[number])
    ? (value as (typeof FEATURED_PLATFORMS)[number])
    : "other";
}

function resolveThumb(platform: string, url: string, thumbnailUrl?: string | null) {
  const explicit = thumbnailUrl?.trim();
  if (explicit) return explicit;
  if (platform === "youtube") return youtubeThumbnailUrl(url);
  return null;
}

async function youtubeTitle(url: string): Promise<string | null> {
  try {
    const response = await fetch(
      `https://www.youtube.com/oembed?url=${encodeURIComponent(url)}&format=json`,
      { next: { revalidate: 86400 } },
    );
    if (!response.ok) return null;
    const payload = (await response.json()) as { title?: string };
    return payload.title?.trim() || null;
  } catch {
    return null;
  }
}

export async function POST(request: Request) {
  const { profile } = await requireDiscoverySession();
  const body = (await request.json().catch(() => ({}))) as Record<string, string>;
  if (!body.url?.trim()) return NextResponse.json({ error: "URL required." }, { status: 400 });
  const supabase = await createClient();
  const { count } = await supabase
    .from("featured_content")
    .select("id", { count: "exact", head: true })
    .eq("profile_id", profile.id);
  if ((count ?? 0) >= MAX_FEATURED_CONTENT) {
    return NextResponse.json({ error: "Maximum 6 featured contents." }, { status: 400 });
  }
  const platform = normalizePlatform(body.platform);
  const url = normalizeHttpUrl(body.url);
  const title = body.title?.trim() || (platform === "youtube" ? await youtubeTitle(url) : null);
  const { error } = await supabase.from("featured_content").insert({
    profile_id: profile.id,
    platform,
    url,
    title,
    thumbnail_url: resolveThumb(platform, url, body.thumbnailUrl),
  });
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ ok: true });
}

export async function PATCH(request: Request) {
  const { profile } = await requireDiscoverySession();
  const body = (await request.json().catch(() => ({}))) as {
    items?: { id: string; sortIndex: number }[];
    id?: string;
    platform?: string;
    url?: string;
    title?: string;
    thumbnailUrl?: string;
  };
  const supabase = await createClient();

  if (Array.isArray(body.items)) {
    for (const item of body.items) {
      if (!item.id) continue;
      await supabase
        .from("featured_content")
        .update({ sort_index: item.sortIndex })
        .eq("id", item.id)
        .eq("profile_id", profile.id);
    }
    return NextResponse.json({ ok: true });
  }

  if (!body.id) return NextResponse.json({ error: "Missing id." }, { status: 400 });
  const platform = normalizePlatform(body.platform);
  const url = normalizeHttpUrl(body.url ?? "");
  if (!url) return NextResponse.json({ error: "URL required." }, { status: 400 });
  const title = body.title?.trim() || (platform === "youtube" ? await youtubeTitle(url) : null);
  const { error } = await supabase
    .from("featured_content")
    .update({
      platform,
      url,
      title,
      thumbnail_url: resolveThumb(platform, url, body.thumbnailUrl),
    })
    .eq("id", body.id)
    .eq("profile_id", profile.id);
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ ok: true });
}

export async function DELETE(request: Request) {
  const { profile } = await requireDiscoverySession();
  const body = (await request.json().catch(() => ({}))) as { id?: string };
  if (!body.id) return NextResponse.json({ error: "Missing id." }, { status: 400 });
  const supabase = await createClient();
  await supabase.from("featured_content").delete().eq("id", body.id).eq("profile_id", profile.id);
  return NextResponse.json({ ok: true });
}
