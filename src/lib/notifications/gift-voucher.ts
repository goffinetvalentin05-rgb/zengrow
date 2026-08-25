import { createNotification } from "@/src/lib/notifications/create";
import { fireNotification } from "@/src/lib/notifications/fire-and-forget";
import { isGiftVoucherNotificationEnabled } from "@/src/lib/notifications/preferences";
import { formatCentsAsChf } from "@/src/lib/gift-vouchers/money";

function giftVoucherDashboardUrl(voucherId: string): string {
  return `/dashboard/gift-vouchers?highlight=${encodeURIComponent(voucherId)}`;
}

export async function notifyGiftVoucherCreated(input: {
  restaurantId: string;
  voucherId: string;
  code: string;
  amountCents: number;
  type: "digital" | "paper";
}): Promise<void> {
  if (!(await isGiftVoucherNotificationEnabled(input.restaurantId, "notify_gift_voucher_created"))) {
    return;
  }
  const kind = input.type === "paper" ? "papier" : "digital";
  fireNotification(
    createNotification({
      restaurantId: input.restaurantId,
      type: "gift_voucher_created",
      title: "Bon créé manuellement",
      message: `Bon ${kind} ${input.code} · ${formatCentsAsChf(input.amountCents)}.`,
      relatedEntityType: "gift_voucher",
      relatedEntityId: input.voucherId,
      actionUrl: giftVoucherDashboardUrl(input.voucherId),
    }),
  );
}

export async function notifyGiftVoucherRequest(input: {
  restaurantId: string;
  requestId: string;
  requesterName: string;
  amountHint?: string | null;
}): Promise<void> {
  if (!(await isGiftVoucherNotificationEnabled(input.restaurantId, "notify_gift_voucher_request"))) {
    return;
  }
  const amount = input.amountHint?.trim();
  fireNotification(
    createNotification({
      restaurantId: input.restaurantId,
      type: "gift_voucher_request",
      title: "Demande de bon cadeau",
      message: amount
        ? `${input.requesterName} a demandé un bon (${amount}).`
        : `${input.requesterName} a demandé un bon cadeau.`,
      relatedEntityType: "gift_voucher_request",
      relatedEntityId: input.requestId,
      actionUrl: "/dashboard/gift-vouchers",
    }),
  );
}

export async function notifyGiftVoucherRedeemed(input: {
  restaurantId: string;
  voucherId: string;
  code: string;
  remainingAmountCents: number;
  fullyUsed: boolean;
}): Promise<void> {
  if (input.fullyUsed) {
    if (!(await isGiftVoucherNotificationEnabled(input.restaurantId, "notify_gift_voucher_fully_used"))) {
      return;
    }
    fireNotification(
      createNotification({
        restaurantId: input.restaurantId,
        type: "gift_voucher_fully_used",
        title: "Bon entièrement utilisé",
        message: `Le bon ${input.code} a été utilisé jusqu’à épuisement du solde.`,
        relatedEntityType: "gift_voucher",
        relatedEntityId: input.voucherId,
        actionUrl: giftVoucherDashboardUrl(input.voucherId),
      }),
    );
    return;
  }

  if (!(await isGiftVoucherNotificationEnabled(input.restaurantId, "notify_gift_voucher_redeemed"))) {
    return;
  }
  fireNotification(
    createNotification({
      restaurantId: input.restaurantId,
      type: "gift_voucher_redeemed",
      title: "Bon utilisé partiellement",
      message: `Le bon ${input.code} a un solde restant de ${formatCentsAsChf(input.remainingAmountCents)}.`,
      relatedEntityType: "gift_voucher",
      relatedEntityId: input.voucherId,
      actionUrl: giftVoucherDashboardUrl(input.voucherId),
    }),
  );
}
