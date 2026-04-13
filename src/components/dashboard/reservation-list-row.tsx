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
  /** Surcharge du libellé du badge de statut. */
  statusDisplayLabel?: string;
  /** Salle ou terrasse. */
  seatingZone?: SeatingZone;
  /** Walk-in enregistré depuis le tableau de bord. */
  reservationType?: "standard" | "walkin";
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
  statusDisplayLabel,
  seatingZone = "interior",
  reservationType = "standard",
  className,
  onClick,
  emphasizeTime,
  presentation = "card",
  showZoneBadge = true,
}: ReservationListRowProps) {
  const zoneLabel = seatingZone === "terrace" ? "Terrasse" : "Intérieur";
  const walkInBadge =
    reservationType === "walkin" ? (
      <span className="rounded-full border border-amber-200/90 bg-amber-50 px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-amber-950">
        Walk-in
      </span>
    ) : null;

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
            {walkInBadge}
            {showZoneBadge ? (
              <span className="rounded-full border border-[#CBE6DF] bg-[#F0F9F7] px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-[#1F7A6C]">
                {zoneLabel}
              </span>
            ) : null}
            <StatusBadge status={status} displayLabel={statusDisplayLabel} />
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
            {walkInBadge}
            {showZoneBadge ? (
              <span className="rounded-full border border-[#CBE6DF] bg-[#F0F9F7] px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-[#1F7A6C]">
                {zoneLabel}
              </span>
            ) : null}
            <span className="text-[15px] font-bold tabular-nums text-[#1F7A6C]">{timeLabel}</span>
            <StatusBadge status={status} displayLabel={statusDisplayLabel} />
          </div>
        </>
      );

    const listRowClass = cn(
      "flex w-full items-start gap-4 border-b border-zg-border/75 py-5 text-left last:border-b-0",
      className,
    );

    if (onClick) {
      return (
        <button
          type="button"
          onClick={onClick}
          className={cn(listRowClass, "cursor-pointer transition hover:bg-zg-highlight/45")}
        >
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
        {walkInBadge}
        {showZoneBadge ? (
          <span className="rounded-full border border-[#CBE6DF] bg-[#F0F9F7] px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-[#1F7A6C]">
            {zoneLabel}
          </span>
        ) : null}
        <StatusBadge status={status} displayLabel={statusDisplayLabel} />
      </div>
    </>
  );

  const rowClass = cn(
    "flex w-full items-center gap-4 rounded-2xl border border-zg-border-strong/85 bg-zg-surface/94 p-4 text-left shadow-zg-soft backdrop-blur-sm transition md:p-5",
    onClick && "cursor-pointer hover:border-zg-mint/40 hover:shadow-zg-card",
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
