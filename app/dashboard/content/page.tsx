import { requireRestaurant } from "@/src/lib/auth";
import { createClient } from "@/src/lib/supabase/server";
import { ContentView } from "@/src/components/sharpz/content/content-view";
import { getContentIdeas, getContentOpportunities } from "@/src/lib/sharpz/queries";

export default async function ContentPage() {
  const restaurant = await requireRestaurant();
  const supabase = await createClient();
  const [opportunities, ideas] = await Promise.all([
    getContentOpportunities(supabase, restaurant.id),
    getContentIdeas(supabase, restaurant.id),
  ]);
  return <ContentView opportunities={opportunities} ideas={ideas} />;
}
