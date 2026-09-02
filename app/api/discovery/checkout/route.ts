import { NextResponse } from "next/server";
import { requireDiscoverySession } from "@/src/lib/discovery/auth";
import { getSharpzProPriceId } from "@/src/lib/discovery/pro";
import { getStripeClient } from "@/src/lib/stripe";
import { createClient } from "@/src/lib/supabase/server";
import { getPublicSiteUrl } from "@/src/lib/site-url";

export async function POST() {
  const { user, profile } = await requireDiscoverySession();
  const priceId = getSharpzProPriceId();
  if (!priceId) {
    return NextResponse.json(
      {
        error:
          "Stripe Pro price is not configured. Set STRIPE_SHARPZ_PRO_PRICE_ID (preferred) or STRIPE_PRO_PRICE_ID.",
      },
      { status: 500 },
    );
  }

  let stripe;
  try {
    stripe = getStripeClient();
  } catch {
    return NextResponse.json({ error: "Missing STRIPE_SECRET_KEY." }, { status: 500 });
  }

  const supabase = await createClient();
  const { data: sub } = await supabase
    .from("user_subscriptions")
    .select("*")
    .eq("user_id", user.id)
    .maybeSingle();

  let customerId = sub?.stripe_customer_id as string | null | undefined;
  if (!customerId) {
    const customer = await stripe.customers.create({
      email: user.email,
      name: profile.displayName,
      metadata: { user_id: user.id, profile_id: profile.id, product: "sharpz_discovery" },
    });
    customerId = customer.id;
    await supabase.from("user_subscriptions").upsert(
      { user_id: user.id, plan: "free", status: "inactive", stripe_customer_id: customerId },
      { onConflict: "user_id" },
    );
  }

  const origin = getPublicSiteUrl();
  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    customer: customerId,
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: `${origin}/analytics?upgraded=1`,
    cancel_url: `${origin}/settings?cancelled=1`,
    client_reference_id: user.id,
    metadata: {
      user_id: user.id,
      profile_id: profile.id,
      product: "sharpz_discovery",
      selected_plan: "pro",
    },
    subscription_data: {
      metadata: {
        user_id: user.id,
        profile_id: profile.id,
        product: "sharpz_discovery",
        selected_plan: "pro",
      },
    },
  });

  if (!session.url) return NextResponse.json({ error: "Unable to create checkout." }, { status: 500 });
  return NextResponse.json({ url: session.url });
}
