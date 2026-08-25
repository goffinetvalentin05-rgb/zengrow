export const DEFAULT_GIFT_VOUCHER_VALIDITY_MONTHS = 12;
export const DEFAULT_GIFT_VOUCHER_SUGGESTED_AMOUNTS = [50, 100, 150] as const;
export const MIN_GIFT_VOUCHER_VALIDITY_MONTHS = 1;
export const MAX_GIFT_VOUCHER_VALIDITY_MONTHS = 60;
export const MAX_GIFT_VOUCHER_SUGGESTED_AMOUNTS = 8;

export function clampGiftVoucherValidityMonths(value: unknown): number {
  const numeric = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(numeric)) return DEFAULT_GIFT_VOUCHER_VALIDITY_MONTHS;
  return Math.min(
    MAX_GIFT_VOUCHER_VALIDITY_MONTHS,
    Math.max(MIN_GIFT_VOUCHER_VALIDITY_MONTHS, Math.round(numeric)),
  );
}

export function parseSuggestedGiftVoucherAmounts(raw: unknown): number[] {
  const values = Array.isArray(raw)
    ? raw
    : typeof raw === "string"
      ? raw.split(/[,;/|\s]+/)
      : [];
  const amounts: number[] = [];
  for (const value of values) {
    const numeric = typeof value === "number" ? value : Number(String(value).trim().replace(",", "."));
    if (!Number.isFinite(numeric)) continue;
    const rounded = Math.round(numeric);
    if (rounded < 1 || rounded > 10_000) continue;
    if (!amounts.includes(rounded)) amounts.push(rounded);
    if (amounts.length >= MAX_GIFT_VOUCHER_SUGGESTED_AMOUNTS) break;
  }
  return amounts.length > 0 ? amounts : [...DEFAULT_GIFT_VOUCHER_SUGGESTED_AMOUNTS];
}

export function formatSuggestedGiftVoucherAmounts(amounts: number[]): string {
  return parseSuggestedGiftVoucherAmounts(amounts).join(" / ");
}

/** Date d’expiration YYYY-MM-DD pour un nouveau bon, à partir d’aujourd’hui. */
export function defaultGiftVoucherExpiryDate(
  months: number,
  from: Date = new Date(),
): string {
  const safeMonths = clampGiftVoucherValidityMonths(months);
  const date = new Date(from.getTime());
  date.setUTCHours(12, 0, 0, 0);
  date.setUTCMonth(date.getUTCMonth() + safeMonths);
  return date.toISOString().slice(0, 10);
}
