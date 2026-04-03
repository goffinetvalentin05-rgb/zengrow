import StatusBadge from "@/src/components/dashboard/status-badge";
import GuestAvatar from "@/src/components/dashboard/guest-avatar";
import { cn } from "@/src/lib/utils";

type ReservationStatus = "pending" | "confirmed" | "rejected" | "completed" | "cancelled" | "no-show";

type ReservationListRowProps = {
  guestName: string;
  timeLabel: string;
  subtitle?: string;
  status: ReservationStatus;
  className?: string;
  onClick?: () => void;
  emphasizeTime?: boolean;
};

export default function ReservationListRow({
  guestName,
  timeLabel,
  subtitle,
  status,
  className,
  onClick,
  emphasizeTime,
}: ReservationListRowProps) {
  const inner = (
    <>
      <GuestAvatar name={guestName} />
      <div className="min-w-0 flex-1">
        {emphasizeTime ? (
          <>
            <p className="font-medium tabular-nums text-green-800">{timeLabel}</p>
            <p className="mt-0.5 truncate font-medium text-gray-900">{guestName}</p>
            {subtitle ? <p className="mt-0.5 text-sm text-gray-500">{subtitle}</p> : null}
          </>
        ) : (
          <>
            <p className="truncate font-medium text-gray-900">{guestName}</p>
            <p className="mt-0.5 text-sm text-gray-500">
              {timeLabel}
              {subtitle ? ` · ${subtitle}` : ""}
            </p>
          </>
        )}
      </div>
      <StatusBadge status={status} />
    </>
  );

  const shell =
    "flex w-full items-center gap-4 border-b border-gray-100 py-4 text-left last:border-b-0 hover:bg-gray-50/50";

  if (onClick) {
    return (
      <button type="button" onClick={onClick} className={cn(shell, className)}>
        {inner}
      </button>
    );
  }

  return <div className={cn(shell, className)}>{inner}</div>;
}
