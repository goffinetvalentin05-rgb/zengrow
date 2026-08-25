const MAX_CHF = 10_000;
const TWO_DECIMALS_EPSILON = 1e-6;

export function chfToCents(chf: number): number {
  if (!Number.isFinite(chf) || chf <= 0) {
    throw new Error("Le montant doit être supérieur à 0.");
  }
  if (chf > MAX_CHF) {
    throw new Error("Le montant ne peut pas dépasser 10’000 CHF.");
  }
  const cents = Math.round(chf * 100);
  if (Math.abs(chf * 100 - cents) > TWO_DECIMALS_EPSILON) {
    throw new Error("Le montant ne peut pas avoir plus de deux décimales.");
  }
  return cents;
}

export function centsToChf(cents: number): number {
  return cents / 100;
}

export function formatChf(amount: number): string {
  return `${amount.toLocaleString("fr-CH")}\u00a0CHF`;
}

export function formatCentsAsChf(cents: number): string {
  return formatChf(centsToChf(cents));
}

export function formatAmountInput(value: number): string {
  return (Math.round(value * 100) / 100).toFixed(2);
}

function normalizeAmountString(value: string): string {
  return value.trim().replace(/\s/g, "").replace(/'/g, "").replace(",", ".");
}

export function parseAmountInput(value: string): number | null {
  const normalized = normalizeAmountString(value);
  if (!normalized || !/^\d+(\.\d{1,2})?$/.test(normalized)) return null;
  const amount = Number(normalized);
  if (!Number.isFinite(amount) || amount <= 0) return null;
  return Math.round(amount * 100) / 100;
}

export function validateAmountInput(
  value: string,
  balanceChf: number,
): { amount: number } | { error: string } {
  const trimmed = value.trim();
  if (!trimmed) return { error: "Le montant doit être supérieur à 0." };
  const normalized = normalizeAmountString(trimmed);
  if (/^\d+\.\d{3,}$/.test(normalized)) {
    return { error: "Le montant ne peut pas avoir plus de deux décimales." };
  }
  const amount = parseAmountInput(trimmed);
  if (amount == null) return { error: "Le montant doit être supérieur à 0." };
  if (amount > MAX_CHF) return { error: "Le montant ne peut pas dépasser 10’000 CHF." };
  const amountCents = Math.round(amount * 100);
  const balanceCents = Math.round(balanceChf * 100);
  if (amountCents > balanceCents) return { error: "Le montant dépasse le solde restant." };
  return { amount: centsToChf(amountCents) };
}

export function remainingAfterRedeem(balanceChf: number, amount: number): number {
  return centsToChf(Math.round(balanceChf * 100) - Math.round(amount * 100));
}
