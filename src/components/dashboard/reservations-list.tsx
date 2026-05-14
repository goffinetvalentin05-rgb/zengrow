import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/src/components/ui/table";

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
    <section>
      <div className="mb-4">
        <h2 className="text-base font-semibold text-zg-fg">Prochaines réservations</h2>
        <p className="mt-1 text-sm text-zg-text-secondary">Liste synthétique des passages à venir.</p>
      </div>
      <Table>
        <TableHeader>
          <tr>
            <TableHead>Date</TableHead>
            <TableHead>Heure</TableHead>
            <TableHead>Nom du client</TableHead>
            <TableHead>Couverts</TableHead>
          </tr>
        </TableHeader>
        <TableBody>
          {reservations.length === 0 ? (
            <TableRow>
              <TableCell colSpan={4} className="py-8 text-center text-sm text-zg-text-muted">
                Aucune réservation pour le moment.
              </TableCell>
            </TableRow>
          ) : (
            reservations.map((reservation) => (
              <TableRow key={reservation.id}>
                <TableCell>{reservation.reservation_date ?? "—"}</TableCell>
                <TableCell>{reservation.reservation_time ?? "—"}</TableCell>
                <TableCell>{reservation.guest_name ?? "—"}</TableCell>
                <TableCell>{reservation.guests ?? "—"}</TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </section>
  );
}
