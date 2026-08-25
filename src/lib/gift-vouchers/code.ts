const ALPHABET = "23456789ABCDEFGHJKLMNPQRSTUVWXYZ";
const CODE_PATTERN = /^ZG-[23456789ABCDEFGHJKLMNPQRSTUVWXYZ]{4}-[23456789ABCDEFGHJKLMNPQRSTUVWXYZ]{4}$/;

export function generateGiftVoucherCode(randomBytes: () => Uint8Array = defaultRandomBytes): string {
  const bytes = randomBytes();
  if (bytes.length < 8) {
    throw new Error("Not enough entropy to generate a gift voucher code.");
  }
  const chars = Array.from({ length: 8 }, (_, i) => ALPHABET[bytes[i]! % ALPHABET.length]);
  return `ZG-${chars.slice(0, 4).join("")}-${chars.slice(4).join("")}`;
}

export function isGiftVoucherCode(value: string): boolean {
  return CODE_PATTERN.test(value);
}

/** Normalise ZG-8K4M-2P7Q, zg 8k4m 2p7q, ZG8K4M2P7Q → format canonique. */
export function normalizeGiftVoucherCode(value: string): string | null {
  const compact = value.trim().toUpperCase().replace(/[\s-]/g, "");
  if (!compact.startsWith("ZG")) return null;
  const rest = compact.slice(2);
  if (!/^[23456789ABCDEFGHJKLMNPQRSTUVWXYZ]{8}$/.test(rest)) return null;
  return `ZG-${rest.slice(0, 4)}-${rest.slice(4)}`;
}

function defaultRandomBytes(): Uint8Array {
  const bytes = new Uint8Array(8);
  crypto.getRandomValues(bytes);
  return bytes;
}
