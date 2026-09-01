import { NextResponse } from "next/server";
import { requireDiscoverySession } from "@/src/lib/discovery/auth";
import { getStripeClient } from "@/src/lib/stripe";
import { createClient } from "@/src/lib/supabase/server";

export async function POST(request: Request) {
  const { user } = await requireDiscoverySession();
  const supabase = await createClient();
  const { data: sub } = await supabase
    .from("user_subscriptions")
    .select("stripe_customer_id")
    .eq("user_id", user.id)
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
  const origin = new URL(request.url).origin;
  const portal = await stripe.billingPortal.sessions.create({
    customer: sub.stripe_customer_id,
    return_url: `${origin}/settings`,
  });
  return NextResponse.json({ url: portal.url });
}
