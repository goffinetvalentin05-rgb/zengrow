"use client";

import { forwardRef } from "react";
import NotificationTypeIcon from "@/src/components/dashboard/notifications/notification-type-icon";
import { formatNotificationRelativeTime } from "@/src/lib/notifications/relative-time";
import type { NotificationRow } from "@/src/lib/notifications/types";
import { isGrowthNotificationType } from "@/src/lib/notifications/types";
import { cn } from "@/src/lib/utils";

type NotificationListItemProps = {
  notification: NotificationRow;
  onActivate: () => void;
  tabIndex?: number;
};

const NotificationListItem = forwardRef<HTMLButtonElement, NotificationListItemProps>(
  function NotificationListItem({ notification, onActivate, tabIndex = 0 }, ref) {
    const relative = formatNotificationRelativeTime(notification.created_at);

    return (
      <button
        ref={ref}
        type="button"
        tabIndex={tabIndex}
        onClick={onActivate}
        className={cn(
          "flex w-full gap-3 rounded-xl px-3 py-3 text-left transition-colors duration-150",
          "hover:bg-zg-card-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zg-accent focus-visible:ring-offset-2 focus-visible:ring-offset-zg-surface",
          !notification.read && "bg-zg-accent-soft-bg/40",
        )}
      >
        <span
          className={cn(
            "mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-zg-border bg-zg-app",
            !notification.read ? "text-zg-accent" : "text-zg-text-muted",
          )}
        >
          <NotificationTypeIcon type={notification.type} />
        </span>
        <span className="min-w-0 flex-1">
          <span className="flex items-start gap-2">
            <span className="min-w-0 flex-1 text-sm font-semibold text-zg-fg">{notification.title}</span>
            {isGrowthNotificationType(notification.type) && notification.severity ? (
              <span className="mt-0.5 shrink-0 text-[10px] uppercase tracking-wide text-zg-text-muted">
                {notification.severity}
              </span>
            ) : null}
            {!notification.read ? (
              <span
                className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-sky-400"
                aria-label="Non lue"
              />
            ) : null}
          </span>
          <span className="mt-0.5 block text-sm leading-snug text-zg-text-secondary">{notification.message}</span>
          {relative ? (
            <span className="mt-1 block text-xs text-zg-text-muted">{relative}</span>
          ) : null}
        </span>
      </button>
    );
  },
);

export default NotificationListItem;
