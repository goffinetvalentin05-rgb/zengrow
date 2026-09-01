import { NextResponse } from "next/server";
import { requireDiscoverySession } from "@/src/lib/discovery/auth";
import { createClient } from "@/src/lib/supabase/server";

export async function POST(request: Request) {
  const { user } = await requireDiscoverySession();
  const body = (await request.json().catch(() => ({}))) as { profileId?: string; proofNote?: string; proofUrl?: string };
  if (!body.profileId) return NextResponse.json({ error: "Missing profile." }, { status: 400 });
  const supabase = await createClient();
  const { data: target } = await supabase.from("profiles").select("id, claim_status").eq("id", body.profileId).maybeSingle();
  if (!target || target.claim_status !== "unclaimed") {
    return NextResponse.json({ error: "This profile cannot be claimed." }, { status: 400 });
  }
  const { error } = await supabase.from("profile_claims").insert({
    profile_id: body.profileId,
    claimant_user_id: user.id,
    proof_note: body.proofNote?.trim() || null,
    proof_url: body.proofUrl?.trim() || null,
    status: "pending",
  });
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ ok: true });
}
