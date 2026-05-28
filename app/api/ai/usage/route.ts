import { NextResponse } from "next/server";
import { countAIUsageThisMonth, resolveAIUsageQuota } from "@/src/lib/ai/usage";
import { getAuthenticatedUser, verifyRestaurantAccess } from "@/src/lib/ai/route-auth";
import { createClient } from "@/src/lib/supabase/server";

export async function GET(request: Request) {
  const supabase = await createClient();
  const { user, error: authError } = await getAuthenticatedUser(supabase);
  if (authError) return authError;

  const { searchParams } = new URL(request.url);
  const restaurantId = searchParams.get("restaurantId")?.trim();

  if (!restaurantId) {
    return NextResponse.json({ error: "restaurantId requis." }, { status: 400 });
  }

  const { restaurant, error: restaurantError } = await verifyRestaurantAccess(
    supabase,
    user!,
    restaurantId,
  );
  if (restaurantError) return restaurantError;

  const used = await countAIUsageThisMonth(supabase, restaurant!.id);
  const { limit, canAccess, isFounder, tier } = resolveAIUsageQuota(
    restaurant!.subscription_status,
    restaurant!.subscription_plan,
    user!.email,
  );

  return NextResponse.json({
    used,
    limit,
    remaining: Math.max(0, limit - used),
    canAccess,
    isFounder,
    tier,
  });
}
