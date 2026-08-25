import { getRedeemBlockReason } from "@/src/lib/gift-vouchers/redeem";
import type { GiftVoucherStatus } from "@/src/lib/gift-vouchers/types";

export type AppleWalletIssueBlockReason = "used" | "expired" | "disabled" | "draft" | "not_found";

const ISSUE_MESSAGES: Record<AppleWalletIssueBlockReason, string> = {
  used: "Ce bon a été entièrement utilisé. Il ne peut plus être ajouté à Apple Wallet.",
  expired: "Ce bon est expiré. Il ne peut plus être ajouté à Apple Wallet.",
  disabled: "Ce bon est désactivé. Il ne peut plus être ajouté à Apple Wallet.",
  draft: "Ce bon n’est pas encore actif.",
  not_found: "Ce bon n’existe pas.",
};

export function getAppleWalletIssueBlockReason(
  voucher: {
    status: GiftVoucherStatus;
    remainingAmountCents: number;
    expiresAt: string | null;
  },
  now: Date = new Date(),
): AppleWalletIssueBlockReason | null {
  const reason = getRedeemBlockReason(voucher, now);
  if (reason == null) return null;
  return reason;
}

export function canIssueAppleWalletPass(
  voucher: {
    status: GiftVoucherStatus;
    remainingAmountCents: number;
    expiresAt: string | null;
  },
  now: Date = new Date(),
): boolean {
  return getAppleWalletIssueBlockReason(voucher, now) == null;
}

export function appleWalletIssueMessage(reason: AppleWalletIssueBlockReason): string {
  return ISSUE_MESSAGES[reason];
}

export function shouldVoidAppleWalletPass(
  voucher: {
    status: GiftVoucherStatus;
    remainingAmountCents: number;
    expiresAt: string | null;
  },
  now: Date = new Date(),
): boolean {
  return getAppleWalletIssueBlockReason(voucher, now) != null;
}
