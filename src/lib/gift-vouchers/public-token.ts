import { getPublicSiteUrl } from "@/src/lib/site-url";

export const GIFT_VOUCHER_PUBLIC_TOKEN_BYTES = 32;
export const GIFT_VOUCHER_PUBLIC_TOKEN_PATTERN = /^[0-9a-f]{64}$/;

export function generateGiftVoucherPublicToken(
  randomBytes: () => Uint8Array = defaultRandomBytes,
): string {
  const bytes = randomBytes();
  if (bytes.length < GIFT_VOUCHER_PUBLIC_TOKEN_BYTES) {
    throw new Error("Not enough entropy to generate a gift voucher public token.");
  }
  return Array.from(bytes.slice(0, GIFT_VOUCHER_PUBLIC_TOKEN_BYTES), (byte) =>
    byte.toString(16).padStart(2, "0"),
  ).join("");
}

export function isGiftVoucherPublicToken(value: string): boolean {
  return GIFT_VOUCHER_PUBLIC_TOKEN_PATTERN.test(value.trim().toLowerCase());
}

export function normalizeGiftVoucherPublicToken(value: string): string | null {
  const token = value.trim().toLowerCase();
  return isGiftVoucherPublicToken(token) ? token : null;
}

export function giftVoucherPublicPath(token: string): string {
  return `/v/${token}`;
}

export function giftVoucherPublicUrl(token: string, origin: string = getPublicSiteUrl()): string {
  const base = origin.replace(/\/$/, "");
  if (!base) return giftVoucherPublicPath(token);
  return `${base}${giftVoucherPublicPath(token)}`;
}

const PUBLIC_PATH_PATTERN = /\/v\/([0-9a-fA-F]{64})(?:\/)?(?:[?#].*)?$/;

/** Extrait un token depuis une URL /v/[token], un chemin, ou un token brut. */
export function parseGiftVoucherQrPayload(raw: string): string | null {
  const trimmed = raw.trim();
  if (!trimmed) return null;

  const fromUrl = parseTokenFromMaybeUrl(trimmed);
  if (fromUrl) return fromUrl;

  return normalizeGiftVoucherPublicToken(trimmed);
}

function parseTokenFromMaybeUrl(value: string): string | null {
  try {
    const url = new URL(value);
    const match = url.pathname.match(PUBLIC_PATH_PATTERN);
    return match?.[1] ? normalizeGiftVoucherPublicToken(match[1]) : null;
  } catch {
    const pathMatch = value.match(PUBLIC_PATH_PATTERN);
    return pathMatch?.[1] ? normalizeGiftVoucherPublicToken(pathMatch[1]) : null;
  }
}

function defaultRandomBytes(): Uint8Array {
  const bytes = new Uint8Array(GIFT_VOUCHER_PUBLIC_TOKEN_BYTES);
  crypto.getRandomValues(bytes);
  return bytes;
}
