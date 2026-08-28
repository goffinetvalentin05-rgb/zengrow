import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

/**
 * Auth cron Vercel / scheduled jobs.
 * Sans CRON_SECRET → refus (pas d’endpoint ouvert en prod).
 * Vercel envoie Authorization: Bearer $CRON_SECRET lorsque la variable est définie.
 */
export function assertCronAuthorized(request: NextRequest): NextResponse | null {
  const cronSecret = process.env.CRON_SECRET?.trim();
  if (!cronSecret) {
    console.error("[sharpz-cron] CRON_SECRET missing — refused");
    return NextResponse.json(
      { error: "CRON_SECRET non configuré. Route cron refusée." },
      { status: 503 },
    );
  }

  const authHeader = request.headers.get("authorization");
  const headerSecret = request.headers.get("x-cron-secret");
  const ok = authHeader === `Bearer ${cronSecret}` || headerSecret === cronSecret;
  if (!ok) {
    console.warn("[sharpz-cron] unauthorized request");
    return NextResponse.json({ error: "Non autorisé." }, { status: 401 });
  }
  return null;
}
