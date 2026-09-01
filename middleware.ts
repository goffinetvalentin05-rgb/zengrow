import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { DISCOVERY_ROUTES, isDiscoveryAuthPath } from "@/src/lib/discovery/routes";

export async function middleware(request: NextRequest) {
  const response = NextResponse.next({
    request: { headers: request.headers },
  });

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

  const pathname = request.nextUrl.pathname;
  const isLegacyApp = pathname.startsWith("/dashboard") || pathname === "/billing" || pathname.startsWith("/billing/");
  const needsAuth = isDiscoveryAuthPath(pathname) || isLegacyApp;

  if (!needsAuth) return response;

  if (!user) {
    return NextResponse.redirect(new URL(DISCOVERY_ROUTES.login, request.url));
  }

  if (isLegacyApp) {
    return NextResponse.redirect(new URL(DISCOVERY_ROUTES.explore, request.url));
  }

  if (pathname !== DISCOVERY_ROUTES.onboarding && !pathname.startsWith(`${DISCOVERY_ROUTES.onboarding}/`)) {
    const { data: profile, error } = await supabase
      .from("profiles")
      .select("id, onboarding_completed, username, profile_type")
      .eq("user_id", user.id)
      .maybeSingle();
    if (error) return response;
    if (!profile) {
      return NextResponse.redirect(new URL(DISCOVERY_ROUTES.onboarding, request.url));
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
    return NextResponse.redirect(new URL(DISCOVERY_ROUTES.onboarding, request.url));
  }

  return response;
}

export const config = {
  matcher: [
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
    "/onboarding/:path*",
    "/onboarding",
    "/search/:path*",
    "/search",
    "/admin/:path*",
    "/admin",
  ],
};
