import { createAdminClient } from "@/src/lib/supabase/admin";

export const GIFT_VOUCHER_NOTIFICATION_PREFS = [
  "notify_gift_voucher_created",
  "notify_gift_voucher_request",
  "notify_gift_voucher_redeemed",
  "notify_gift_voucher_fully_used",
] as const;

export type GiftVoucherNotificationPref = (typeof GIFT_VOUCHER_NOTIFICATION_PREFS)[number];

export type GiftVoucherNotificationPrefs = Record<GiftVoucherNotificationPref, boolean>;

export const DEFAULT_GIFT_VOUCHER_NOTIFICATION_PREFS: GiftVoucherNotificationPrefs = {
  notify_gift_voucher_created: true,
  notify_gift_voucher_request: true,
  notify_gift_voucher_redeemed: true,
  notify_gift_voucher_fully_used: true,
};

export function mapGiftVoucherNotificationPrefs(row: Partial<GiftVoucherNotificationPrefs> | null): GiftVoucherNotificationPrefs {
  return {
    notify_gift_voucher_created: row?.notify_gift_voucher_created !== false,
    notify_gift_voucher_request: row?.notify_gift_voucher_request !== false,
    notify_gift_voucher_redeemed: row?.notify_gift_voucher_redeemed !== false,
    notify_gift_voucher_fully_used: row?.notify_gift_voucher_fully_used !== false,
  };
}

export async function loadGiftVoucherNotificationPrefs(
  restaurantId: string,
): Promise<GiftVoucherNotificationPrefs> {
  try {
    const admin = createAdminClient();
    const { data, error } = await admin
      .from("restaurant_settings")
      .select(
        "notify_gift_voucher_created, notify_gift_voucher_request, notify_gift_voucher_redeemed, notify_gift_voucher_fully_used",
      )
      .eq("restaurant_id", restaurantId)
      .maybeSingle();
    if (error || !data) return DEFAULT_GIFT_VOUCHER_NOTIFICATION_PREFS;
    return mapGiftVoucherNotificationPrefs(data as unknown as Partial<GiftVoucherNotificationPrefs>);
  } catch {
    return DEFAULT_GIFT_VOUCHER_NOTIFICATION_PREFS;
  }
}

export async function isGiftVoucherNotificationEnabled(
  restaurantId: string,
  pref: GiftVoucherNotificationPref,
): Promise<boolean> {
  const prefs = await loadGiftVoucherNotificationPrefs(restaurantId);
  return prefs[pref];
}
