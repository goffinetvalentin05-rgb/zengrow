import { NextResponse } from "next/server";
import { requireAdminSession } from "@/src/lib/discovery/auth";
import { slugifyUsername } from "@/src/lib/discovery/slug";
import { createAdminClient } from "@/src/lib/supabase/admin";

export async function POST(request: Request) {
  await requireAdminSession();
  const body = (await request.json().catch(() => ({}))) as {
    entity?: string;
    displayName?: string;
    username?: string;
    bio?: string;
    categoryId?: string;
  };
  if (body.entity !== "profile") return NextResponse.json({ error: "Unsupported." }, { status: 400 });
  const supabase = createAdminClient();
  const username = slugifyUsername(body.username || body.displayName || "person");
  const { error } = await supabase.from("profiles").insert({
    display_name: body.displayName?.trim() || "Unclaimed",
    username,
    bio: body.bio?.trim() || null,
    primary_category_id: body.categoryId || null,
    claim_status: "unclaimed",
    user_id: null,
    is_public: true,
    onboarding_completed: true,
    completeness: 40,
  });
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ ok: true });
}

export async function PATCH(request: Request) {
  const admin = await requireAdminSession();
  const body = (await request.json().catch(() => ({}))) as {
    entity?: string;
    id?: string;
    patch?: Record<string, unknown>;
  };
  if (!body.id || !body.patch) return NextResponse.json({ error: "Missing." }, { status: 400 });
  const supabase = createAdminClient();

  if (body.entity === "profile") {
    const allowed = ["is_featured", "editor_pick", "is_disabled", "claim_status", "featured_rank", "is_public"];
    const patch: Record<string, unknown> = {};
    for (const key of allowed) {
      if (key in body.patch) patch[key] = body.patch[key];
    }
    const { error } = await supabase.from("profiles").update(patch).eq("id", body.id);
    if (error) return NextResponse.json({ error: error.message }, { status: 400 });
    return NextResponse.json({ ok: true });
  }

  if (body.entity === "claim") {
    const { error } = await supabase
      .from("profile_claims")
      .update({
        status: body.patch.status,
        reviewed_by: admin.user.id,
        reviewed_at: new Date().toISOString(),
      })
      .eq("id", body.id);
    if (error) return NextResponse.json({ error: error.message }, { status: 400 });
    if (body.patch.status === "approved") {
      const { data: claim } = await supabase.from("profile_claims").select("*").eq("id", body.id).maybeSingle();
      if (claim) {
        await supabase
          .from("profiles")
          .update({ claim_status: "claimed", user_id: claim.claimant_user_id })
          .eq("id", claim.profile_id);
      }
    }
    return NextResponse.json({ ok: true });
  }

  return NextResponse.json({ error: "Unsupported." }, { status: 400 });
}
