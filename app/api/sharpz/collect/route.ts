import { NextResponse } from "next/server";
import { z } from "zod";
import { ingestAnalyticsEvent } from "@/src/lib/sharpz/analytics";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

const collectSchema = z.object({
  siteKey: z.string().min(8).max(64),
  sessionId: z.string().min(4).max(64),
  visitorId: z.string().min(4).max(64),
  eventType: z.enum(["pageview", "custom"]).optional(),
  path: z.string().max(500).optional(),
  referrer: z.string().max(500).optional(),
  utmSource: z.string().max(120).optional(),
  utmMedium: z.string().max(120).optional(),
  utmCampaign: z.string().max(120).optional(),
});

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON." }, { status: 400, headers: corsHeaders });
  }

  const parsed = collectSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Payload invalide." }, { status: 400, headers: corsHeaders });
  }

  try {
    const result = await ingestAnalyticsEvent(request, parsed.data);
    if (!result.ok) {
      return NextResponse.json({ error: "Collecte refusée." }, { status: result.status, headers: corsHeaders });
    }
    return new NextResponse(null, { status: 204, headers: corsHeaders });
  } catch {
    return NextResponse.json({ error: "Collecte indisponible." }, { status: 503, headers: corsHeaders });
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: corsHeaders,
  });
}
