import { NextResponse } from "next/server";
import { createAdminClient } from "@/src/lib/supabase/admin";
import { loadGiftVoucherPresentation } from "@/src/lib/gift-vouchers/branding";
import { getPublicSiteUrl } from "@/src/lib/site-url";
import { isAppleWalletPassType } from "@/src/lib/gift-vouchers/wallet/config";
import { generateGiftVoucherPkpass } from "@/src/lib/gift-vouchers/wallet/generate-pkpass";
import { giftVoucherPassFilename } from "@/src/lib/gift-vouchers/wallet/pass-json";
import {
  authenticationTokensMatch,
  getWalletPassBySerial,
  listUpdatedSerialsForDevice,
  parseApplePassAuthorization,
  registerWalletDevice,
  unregisterWalletDevice,
  walletLastUpdatedTag,
} from "@/src/lib/gift-vouchers/wallet/store";

function unauthorized() {
  return new NextResponse(null, { status: 401 });
}

async function requirePass(serialNumber: string, authorization: string | null) {
  const token = parseApplePassAuthorization(authorization);
  if (!token) return { ok: false as const, response: unauthorized() };
  const admin = createAdminClient();
  const pass = await getWalletPassBySerial(admin, serialNumber);
  if (!pass || !authenticationTokensMatch(pass.authentication_token, token)) {
    return { ok: false as const, response: unauthorized() };
  }
  return { ok: true as const, admin, pass };
}

export async function handleWalletRegister(params: {
  deviceLibraryIdentifier: string;
  passTypeIdentifier: string;
  serialNumber: string;
  authorization: string | null;
  body: unknown;
}) {
  if (!isAppleWalletPassType(params.passTypeIdentifier)) return unauthorized();
  const ctx = await requirePass(params.serialNumber, params.authorization);
  if (!ctx.ok) return ctx.response;

  const pushToken =
    params.body && typeof params.body === "object" && "pushToken" in params.body
      ? String((params.body as { pushToken?: unknown }).pushToken ?? "").trim()
      : "";
  if (!pushToken) {
    return NextResponse.json({ error: "pushToken manquant." }, { status: 400 });
  }

  await registerWalletDevice(ctx.admin, {
    passId: ctx.pass.id,
    deviceLibraryIdentifier: params.deviceLibraryIdentifier,
    pushToken,
  });
  return new NextResponse(null, { status: 201 });
}

export async function handleWalletUnregister(params: {
  deviceLibraryIdentifier: string;
  passTypeIdentifier: string;
  serialNumber: string;
  authorization: string | null;
}) {
  if (!isAppleWalletPassType(params.passTypeIdentifier)) return unauthorized();
  const ctx = await requirePass(params.serialNumber, params.authorization);
  if (!ctx.ok) return ctx.response;
  await unregisterWalletDevice(ctx.admin, {
    passId: ctx.pass.id,
    deviceLibraryIdentifier: params.deviceLibraryIdentifier,
  });
  return new NextResponse(null, { status: 200 });
}

export async function handleWalletUpdatedSerials(params: {
  deviceLibraryIdentifier: string;
  passTypeIdentifier: string;
  passesUpdatedSince: string | null;
}) {
  if (!isAppleWalletPassType(params.passTypeIdentifier)) return unauthorized();
  const admin = createAdminClient();
  const result = await listUpdatedSerialsForDevice(admin, {
    deviceLibraryIdentifier: params.deviceLibraryIdentifier,
    passesUpdatedSince: params.passesUpdatedSince,
  });
  if (result.serialNumbers.length === 0) {
    return new NextResponse(null, { status: 204 });
  }
  return NextResponse.json({
    lastUpdated: result.lastUpdated,
    serialNumbers: result.serialNumbers,
  });
}

export async function handleWalletGetLatestPass(params: {
  passTypeIdentifier: string;
  serialNumber: string;
  authorization: string | null;
  ifModifiedSince: string | null;
}) {
  if (!isAppleWalletPassType(params.passTypeIdentifier)) return unauthorized();
  const ctx = await requirePass(params.serialNumber, params.authorization);
  if (!ctx.ok) return ctx.response;

  const lastModified = new Date(ctx.pass.last_updated_at);
  if (params.ifModifiedSince) {
    const since = new Date(params.ifModifiedSince);
    if (!Number.isNaN(since.getTime()) && lastModified.getTime() <= since.getTime()) {
      return new NextResponse(null, { status: 304 });
    }
  }

  const presentation = await loadGiftVoucherPresentation(
    ctx.admin,
    ctx.pass.restaurant_id,
    ctx.pass.voucher_id,
  );
  if (!presentation) return new NextResponse(null, { status: 404 });

  const origin = getPublicSiteUrl();
  const buffer = await generateGiftVoucherPkpass({
    presentation,
    origin,
    authenticationToken: ctx.pass.authentication_token,
  });

  return new NextResponse(new Uint8Array(buffer), {
    status: 200,
    headers: {
      "Content-Type": "application/vnd.apple.pkpass",
      "Content-Disposition": `attachment; filename="${giftVoucherPassFilename(presentation.code)}"`,
      "Last-Modified": lastModified.toUTCString(),
      "Cache-Control": "no-store",
      "X-Wallet-Last-Updated": walletLastUpdatedTag(ctx.pass.last_updated_at),
    },
  });
}

export async function handleWalletLog(body: unknown) {
  if (body && typeof body === "object" && "logs" in body) {
    const logs = (body as { logs?: unknown }).logs;
    if (Array.isArray(logs)) {
      for (const line of logs.slice(0, 20)) {
        if (typeof line === "string") console.info("[apple-wallet]", line);
      }
    }
  }
  return new NextResponse(null, { status: 200 });
}
