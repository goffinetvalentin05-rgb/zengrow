import { requireRestaurant } from "@/src/lib/auth";
import { createClient } from "@/src/lib/supabase/server";
import { GrowthView } from "@/src/components/sharpz/growth/growth-view";
import { getOpportunities } from "@/src/lib/sharpz/queries";

export default async function GrowthPage() {
  const restaurant = await requireRestaurant();
  const supabase = await createClient();
  const opportunities = await getOpportunities(supabase, restaurant.id);
  return <GrowthView opportunities={opportunities} />;
}
