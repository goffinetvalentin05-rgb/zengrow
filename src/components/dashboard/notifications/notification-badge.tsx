"use client";

import { memo } from "react";
import { formatUnreadBadgeCount } from "@/src/lib/notifications/badge-label";
import { useNotificationUnreadCount } from "@/src/components/dashboard/notifications/notification-provider";
import { cn } from "@/src/lib/utils";

type NotificationBadgeProps = {
  className?: string;
};

function NotificationBadgeInner({ className }: NotificationBadgeProps) {
  const unreadCount = useNotificationUnreadCount();
  const label = formatUnreadBadgeCount(unreadCount);

  if (!label) return null;

  return (
    <span
      className={cn(
        "absolute -right-0.5 -top-0.5 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold leading-none text-white ring-2 ring-zg-surface",
        className,
      )}
      aria-hidden
    >
      {label}
    </span>
  );
}

const NotificationBadge = memo(NotificationBadgeInner);
export default NotificationBadge;
