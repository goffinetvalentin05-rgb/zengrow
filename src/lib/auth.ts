import { redirect } from "next/navigation";
import { createClient } from "@/src/lib/supabase/server";

export type Restaurant = {
  id: string;
  owner_id: string;
  name: string;
  slug: string;
  phone: string | null;
  email: string | null;
  address: string | null;
  description: string | null;
};

export async function requireUser() {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getUser();

  if (error || !data.user) {
    redirect("/login");
  }

  return data.user;
}

export async function requireRestaurant() {
  const supabase = await createClient();
  const user = await requireUser();

  const { data: restaurant } = await supabase
    .from("restaurants")
    .select("id, owner_id, name, slug, phone, email, address, description")
    .eq("owner_id", user.id)
    .maybeSingle();

  if (!restaurant) {
    redirect("/signup");
  }

  return restaurant as Restaurant;
}
