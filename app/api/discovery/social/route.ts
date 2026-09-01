import { NextResponse } from "next/server";
import { requireDiscoverySession } from "@/src/lib/discovery/auth";
import { SOCIAL_PLATFORMS } from "@/src/lib/discovery/constants";
import { normalizeHttpUrl } from "@/src/lib/discovery/media";
import { syncProfileDerived } from "@/src/lib/discovery/sync-profile";
import { createClient } from "@/src/lib/supabase/server";

export async function PUT(request: Request) {
  const { profile } = await requireDiscoverySession();
  const body = (await request.json().catch(() => ({}))) as {
    links?: { platform: string; url: string }[];
  };
  const supabase = await createClient();
  await supabase.from("social_links").delete().eq("profile_id", profile.id);
  const links = (body.links ?? [])
    .filter((item) => SOCIAL_PLATFORMS.includes(item.platform as (typeof SOCIAL_PLATFORMS)[number]) && item.url.trim())
    .map((item, index) => ({
      profile_id: profile.id,
      platform: item.platform,
      url: normalizeHttpUrl(item.url),
      sort_index: index,
    }));
  if (links.length) {
    const { error } = await supabase.from("social_links").insert(links);
    if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  }
  await syncProfileDerived(supabase, profile.id);
  return NextResponse.json({ ok: true });
}
