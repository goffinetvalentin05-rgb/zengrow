import type { SupabaseClient } from "@supabase/supabase-js";
import { LEARN_ROUTES } from "@/src/lib/learn/routes";
import { destinationAfterAuth } from "@/src/lib/learn/routing";

export async function pathAfterAuth(supabase: SupabaseClient) {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return LEARN_ROUTES.login;

  const { data } = await supabase
    .from("learner_profiles")
    .select("onboarding_completed")
    .eq("user_id", user.id)
    .maybeSingle();

  return destinationAfterAuth(data?.onboarding_completed);
}
