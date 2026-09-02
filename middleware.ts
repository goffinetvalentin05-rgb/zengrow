import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { DISCOVERY_ROUTES, isDiscoveryAuthPath } from "@/src/lib/discovery/routes";
import {
  isLocale,
  localeCookieOptions,
  localeFromAcceptLanguage,
  LOCALE_COOKIE,
} from "@/src/i18n/locale";

function withLocaleCookie(request: NextRequest, response: NextResponse) {
  const existing =
    request.cookies.get(LOCALE_COOKIE)?.value ??
    request.cookies.get("sharpz_dashboard_locale")?.value ??
    request.cookies.get("zengrow-landing-locale")?.value;
  if (isLocale(existing)) {
    if (!request.cookies.get(LOCALE_COOKIE)?.value) {
      response.cookies.set(LOCALE_COOKIE, existing, localeCookieOptions());
    }
    return response;
  }
  const detected = localeFromAcceptLanguage(request.headers.get("accept-language"));
  response.cookies.set(LOCALE_COOKIE, detected, localeCookieOptions());
  return response;
}

export async function middleware(request: NextRequest) {
  const response = withLocaleCookie(
    request,
    NextResponse.next({
      request: { headers: request.headers },
    }),
  );

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!supabaseUrl || !supabaseAnonKey) return response;

  const pathname = request.nextUrl.pathname;
  const isLegacyApp = pathname.startsWith("/dashboard") || pathname === "/billing" || pathname.startsWith("/billing/");
  const needsAuth = isDiscoveryAuthPath(pathname) || isLegacyApp;

  if (!needsAuth) return response;

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

  if (!user) {
    const redirect = NextResponse.redirect(new URL(DISCOVERY_ROUTES.login, request.url));
    return withLocaleCookie(request, redirect);
  }

  if (isLegacyApp) {
    const redirect = NextResponse.redirect(new URL(DISCOVERY_ROUTES.explore, request.url));
    return withLocaleCookie(request, redirect);
  }

  if (pathname !== DISCOVERY_ROUTES.onboarding && !pathname.startsWith(`${DISCOVERY_ROUTES.onboarding}/`)) {
    const { data: profile, error } = await supabase
      .from("profiles")
      .select("id, onboarding_completed, username, profile_type, preferred_language")
      .eq("user_id", user.id)
      .maybeSingle();
    if (error) return response;
    if (profile && isLocale(profile.preferred_language) && !request.cookies.get(LOCALE_COOKIE)?.value) {
      response.cookies.set(LOCALE_COOKIE, profile.preferred_language, localeCookieOptions());
    }
    if (!profile) {
      const redirect = NextResponse.redirect(new URL(DISCOVERY_ROUTES.onboarding, request.url));
      return withLocaleCookie(request, redirect);
    }
    if (profile.onboarding_completed === true) return response;
    if (profile.username && profile.profile_type) {
      const { count } = await supabase
        .from("profile_categories")
        .select("id", { count: "exact", head: true })
        .eq("profile_id", profile.id);
      if ((count ?? 0) > 0) {
        await supabase
          .from("profiles")
          .update({
            onboarding_completed: true,
            onboarding_completed_at: new Date().toISOString(),
            onboarding_step: "done",
          })
          .eq("id", profile.id);
        return response;
      }
    }
    const redirect = NextResponse.redirect(new URL(DISCOVERY_ROUTES.onboarding, request.url));
    return withLocaleCookie(request, redirect);
  }

  return response;
}

export const config = {
  matcher: [
    "/",
    "/pro/:path*",
    "/update-password",
    "/onboarding/:path*",
    "/onboarding",
    "/dashboard/:path*",
    "/billing",
    "/explore/:path*",
    "/explore",
    "/following/:path*",
    "/following",
    "/saved/:path*",
    "/saved",
    "/me/:path*",
    "/me",
    "/analytics/:path*",
    "/analytics",
    "/settings/:path*",
    "/settings",
    "/search/:path*",
    "/search",
    "/admin/:path*",
    "/admin",
    "/u/:path*",
    "/:username",
    "/:username/:source",
  ],
};
