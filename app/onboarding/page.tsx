import { redirect } from "next/navigation";
import OnboardingForm from "@/src/components/learn/onboarding-form";
import { getAuthSession } from "@/src/lib/auth/user-session";
import { LEARN_ROUTES } from "@/src/lib/learn/routes";

export default async function OnboardingPage() {
  const { supabase, user } = await getAuthSession();
  if (!user) redirect(LEARN_ROUTES.login);

  const { data: profile } = await supabase
    .from("learner_profiles")
    .select("onboarding_completed")
    .eq("user_id", user.id)
    .maybeSingle();

  if (profile?.onboarding_completed) redirect(LEARN_ROUTES.today);

  return (
    <div className="min-h-dvh bg-[var(--zg-app)] px-5 py-12 text-[var(--zg-fg)]">
      <OnboardingForm />
    </div>
  );
}
