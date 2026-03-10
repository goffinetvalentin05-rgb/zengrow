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
    <section className="rounded-xl border border-slate-200 bg-white">
      <div className="border-b border-slate-200 px-6 py-4">
        <h2 className="text-lg font-semibold text-slate-900">Prochaines réservations</h2>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-200 text-sm">
          <thead className="bg-slate-50 text-left text-slate-600">
            <tr>
              <th className="px-6 py-3 font-medium">Date</th>
              <th className="px-6 py-3 font-medium">Heure</th>
              <th className="px-6 py-3 font-medium">Nom du client</th>
              <th className="px-6 py-3 font-medium">Couverts</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {reservations.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-6 py-6 text-slate-500">
                  Aucune réservation pour le moment.
                </td>
              </tr>
            ) : (
              reservations.map((reservation) => (
                <tr key={reservation.id} className="text-slate-800">
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
