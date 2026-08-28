import type { LoyaltyPointsExpiration, LoyaltyProgramType, LoyaltyRewardState } from "@/src/lib/loyalty/points";

export type LoyaltyCardStatus = "active" | "disabled";
export type LoyaltyTransactionType = "signup_bonus" | "purchase" | "reward_redeemed" | "adjustment";

export type LoyaltyProgramSettings = {
  programType: LoyaltyProgramType;
  spendAmountCents: number;
  pointsPerSpend: number;
  signupBonusPoints: number;
  pointsExpiration: LoyaltyPointsExpiration;
};

export type LoyaltyReward = {
  id: string;
  restaurantId: string;
  title: string;
  description: string | null;
  pointsRequired: number;
  active: boolean;
  sortIndex: number;
  createdAt: string;
};

export type LoyaltyTransaction = {
  id: string;
  type: LoyaltyTransactionType;
  purchaseAmountCents: number | null;
  pointsDelta: number;
  balanceAfter: number;
  rewardId: string | null;
  rewardTitle: string | null;
  note: string | null;
  createdAt: string;
  dateLabel: string;
  title: string;
};

export type LoyaltyCardRecord = {
  id: string;
  customerId: string;
  cardCode: string;
  publicToken: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string | null;
  pointsBalance: number;
  status: LoyaltyCardStatus;
  createdAt: string;
  lastVisitAt: string | null;
  lastVisitLabel: string;
  createdLabel: string;
  rewardState: LoyaltyRewardState;
  history: LoyaltyTransaction[];
};

export type LoyaltyKpis = {
  cardCount: number;
  activeCount: number;
  pointsInCirculation: number;
  pointsAwarded: number;
  rewardsRedeemed: number;
  visitCount: number;
};
