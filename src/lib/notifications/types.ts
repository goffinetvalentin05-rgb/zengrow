/** Types alignés sur l'enum Postgres `notification_type`. */
export const NOTIFICATION_TYPES = [
  "reservation_created",
  "reservation_cancelled",
  "reservation_modified",
  "reservation_no_show",
  "feedback_received",
  "system",
  "gift_voucher_created",
  "gift_voucher_request",
  "gift_voucher_redeemed",
  "gift_voucher_fully_used",
  "growth_follow_up_due",
  "growth_experiment_due",
  "growth_experiment_overdue",
  "growth_traffic_signal",
  "growth_revenue_signal",
  "growth_competitor_change",
] as const;

export type NotificationType = (typeof NOTIFICATION_TYPES)[number];

export const GROWTH_NOTIFICATION_TYPES = [
  "growth_follow_up_due",
  "growth_experiment_due",
  "growth_experiment_overdue",
  "growth_traffic_signal",
  "growth_revenue_signal",
  "growth_competitor_change",
] as const;

export type GrowthNotificationType = (typeof GROWTH_NOTIFICATION_TYPES)[number];

export type NotificationSeverity = "info" | "attention" | "critical";

export type NotificationRelatedEntityType =
  | "reservation"
  | "feedback"
  | "gift_voucher"
  | "gift_voucher_request"
  | "growth"
  | "experiment"
  | "competitor_change";

export type NotificationRow = {
  id: string;
  restaurant_id: string;
  type: NotificationType;
  title: string;
  message: string;
  related_entity_type: string | null;
  related_entity_id: string | null;
  action_url: string | null;
  read: boolean;
  created_at: string;
  dedup_key?: string | null;
  severity?: NotificationSeverity | string | null;
};

export type CreateNotificationInput = {
  restaurantId: string;
  type: NotificationType;
  title: string;
  message: string;
  relatedEntityType?: NotificationRelatedEntityType | string | null;
  relatedEntityId?: string | null;
  actionUrl?: string | null;
  dedupKey?: string | null;
  severity?: NotificationSeverity | null;
};

export type CreateNotificationResult =
  | { ok: true; id: string; skipped?: boolean }
  | { ok: false; error: string };

export function isGrowthNotificationType(type: string): type is GrowthNotificationType {
  return (GROWTH_NOTIFICATION_TYPES as readonly string[]).includes(type);
}
