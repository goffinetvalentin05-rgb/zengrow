import { NextResponse } from "next/server";
import { getDiscoveryApiSession, isApiError } from "@/src/lib/discovery/api-session";
import { createClient } from "@/src/lib/supabase/server";

export async function POST(request: Request) {
  const session = await getDiscoveryApiSession();
  if (isApiError(session)) return session;
  const body = (await request.json().catch(() => ({}))) as { profileId?: string };
  if (!body.profileId) return NextResponse.json({ error: "Missing profile." }, { status: 400 });
  const supabase = await createClient();
  const { error } = await supabase.from("saved_profiles").insert({
    user_id: session.profile.id,
    profile_id: body.profileId,
  });
  if (error && !error.message.includes("duplicate")) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
  return NextResponse.json({ ok: true });
}

export async function DELETE(request: Request) {
  const session = await getDiscoveryApiSession();
  if (isApiError(session)) return session;
  const body = (await request.json().catch(() => ({}))) as { profileId?: string };
  if (!body.profileId) return NextResponse.json({ error: "Missing profile." }, { status: 400 });
  const supabase = await createClient();
  await supabase.from("saved_profiles").delete().eq("user_id", session.profile.id).eq("profile_id", body.profileId);
  return NextResponse.json({ ok: true });
}
