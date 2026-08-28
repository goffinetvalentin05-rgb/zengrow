import { requireRestaurant } from "@/src/lib/auth";
import { createClient } from "@/src/lib/supabase/server";
import { ActionsBoard } from "@/src/components/sharpz/actions/actions-board";
import { getActions } from "@/src/lib/sharpz/queries";

export default async function ActionsPage() {
  const restaurant = await requireRestaurant();
  const supabase = await createClient();
  const actions = await getActions(supabase, restaurant.id);
  return <ActionsBoard actions={actions} />;
}
