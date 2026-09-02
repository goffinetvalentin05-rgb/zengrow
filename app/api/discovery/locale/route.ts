import { NextResponse } from "next/server";
import { getDiscoveryApiSession, isApiError } from "@/src/lib/discovery/api-session";
import { isLocale, localeCookieOptions, LOCALE_COOKIE } from "@/src/i18n/locale";
import { createClient } from "@/src/lib/supabase/server";

export async function POST(request: Request) {
  const body = (await request.json().catch(() => ({}))) as { locale?: string };
  if (!isLocale(body.locale)) {
    return NextResponse.json({ error: "Invalid locale." }, { status: 400 });
  }

  const response = NextResponse.json({ ok: true, locale: body.locale });
  response.cookies.set(LOCALE_COOKIE, body.locale, localeCookieOptions());

  const session = await getDiscoveryApiSession();
  if (isApiError(session)) return response;

  const supabase = await createClient();
  await supabase.from("profiles").update({ preferred_language: body.locale }).eq("id", session.profile.id);
  return response;
}
