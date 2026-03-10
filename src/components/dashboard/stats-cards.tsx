type StatsCardsProps = {
  reservationsToday: number;
  confirmedReservations: number;
  pendingReviewRequests: number;
};

export default function StatsCards({
  reservationsToday,
  confirmedReservations,
  pendingReviewRequests,
}: StatsCardsProps) {
  return (
    <section className="grid gap-4 md:grid-cols-3">
      <article className="rounded-xl border border-slate-200 bg-white p-5">
        <p className="text-xs uppercase tracking-wide text-slate-500">Réservations aujourd&apos;hui</p>
        <p className="mt-2 text-3xl font-semibold text-slate-900">{reservationsToday}</p>
      </article>
      <article className="rounded-xl border border-slate-200 bg-white p-5">
        <p className="text-xs uppercase tracking-wide text-slate-500">Réservations confirmées</p>
        <p className="mt-2 text-3xl font-semibold text-slate-900">{confirmedReservations}</p>
      </article>
      <article className="rounded-xl border border-slate-200 bg-white p-5">
        <p className="text-xs uppercase tracking-wide text-slate-500">Demandes d&apos;avis en attente</p>
        <p className="mt-2 text-3xl font-semibold text-slate-900">{pendingReviewRequests}</p>
      </article>
    </section>
  );
}
