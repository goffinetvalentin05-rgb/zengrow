import { NextResponse } from "next/server";
import { requireAdminSession } from "@/src/lib/discovery/auth";
import { DISCOVERY_SEED_PROFILES } from "@/src/lib/discovery/seed-data";
import { createAdminClient } from "@/src/lib/supabase/admin";

export async function POST() {
  const allow = process.env.NODE_ENV !== "production" || process.env.DISCOVERY_ALLOW_SEED === "1";
  if (!allow) {
    return NextResponse.json({ error: "Seed is disabled in this environment." }, { status: 403 });
  }
  await requireAdminSession();
  const supabase = createAdminClient();
  const { data: categories } = await supabase.from("categories").select("id, slug");
  const bySlug = new Map((categories ?? []).map((row) => [String(row.slug), String(row.id)]));
  let created = 0;

  for (const person of DISCOVERY_SEED_PROFILES) {
    const { data: existing } = await supabase.from("profiles").select("id").eq("username", person.username).maybeSingle();
    if (existing) continue;
    const categoryId = bySlug.get(person.niche) ?? null;
    const { data: profile, error } = await supabase
      .from("profiles")
      .insert({
        display_name: person.name,
        username: person.username,
        bio: person.bio,
        location: person.location,
        country: person.country,
        profile_type: person.type,
        role_label: person.role,
        audience_size: person.audience,
        audience_size_source: "self_reported",
        claim_status: "unclaimed",
        user_id: null,
        is_seed: true,
        is_public: true,
        onboarding_completed: true,
        completeness: 78,
        is_featured: person.featured,
        editor_pick: person.editor,
        featured_rank: person.rank,
        primary_category_id: categoryId,
        avatar_url: `https://api.dicebear.com/9.x/notionists/svg?seed=${person.username}`,
      })
      .select("id")
      .single();
    if (error || !profile) continue;
    created += 1;
    if (categoryId) {
      await supabase.from("profile_categories").insert({
        profile_id: profile.id,
        category_id: categoryId,
        is_favorite: true,
      });
    }
    await supabase.from("projects").insert({
      owner_id: profile.id,
      name: person.project.name,
      slug: person.project.slug,
      description: person.project.description,
      url: person.project.url,
      category: person.project.category,
      status: "building",
      featured_project: true,
    });
    if (person.links.length) {
      await supabase.from("social_links").insert(
        person.links.map((link, index) => ({
          profile_id: profile.id,
          platform: link.platform,
          url: link.url,
          sort_index: index,
        })),
      );
    }
  }

  return NextResponse.json({ ok: true, created });
}
