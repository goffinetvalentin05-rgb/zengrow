import { NextResponse } from "next/server";
import type { SupabaseClient, User } from "@supabase/supabase-js";
import Stripe from "stripe";
import { requireApiUser } from "@/src/lib/auth/user-session";
import { getLearnProPriceId, LEARN_PRODUCT } from "@/src/lib/billing/user-plan";
import { LEARN_ROUTES } from "@/src/lib/learn/routes";
import { getStripeClient } from "@/src/lib/stripe";
import { getPublicSiteUrl } from "@/src/lib/site-url";

function sanitizeStripeText(value: string) {
  return value
    .replace(/(?:sk|rk)_(?:live|test)_[A-Za-z0-9]+/g, "[redacted]")
    .replace(/whsec_[A-Za-z0-9]+/g, "[redacted]")
    .replace(/Bearer\s+\S+/gi, "Bearer [redacted]");
}

function checkoutErrorResponse(error: unknown) {
  if (!(error instanceof Stripe.errors.StripeError)) {
    return NextResponse.json({ error: "Unable to create checkout. Please try again." }, { status: 500 });
  }
  const message = sanitizeStripeText(error.message);
  if (error.code === "resource_missing" || /no such price/i.test(message)) {
    return NextResponse.json(
      { error: "Stripe price was not found. Check STRIPE_SHARPZ_PRO_PRICE_ID." },
      { status: 400 },
    );
  }
  const status = typeof error.statusCode === "number" && error.statusCode >= 400 && error.statusCode < 500 ? error.statusCode : 502;
  return NextResponse.json({ error: "Stripe rejected the checkout request." }, { status });
}

async function displayNameForUser(supabase: SupabaseClient, user: User) {
  const { data } = await supabase
    .from("learner_profiles")
    .select("display_name")
    .eq("user_id", user.id)
    .maybeSingle();
  const fromProfile = typeof data?.display_name === "string" ? data.display_name.trim() : "";
  if (fromProfile) return fromProfile;
  const meta = user.user_metadata?.full_name;
  if (typeof meta === "string" && meta.trim()) return meta.trim();
  return user.email ?? "Learner";
}

export async function createLearnCheckout() {
  const session = await requireApiUser();
  if (!session.ok) return session.response;

  const priceId = getLearnProPriceId();
  if (!priceId) {
    return NextResponse.json(
      { error: "Stripe Pro price is not configured. Set STRIPE_SHARPZ_PRO_PRICE_ID." },
      { status: 500 },
    );
  }

  let stripe;
  try {
    stripe = getStripeClient();
  } catch {
    return NextResponse.json({ error: "Missing STRIPE_SECRET_KEY." }, { status: 500 });
  }

  const { data: sub } = await session.supabase
    .from("user_subscriptions")
    .select("stripe_customer_id")
    .eq("user_id", session.user.id)
    .maybeSingle();

  let customerId = sub?.stripe_customer_id as string | null | undefined;
  const origin = getPublicSiteUrl();

  try {
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: session.user.email,
        name: await displayNameForUser(session.supabase, session.user),
        metadata: { user_id: session.user.id, product: LEARN_PRODUCT },
      });
      customerId = customer.id;
      await session.supabase.from("user_subscriptions").upsert(
        { user_id: session.user.id, plan: "free", status: "inactive", stripe_customer_id: customerId },
        { onConflict: "user_id" },
      );
    }

    const checkout = await stripe.checkout.sessions.create({
      mode: "subscription",
      customer: customerId,
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${origin}${LEARN_ROUTES.settings}?upgraded=1`,
      cancel_url: `${origin}${LEARN_ROUTES.settings}?cancelled=1`,
      client_reference_id: session.user.id,
      metadata: {
        user_id: session.user.id,
        product: LEARN_PRODUCT,
        selected_plan: "pro",
      },
      subscription_data: {
        metadata: {
          user_id: session.user.id,
          product: LEARN_PRODUCT,
          selected_plan: "pro",
        },
      },
    });

    if (!checkout.url) {
      return NextResponse.json({ error: "Unable to create checkout." }, { status: 500 });
    }
    return NextResponse.json({ url: checkout.url });
  } catch (error) {
    console.error("[billing/checkout]", error instanceof Error ? sanitizeStripeText(error.message) : "stripe error");
    return checkoutErrorResponse(error);
  }
}

export async function createLearnPortal(request: Request) {
  const session = await requireApiUser();
  if (!session.ok) return session.response;

  const { data: sub } = await session.supabase
    .from("user_subscriptions")
    .select("stripe_customer_id")
    .eq("user_id", session.user.id)
    .maybeSingle();

  if (!sub?.stripe_customer_id) {
    return NextResponse.json({ error: "No Stripe customer on this account yet." }, { status: 400 });
  }

  let stripe;
  try {
    stripe = getStripeClient();
  } catch {
    return NextResponse.json({ error: "Missing STRIPE_SECRET_KEY." }, { status: 500 });
  }

  const originHeader = request.headers.get("origin");
  const origin = originHeader || new URL(request.url).origin;
  const portal = await stripe.billingPortal.sessions.create({
    customer: sub.stripe_customer_id,
    return_url: `${origin}${LEARN_ROUTES.settings}`,
  });
  return NextResponse.json({ url: portal.url });
}
