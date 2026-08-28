import { NextResponse } from "next/server";
import { LoyaltyServiceError } from "@/src/lib/loyalty/errors";
import { createClient } from "@/src/lib/supabase/server";

export async function getLoyaltyRequestContext() {
  const supabase = await createClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return {
      ok: false as const,
      response: NextResponse.json({ error: "Non autorisé." }, { status: 401 }),
    };
  }

  const { data: restaurant, error: restaurantError } = await supabase
    .from("restaurants")
    .select("id, owner_id")
    .eq("owner_id", user.id)
    .maybeSingle();

  if (restaurantError || !restaurant) {
    return {
      ok: false as const,
      response: NextResponse.json({ error: "Établissement introuvable." }, { status: 404 }),
    };
  }

  return {
    ok: true as const,
    supabase,
    userId: user.id,
    restaurantId: restaurant.id as string,
  };
}

export function loyaltyErrorResponse(error: unknown) {
  if (error instanceof LoyaltyServiceError) {
    return NextResponse.json({ error: error.message }, { status: error.status });
  }
  console.error("[loyalty]", error);
  return NextResponse.json({ error: "Une erreur est survenue. Réessayez." }, { status: 500 });
}
