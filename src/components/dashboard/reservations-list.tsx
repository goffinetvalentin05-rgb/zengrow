type ReservationItem = {
  id: string;
  guest_name: string | null;
  guests: number | null;
  reservation_time: string | null;
  reservation_date?: string | null;
};

type ReservationsListProps = {
  reservations: ReservationItem[];
};

export default function ReservationsList({ reservations }: ReservationsListProps) {
  return (
    <section className="overflow-hidden rounded-2xl border border-zg-border bg-zg-surface shadow-zg-soft">
      <div className="border-b border-zg-border/80 px-6 py-4">
        <h2 className="text-lg font-bold tracking-tight text-zg-fg">Prochaines réservations</h2>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-zg-border/70 text-sm">
          <thead className="bg-zg-surface-soft/80 text-left text-zg-muted">
            <tr>
              <th className="px-6 py-3.5 text-xs font-semibold uppercase tracking-wide">Date</th>
              <th className="px-6 py-3.5 text-xs font-semibold uppercase tracking-wide">Heure</th>
              <th className="px-6 py-3.5 text-xs font-semibold uppercase tracking-wide">Nom du client</th>
              <th className="px-6 py-3.5 text-xs font-semibold uppercase tracking-wide">Couverts</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zg-border/60">
            {reservations.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-6 py-6 text-zg-muted">
                  Aucune réservation pour le moment.
                </td>
              </tr>
            ) : (
              reservations.map((reservation) => (
                <tr key={reservation.id} className="text-zg-fg transition-colors hover:bg-zg-highlight/45">
                  <td className="px-6 py-4">{reservation.reservation_date ?? "-"}</td>
                  <td className="px-6 py-4">{reservation.reservation_time ?? "-"}</td>
                  <td className="px-6 py-4">{reservation.guest_name ?? "-"}</td>
                  <td className="px-6 py-4">{reservation.guests ?? "-"}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
