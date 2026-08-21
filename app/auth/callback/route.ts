import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { logFitmeOAuth } from "@/src/lib/fitme/oauth";

export async function GET(request: NextRequest) {
  const url = request.nextUrl;
  const origin = url.origin;
  const code = url.searchParams.get("code");
  const oauthError = url.searchParams.get("error");
  const loginError = new URL("/login?error=oauth", origin);
  const startUrl = new URL("/start", origin);

  logFitmeOAuth("callback:received", {
    origin,
    pathname: url.pathname,
    hasCode: Boolean(code),
    hasError: Boolean(oauthError),
  });

  if (oauthError || !code) {
    logFitmeOAuth("callback:missing-code-or-error", { oauthError: oauthError ?? null });
    return NextResponse.redirect(loginError);
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!supabaseUrl || !supabaseAnonKey) {
    logFitmeOAuth("callback:missing-supabase-env");
    return NextResponse.redirect(loginError);
  }

  const redirectResponse = NextResponse.redirect(startUrl);

  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value, options }) => {
          redirectResponse.cookies.set(name, value, options);
        });
      },
    },
  });

  const { error } = await supabase.auth.exchangeCodeForSession(code);
  if (error) {
    logFitmeOAuth("callback:exchange-failed", { message: error.message });
    return NextResponse.redirect(loginError);
  }

  logFitmeOAuth("callback:exchange-ok", { destination: "/start" });
  return redirectResponse;
}
