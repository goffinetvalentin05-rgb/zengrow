import { createHash, randomBytes, timingSafeEqual } from "node:crypto";
import type { SupabaseClient } from "@supabase/supabase-js";

export type GiftVoucherWalletPassRow = {
  id: string;
  voucher_id: string;
  restaurant_id: string;
  serial_number: string;
  authentication_token: string;
  last_updated_at: string;
};

export type GiftVoucherWalletDeviceRow = {
  id: string;
  pass_id: string;
  device_library_identifier: string;
  push_token: string;
};

export function generateWalletAuthenticationToken(): string {
  return randomBytes(32).toString("hex");
}

export function authenticationTokensMatch(expected: string, received: string): boolean {
  const left = Buffer.from(expected);
  const right = Buffer.from(received);
  if (left.length !== right.length || left.length === 0) {
    return expected.length === received.length && expected === received;
  }
  return timingSafeEqual(left, right);
}

export function parseApplePassAuthorization(header: string | null | undefined): string | null {
  if (!header) return null;
  const [scheme, token, ...rest] = header.trim().split(/\s+/);
  if (scheme !== "ApplePass" || !token || rest.length > 0) return null;
  return token;
}

export function walletLastUpdatedTag(iso: string = new Date().toISOString()): string {
  const time = new Date(iso).getTime();
  return Number.isFinite(time) ? String(time) : String(Date.now());
}

export function passUpdatedSince(lastUpdatedAt: string, passesUpdatedSince: string | null): boolean {
  if (!passesUpdatedSince) return true;
  const current = walletLastUpdatedTag(lastUpdatedAt);
  if (/^\d+$/.test(passesUpdatedSince) && /^\d+$/.test(current)) {
    return Number(current) > Number(passesUpdatedSince);
  }
  return current !== passesUpdatedSince;
}

export async function getOrCreateWalletPass(
  admin: SupabaseClient,
  params: { voucherId: string; restaurantId: string; serialNumber: string },
): Promise<GiftVoucherWalletPassRow> {
  const { data: existing } = await admin
    .from("gift_voucher_wallet_passes")
    .select("id, voucher_id, restaurant_id, serial_number, authentication_token, last_updated_at")
    .eq("voucher_id", params.voucherId)
    .maybeSingle();

  if (existing) return existing as GiftVoucherWalletPassRow;

  const { data, error } = await admin
    .from("gift_voucher_wallet_passes")
    .insert({
      voucher_id: params.voucherId,
      restaurant_id: params.restaurantId,
      serial_number: params.serialNumber,
      authentication_token: generateWalletAuthenticationToken(),
    })
    .select("id, voucher_id, restaurant_id, serial_number, authentication_token, last_updated_at")
    .single();

  if (error || !data) {
    const { data: retry } = await admin
      .from("gift_voucher_wallet_passes")
      .select("id, voucher_id, restaurant_id, serial_number, authentication_token, last_updated_at")
      .eq("voucher_id", params.voucherId)
      .maybeSingle();
    if (retry) return retry as GiftVoucherWalletPassRow;
    throw error ?? new Error("Impossible d’enregistrer le pass Apple Wallet.");
  }

  return data as GiftVoucherWalletPassRow;
}

export async function getWalletPassBySerial(
  admin: SupabaseClient,
  serialNumber: string,
): Promise<GiftVoucherWalletPassRow | null> {
  const { data } = await admin
    .from("gift_voucher_wallet_passes")
    .select("id, voucher_id, restaurant_id, serial_number, authentication_token, last_updated_at")
    .eq("serial_number", serialNumber)
    .maybeSingle();
  return (data as GiftVoucherWalletPassRow | null) ?? null;
}

export async function touchWalletPassUpdatedAt(admin: SupabaseClient, voucherId: string): Promise<string | null> {
  const now = new Date().toISOString();
  const { data } = await admin
    .from("gift_voucher_wallet_passes")
    .update({ last_updated_at: now })
    .eq("voucher_id", voucherId)
    .select("last_updated_at")
    .maybeSingle();
  return (data?.last_updated_at as string | undefined) ?? null;
}

export async function registerWalletDevice(
  admin: SupabaseClient,
  params: { passId: string; deviceLibraryIdentifier: string; pushToken: string },
): Promise<void> {
  const { error } = await admin.from("gift_voucher_wallet_devices").upsert(
    {
      pass_id: params.passId,
      device_library_identifier: params.deviceLibraryIdentifier,
      push_token: params.pushToken,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "pass_id,device_library_identifier" },
  );
  if (error) throw error;
}

export async function unregisterWalletDevice(
  admin: SupabaseClient,
  params: { passId: string; deviceLibraryIdentifier: string },
): Promise<void> {
  await admin
    .from("gift_voucher_wallet_devices")
    .delete()
    .eq("pass_id", params.passId)
    .eq("device_library_identifier", params.deviceLibraryIdentifier);
}

export async function listUpdatedSerialsForDevice(
  admin: SupabaseClient,
  params: { deviceLibraryIdentifier: string; passesUpdatedSince: string | null },
): Promise<{ lastUpdated: string; serialNumbers: string[] }> {
  const { data: devices, error: deviceError } = await admin
    .from("gift_voucher_wallet_devices")
    .select("pass_id")
    .eq("device_library_identifier", params.deviceLibraryIdentifier);

  if (deviceError) throw deviceError;
  const passIds = [...new Set((devices ?? []).map((row) => (row as { pass_id: string }).pass_id).filter(Boolean))];
  if (passIds.length === 0) {
    return { lastUpdated: String(Date.now()), serialNumbers: [] };
  }

  const { data: passes, error: passError } = await admin
    .from("gift_voucher_wallet_passes")
    .select("serial_number, last_updated_at")
    .in("id", passIds);

  if (passError) throw passError;

  const serialNumbers: string[] = [];
  let latest = 0;
  for (const pass of (passes ?? []) as { serial_number: string; last_updated_at: string }[]) {
    const tag = Number(walletLastUpdatedTag(pass.last_updated_at));
    if (tag > latest) latest = tag;
    if (passUpdatedSince(pass.last_updated_at, params.passesUpdatedSince)) {
      serialNumbers.push(pass.serial_number);
    }
  }

  return {
    lastUpdated: String(latest || Date.now()),
    serialNumbers,
  };
}

export async function listPushTokensForVoucher(
  admin: SupabaseClient,
  voucherId: string,
): Promise<string[]> {
  const { data: pass } = await admin
    .from("gift_voucher_wallet_passes")
    .select("id")
    .eq("voucher_id", voucherId)
    .maybeSingle();
  if (!pass?.id) return [];

  const { data } = await admin
    .from("gift_voucher_wallet_devices")
    .select("push_token")
    .eq("pass_id", pass.id);

  return (data ?? [])
    .map((row) => (row as { push_token?: string }).push_token?.trim() ?? "")
    .filter(Boolean);
}

export function hashForLog(value: string): string {
  return createHash("sha256").update(value).digest("hex").slice(0, 12);
}
