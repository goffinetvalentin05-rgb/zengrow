import StatusBadge from "@/src/components/dashboard/status-badge";
import GuestAvatar from "@/src/components/dashboard/guest-avatar";
import { zoneDisplayLabel } from "@/src/lib/reservation/terrace-settings";
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
  terraceLabel?: string;
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
  terraceLabel = "Terrasse",
}: ReservationListRowProps) {
  const zoneLabel = zoneDisplayLabel(seatingZone, terraceLabel);
  const walkInBadge =
    reservationType === "walkin" ? (
      <span className="rounded-full border border-zg-warning/35 bg-zg-warning-soft-bg px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-zg-warning">
        Walk-in
      </span>
    ) : null;

  if (presentation === "list") {
    const listInner =
      emphasizeTime === true ? (
        <>
          <GuestAvatar name={guestName} size="md" />
          <div className="min-w-0 flex-1">
            <p className="text-base font-bold tabular-nums text-zg-teal">{timeLabel}</p>
            <p className="mt-1 truncate text-[15px] font-bold text-zg-fg">{guestName}</p>
            {subtitle ? <p className="mt-0.5 text-sm text-zg-muted">{subtitle}</p> : null}
          </div>
          <div className="flex shrink-0 flex-col items-end gap-2">
            {walkInBadge}
            {showZoneBadge ? (
              <span className="rounded-full border border-zg-border bg-zg-accent-soft-bg px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-zg-accent">
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
            <p className="truncate text-[15px] font-bold text-zg-fg">{guestName}</p>
            {subtitle ? <p className="mt-0.5 text-sm text-zg-muted">{subtitle}</p> : null}
          </div>
          <div className="flex shrink-0 flex-col items-end gap-2">
            {walkInBadge}
            {showZoneBadge ? (
              <span className="rounded-full border border-zg-border bg-zg-accent-soft-bg px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-zg-accent">
                {zoneLabel}
              </span>
            ) : null}
            <span className="text-[15px] font-bold tabular-nums text-zg-teal">{timeLabel}</span>
            <StatusBadge status={status} displayLabel={statusDisplayLabel} />
          </div>
        </>
      );

    const listRowClass = cn("flex w-full items-start gap-4 border-b border-zg-border py-4 text-left last:border-b-0", className);

    if (onClick) {
      return (
        <button
          type="button"
          onClick={onClick}
          className={cn(
            listRowClass,
            "cursor-pointer rounded-xl px-2 transition-all duration-200 ease-out hover:bg-zg-card-hover",
          )}
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
            <p className="text-base font-semibold tabular-nums text-zg-teal">{timeLabel}</p>
            <p className="mt-1 truncate text-[15px] font-semibold text-zg-fg">{guestName}</p>
            {subtitle ? <p className="mt-0.5 text-sm text-zg-muted">{subtitle}</p> : null}
          </>
        ) : (
          <>
            <p className="truncate text-[15px] font-semibold text-zg-fg">{guestName}</p>
            <p className="mt-0.5 text-sm text-zg-muted">
              <span className="font-semibold tabular-nums text-zg-teal">{timeLabel}</span>
              {subtitle ? <span>{` · ${subtitle}`}</span> : null}
            </p>
          </>
        )}
      </div>
      <div className="flex shrink-0 flex-col items-end gap-2">
        {walkInBadge}
        {showZoneBadge ? (
          <span className="rounded-full border border-zg-border bg-zg-accent-soft-bg px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-zg-accent">
            {zoneLabel}
          </span>
        ) : null}
        <StatusBadge status={status} displayLabel={statusDisplayLabel} />
      </div>
    </>
  );

  const rowClass = cn(
    "flex w-full items-center gap-4 rounded-2xl border border-zg-border bg-zg-surface p-4 text-left transition-all duration-200 ease-out md:p-5",
    onClick && "cursor-pointer hover:border-zg-border-hover hover:bg-zg-card-hover",
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
