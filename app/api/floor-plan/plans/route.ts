import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/src/lib/supabase/server";

export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;
  const restaurantId = params.get("restaurantId") ?? "";
  if (!restaurantId) {
    return NextResponse.json({ plans: [], error: "Paramètres invalides." }, { status: 400 });
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("floor_plans")
    .select("id, name, type, is_active, sort_order")
    .eq("restaurant_id", restaurantId)
    .eq("is_active", true)
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: true });

  if (error) {
    return NextResponse.json({ plans: [], error: error.message }, { status: 500 });
  }

  return NextResponse.json({ plans: data ?? [] });
}

