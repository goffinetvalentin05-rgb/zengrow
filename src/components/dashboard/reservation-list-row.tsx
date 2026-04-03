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
            <p className="font-semibold tabular-nums text-[var(--primary)]">{timeLabel}</p>
            <p className="mt-0.5 truncate text-[15px] font-semibold text-[var(--foreground)]">{guestName}</p>
            {subtitle ? <p className="mt-0.5 text-[13px] text-[var(--muted-foreground)]">{subtitle}</p> : null}
          </>
        ) : (
          <>
            <p className="truncate text-[15px] font-semibold text-[var(--foreground)]">{guestName}</p>
            <p className="mt-0.5 text-[13px] text-[var(--muted-foreground)]">
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
    "flex w-full items-center gap-4 rounded-[20px] border border-[var(--border-soft)] bg-[var(--surface-card)] px-4 py-3.5 shadow-[var(--card-shadow)] transition-shadow duration-200 hover:shadow-[var(--card-shadow-hover)]";

  if (onClick) {
    return (
      <button type="button" onClick={onClick} className={cn(shell, "text-left", className)}>
        {inner}
      </button>
    );
  }

  return <div className={cn(shell, className)}>{inner}</div>;
}
