import { redirect } from "next/navigation";
import { getEffectiveAccessState, type EffectiveAccess } from "@/src/lib/access";
import { createClient } from "@/src/lib/supabase/server";
import { expireTrialIfNeeded, type SubscriptionPlan, type SubscriptionStatus } from "@/src/lib/subscription";

export type Restaurant = {
  id: string;
  owner_id: string;
  name: string;
  slug: string;
  phone: string | null;
  email: string | null;
  address: string | null;
  description: string | null;
  subscription_plan: SubscriptionPlan;
  subscription_status: SubscriptionStatus;
  trial_start_date: string | null;
  trial_end_date: string | null;
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
};

export async function requireUser() {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getUser();

  if (error || !data.user) {
    redirect("/pro/login");
  }

  return data.user;
}

export type RestaurantSession = {
  user: Awaited<ReturnType<typeof requireUser>>;
  restaurant: Restaurant;
  access: EffectiveAccess;
};

export async function requireRestaurantSession(): Promise<RestaurantSession> {
  const supabase = await createClient();
  const user = await requireUser();

  const { data: restaurant } = await supabase
    .from("restaurants")
    .select(
      "id, owner_id, name, slug, phone, email, address, description, subscription_plan, subscription_status, trial_start_date, trial_end_date, stripe_customer_id, stripe_subscription_id",
    )
    .eq("owner_id", user.id)
    .maybeSingle();

  if (!restaurant) {
    redirect("/pro/signup");
  }

  const syncedRestaurant = await expireTrialIfNeeded(supabase, restaurant);
  const merged = { ...restaurant, ...syncedRestaurant } as Restaurant;
  const access = getEffectiveAccessState(user.email, merged);

  return { user, restaurant: merged, access };
}

export async function requireRestaurant() {
  const { restaurant } = await requireRestaurantSession();
  return restaurant;
}
