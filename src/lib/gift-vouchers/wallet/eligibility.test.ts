import { describe, expect, it } from "vitest";
import {
  appleWalletIssueMessage,
  canIssueAppleWalletPass,
  getAppleWalletIssueBlockReason,
  shouldVoidAppleWalletPass,
} from "@/src/lib/gift-vouchers/wallet/eligibility";

const active = {
  status: "active" as const,
  remainingAmountCents: 2500,
  expiresAt: "2027-08-25T23:59:59.000Z",
};

describe("Apple Wallet eligibility", () => {
  it("autorise un bon actif avec solde", () => {
    expect(canIssueAppleWalletPass(active)).toBe(true);
    expect(getAppleWalletIssueBlockReason(active)).toBeNull();
    expect(shouldVoidAppleWalletPass(active)).toBe(false);
  });

  it("refuse un bon entièrement utilisé", () => {
    const used = { ...active, status: "used" as const, remainingAmountCents: 0 };
    expect(canIssueAppleWalletPass(used)).toBe(false);
    expect(getAppleWalletIssueBlockReason(used)).toBe("used");
    expect(appleWalletIssueMessage("used")).toMatch(/entièrement utilisé/i);
  });

  it("refuse un solde à zéro même si le statut n’est pas encore used", () => {
    expect(canIssueAppleWalletPass({ ...active, remainingAmountCents: 0 })).toBe(false);
    expect(getAppleWalletIssueBlockReason({ ...active, remainingAmountCents: 0 })).toBe("used");
  });

  it("refuse un bon expiré, désactivé ou brouillon", () => {
    expect(getAppleWalletIssueBlockReason({ ...active, status: "expired" })).toBe("expired");
    expect(getAppleWalletIssueBlockReason({ ...active, status: "disabled" })).toBe("disabled");
    expect(getAppleWalletIssueBlockReason({ ...active, status: "draft" })).toBe("draft");
    expect(
      getAppleWalletIssueBlockReason({
        ...active,
        expiresAt: "2020-01-01T00:00:00.000Z",
      }),
    ).toBe("expired");
  });
});
