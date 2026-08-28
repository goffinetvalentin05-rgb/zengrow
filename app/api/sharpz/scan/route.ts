import { NextResponse } from "next/server";
import { parseJson, requireSharpzApi } from "@/src/lib/sharpz/api-session";
import { extractWebsite, WebsiteExtractError } from "@/src/lib/sharpz/website-extract";
import { enrichScanWithAI, scanFromExtractOnly } from "@/src/lib/sharpz/scan";
import { runAIGeneration } from "@/src/lib/ai/route-auth";

export const maxDuration = 60;

export async function POST(request: Request) {
  const session = await requireSharpzApi();
  if (!session.ok) return session.error;
  const { supabase, user, restaurant } = session;

  const body = await parseJson<{ url?: string }>(request);
  const url = body?.url?.trim();
  if (!url) {
    return NextResponse.json({ error: "URL requise." }, { status: 400 });
  }

  try {
    const extract = await extractWebsite(url);
    let scan;
    try {
      scan = await runAIGeneration({
        supabase,
        user,
        restaurant,
        feature: "sharpz_scan",
        input: url,
        generate: () => enrichScanWithAI(extract),
      });
    } catch {
      scan = scanFromExtractOnly(extract);
    }
    return NextResponse.json({ scan });
  } catch (error) {
    const message = error instanceof WebsiteExtractError ? error.message : "Impossible d’analyser ce site.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
