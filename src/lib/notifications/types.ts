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
] as const;

export type NotificationType = (typeof NOTIFICATION_TYPES)[number];

export type NotificationRelatedEntityType =
  | "reservation"
  | "feedback"
  | "gift_voucher"
  | "gift_voucher_request";

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
};

export type CreateNotificationInput = {
  restaurantId: string;
  type: NotificationType;
  title: string;
  message: string;
  relatedEntityType?: NotificationRelatedEntityType | string | null;
  relatedEntityId?: string | null;
  actionUrl?: string | null;
};

export type CreateNotificationResult =
  | { ok: true; id: string }
  | { ok: false; error: string };
