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
  /** Liste plate dans une carte (tableau de bord) ou ligne carte cliquable (gestion). */
  presentation?: "card" | "list";
  showZoneBadge?: boolean;
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
  presentation = "card",
  showZoneBadge = true,
}: ReservationListRowProps) {
  const zoneLabel = seatingZone === "terrace" ? "Terrasse" : "Intérieur";

  if (presentation === "list") {
    const listInner =
      emphasizeTime === true ? (
        <>
          <GuestAvatar name={guestName} size="md" />
          <div className="min-w-0 flex-1">
            <p className="text-base font-bold tabular-nums text-[#1F7A6C]">{timeLabel}</p>
            <p className="mt-1 truncate text-[15px] font-bold text-[#0F3F3A]">{guestName}</p>
            {subtitle ? <p className="mt-0.5 text-sm text-[#0F3F3A]/55">{subtitle}</p> : null}
          </div>
          <div className="flex shrink-0 flex-col items-end gap-2">
            {showZoneBadge ? (
              <span className="rounded-full border border-[#CBE6DF] bg-[#F0F9F7] px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-[#1F7A6C]">
                {zoneLabel}
              </span>
            ) : null}
            <StatusBadge status={status} />
          </div>
        </>
      ) : (
        <>
          <GuestAvatar name={guestName} size="md" />
          <div className="min-w-0 flex-1">
            <p className="truncate text-[15px] font-bold text-[#0F3F3A]">{guestName}</p>
            {subtitle ? <p className="mt-0.5 text-sm text-[#0F3F3A]/55">{subtitle}</p> : null}
          </div>
          <div className="flex shrink-0 flex-col items-end gap-2">
            <span className="text-[15px] font-bold tabular-nums text-[#1F7A6C]">{timeLabel}</span>
            <StatusBadge status={status} />
          </div>
        </>
      );

    const listRowClass = cn(
      "flex w-full items-start gap-4 border-b border-[#DDEFEA]/70 py-5 text-left last:border-b-0",
      className,
    );

    if (onClick) {
      return (
        <button type="button" onClick={onClick} className={cn(listRowClass, "cursor-pointer transition hover:bg-[#F0F9F7]/50")}>
          {listInner}
        </button>
      );
    }

    return <div className={listRowClass}>{listInner}</div>;
  }

  const inner = (
    <>
      <GuestAvatar name={guestName} size="md" />
      <div className="min-w-0 flex-1">
        {emphasizeTime ? (
          <>
            <p className="text-base font-semibold tabular-nums text-[#1F7A6C]">{timeLabel}</p>
            <p className="mt-1 truncate text-[15px] font-semibold text-[#0F3F3A]">{guestName}</p>
            {subtitle ? <p className="mt-0.5 text-sm text-[#0F3F3A]/55">{subtitle}</p> : null}
          </>
        ) : (
          <>
            <p className="truncate text-[15px] font-semibold text-[#0F3F3A]">{guestName}</p>
            <p className="mt-0.5 text-sm text-[#0F3F3A]/55">
              <span className="font-semibold tabular-nums text-[#1F7A6C]">{timeLabel}</span>
              {subtitle ? <span>{` · ${subtitle}`}</span> : null}
            </p>
          </>
        )}
      </div>
      <div className="flex shrink-0 flex-col items-end gap-2">
        {showZoneBadge ? (
          <span className="rounded-full border border-[#CBE6DF] bg-[#F0F9F7] px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-[#1F7A6C]">
            {zoneLabel}
          </span>
        ) : null}
        <StatusBadge status={status} />
      </div>
    </>
  );

  const rowClass = cn(
    "flex w-full items-center gap-4 rounded-xl border border-[#DDEFEA]/80 bg-white p-4 text-left shadow-sm transition md:p-5",
    onClick && "cursor-pointer hover:border-[#A3D8CC] hover:shadow-md",
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
