import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { ensureDiscoveryProfile } from "@/src/lib/discovery/auth";
import { isLocale, localeCookieOptions, LOCALE_COOKIE } from "@/src/i18n/locale";
import { createClient } from "@/src/lib/supabase/server";

export async function POST() {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.getUser();
    if (error || !data.user) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    const profile = await ensureDiscoveryProfile(data.user);
    const store = await cookies();
    const cookieLocale = store.get(LOCALE_COOKIE)?.value;
    let locale = profile.preferredLanguage;

    if (!locale && isLocale(cookieLocale)) {
      locale = cookieLocale;
      await supabase.from("profiles").update({ preferred_language: cookieLocale }).eq("id", profile.id);
    }

    const response = NextResponse.json({
      onboardingCompleted: profile.onboardingCompleted,
      username: profile.username,
      preferredLanguage: locale,
    });
    if (isLocale(locale)) {
      response.cookies.set(LOCALE_COOKIE, locale, localeCookieOptions());
    }
    return response;
  } catch (err) {
    const message = err instanceof Error ? err.message : "Bootstrap failed.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
