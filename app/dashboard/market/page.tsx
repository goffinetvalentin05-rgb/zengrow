import { requireRestaurant } from "@/src/lib/auth";
import { createClient } from "@/src/lib/supabase/server";
import { MarketView } from "@/src/components/sharpz/market/market-view";
import { getCompetitorChanges, getCompetitors, getOpportunities } from "@/src/lib/sharpz/queries";

export default async function MarketPage() {
  const restaurant = await requireRestaurant();
  const supabase = await createClient();
  const [competitors, changes, opportunities] = await Promise.all([
    getCompetitors(supabase, restaurant.id),
    getCompetitorChanges(supabase, restaurant.id),
    getOpportunities(supabase, restaurant.id),
  ]);
  return <MarketView competitors={competitors} changes={changes} opportunities={opportunities} />;
}
