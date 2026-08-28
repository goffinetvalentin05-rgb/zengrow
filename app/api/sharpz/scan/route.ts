import { NextResponse } from "next/server";
import { parseJson, requireSharpzApi } from "@/src/lib/sharpz/api-session";
import { extractWebsite, WebsiteExtractError } from "@/src/lib/sharpz/website-extract";
import { enrichScanWithAI, scanFromExtractOnly } from "@/src/lib/sharpz/scan";

export async function POST(request: Request) {
  const session = await requireSharpzApi();
  if (!session.ok) return session.error;

  const body = await parseJson<{ url?: string }>(request);
  const url = body?.url?.trim();
  if (!url) {
    return NextResponse.json({ error: "URL requise." }, { status: 400 });
  }

  try {
    const extract = await extractWebsite(url);
    let scan;
    try {
      scan = await enrichScanWithAI(extract);
    } catch {
      scan = scanFromExtractOnly(extract);
    }
    return NextResponse.json({ scan });
  } catch (error) {
    const message = error instanceof WebsiteExtractError ? error.message : "Impossible d’analyser ce site.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
