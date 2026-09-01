import { NextResponse } from "next/server";
import { requireDiscoverySession } from "@/src/lib/discovery/auth";
import { PROJECT_STATUSES } from "@/src/lib/discovery/constants";
import { slugifyHandle } from "@/src/lib/discovery/slug";
import { syncProfileDerived } from "@/src/lib/discovery/sync-profile";
import { createClient } from "@/src/lib/supabase/server";

export async function POST(request: Request) {
  const { profile } = await requireDiscoverySession();
  const body = (await request.json().catch(() => ({}))) as Record<string, string | boolean | undefined>;
  if (typeof body.name !== "string" || !body.name.trim()) {
    return NextResponse.json({ error: "Name required." }, { status: 400 });
  }
  const supabase = await createClient();
  if (body.featuredProject) {
    await supabase.from("projects").update({ featured_project: false }).eq("owner_id", profile.id);
  }
  const { error } = await supabase.from("projects").insert({
    owner_id: profile.id,
    name: body.name.trim(),
    slug: slugifyHandle(body.name),
    url: typeof body.url === "string" ? body.url.trim() || null : null,
    description: typeof body.description === "string" ? body.description.trim() || null : null,
    category: typeof body.category === "string" ? body.category.trim() || null : null,
    status: PROJECT_STATUSES.includes(body.status as (typeof PROJECT_STATUSES)[number])
      ? body.status
      : "building",
    featured_project: Boolean(body.featuredProject),
  });
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  await syncProfileDerived(supabase, profile.id);
  return NextResponse.json({ ok: true });
}

export async function DELETE(request: Request) {
  const { profile } = await requireDiscoverySession();
  const body = (await request.json().catch(() => ({}))) as { id?: string };
  if (!body.id) return NextResponse.json({ error: "Missing id." }, { status: 400 });
  const supabase = await createClient();
  const { error } = await supabase.from("projects").delete().eq("id", body.id).eq("owner_id", profile.id);
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  await syncProfileDerived(supabase, profile.id);
  return NextResponse.json({ ok: true });
}
