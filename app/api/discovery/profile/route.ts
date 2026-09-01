import { NextResponse } from "next/server";
import { getDiscoveryApiSession, isApiError } from "@/src/lib/discovery/api-session";
import { MAX_NICHES, PROFILE_TYPES } from "@/src/lib/discovery/constants";
import { isAdultBirthDate } from "@/src/lib/discovery/media";
import { isProfileThemeKey } from "@/src/lib/discovery/appearance";
import { classifyPublicSlug } from "@/src/lib/discovery/public-link";
import { normalizePublicSlug } from "@/src/lib/discovery/slug";
import { syncProfileDerived } from "@/src/lib/discovery/sync-profile";
import { createClient } from "@/src/lib/supabase/server";

export async function PATCH(request: Request) {
  const session = await getDiscoveryApiSession();
  if (isApiError(session)) return session;
  const profile = session.profile;
  const body = (await request.json().catch(() => ({}))) as Record<string, unknown>;
  const supabase = await createClient();

  if (Array.isArray(body.nicheIds)) {
    const ids = (body.nicheIds as unknown[]).filter((id): id is string => typeof id === "string").slice(0, MAX_NICHES);
    await supabase.from("profile_categories").delete().eq("profile_id", profile.id);
    if (ids.length) {
      await supabase.from("profile_categories").insert(
        ids.map((categoryId, index) => ({
          profile_id: profile.id,
          category_id: categoryId,
          is_favorite: true,
        })),
      );
      await supabase.from("profiles").update({ primary_category_id: ids[0] }).eq("id", profile.id);
    }
    await syncProfileDerived(supabase, profile.id);
    return NextResponse.json({ ok: true });
  }

  const patch: Record<string, unknown> = {};
  if (typeof body.displayName === "string") patch.display_name = body.displayName.trim();
  if (typeof body.bio === "string") patch.bio = body.bio.trim() || null;
  if (typeof body.location === "string") patch.location = body.location.trim() || null;
  if (typeof body.country === "string") patch.country = body.country.trim() || null;
  if (typeof body.avatarUrl === "string") patch.avatar_url = body.avatarUrl.trim() || null;
  if (typeof body.coverImageUrl === "string") patch.cover_image_url = body.coverImageUrl.trim() || null;
  if (typeof body.themeKey === "string" && isProfileThemeKey(body.themeKey)) {
    patch.theme_key = body.themeKey;
  }
  if (typeof body.featuredFirst === "boolean") patch.featured_first = body.featuredFirst;
  if (typeof body.profileType === "string" && PROFILE_TYPES.includes(body.profileType as (typeof PROFILE_TYPES)[number])) {
    patch.profile_type = body.profileType;
  }
  if ("birthDate" in body) {
    if (body.birthDate === "" || body.birthDate == null) {
      patch.birth_date = null;
    } else if (typeof body.birthDate === "string") {
      if (!isAdultBirthDate(body.birthDate)) {
        return NextResponse.json({ error: "Birthday is optional, and must be 18+." }, { status: 400 });
      }
      patch.birth_date = body.birthDate;
    }
  }
  if (typeof body.username === "string") {
    const username = normalizePublicSlug(body.username);
    const format = classifyPublicSlug(username);
    if (format === "reserved") {
      return NextResponse.json({ error: "This link is reserved." }, { status: 400 });
    }
    if (format === "invalid") {
      return NextResponse.json({ error: "Use 3–30 letters, numbers or hyphens." }, { status: 400 });
    }
    patch.username = username;
  }
  if (body.audienceSize === "" || body.audienceSize == null) {
    patch.audience_size = null;
    patch.audience_size_source = null;
  } else if (body.audienceSize !== undefined) {
    const n = Number(body.audienceSize);
    if (Number.isFinite(n) && n >= 0) {
      patch.audience_size = Math.trunc(n);
      patch.audience_size_source = "self_reported";
    }
  }

  const { error } = await supabase.from("profiles").update(patch).eq("id", profile.id);
  if (error) {
    if (error.message.toLowerCase().includes("duplicate") || error.code === "23505") {
      return NextResponse.json({ error: "Already taken." }, { status: 409 });
    }
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
  await syncProfileDerived(supabase, profile.id);
  return NextResponse.json({ ok: true });
}
