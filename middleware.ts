import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import {
  isLocale,
  localeCookieOptions,
  localeFromAcceptLanguage,
  LOCALE_COOKIE,
} from "@/src/i18n/locale";
import { isLearnAppPath, isLearnOnboardingPath, LEARN_ROUTES } from "@/src/lib/learn/routes";

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

function redirectTo(request: NextRequest, pathname: string) {
  return withLocaleCookie(request, NextResponse.redirect(new URL(pathname, request.url)));
}

export async function middleware(request: NextRequest) {
  const response = withLocaleCookie(
    request,
    NextResponse.next({
      request: { headers: request.headers },
    }),
  );

  const pathname = request.nextUrl.pathname;
  const needsSession = isLearnAppPath(pathname) || isLearnOnboardingPath(pathname);
  const isAuthScreen =
    pathname === LEARN_ROUTES.login ||
    pathname === LEARN_ROUTES.signup ||
    pathname === LEARN_ROUTES.forgotPassword;

  if (!needsSession && !isAuthScreen) return response;

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!supabaseUrl || !supabaseAnonKey) return response;

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
    if (needsSession) return redirectTo(request, LEARN_ROUTES.login);
    return response;
  }

  const { data: profile, error } = await supabase
    .from("learner_profiles")
    .select("onboarding_completed")
    .eq("user_id", user.id)
    .maybeSingle();

  const completed = !error && profile?.onboarding_completed === true;

  if (isAuthScreen) {
    return redirectTo(request, completed ? LEARN_ROUTES.today : LEARN_ROUTES.onboarding);
  }

  if (isLearnOnboardingPath(pathname)) {
    if (completed) return redirectTo(request, LEARN_ROUTES.today);
    return response;
  }

  if (!completed) return redirectTo(request, LEARN_ROUTES.onboarding);
  return response;
}

export const config = {
  matcher: [
    "/",
    "/login",
    "/signup",
    "/forgot-password",
    "/update-password",
    "/onboarding",
    "/onboarding/:path*",
    "/today",
    "/today/:path*",
    "/library",
    "/library/:path*",
    "/review",
    "/review/:path*",
    "/week",
    "/week/:path*",
    "/progress",
    "/progress/:path*",
    "/settings",
    "/settings/:path*",
  ],
};
