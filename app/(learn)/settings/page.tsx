import SettingsView from "@/src/components/learn/settings-view";
import { DataError } from "@/src/components/learn/states";
import { getAuthSession } from "@/src/lib/auth/user-session";
import { isUserProActive, type UserPlan, type UserSubscriptionStatus } from "@/src/lib/billing/user-plan";
import { calendarDateInTimezone, weekStartIso } from "@/src/lib/learn/calendar";
import { ensureStarterCategories, loadLearner } from "@/src/lib/learn/db";
import { LEARN_ROUTES } from "@/src/lib/learn/routes";
import { redirect } from "next/navigation";

export default async function SettingsPage({
  searchParams,
}: {
  searchParams: Promise<{ upgraded?: string; cancelled?: string }>;
}) {
  const params = await searchParams;
  const { supabase, user } = await getAuthSession();
  if (!user) redirect(LEARN_ROUTES.login);
  const db = { supabase, userId: user.id };

  try {
    const [profile, categories, tokens, sub] = await Promise.all([
      loadLearner(db),
      ensureStarterCategories(db),
      supabase
        .from("api_tokens")
        .select("id, name, prefix, last_used_at, revoked_at, created_at")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false }),
      supabase.from("user_subscriptions").select("plan, status, stripe_customer_id").eq("user_id", user.id).maybeSingle(),
    ]);

    const plan = (sub.data?.plan === "pro" ? "pro" : "free") as UserPlan;
    const status = (sub.data?.status ?? "inactive") as UserSubscriptionStatus;
    const zone = profile?.timezone || "UTC";
    const notice = params.upgraded
      ? "Subscription updated. Stripe can take a moment to confirm the plan."
      : params.cancelled
        ? "Checkout was cancelled. Your plan is unchanged."
        : null;

    return (
      <SettingsView
        email={user.email ?? null}
        displayName={profile?.display_name ?? ""}
        uiLanguage={profile?.ui_language ?? "en"}
        level={profile?.level ?? "A2"}
        timezone={zone}
        weeklyMinutes={profile?.weekly_minutes ?? 60}
        preferredActivities={(profile?.preferred_activities as string[] | null) ?? []}
        weekStart={weekStartIso(calendarDateInTimezone(new Date(), zone))}
        categories={categories}
        tokens={(tokens.data ?? []).map((token) => ({
          id: token.id as string,
          name: token.name as string,
          prefix: token.prefix as string,
          lastUsedAt: (token.last_used_at as string | null) ?? null,
          revokedAt: (token.revoked_at as string | null) ?? null,
          createdAt: token.created_at as string,
        }))}
        isPro={isUserProActive({ plan, status })}
        status={status}
        hasCustomer={Boolean(sub.data?.stripe_customer_id)}
        notice={notice}
      />
    );
  } catch (error) {
    return <DataError message={error instanceof Error ? error.message : "Could not load settings."} />;
  }
}
