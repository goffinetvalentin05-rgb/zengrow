import { centsToChf } from "@/src/lib/gift-vouchers/money";

/** Caractères hors Latin-1 qui font échouer @react-pdf/renderer (glyphe introuvable). */
export function pdfSafeText(value: string): string {
  return value
    .replace(/\u00a0|\u202F|\u2007/g, " ")
    .replace(/[\u2018\u2019\u201A\u2032]/g, "'")
    .replace(/[\u201C\u201D\u201E\u2033]/g, '"')
    .replace(/[\u2013\u2014\u2212]/g, "-")
    .replace(/\u2026/g, "...")
    .replace(/[^\u0009\u000A\u000D\u0020-\u007E\u00A0-\u00FF]/g, "?");
}

export function formatCentsAsChfPdf(cents: number): string {
  const amount = centsToChf(cents);
  const [whole, fraction = "00"] = amount.toFixed(2).split(".");
  const grouped = whole.replace(/\B(?=(\d{3})+(?!\d))/g, " ");
  return `${grouped}.${fraction} CHF`;
}
