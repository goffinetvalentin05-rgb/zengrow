import StatusBadge from "@/src/components/dashboard/status-badge";
import GuestAvatar from "@/src/components/dashboard/guest-avatar";
import { cn } from "@/src/lib/utils";

type ReservationStatus = "pending" | "confirmed" | "refused" | "completed" | "cancelled" | "no-show";
type SeatingZone = "interior" | "terrace";

type ReservationListRowProps = {
  guestName: string;
  timeLabel: string;
  subtitle?: string;
  status: ReservationStatus;
  /** Salle ou terrasse. */
  seatingZone?: SeatingZone;
  className?: string;
  onClick?: () => void;
  emphasizeTime?: boolean;
};

export default function ReservationListRow({
  guestName,
  timeLabel,
  subtitle,
  status,
  seatingZone = "interior",
  className,
  onClick,
  emphasizeTime,
}: ReservationListRowProps) {
  const zoneLabel = seatingZone === "terrace" ? "Terrasse" : "Intérieur";
  const inner = (
    <>
      <GuestAvatar name={guestName} size="md" />
      <div className="min-w-0 flex-1">
        {emphasizeTime ? (
          <>
            <p className="text-base font-semibold tabular-nums text-green-600">{timeLabel}</p>
            <p className="mt-1 truncate text-[15px] font-semibold text-gray-900">{guestName}</p>
            {subtitle ? <p className="mt-0.5 text-sm text-gray-500">{subtitle}</p> : null}
          </>
        ) : (
          <>
            <p className="truncate text-[15px] font-semibold text-gray-900">{guestName}</p>
            <p className="mt-0.5 text-sm text-gray-500">
              <span className="font-medium tabular-nums text-green-600">{timeLabel}</span>
              {subtitle ? <span>{` · ${subtitle}`}</span> : null}
            </p>
          </>
        )}
      </div>
      <div className="flex shrink-0 flex-col items-end gap-2">
        <span className="rounded-full border border-emerald-100 bg-emerald-50 px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-emerald-900">
          {zoneLabel}
        </span>
        <StatusBadge status={status} />
      </div>
    </>
  );

  const rowClass = cn(
    "flex w-full items-center gap-4 rounded-xl border border-gray-100 bg-white p-4 text-left shadow-sm transition md:p-5",
    onClick && "cursor-pointer hover:border-green-200/70 hover:shadow-md",
    className,
  );

  if (onClick) {
    return (
      <button type="button" onClick={onClick} className={rowClass}>
        {inner}
      </button>
    );
  }

  return <div className={rowClass}>{inner}</div>;
}
