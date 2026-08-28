import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { isOwnerEmail } from "@/src/lib/access";

export async function middleware(request: NextRequest) {
  const response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    return response;
  }

  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
      },
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const pathname = request.nextUrl.pathname;
  const isRestaurantPath = pathname.startsWith("/dashboard") || pathname === "/billing" || pathname.startsWith("/billing/");

  if (!isRestaurantPath) {
    return response;
  }

  if (!user) {
    return NextResponse.redirect(new URL("/pro/login", request.url));
  }

  const isBillingPage = pathname.startsWith("/billing");

  const { data: restaurant } = await supabase
    .from("restaurants")
    .select("id, subscription_status, trial_end_date, stripe_subscription_id")
    .eq("owner_id", user.id)
    .maybeSingle();

  if (!restaurant) {
    return response;
  }

  let status = restaurant.subscription_status;
  const trialEndDateMs = restaurant.trial_end_date ? new Date(restaurant.trial_end_date).getTime() : null;
  const shouldExpireTrial =
    status === "trial" && Boolean(trialEndDateMs && trialEndDateMs <= Date.now() && !restaurant.stripe_subscription_id);

  if (shouldExpireTrial) {
    status = "expired";
    await supabase.from("restaurants").update({ subscription_status: "expired" }).eq("id", restaurant.id);
  }

  if (status === "expired" && !isBillingPage && !isOwnerEmail(user.email)) {
    return NextResponse.redirect(new URL("/billing", request.url));
  }

  if (pathname.startsWith("/dashboard") && !pathname.startsWith("/dashboard/onboarding")) {
    const { data: saas, error: saasError } = await supabase
      .from("user_saas")
      .select("onboarding_completed")
      .eq("restaurant_id", restaurant.id)
      .maybeSingle();

    if (!saasError && (!saas || saas.onboarding_completed !== true)) {
      return NextResponse.redirect(new URL("/dashboard/onboarding", request.url));
    }
  }

  return response;
}

export const config = {
  matcher: ["/dashboard/:path*", "/billing"],
};
