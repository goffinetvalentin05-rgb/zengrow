import type { LucideIcon } from "lucide-react";
import {
  Bell,
  CalendarCheck,
  CalendarClock,
  CalendarX,
  FlaskConical,
  Gift,
  LineChart,
  MessageSquare,
  TicketCheck,
  TrendingDown,
  UserX,
  Users,
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
  gift_voucher_created: Gift,
  gift_voucher_request: Gift,
  gift_voucher_redeemed: TicketCheck,
  gift_voucher_fully_used: TicketCheck,
  growth_follow_up_due: Users,
  growth_experiment_due: FlaskConical,
  growth_experiment_overdue: FlaskConical,
  growth_traffic_signal: LineChart,
  growth_revenue_signal: TrendingDown,
  growth_competitor_change: Bell,
};

type NotificationTypeIconProps = {
  type: NotificationType;
  className?: string;
};

export default function NotificationTypeIcon({ type, className }: NotificationTypeIconProps) {
  const Icon = ICON_BY_TYPE[type] ?? Bell;
  return <Icon className={cn("h-4 w-4 shrink-0", className)} strokeWidth={1.75} aria-hidden />;
}
