import { createHmac, timingSafeEqual } from "node:crypto";

function secret(): string {
  return (
    process.env.MARKETING_OPEN_SECRET?.trim() ||
    process.env.CRON_SECRET?.trim() ||
    ""
  );
}

export function signMarketingRecipientOpenToken(recipientId: string): string {
  const s = secret();
  if (!s) return "";
  return createHmac("sha256", s).update(recipientId).digest("hex");
}

export function verifyMarketingRecipientOpenToken(recipientId: string, token: string): boolean {
  const expected = signMarketingRecipientOpenToken(recipientId);
  if (!expected || !token || token.length !== expected.length) return false;
  if (!/^[0-9a-f]+$/i.test(token) || !/^[0-9a-f]+$/i.test(expected)) return false;
  try {
    return timingSafeEqual(Buffer.from(expected, "hex"), Buffer.from(token, "hex"));
  } catch {
    return false;
  }
}
