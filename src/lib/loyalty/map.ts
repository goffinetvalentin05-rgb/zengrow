import { formatCentsAsChf } from "@/src/lib/gift-vouchers/money";
import { computeRewardState, type LoyaltyRewardLike } from "@/src/lib/loyalty/points";
import type {
  LoyaltyCardRecord,
  LoyaltyCardStatus,
  LoyaltyProgramSettings,
  LoyaltyReward,
  LoyaltyTransaction,
  LoyaltyTransactionType,
} from "@/src/lib/loyalty/types";
import { defaultLoyaltySettings } from "@/src/lib/loyalty/schemas";
import { isLoyaltyPointsExpiration, isLoyaltyProgramType } from "@/src/lib/loyalty/points";

const DATE_FORMATTER = new Intl.DateTimeFormat("fr-CH", {
  day: "numeric",
  month: "long",
  year: "numeric",
});

const DATETIME_FORMATTER = new Intl.DateTimeFormat("fr-CH", {
  day: "numeric",
  month: "long",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
  timeZone: "Europe/Zurich",
});

export function formatLoyaltyDate(iso: string | null): string {
  if (!iso) return "—";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "—";
  return DATE_FORMATTER.format(date);
}

export function formatLoyaltyDateTime(iso: string | null): string {
  if (!iso) return "—";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "—";
  return DATETIME_FORMATTER.format(date);
}

export type LoyaltyCardRow = {
  id: string;
  restaurant_id: string;
  customer_id: string;
  card_code: string;
  public_token: string;
  points_balance: number;
  status: string;
  last_visit_at: string | null;
  created_at: string;
  customers:
    | {
        id: string;
        full_name: string;
        email: string | null;
        phone: string | null;
      }
    | {
        id: string;
        full_name: string;
        email: string | null;
        phone: string | null;
      }[]
    | null;
};

export type LoyaltyTransactionRow = {
  id: string;
  type: string;
  purchase_amount_cents: number | null;
  points_delta: number;
  balance_after: number;
  reward_id: string | null;
  reward_title_snapshot: string | null;
  note: string | null;
  created_at: string;
};

export type LoyaltyRewardRow = {
  id: string;
  restaurant_id: string;
  title: string;
  description: string | null;
  points_required: number;
  active: boolean;
  sort_index: number;
  created_at: string;
};

export type LoyaltySettingsRow = {
  loyalty_program_type?: string | null;
  loyalty_spend_amount_cents?: number | null;
  loyalty_points_per_spend?: number | null;
  loyalty_signup_bonus_points?: number | null;
  loyalty_points_expiration?: string | null;
};

function asCustomer(value: LoyaltyCardRow["customers"]) {
  if (!value) return null;
  return Array.isArray(value) ? (value[0] ?? null) : value;
}

function isCardStatus(value: string): value is LoyaltyCardStatus {
  return value === "active" || value === "disabled";
}

function isTransactionType(value: string): value is LoyaltyTransactionType {
  return value === "signup_bonus" || value === "purchase" || value === "reward_redeemed" || value === "adjustment";
}

export function mapRewardRow(row: LoyaltyRewardRow): LoyaltyReward {
  return {
    id: row.id,
    restaurantId: row.restaurant_id,
    title: row.title,
    description: row.description,
    pointsRequired: row.points_required,
    active: row.active,
    sortIndex: row.sort_index,
    createdAt: row.created_at,
  };
}

export function toRewardLike(reward: LoyaltyReward): LoyaltyRewardLike {
  return {
    id: reward.id,
    title: reward.title,
    description: reward.description,
    pointsRequired: reward.pointsRequired,
    active: reward.active,
  };
}

export function mapTransactionRow(row: LoyaltyTransactionRow): LoyaltyTransaction {
  const type: LoyaltyTransactionType = isTransactionType(row.type) ? row.type : "adjustment";
  const purchaseLabel = row.purchase_amount_cents != null ? formatCentsAsChf(row.purchase_amount_cents) : null;
  const rewardTitle = row.reward_title_snapshot?.trim() || null;
  const signed = row.points_delta > 0 ? `+${row.points_delta} pts` : `${row.points_delta} pts`;
  let title = signed;
  if (type === "purchase" && purchaseLabel) title = `${signed} — Achat de ${purchaseLabel}`;
  else if (type === "signup_bonus") title = `${signed} — Bonus d’inscription`;
  else if (type === "reward_redeemed") title = `${signed} — Récompense utilisée : ${rewardTitle ?? "Récompense"}`;
  else if (row.note?.trim()) title = `${signed} — ${row.note.trim()}`;

  return {
    id: row.id,
    type,
    purchaseAmountCents: row.purchase_amount_cents,
    pointsDelta: row.points_delta,
    balanceAfter: row.balance_after,
    rewardId: row.reward_id,
    rewardTitle,
    note: row.note,
    createdAt: row.created_at,
    dateLabel: formatLoyaltyDateTime(row.created_at),
    title,
  };
}

export function mapCardRecord(
  row: LoyaltyCardRow,
  rewards: LoyaltyReward[],
  history: LoyaltyTransaction[] = [],
): LoyaltyCardRecord {
  const customer = asCustomer(row.customers);
  const pointsBalance = Number.isFinite(row.points_balance) ? row.points_balance : 0;
  return {
    id: row.id,
    customerId: row.customer_id,
    cardCode: row.card_code,
    publicToken: row.public_token,
    customerName: customer?.full_name?.trim() || "Client",
    customerEmail: customer?.email?.trim() || "",
    customerPhone: customer?.phone?.trim() || null,
    pointsBalance,
    status: isCardStatus(row.status) ? row.status : "active",
    createdAt: row.created_at,
    lastVisitAt: row.last_visit_at,
    lastVisitLabel: formatLoyaltyDate(row.last_visit_at),
    createdLabel: formatLoyaltyDate(row.created_at),
    rewardState: computeRewardState(pointsBalance, rewards.map(toRewardLike)),
    history,
  };
}

export function mapProgramSettings(row: LoyaltySettingsRow | null): LoyaltyProgramSettings {
  const defaults = defaultLoyaltySettings();
  const programType = row?.loyalty_program_type;
  const expiration = row?.loyalty_points_expiration;
  return {
    programType: programType && isLoyaltyProgramType(programType) ? programType : defaults.programType,
    spendAmountCents:
      typeof row?.loyalty_spend_amount_cents === "number" && row.loyalty_spend_amount_cents > 0
        ? row.loyalty_spend_amount_cents
        : defaults.spendAmountCents,
    pointsPerSpend:
      typeof row?.loyalty_points_per_spend === "number" && row.loyalty_points_per_spend > 0
        ? row.loyalty_points_per_spend
        : defaults.pointsPerSpend,
    signupBonusPoints:
      typeof row?.loyalty_signup_bonus_points === "number" && row.loyalty_signup_bonus_points >= 0
        ? row.loyalty_signup_bonus_points
        : defaults.signupBonusPoints,
    pointsExpiration: expiration && isLoyaltyPointsExpiration(expiration) ? expiration : defaults.pointsExpiration,
  };
}
