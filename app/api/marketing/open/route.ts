import { NextRequest, NextResponse } from "next/server";
import { verifyMarketingRecipientOpenToken } from "@/src/lib/marketing/open-pixel-token";
import { createAdminClient } from "@/src/lib/supabase/admin";

/** Pixel 1×1 : enregistre la première ouverture d’un e-mail de campagne. */
export async function GET(request: NextRequest) {
  const id = request.nextUrl.searchParams.get("id") ?? "";
  const token = request.nextUrl.searchParams.get("t") ?? "";

  if (!id || !verifyMarketingRecipientOpenToken(id, token)) {
    return transparentPixel();
  }

  const supabase = createAdminClient();
  const now = new Date().toISOString();

  const { data: row } = await supabase
    .from("email_campaign_recipients")
    .select("opened_at")
    .eq("id", id)
    .maybeSingle();

  if (row && row.opened_at == null) {
    await supabase.from("email_campaign_recipients").update({ opened_at: now }).eq("id", id);
  }

  return transparentPixel();
}

function transparentPixel() {
  const body = Buffer.from(
    "R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7",
    "base64",
  );
  return new NextResponse(body, {
    status: 200,
    headers: {
      "Content-Type": "image/gif",
      "Content-Length": String(body.length),
      "Cache-Control": "no-store, no-cache, must-revalidate, private",
    },
  });
}
