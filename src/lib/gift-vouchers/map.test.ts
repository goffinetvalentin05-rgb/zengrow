import { describe, expect, it } from "vitest";
import { mapTransactionToUsageEvent, toGiftCardRecord } from "@/src/lib/gift-vouchers/map";
import { formatChf } from "@/src/lib/gift-vouchers/money";
import type { GiftVoucher, GiftVoucherTransaction } from "@/src/lib/gift-vouchers/types";

const voucher: GiftVoucher = {
  id: "v1",
  restaurantId: "r1",
  buyerCustomerId: null,
  code: "ZG-8K4M-2P7Q",
  type: "digital",
  status: "active",
  initialAmountCents: 10000,
  remainingAmountCents: 3000,
  currency: "CHF",
  buyerName: "Anna L.",
  buyerEmail: "anna@email.ch",
  buyerPhone: null,
  recipientName: "Sophie",
  recipientEmail: null,
  message: null,
  expiresAt: "2027-08-25T23:59:59.000Z",
  issuedAt: "2026-08-20T10:00:00.000Z",
  fullyUsedAt: null,
  createdAt: "2026-08-20T10:00:00.000Z",
  updatedAt: "2026-08-25T09:00:00.000Z",
  createdBy: "user-1",
  publicToken: "a".repeat(64),
  metadata: {},
};

const issued: GiftVoucherTransaction = {
  id: "tx-issued",
  voucherId: "v1",
  restaurantId: "r1",
  type: "issued",
  amountCents: 10000,
  balanceBeforeCents: 0,
  balanceAfterCents: 10000,
  note: "Bon émis",
  createdBy: "user-1",
  createdAt: "2026-08-20T10:00:00.000Z",
  metadata: {},
};

const redemption: GiftVoucherTransaction = {
  id: "tx-redeem",
  voucherId: "v1",
  restaurantId: "r1",
  type: "redemption",
  amountCents: 3500,
  balanceBeforeCents: 6500,
  balanceAfterCents: 3000,
  note: "Utilisation",
  createdBy: "user-1",
  createdAt: "2026-08-25T09:00:00.000Z",
  metadata: {},
};

describe("gift voucher history mapping", () => {
  it("affiche création et utilisation dans l’ordre décroissant", () => {
    const record = toGiftCardRecord(voucher, [issued, redemption]);
    expect(record.usageHistory.map((event) => event.kind)).toEqual(["redemption", "issued"]);
    expect(record.usageHistory[0]).toMatchObject({
      title: "Utilisation",
      amountLabel: `-${formatChf(35)}`,
      remainingBalanceChf: 30,
    });
    expect(record.usageHistory[1]).toMatchObject({
      title: "Création",
      amountLabel: `+${formatChf(100)}`,
      remainingBalanceChf: 100,
    });
    expect(record.publicToken).toHaveLength(64);
  });

  it("mappe une utilisation isolée", () => {
    const event = mapTransactionToUsageEvent(redemption);
    expect(event.title).toBe("Utilisation");
    expect(event.amountUsedChf).toBe(35);
  });
});
