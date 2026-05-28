import { NextResponse } from "next/server";
import { createClient } from "@/src/lib/supabase/server";
import { countAIUsageThisMonth, getAIMonthlyLimit } from "@/src/lib/ai/usage";
import { getAuthenticatedUser, verifyRestaurantAccess } from "@/src/lib/ai/route-auth";

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
  const limit = getAIMonthlyLimit(restaurant!.subscription_status, restaurant!.subscription_plan);

  return NextResponse.json({ used, limit, remaining: Math.max(0, limit - used) });
}
