import { requireRestaurant } from "@/src/lib/auth";
import { createClient } from "@/src/lib/supabase/server";
import { ProspectsView } from "@/src/components/sharpz/prospects/prospects-view";
import { getProspects } from "@/src/lib/sharpz/queries";

export default async function ProspectsPage() {
  const restaurant = await requireRestaurant();
  const supabase = await createClient();
  const prospects = await getProspects(supabase, restaurant.id);
  return <ProspectsView prospects={prospects} />;
}
