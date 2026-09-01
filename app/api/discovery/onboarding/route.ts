import { NextResponse } from "next/server";
import { getDiscoveryApiSession, isApiError } from "@/src/lib/discovery/api-session";
import {
  MAX_NICHES,
  ONBOARDING_PROJECT_STATUSES,
  PROFILE_TYPES,
  SOCIAL_PLATFORMS,
  type ProjectStatus,
} from "@/src/lib/discovery/constants";
import { isOnboardingRole, isOptionalUrlOk } from "@/src/lib/discovery/onboarding";
import { isProfileThemeKey } from "@/src/lib/discovery/appearance";
import { classifyPublicSlug } from "@/src/lib/discovery/public-link";
import { slugifyHandle, slugifyUsername } from "@/src/lib/discovery/slug";
import { normalizeHttpUrl } from "@/src/lib/discovery/media";
import { syncProfileDerived } from "@/src/lib/discovery/sync-profile";
import { createClient } from "@/src/lib/supabase/server";

export async function POST(request: Request) {
  const session = await getDiscoveryApiSession();
  if (isApiError(session)) return session;
  const profile = session.profile;
  const body = (await request.json().catch(() => ({}))) as Record<string, unknown>;
  const supabase = await createClient();

  if (body.intent === "progress" && typeof body.step === "string") {
    await supabase.from("profiles").update({ onboarding_step: body.step }).eq("id", profile.id);
    return NextResponse.json({ ok: true });
  }

  const username = slugifyUsername(String(body.username || profile.username || profile.displayName || ""));
  const format = classifyPublicSlug(username);
  if (format === "reserved") {
    return NextResponse.json({ error: "This link is reserved." }, { status: 400 });
  }
  if (format === "invalid") {
    return NextResponse.json({ error: "Choose a link with 3–30 letters, numbers or hyphens." }, { status: 400 });
  }
  const displayName = String(body.displayName ?? "").trim();
  if (displayName.length < 2) {
    return NextResponse.json({ error: "Name is required." }, { status: 400 });
  }
  const niches = (Array.isArray(body.niches) ? body.niches : [])
    .filter((id): id is string => typeof id === "string")
    .slice(0, MAX_NICHES);
  if (!niches.length) {
    return NextResponse.json({ error: "Pick at least one niche." }, { status: 400 });
  }
  const profileType = String(body.profileType ?? "");
  if (!isOnboardingRole(profileType) || !PROFILE_TYPES.includes(profileType as (typeof PROFILE_TYPES)[number])) {
    return NextResponse.json({ error: "Pick who you are." }, { status: 400 });
  }

  const skipProject = Boolean(body.skipProject) || !String(body.projectName ?? "").trim();
  const projectUrl = String(body.projectUrl ?? "");
  if (!skipProject && !isOptionalUrlOk(projectUrl)) {
    return NextResponse.json({ error: "Project URL looks invalid." }, { status: 400 });
  }

  const links = Object.entries((body.links as Record<string, string> | undefined) ?? {})
    .filter(([platform, url]) => SOCIAL_PLATFORMS.includes(platform as (typeof SOCIAL_PLATFORMS)[number]) && url.trim());
  for (const [, url] of links) {
    if (!isOptionalUrlOk(url)) {
      return NextResponse.json({ error: "One of the social links looks invalid." }, { status: 400 });
    }
  }

  const themeKey = typeof body.themeKey === "string" && isProfileThemeKey(body.themeKey) ? body.themeKey : "obsidian";
  const now = new Date().toISOString();
  const { error: profileError } = await supabase
    .from("profiles")
    .update({
      display_name: displayName,
      username,
      bio: String(body.bio ?? "").trim() || null,
      location: String(body.location ?? "").trim() || null,
      country: String(body.country ?? "").trim() || null,
      profile_type: profileType,
      primary_category_id: niches[0],
      theme_key: themeKey,
      avatar_url: String(body.avatarUrl ?? "").trim() || profile.avatarUrl || null,
      cover_image_url: String(body.coverImageUrl ?? "").trim() || profile.coverImageUrl || null,
      onboarding_completed: true,
      onboarding_completed_at: now,
      onboarding_step: "done",
    })
    .eq("id", profile.id);

  if (profileError) {
    if (profileError.code === "23505") {
      return NextResponse.json({ error: "Already taken." }, { status: 409 });
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

  if (!skipProject) {
    const projectStatus = ONBOARDING_PROJECT_STATUSES.includes(
      body.projectStatus as (typeof ONBOARDING_PROJECT_STATUSES)[number],
    )
      ? (body.projectStatus as ProjectStatus)
      : "building";
    const payload = {
      name: String(body.projectName).trim(),
      slug: slugifyHandle(String(body.projectName)),
      url: projectUrl.trim() ? normalizeHttpUrl(projectUrl) : null,
      description: String(body.projectDescription ?? "").trim() || null,
      logo_url: String(body.projectLogoUrl ?? "").trim() || null,
      category: String(body.projectCategory ?? "").trim() || null,
      status: projectStatus,
      featured_project: true,
    };
    const { data: existing } = await supabase
      .from("projects")
      .select("id")
      .eq("owner_id", profile.id)
      .eq("featured_project", true)
      .maybeSingle();
    if (existing?.id) {
      await supabase.from("projects").update(payload).eq("id", existing.id);
    } else {
      await supabase.from("projects").insert({ owner_id: profile.id, ...payload });
    }
  }

  const socialRows = links.map(([platform, url], index) => ({
    profile_id: profile.id,
    platform,
    url: normalizeHttpUrl(url),
    sort_index: index,
  }));
  if (socialRows.length) {
    await supabase.from("social_links").upsert(socialRows, { onConflict: "profile_id,platform" });
  }

  await syncProfileDerived(supabase, profile.id);
  return NextResponse.json({ ok: true });
}
