import type { LucideIcon } from "lucide-react";
import {
  Bell,
  CalendarCheck,
  CalendarClock,
  CalendarX,
  MessageSquare,
  UserX,
} from "lucide-react";
import type { NotificationType } from "@/src/lib/notifications/types";
import { cn } from "@/src/lib/utils";

const ICON_BY_TYPE: Record<NotificationType, LucideIcon> = {
  reservation_created: CalendarCheck,
  reservation_cancelled: CalendarX,
  reservation_modified: CalendarClock,
  reservation_no_show: UserX,
  feedback_received: MessageSquare,
  system: Bell,
};

type NotificationTypeIconProps = {
  type: NotificationType;
  className?: string;
};

export default function NotificationTypeIcon({ type, className }: NotificationTypeIconProps) {
  const Icon = ICON_BY_TYPE[type] ?? Bell;
  return <Icon className={cn("h-4 w-4 shrink-0", className)} strokeWidth={1.75} aria-hidden />;
}
