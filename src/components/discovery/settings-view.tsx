"use client";

import Button from "@/src/components/ui/button";
import { DISCOVERY_ROUTES } from "@/src/lib/discovery/routes";
import { SHARPZ_PRO_PRICE_LABEL } from "@/src/lib/discovery/pro";
import type { UserSubscription } from "@/src/lib/discovery/types";
import Link from "next/link";

export function SettingsView({
  email,
  subscription,
  isPro,
  isAdmin,
}: {
  email: string | undefined;
  subscription: UserSubscription;
  isPro: boolean;
  isAdmin?: boolean;
}) {
  async function upgrade() {
    const response = await fetch("/api/discovery/checkout", { method: "POST" });
    const payload = (await response.json().catch(() => ({}))) as { url?: string; error?: string };
    if (payload.url) window.location.href = payload.url;
    else alert(payload.error ?? "Stripe is not configured yet.");
  }

  async function manage() {
    const response = await fetch("/api/discovery/portal", { method: "POST" });
    const payload = (await response.json().catch(() => ({}))) as { url?: string; error?: string };
    if (payload.url) window.location.href = payload.url;
    else alert(payload.error ?? "No Stripe customer yet.");
  }

  return (
    <div className="mx-auto w-full max-w-xl">
      <h1 className="font-[family-name:var(--font-zg-display)] text-4xl text-white">Settings</h1>
      <section className="mt-8 rounded-3xl border border-white/[0.07] p-5">
        <p className="text-xs uppercase tracking-[0.14em] text-white/35">Account</p>
        <p className="mt-2 text-white">{email}</p>
      </section>
      <section className="mt-4 rounded-3xl border border-white/[0.07] p-5">
        <p className="text-xs uppercase tracking-[0.14em] text-white/35">Sharpz Pro</p>
        <p className="mt-2 text-white">{isPro ? "Pro active" : "Free"} · {SHARPZ_PRO_PRICE_LABEL}</p>
        <p className="mt-1 text-sm text-white/40">Status: {subscription.status}</p>
        <div className="mt-4">
          {isPro ? (
            <Button variant="secondary" onClick={manage}>
              Manage subscription
            </Button>
          ) : (
            <Button onClick={upgrade}>Upgrade to Pro</Button>
          )}
        </div>
      </section>
      {isAdmin ? (
        <section className="mt-4 rounded-3xl border border-white/[0.07] p-5">
          <p className="text-xs uppercase tracking-[0.14em] text-white/35">Admin</p>
          <Link href={DISCOVERY_ROUTES.admin} className="mt-2 inline-block text-sm text-white/70 hover:text-white">
            Open admin
          </Link>
        </section>
      ) : null}
    </div>
  );
}
