import { NextResponse } from "next/server";
import { requireDiscoverySession } from "@/src/lib/discovery/auth";
import { FEATURED_PLATFORMS, MAX_FEATURED_CONTENT } from "@/src/lib/discovery/constants";
import { createClient } from "@/src/lib/supabase/server";

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
  const { error } = await supabase.from("featured_content").insert({
    profile_id: profile.id,
    platform: FEATURED_PLATFORMS.includes(body.platform as (typeof FEATURED_PLATFORMS)[number])
      ? body.platform
      : "other",
    url: body.url.trim(),
    title: body.title?.trim() || null,
    thumbnail_url: body.thumbnailUrl?.trim() || null,
  });
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
