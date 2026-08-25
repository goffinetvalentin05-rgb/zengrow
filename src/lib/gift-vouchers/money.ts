const MAX_CHF = 10_000;

export function chfToCents(chf: number): number {
  if (!Number.isFinite(chf) || chf <= 0) {
    throw new Error("Le montant doit être supérieur à 0.");
  }
  if (chf > MAX_CHF) {
    throw new Error("Le montant ne peut pas dépasser 10’000 CHF.");
  }
  return Math.round(chf * 100);
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
