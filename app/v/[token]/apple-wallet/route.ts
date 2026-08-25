import { NextResponse } from "next/server";
import { loadGiftVoucherPresentationByPublicToken } from "@/src/lib/gift-vouchers/branding";
import {
  appleWalletIssueMessage,
  canIssueAppleWalletPass,
  getAppleWalletIssueBlockReason,
} from "@/src/lib/gift-vouchers/wallet/eligibility";
import { AppleWalletNotConfiguredError, generateGiftVoucherPkpass } from "@/src/lib/gift-vouchers/wallet/generate-pkpass";
import { giftVoucherPassFilename } from "@/src/lib/gift-vouchers/wallet/pass-json";
import { getOrCreateWalletPass } from "@/src/lib/gift-vouchers/wallet/store";
import { consumePublicVoucherRateLimit } from "@/src/lib/gift-vouchers/public-rate-limit";
import { normalizeGiftVoucherPublicToken } from "@/src/lib/gift-vouchers/public-token";
import { getRequestOrigin } from "@/src/lib/site-url";
import { createAdminClient } from "@/src/lib/supabase/admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 30;

type RouteContext = {
  params: Promise<{ token: string }>;
};

function clientIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0]?.trim() || "unknown";
  return request.headers.get("x-real-ip")?.trim() || "unknown";
}

function htmlError(status: number, title: string, message: string) {
  const body = `<!doctype html>
<html lang="fr">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>${title}</title>
    <style>
      body { font-family: ui-sans-serif, system-ui, sans-serif; background: #f8fafc; color: #0f172a; margin: 0; padding: 48px 20px; }
      main { max-width: 28rem; margin: 0 auto; background: #fff; border: 1px solid #e2e8f0; border-radius: 24px; padding: 28px; }
      h1 { font-size: 1.15rem; margin: 0 0 8px; }
      p { margin: 0; color: #64748b; line-height: 1.5; }
    </style>
  </head>
  <body>
    <main>
      <h1>${title}</h1>
      <p>${message}</p>
    </main>
  </body>
</html>`;
  return new NextResponse(body, {
    status,
    headers: { "Content-Type": "text/html; charset=utf-8", "Cache-Control": "no-store" },
  });
}

export async function GET(request: Request, context: RouteContext) {
  if (!consumePublicVoucherRateLimit(`wallet:${clientIp(request)}`)) {
    return htmlError(429, "Trop de tentatives", "Réessayez dans un instant.");
  }

  const { token: rawToken } = await context.params;
  const token = normalizeGiftVoucherPublicToken(rawToken);
  if (!token) {
    return htmlError(404, "Bon introuvable", "Le lien est invalide ou n’est plus actif.");
  }

  let admin;
  try {
    admin = createAdminClient();
  } catch {
    return htmlError(503, "Configuration incomplète", "Apple Wallet n’est pas encore configuré sur le serveur.");
  }

  const presentation = await loadGiftVoucherPresentationByPublicToken(admin, token);
  if (!presentation) {
    return htmlError(404, "Bon introuvable", "Le lien est invalide ou n’est plus actif.");
  }

  const block = getAppleWalletIssueBlockReason(presentation);
  if (block || !canIssueAppleWalletPass(presentation)) {
    return htmlError(409, "Pass indisponible", appleWalletIssueMessage(block ?? "not_found"));
  }

  let authenticationToken: string | null = null;
  try {
    const passRow = await getOrCreateWalletPass(admin, {
      voucherId: presentation.voucherId,
      restaurantId: presentation.restaurantId,
      serialNumber: presentation.voucherId,
    });
    authenticationToken = passRow.authentication_token;
  } catch (error) {
    console.error("[gift-vouchers/wallet] persist pass", error);
  }

  try {
    const origin = getRequestOrigin(request.headers);
    const buffer = await generateGiftVoucherPkpass({
      presentation,
      origin,
      authenticationToken,
    });
    const filename = giftVoucherPassFilename(presentation.code);
    return new NextResponse(new Uint8Array(buffer), {
      status: 200,
      headers: {
        "Content-Type": "application/vnd.apple.pkpass",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Content-Length": String(buffer.byteLength),
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    if (error instanceof AppleWalletNotConfiguredError) {
      return htmlError(
        503,
        "Apple Wallet n’est pas encore configuré",
        "Les certificats Apple Developer n’ont pas encore été ajoutés au serveur. Le PDF et la page du bon restent disponibles.",
      );
    }
    console.error("[gift-vouchers/wallet] generate", error);
    return htmlError(500, "Impossible de créer le pass", "Réessayez dans un instant.");
  }
}
