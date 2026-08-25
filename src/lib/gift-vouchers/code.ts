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

function defaultRandomBytes(): Uint8Array {
  const bytes = new Uint8Array(8);
  crypto.getRandomValues(bytes);
  return bytes;
}
