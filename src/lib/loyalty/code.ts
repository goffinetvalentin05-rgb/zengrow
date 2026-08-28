import {
  generateGiftVoucherCode,
  isGiftVoucherCode,
  normalizeGiftVoucherCode,
} from "@/src/lib/gift-vouchers/code";
import {
  generateGiftVoucherPublicToken,
  isGiftVoucherPublicToken,
  normalizeGiftVoucherPublicToken,
} from "@/src/lib/gift-vouchers/public-token";

export function generateLoyaltyCardCode(randomBytes?: () => Uint8Array): string {
  return generateGiftVoucherCode(randomBytes);
}

export function isLoyaltyCardCode(value: string): boolean {
  return isGiftVoucherCode(value);
}

export function normalizeLoyaltyCardCode(value: string): string | null {
  return normalizeGiftVoucherCode(value);
}

export function generateLoyaltyPublicToken(randomBytes?: () => Uint8Array): string {
  return generateGiftVoucherPublicToken(randomBytes);
}

export function isLoyaltyPublicToken(value: string): boolean {
  return isGiftVoucherPublicToken(value);
}

export function normalizeLoyaltyPublicToken(value: string): string | null {
  return normalizeGiftVoucherPublicToken(value);
}

export function resolveScannedLoyaltyPayload(
  raw: string,
): { kind: "token"; value: string } | { kind: "code"; value: string } | null {
  const trimmed = raw.trim();
  if (!trimmed) return null;

  const fromUrl = parseFromMaybeUrl(trimmed);
  if (fromUrl) return fromUrl;

  const token = normalizeLoyaltyPublicToken(trimmed);
  if (token) return { kind: "token", value: token };

  const code = normalizeLoyaltyCardCode(trimmed);
  return code ? { kind: "code", value: code } : null;
}

function parseFromMaybeUrl(
  value: string,
): { kind: "token"; value: string } | { kind: "code"; value: string } | null {
  try {
    const url = new URL(value);
    const token =
      normalizeLoyaltyPublicToken(url.searchParams.get("token") ?? "") ||
      normalizeLoyaltyPublicToken(url.searchParams.get("card") ?? "");
    if (token) return { kind: "token", value: token };
    const code =
      normalizeLoyaltyCardCode(url.searchParams.get("code") ?? "") ||
      normalizeLoyaltyCardCode(url.pathname.split("/").filter(Boolean).at(-1) ?? "");
    if (code) return { kind: "code", value: code };
    const pathToken = url.pathname.match(/([0-9a-f]{64})/i)?.[1];
    const normalizedPathToken = pathToken ? normalizeLoyaltyPublicToken(pathToken) : null;
    if (normalizedPathToken) return { kind: "token", value: normalizedPathToken };
    return null;
  } catch {
    return null;
  }
}
