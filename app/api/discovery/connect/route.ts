import { NextResponse } from "next/server";
import { getDiscoveryApiSession, isApiError } from "@/src/lib/discovery/api-session";
import { isUuid } from "@/src/lib/discovery/connections";
import { createClient } from "@/src/lib/supabase/server";

type Action = "request" | "accept" | "decline" | "cancel";

async function findPair(
  supabase: Awaited<ReturnType<typeof createClient>>,
  a: string,
  b: string,
) {
  const { data } = await supabase
    .from("connections")
    .select("id, requester_id, receiver_id, status")
    .or(
      `and(requester_id.eq.${a},receiver_id.eq.${b}),and(requester_id.eq.${b},receiver_id.eq.${a})`,
    )
    .maybeSingle();
  return data as { id: string; requester_id: string; receiver_id: string; status: string } | null;
}

export async function POST(request: Request) {
  const session = await getDiscoveryApiSession();
  if (isApiError(session)) return session;
  const body = (await request.json().catch(() => ({}))) as { profileId?: string; action?: Action };
  const me = session.profile.id;
  const other = body.profileId;
  const action: Action = body.action ?? "request";
  if (!other || !isUuid(other)) return NextResponse.json({ error: "Missing profile." }, { status: 400 });
  if (other === me) return NextResponse.json({ error: "You cannot connect with yourself." }, { status: 400 });

  const supabase = await createClient();
  const existing = await findPair(supabase, me, other);

  if (action === "request") {
    if (existing?.status === "accepted") {
      return NextResponse.json({ ok: true, status: "accepted" });
    }
    if (existing?.status === "pending") {
      if (existing.receiver_id === me) {
        const { error } = await supabase.from("connections").update({ status: "accepted" }).eq("id", existing.id);
        if (error) return NextResponse.json({ error: error.message }, { status: 400 });
        return NextResponse.json({ ok: true, status: "accepted" });
      }
      return NextResponse.json({ ok: true, status: "pending" });
    }
    if (existing?.status === "declined") {
      const { error } = await supabase
        .from("connections")
        .update({ requester_id: me, receiver_id: other, status: "pending" })
        .eq("id", existing.id);
      if (error) return NextResponse.json({ error: error.message }, { status: 400 });
      return NextResponse.json({ ok: true, status: "pending" });
    }
    const { error } = await supabase.from("connections").insert({
      requester_id: me,
      receiver_id: other,
      status: "pending",
    });
    if (error) {
      if (error.message.toLowerCase().includes("duplicate") || error.code === "23505") {
        return NextResponse.json({ ok: true, status: "pending" });
      }
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    return NextResponse.json({ ok: true, status: "pending" });
  }

  if (!existing) return NextResponse.json({ error: "No connection request." }, { status: 404 });

  if (action === "accept") {
    if (existing.receiver_id !== me) return NextResponse.json({ error: "Not allowed." }, { status: 403 });
    if (existing.status === "accepted") return NextResponse.json({ ok: true, status: "accepted" });
    const { error } = await supabase.from("connections").update({ status: "accepted" }).eq("id", existing.id);
    if (error) return NextResponse.json({ error: error.message }, { status: 400 });
    return NextResponse.json({ ok: true, status: "accepted" });
  }

  if (action === "decline") {
    if (existing.receiver_id !== me) return NextResponse.json({ error: "Not allowed." }, { status: 403 });
    const { error } = await supabase.from("connections").update({ status: "declined" }).eq("id", existing.id);
    if (error) return NextResponse.json({ error: error.message }, { status: 400 });
    return NextResponse.json({ ok: true, status: "declined" });
  }

  if (action === "cancel") {
    if (existing.requester_id !== me || existing.status !== "pending") {
      return NextResponse.json({ error: "Not allowed." }, { status: 403 });
    }
    const { error } = await supabase.from("connections").delete().eq("id", existing.id);
    if (error) return NextResponse.json({ error: error.message }, { status: 400 });
    return NextResponse.json({ ok: true, status: "none" });
  }

  return NextResponse.json({ error: "Unknown action." }, { status: 400 });
}
