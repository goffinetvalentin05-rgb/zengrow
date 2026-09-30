import { redirect } from "next/navigation";
import BillingActions from "@/src/components/app/billing-actions";
import { getAuthSession } from "@/src/lib/auth/user-session";
import { isUserProActive, type UserPlan, type UserSubscriptionStatus } from "@/src/lib/billing/user-plan";
import { LEARN_ROUTES } from "@/src/lib/learn/routes";

export default async function SettingsPage({
  searchParams,
}: {
  searchParams: Promise<{ upgraded?: string; cancelled?: string }>;
}) {
  const params = await searchParams;
  const { supabase, user } = await getAuthSession();
  if (!user) redirect(LEARN_ROUTES.login);

  const { data: sub } = await supabase
    .from("user_subscriptions")
    .select("plan, status, stripe_customer_id")
    .eq("user_id", user.id)
    .maybeSingle();

  const plan = (sub?.plan === "pro" ? "pro" : "free") as UserPlan;
  const status = (sub?.status ?? "inactive") as UserSubscriptionStatus;
  const isPro = isUserProActive({ plan, status });

  return (
    <section className="max-w-xl">
      <h1 className="text-3xl font-semibold tracking-tight">Settings</h1>
      <p className="mt-3 text-sm leading-relaxed text-white/55">Account, plan, and later the ChatGPT connection.</p>

      {params.upgraded ? (
        <p className="mt-6 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-100">
          Subscription updated. It can take a moment for Stripe to confirm the plan.
        </p>
      ) : null}
      {params.cancelled ? (
        <p className="mt-6 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white/70">
          Checkout was cancelled. Your plan is unchanged.
        </p>
      ) : null}

      <div className="mt-8 rounded-2xl border border-white/10 bg-white/[0.03] p-5">
        <p className="text-xs uppercase tracking-[0.14em] text-white/40">Account</p>
        <p className="mt-2 text-sm">{user.email}</p>
      </div>

      <div className="mt-4 rounded-2xl border border-white/10 bg-white/[0.03] p-5">
        <p className="text-xs uppercase tracking-[0.14em] text-white/40">Plan</p>
        <p className="mt-2 text-lg font-medium">{isPro ? "Pro" : "Free"}</p>
        <p className="mt-1 text-sm text-white/50">Status: {status}</p>
        <BillingActions hasCustomer={Boolean(sub?.stripe_customer_id)} />
      </div>

      <div className="mt-4 rounded-2xl border border-dashed border-white/15 p-5 text-sm text-white/45">
        Connecting ChatGPT will be available in a later step. Nothing is linked yet.
      </div>
    </section>
  );
}
