export const DEFAULT_LOYALTY_SPEND_AMOUNT_CENTS = 100;
export const DEFAULT_LOYALTY_POINTS_PER_SPEND = 1;
export const DEFAULT_LOYALTY_SIGNUP_BONUS = 50;

export type LoyaltyPointsExpiration = "never" | "months_6" | "months_12";
export type LoyaltyProgramType = "points" | "stamps";

export function calculatePurchasePoints(
  purchaseAmountCents: number,
  spendAmountCents: number,
  pointsPerSpend: number,
): number {
  if (
    !Number.isInteger(purchaseAmountCents) ||
    purchaseAmountCents <= 0 ||
    !Number.isInteger(spendAmountCents) ||
    spendAmountCents <= 0 ||
    !Number.isInteger(pointsPerSpend) ||
    pointsPerSpend <= 0
  ) {
    return 0;
  }
  return Math.floor(purchaseAmountCents / spendAmountCents) * pointsPerSpend;
}

export function formatPoints(points: number): string {
  return `${points.toLocaleString("fr-CH")} pts`;
}

export function formatPointsProgress(current: number, target: number): string {
  return `${current.toLocaleString("fr-CH")} / ${target.toLocaleString("fr-CH")} pts`;
}

export type LoyaltyRewardLike = {
  id: string;
  title: string;
  description?: string | null;
  pointsRequired: number;
  active: boolean;
};

export type LoyaltyRewardState = {
  available: LoyaltyRewardLike[];
  bestAvailable: LoyaltyRewardLike | null;
  next: LoyaltyRewardLike | null;
  pointsToNext: number | null;
};

export function computeRewardState(
  pointsBalance: number,
  rewards: LoyaltyRewardLike[],
): LoyaltyRewardState {
  const active = rewards
    .filter((reward) => reward.active)
    .sort((a, b) => a.pointsRequired - b.pointsRequired || a.title.localeCompare(b.title, "fr"));
  const available = active.filter((reward) => pointsBalance >= reward.pointsRequired);
  const next = active.find((reward) => pointsBalance < reward.pointsRequired) ?? null;
  const bestAvailable = available.at(-1) ?? null;
  return {
    available,
    bestAvailable,
    next,
    pointsToNext: next ? Math.max(0, next.pointsRequired - pointsBalance) : null,
  };
}

export function isLoyaltyPointsExpiration(value: string): value is LoyaltyPointsExpiration {
  return value === "never" || value === "months_6" || value === "months_12";
}

export function isLoyaltyProgramType(value: string): value is LoyaltyProgramType {
  return value === "points" || value === "stamps";
}
