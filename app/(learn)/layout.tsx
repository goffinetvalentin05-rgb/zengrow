import { redirect } from "next/navigation";
import AppShell from "@/src/components/app/app-shell";
import { getAuthSession } from "@/src/lib/auth/user-session";
import { LEARN_ROUTES } from "@/src/lib/learn/routes";

export default async function LearnLayout({ children }: { children: React.ReactNode }) {
  const { supabase, user } = await getAuthSession();
  if (!user) redirect(LEARN_ROUTES.login);

  const { data: profile } = await supabase
    .from("learner_profiles")
    .select("display_name, onboarding_completed")
    .eq("user_id", user.id)
    .maybeSingle();

  if (!profile?.onboarding_completed) redirect(LEARN_ROUTES.onboarding);

  const displayName =
    (typeof profile.display_name === "string" && profile.display_name.trim()) ||
    user.email?.split("@")[0] ||
    "Learner";

  return (
    <AppShell displayName={displayName} email={user.email ?? null}>
      {children}
    </AppShell>
  );
}
