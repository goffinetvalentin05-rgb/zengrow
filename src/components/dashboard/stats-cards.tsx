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
      <article className="rounded-2xl border border-zg-border-strong/88 bg-zg-surface/92 p-5 shadow-zg-soft backdrop-blur-md">
        <p className="text-xs font-semibold uppercase tracking-[0.12em] text-zg-fg/50">Réservations aujourd&apos;hui</p>
        <p className="mt-2 text-3xl font-bold tabular-nums tracking-tight text-zg-fg">{reservationsToday}</p>
      </article>
      <article className="rounded-2xl border border-zg-border-strong/88 bg-zg-surface/92 p-5 shadow-zg-soft backdrop-blur-md">
        <p className="text-xs font-semibold uppercase tracking-[0.12em] text-zg-fg/50">Réservations confirmées</p>
        <p className="mt-2 text-3xl font-bold tabular-nums tracking-tight text-zg-fg">{confirmedReservations}</p>
      </article>
      <article className="rounded-2xl border border-zg-border-strong/88 bg-zg-surface/92 p-5 shadow-zg-soft backdrop-blur-md">
        <p className="text-xs font-semibold uppercase tracking-[0.12em] text-zg-fg/50">Demandes d&apos;avis en attente</p>
        <p className="mt-2 text-3xl font-bold tabular-nums tracking-tight text-zg-fg">{pendingReviewRequests}</p>
      </article>
    </section>
  );
}
