import { centsToChf, formatChf } from "@/src/lib/gift-vouchers/money";
import type {
  GiftVoucher,
  GiftVoucherStatus,
  GiftVoucherTransaction,
  GiftVoucherTransactionType,
  GiftVoucherType,
} from "@/src/lib/gift-vouchers/types";
import type {
  GiftCardRecord,
  GiftCardStatus,
  GiftCardType,
  GiftCardUsageEvent,
} from "@/src/components/dashboard/gift-cards/types";

const DATE_FORMATTER = new Intl.DateTimeFormat("fr-CH", {
  day: "numeric",
  month: "long",
  year: "numeric",
});

function isGiftVoucherType(value: string): value is GiftVoucherType {
  return value === "digital" || value === "paper";
}

function isGiftVoucherStatus(value: string): value is GiftVoucherStatus {
  return value === "draft" || value === "active" || value === "used" || value === "expired" || value === "disabled";
}

function isTransactionType(value: string): value is GiftVoucherTransactionType {
  return (
    value === "issued" ||
    value === "redemption" ||
    value === "adjustment" ||
    value === "refund" ||
    value === "disabled" ||
    value === "reactivated"
  );
}

function asMetadata(value: unknown): Record<string, unknown> {
  if (value && typeof value === "object" && !Array.isArray(value)) {
    return value as Record<string, unknown>;
  }
  return {};
}

export function formatGiftVoucherDate(iso: string | null): string {
  if (!iso) return "—";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "—";
  return DATE_FORMATTER.format(date);
}

export type GiftVoucherRow = {
  id: string;
  restaurant_id: string;
  buyer_customer_id: string | null;
  code: string;
  type: string;
  status: string;
  initial_amount_cents: number;
  remaining_amount_cents: number;
  currency: string;
  buyer_name: string | null;
  buyer_email: string | null;
  buyer_phone: string | null;
  recipient_name: string | null;
  recipient_email: string | null;
  message: string | null;
  expires_at: string | null;
  issued_at: string;
  fully_used_at: string | null;
  created_at: string;
  updated_at: string;
  created_by: string | null;
  public_token: string;
  metadata: unknown;
};

export type GiftVoucherTransactionRow = {
  id: string;
  voucher_id: string;
  restaurant_id: string;
  type: string;
  amount_cents: number | null;
  balance_before_cents: number | null;
  balance_after_cents: number | null;
  note: string | null;
  created_by: string | null;
  created_at: string;
  metadata: unknown;
};

export function mapGiftVoucherRow(row: GiftVoucherRow): GiftVoucher {
  if (!isGiftVoucherType(row.type)) {
    throw new Error("Type de bon invalide.");
  }
  if (!isGiftVoucherStatus(row.status)) {
    throw new Error("Statut de bon invalide.");
  }
  if (!row.public_token) {
    throw new Error("Token public manquant.");
  }
  return {
    id: row.id,
    restaurantId: row.restaurant_id,
    buyerCustomerId: row.buyer_customer_id,
    code: row.code,
    type: row.type,
    status: row.status,
    initialAmountCents: row.initial_amount_cents,
    remainingAmountCents: row.remaining_amount_cents,
    currency: row.currency,
    buyerName: row.buyer_name,
    buyerEmail: row.buyer_email,
    buyerPhone: row.buyer_phone,
    recipientName: row.recipient_name,
    recipientEmail: row.recipient_email,
    message: row.message,
    expiresAt: row.expires_at,
    issuedAt: row.issued_at,
    fullyUsedAt: row.fully_used_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    createdBy: row.created_by,
    publicToken: row.public_token,
    metadata: asMetadata(row.metadata),
  };
}

export function mapGiftVoucherTransactionRow(row: GiftVoucherTransactionRow): GiftVoucherTransaction {
  if (!isTransactionType(row.type)) {
    throw new Error("Type de transaction invalide.");
  }
  return {
    id: row.id,
    voucherId: row.voucher_id,
    restaurantId: row.restaurant_id,
    type: row.type,
    amountCents: row.amount_cents,
    balanceBeforeCents: row.balance_before_cents,
    balanceAfterCents: row.balance_after_cents,
    note: row.note,
    createdBy: row.created_by,
    createdAt: row.created_at,
    metadata: asMetadata(row.metadata),
  };
}

function transactionTitle(type: GiftVoucherTransactionType): string {
  switch (type) {
    case "issued":
      return "Création";
    case "redemption":
      return "Utilisation";
    case "disabled":
      return "Désactivation";
    case "reactivated":
      return "Réactivation";
    case "adjustment":
      return "Ajustement";
    case "refund":
      return "Remboursement";
  }
}

function transactionAmountLabel(tx: GiftVoucherTransaction): string | null {
  if (tx.amountCents == null) return null;
  const formatted = formatChf(centsToChf(Math.abs(tx.amountCents)));
  if (tx.type === "issued" || tx.type === "refund") return `+${formatted}`;
  if (tx.type === "redemption") return `-${formatted}`;
  return formatted;
}

export function mapTransactionToUsageEvent(tx: GiftVoucherTransaction): GiftCardUsageEvent {
  const title = transactionTitle(tx.type);
  return {
    id: tx.id,
    dateLabel: formatGiftVoucherDate(tx.createdAt),
    title,
    amountLabel: transactionAmountLabel(tx),
    amountUsedChf: tx.type === "redemption" ? centsToChf(tx.amountCents ?? 0) : 0,
    remainingBalanceChf: centsToChf(tx.balanceAfterCents ?? 0),
    kind: tx.type,
    label: tx.note?.trim() || title,
  };
}

export function buyerDisplayName(voucher: GiftVoucher): string {
  const name = voucher.buyerName?.trim();
  if (name) return name;
  const email = voucher.buyerEmail?.trim();
  if (email) return email;
  return "—";
}

export function toGiftCardRecord(voucher: GiftVoucher, transactions: GiftVoucherTransaction[] = []): GiftCardRecord {
  return {
    id: voucher.id,
    code: voucher.code,
    buyerName: buyerDisplayName(voucher),
    buyerEmail: voucher.buyerEmail ?? "",
    recipientName: voucher.recipientName,
    recipientEmail: voucher.recipientEmail,
    message: voucher.message,
    amountChf: centsToChf(voucher.initialAmountCents),
    balanceChf: centsToChf(voucher.remainingAmountCents),
    type: voucher.type as GiftCardType,
    status: voucher.status as GiftCardStatus,
    purchasedAt: voucher.issuedAt,
    purchasedLabel: formatGiftVoucherDate(voucher.issuedAt),
    expiresAt: voucher.expiresAt,
    expiresLabel: formatGiftVoucherDate(voucher.expiresAt),
    publicToken: voucher.publicToken,
    qrPlaceholder: `QR-${voucher.code}`,
    usageHistory: [...transactions]
      .sort((a, b) => {
        const byDate = b.createdAt.localeCompare(a.createdAt);
        return byDate !== 0 ? byDate : b.id.localeCompare(a.id);
      })
      .map(mapTransactionToUsageEvent),
  };
}
