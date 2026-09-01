import { NextResponse } from "next/server";
import { getDiscoveryApiSession, isApiError } from "@/src/lib/discovery/api-session";
import { MAX_NICHES, PROFILE_TYPES, SOCIAL_PLATFORMS, USERNAME_PATTERN } from "@/src/lib/discovery/constants";
import { slugifyHandle, slugifyUsername } from "@/src/lib/discovery/slug";
import { normalizeHttpUrl } from "@/src/lib/discovery/media";
import { syncProfileDerived } from "@/src/lib/discovery/sync-profile";
import { createClient } from "@/src/lib/supabase/server";

export async function POST(request: Request) {
  const session = await getDiscoveryApiSession();
  if (isApiError(session)) return session;
  const profile = session.profile;
  const body = (await request.json().catch(() => ({}))) as {
    niches?: string[];
    profileType?: string;
    displayName?: string;
    username?: string;
    bio?: string;
    location?: string;
    country?: string;
    projectName?: string;
    projectUrl?: string;
    projectDescription?: string;
    links?: Record<string, string>;
  };

  const username = slugifyUsername(body.username || profile.username || profile.displayName);
  if (!USERNAME_PATTERN.test(username)) {
    return NextResponse.json({ error: "Choose a username with 3–30 letters, numbers or underscores." }, { status: 400 });
  }
  if (!body.displayName?.trim()) {
    return NextResponse.json({ error: "Name is required." }, { status: 400 });
  }
  const niches = (body.niches ?? []).slice(0, MAX_NICHES);
  if (!niches.length) {
    return NextResponse.json({ error: "Pick at least one niche." }, { status: 400 });
  }
  if (!body.profileType || !PROFILE_TYPES.includes(body.profileType as (typeof PROFILE_TYPES)[number])) {
    return NextResponse.json({ error: "Pick who you are." }, { status: 400 });
  }

  const supabase = await createClient();
  const { error: profileError } = await supabase
    .from("profiles")
    .update({
      display_name: body.displayName.trim(),
      username,
      bio: body.bio?.trim() || null,
      location: body.location?.trim() || null,
      country: body.country?.trim() || null,
      profile_type: body.profileType,
      primary_category_id: niches[0],
      onboarding_completed: true,
      onboarding_step: "done",
    })
    .eq("id", profile.id);

  if (profileError) {
    if (profileError.code === "23505") {
      return NextResponse.json({ error: "Username already taken." }, { status: 409 });
    }
    return NextResponse.json({ error: profileError.message }, { status: 400 });
  }

  await supabase.from("profile_categories").delete().eq("profile_id", profile.id);
  await supabase.from("profile_categories").insert(
    niches.map((categoryId) => ({
      profile_id: profile.id,
      category_id: categoryId,
      is_favorite: true,
    })),
  );

  if (body.projectName?.trim()) {
    await supabase.from("projects").insert({
      owner_id: profile.id,
      name: body.projectName.trim(),
      slug: slugifyHandle(body.projectName),
      url: body.projectUrl?.trim() ? normalizeHttpUrl(body.projectUrl) : null,
      description: body.projectDescription?.trim() || null,
      featured_project: true,
      status: "building",
    });
  }

  const links = Object.entries(body.links ?? {})
    .filter(([platform, url]) => SOCIAL_PLATFORMS.includes(platform as (typeof SOCIAL_PLATFORMS)[number]) && url.trim())
    .map(([platform, url], index) => ({
      profile_id: profile.id,
      platform,
      url: normalizeHttpUrl(url),
      sort_index: index,
    }));
  if (links.length) {
    await supabase.from("social_links").upsert(links, { onConflict: "profile_id,platform" });
  }

  await syncProfileDerived(supabase, profile.id);
  return NextResponse.json({ ok: true });
}
