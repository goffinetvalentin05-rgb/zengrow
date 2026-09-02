import { NextResponse } from "next/server";
import Stripe from "stripe";
import { requireDiscoverySession } from "@/src/lib/discovery/auth";
import { getSharpzProPriceId } from "@/src/lib/discovery/pro";
import { getStripeClient } from "@/src/lib/stripe";
import { createClient } from "@/src/lib/supabase/server";
import { getPublicSiteUrl } from "@/src/lib/site-url";

function sanitizeStripeText(value: string) {
  return value
    .replace(/(?:sk|rk)_(?:live|test)_[A-Za-z0-9]+/g, "[redacted]")
    .replace(/whsec_[A-Za-z0-9]+/g, "[redacted]")
    .replace(/Bearer\s+\S+/gi, "Bearer [redacted]");
}

function stripeErrorFields(error: unknown) {
  if (!(error instanceof Stripe.errors.StripeError)) return null;
  return {
    type: error.type,
    rawType: error.rawType,
    code: error.code ?? null,
    param: error.param ?? null,
    statusCode: error.statusCode ?? null,
    requestId: error.requestId ?? null,
    declineCode: error.decline_code ?? null,
    message: sanitizeStripeText(error.message),
  };
}

function logCheckoutStripeError(error: unknown, context: { userId: string; priceId: string }) {
  const stripeFields = stripeErrorFields(error);
  const fallback =
    error instanceof Error
      ? { name: error.name, message: sanitizeStripeText(error.message) }
      : { message: sanitizeStripeText(String(error)) };

  console.error("[discovery/checkout] Stripe checkout failed", {
    userId: context.userId,
    priceId: context.priceId,
    ...(stripeFields ?? fallback),
  });
}

function checkoutErrorResponse(error: unknown) {
  const stripeFields = stripeErrorFields(error);
  const rawType = stripeFields?.rawType;
  const code = stripeFields?.code;
  const message = stripeFields?.message ?? "";
  const param = stripeFields?.param;

  let status = 500;
  let clientError = "Unable to create checkout. Please try again.";

  if (rawType === "authentication_error") {
    status = 500;
    clientError = "Stripe authentication failed. Check STRIPE_SECRET_KEY.";
  } else if (
    code === "resource_missing" ||
    /no such price/i.test(message) ||
    /no such customer/i.test(message) ||
    param === "line_items[0][price]" ||
    param === "price"
  ) {
    status = 400;
    clientError =
      "Stripe price was not found for this account. Check STRIPE_SHARPZ_PRO_PRICE_ID (Price ID, live vs test).";
  } else if (rawType === "invalid_request_error") {
    status = 400;
    clientError =
      "Stripe rejected the checkout request. The Price ID must be a recurring subscription price.";
  } else if (rawType === "rate_limit_error") {
    status = 429;
    clientError = "Stripe is rate-limiting requests. Please try again in a moment.";
  } else if (rawType === "api_error") {
    status = 502;
    clientError = "Stripe is temporarily unavailable. Please try again.";
  } else if (typeof stripeFields?.statusCode === "number" && stripeFields.statusCode >= 400) {
    status = stripeFields.statusCode >= 500 ? 502 : stripeFields.statusCode;
  }

  if (process.env.NODE_ENV !== "production" && message) {
    clientError = `${clientError} (${message})`;
  }

  return NextResponse.json({ error: clientError }, { status });
}

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

  try {
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
  } catch (error) {
    logCheckoutStripeError(error, { userId: user.id, priceId });
    return checkoutErrorResponse(error);
  }
}
