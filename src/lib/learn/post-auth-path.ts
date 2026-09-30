import type { SupabaseClient } from "@supabase/supabase-js";
import { LEARN_ROUTES } from "@/src/lib/learn/routes";

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

  return data?.onboarding_completed ? LEARN_ROUTES.today : LEARN_ROUTES.onboarding;
}
