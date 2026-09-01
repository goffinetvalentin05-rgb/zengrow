import { NextResponse } from "next/server";
import { ensureDiscoveryProfile } from "@/src/lib/discovery/auth";
import { isOwnerEmail } from "@/src/lib/access";
import { mapSubscription } from "@/src/lib/discovery/mappers";
import { createClient } from "@/src/lib/supabase/server";
import type { DiscoverySession } from "@/src/lib/discovery/auth";

export async function getDiscoveryApiSession(): Promise<DiscoverySession | NextResponse> {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }
  const profile = await ensureDiscoveryProfile(data.user);
  const { data: subRow } = await supabase
    .from("user_subscriptions")
    .select("*")
    .eq("user_id", data.user.id)
    .maybeSingle();
  return {
    user: data.user,
    profile,
    subscription: mapSubscription(subRow),
    isOwnerDev: isOwnerEmail(data.user.email),
  };
}

export function isApiError(value: DiscoverySession | NextResponse): value is NextResponse {
  return value instanceof NextResponse;
}
