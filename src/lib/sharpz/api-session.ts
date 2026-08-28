import type { SupabaseClient, User } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import { getAuthenticatedUser, verifyRestaurantAccess } from "@/src/lib/ai/route-auth";
import { createClient } from "@/src/lib/supabase/server";

type RestaurantRow = {
  id: string;
  name: string;
  subscription_plan: import("@/src/lib/subscription").SubscriptionPlan;
  subscription_status: import("@/src/lib/subscription").SubscriptionStatus;
  trial_end_date: string | null;
  stripe_subscription_id: string | null;
};

export type SharpzApiOk = {
  ok: true;
  supabase: SupabaseClient;
  user: User;
  restaurant: RestaurantRow;
};

export type SharpzApiErr = { ok: false; error: NextResponse };

export async function requireSharpzApi(): Promise<SharpzApiOk | SharpzApiErr> {
  const supabase = await createClient();
  const { user, error: authError } = await getAuthenticatedUser(supabase);
  if (authError || !user) {
    return { ok: false, error: authError ?? NextResponse.json({ error: "Non autorisé." }, { status: 401 }) };
  }

  const { data: restaurant } = await supabase
    .from("restaurants")
    .select("id, name, subscription_plan, subscription_status, trial_end_date, stripe_subscription_id")
    .eq("owner_id", user.id)
    .maybeSingle();

  if (!restaurant) {
    return { ok: false, error: NextResponse.json({ error: "Espace introuvable." }, { status: 404 }) };
  }

  const { restaurant: verified, error: accessError } = await verifyRestaurantAccess(supabase, user, restaurant.id);
  if (accessError || !verified) {
    return { ok: false, error: accessError ?? NextResponse.json({ error: "Espace introuvable." }, { status: 404 }) };
  }

  return { ok: true, supabase, user, restaurant: verified };
}

export async function parseJson<T>(request: Request): Promise<T | null> {
  try {
    const body = await request.json();
    if (!body || typeof body !== "object") return null;
    return body as T;
  } catch {
    return null;
  }
}
