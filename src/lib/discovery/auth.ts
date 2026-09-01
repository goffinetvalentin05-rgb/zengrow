import { redirect } from "next/navigation";
import { isOwnerEmail } from "@/src/lib/access";
import { DISCOVERY_ROUTES } from "@/src/lib/discovery/routes";
import { profileHasMinimumOnboarding } from "@/src/lib/discovery/onboarding";
import { mapProfile, mapSubscription } from "@/src/lib/discovery/mappers";
import type { Profile, UserSubscription } from "@/src/lib/discovery/types";
import { createClient } from "@/src/lib/supabase/server";
import type { SupabaseClient, User } from "@supabase/supabase-js";

export type DiscoverySession = {
  user: User;
  profile: Profile;
  subscription: UserSubscription;
  isOwnerDev: boolean;
};

export async function getOptionalUser() {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user) return null;
  return data.user;
}

export async function requireDiscoveryUser() {
  const user = await getOptionalUser();
  if (!user) redirect(DISCOVERY_ROUTES.login);
  return user;
}

export async function maybeGrandfatherOnboarding(supabase: SupabaseClient, profile: Profile): Promise<Profile> {
  if (profile.onboardingCompleted) return profile;
  const { count } = await supabase
    .from("profile_categories")
    .select("id", { count: "exact", head: true })
    .eq("profile_id", profile.id);
  if (
    !profileHasMinimumOnboarding({
      onboardingCompleted: profile.onboardingCompleted,
      username: profile.username,
      profileType: profile.profileType,
      nicheCount: count ?? 0,
    })
  ) {
    return profile;
  }
  const now = new Date().toISOString();
  await supabase
    .from("profiles")
    .update({
      onboarding_completed: true,
      onboarding_completed_at: now,
      onboarding_step: "done",
    })
    .eq("id", profile.id);
  return { ...profile, onboardingCompleted: true, onboardingStep: "done" };
}

export async function ensureDiscoveryProfile(user: User): Promise<Profile> {
  const supabase = await createClient();
  const { data: existing } = await supabase
    .from("profiles")
    .select("*")
    .eq("user_id", user.id)
    .maybeSingle();

  if (existing) {
    if (isOwnerEmail(user.email) && !existing.is_admin) {
      await supabase.from("profiles").update({ is_admin: true }).eq("id", existing.id);
      return maybeGrandfatherOnboarding(supabase, mapProfile({ ...existing, is_admin: true }));
    }
    return maybeGrandfatherOnboarding(supabase, mapProfile(existing));
  }

  const displayName =
    (typeof user.user_metadata?.full_name === "string" && user.user_metadata.full_name.trim()) ||
    user.email?.split("@")[0] ||
    "Member";

  const { data: created, error } = await supabase
    .from("profiles")
    .insert({
      user_id: user.id,
      email: user.email,
      display_name: displayName,
      claim_status: "claimed",
      is_public: true,
    })
    .select("*")
    .single();

  if (error || !created) {
    const { data: retry } = await supabase
      .from("profiles")
      .select("*")
      .eq("user_id", user.id)
      .maybeSingle();
    if (retry) return mapProfile(retry);
    throw new Error(error?.message ?? "Unable to create profile");
  }

  await supabase.from("user_subscriptions").upsert(
    { user_id: user.id, plan: "free", status: "inactive" },
    { onConflict: "user_id" },
  );

  return mapProfile(created);
}

export async function getOptionalDiscoverySession(): Promise<DiscoverySession | null> {
  const user = await getOptionalUser();
  if (!user) return null;
  const supabase = await createClient();
  const profile = await ensureDiscoveryProfile(user);
  const { data: subRow } = await supabase
    .from("user_subscriptions")
    .select("*")
    .eq("user_id", user.id)
    .maybeSingle();

  return {
    user,
    profile,
    subscription: mapSubscription(subRow),
    isOwnerDev: isOwnerEmail(user.email),
  };
}

export async function requireDiscoverySession(): Promise<DiscoverySession> {
  const session = await getOptionalDiscoverySession();
  if (!session) redirect(DISCOVERY_ROUTES.login);
  return session;
}

export async function requireOnboardedSession(): Promise<DiscoverySession> {
  const session = await requireDiscoverySession();
  if (!session.profile.onboardingCompleted) {
    redirect(DISCOVERY_ROUTES.onboarding);
  }
  return session;
}

export async function requireAdminSession(): Promise<DiscoverySession> {
  const session = await requireOnboardedSession();
  if (!session.profile.isAdmin && !session.isOwnerDev) {
    redirect(DISCOVERY_ROUTES.explore);
  }
  return session;
}
