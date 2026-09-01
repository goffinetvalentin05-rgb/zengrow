import { NextResponse } from "next/server";
import { DISCOVERY_PAGE_SIZE } from "@/src/lib/discovery/constants";
import { parseExploreFilters } from "@/src/lib/discovery/filters";
import { getDiscoveryFeedPage, getFavoriteCategorySlugs } from "@/src/lib/discovery/queries";
import { ensureDiscoveryProfile } from "@/src/lib/discovery/auth";
import { createClient } from "@/src/lib/supabase/server";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const filters = parseExploreFilters(Object.fromEntries(url.searchParams.entries()));
  const offset = Number(url.searchParams.get("offset") ?? "0");
  const limit = Number(url.searchParams.get("limit") ?? DISCOVERY_PAGE_SIZE);

  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();
  let viewerId: string | null = null;
  let favoriteSlugs: string[] = [];
  if (data.user) {
    const profile = await ensureDiscoveryProfile(data.user);
    viewerId = profile.id;
    favoriteSlugs = await getFavoriteCategorySlugs(supabase, profile.id);
  }

  const page = await getDiscoveryFeedPage(supabase, {
    filters,
    favoriteSlugs,
    viewerId,
    offset: Number.isFinite(offset) ? offset : 0,
    limit: Number.isFinite(limit) ? limit : DISCOVERY_PAGE_SIZE,
  });

  return NextResponse.json(page);
}
