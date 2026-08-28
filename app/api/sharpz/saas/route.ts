import { NextResponse } from "next/server";
import { parseJson, requireSharpzApi } from "@/src/lib/sharpz/api-session";

export async function PATCH(request: Request) {
  const session = await requireSharpzApi();
  if (!session.ok) return session.error;
  const { supabase, restaurant } = session;
  const body = await parseJson<{
    name?: string;
    url?: string | null;
    description?: string | null;
    market?: string | null;
    businessModel?: string | null;
    pricingSummary?: string | null;
    stage?: string | null;
    icp?: Record<string, string | null>;
  }>(request);

  const patch = {
    name: body?.name ?? null,
    url: body?.url ?? null,
    description: body?.description ?? null,
    market: body?.market ?? null,
    business_model: body?.businessModel ?? null,
    pricing_summary: body?.pricingSummary ?? null,
    pricing_detected: Boolean(body?.pricingSummary),
    stage: body?.stage ?? null,
    icp: body?.icp ?? {},
  };

  const { data: existing } = await supabase
    .from("user_saas")
    .select("id")
    .eq("restaurant_id", restaurant.id)
    .maybeSingle();

  if (existing?.id) {
    await supabase.from("user_saas").update(patch).eq("id", existing.id);
  } else {
    await supabase.from("user_saas").insert({
      restaurant_id: restaurant.id,
      ...patch,
      onboarding_completed: false,
      onboarding_step: "url",
    });
  }

  if (patch.name) {
    await supabase.from("restaurants").update({ name: patch.name }).eq("id", restaurant.id);
  }

  return NextResponse.json({ ok: true });
}
