import Link from "next/link";
import EmptyState from "@/src/components/ui/empty-state";
import { DataError } from "@/src/components/learn/states";
import { calendarDateInTimezone, formatMinutes, shiftIsoDate, weekdayFromIso } from "@/src/lib/learn/calendar";
import { WEEKDAY_LABELS } from "@/src/lib/learn/calendar";
import { countReviewLogs, listItems, listSessions, loadLearner, todayKey, weekMinutes } from "@/src/lib/learn/db";
import { requireLearnDb } from "@/src/lib/learn/page-db";
import { LEARN_ROUTES } from "@/src/lib/learn/routes";

export default async function ProgressPage() {
  const db = await requireLearnDb();
  try {
    const profile = await loadLearner(db);
    const zone = profile?.timezone || "UTC";
    const { weekStart } = todayKey(new Date(), zone);
    const [items, sessions, reviews, minutes] = await Promise.all([
      listItems(db),
      listSessions(db),
      countReviewLogs(db),
      weekMinutes(db, weekStart, zone),
    ]);

    const totalMinutes = sessions.reduce((total, session) => total + ((session.minutes as number | null) ?? 0), 0);
    const mastered = items.filter((item) => item.status === "mastered").length;
    const quiet = items.length === 0 && sessions.length === 0 && reviews === 0;

    if (quiet) {
      return (
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Progress</h1>
          <div className="mt-8">
            <EmptyState
              title="Your progress starts with one thing you keep."
              description="Add a word or review a card. The streak and the week will show up here."
              action={
                <Link href={LEARN_ROUTES.library} className="text-sm font-medium underline-offset-4 hover:underline">
                  Open library
                </Link>
              }
            />
          </div>
        </div>
      );
    }

    const byCategory = new Map<string, { total: number; mastered: number }>();
    for (const item of items) {
      const name = item.categoryName ?? "Uncategorized";
      const current = byCategory.get(name) ?? { total: 0, mastered: 0 };
      current.total += 1;
      if (item.status === "mastered") current.mastered += 1;
      byCategory.set(name, current);
    }

    const dayMinutes = WEEKDAY_LABELS.map((_, index) => {
      const iso = shiftIsoDate(weekStart, index);
      const total = sessions.reduce((sum, session) => {
        const day = calendarDateInTimezone(new Date(session.started_at as string), zone);
        return day === iso ? sum + ((session.minutes as number | null) ?? 0) : sum;
      }, 0);
      return { label: WEEKDAY_LABELS[weekdayFromIso(iso) - 1], minutes: total };
    });
    const peak = Math.max(1, ...dayMinutes.map((day) => day.minutes));

    return (
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">Progress</h1>
        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          <Card label="Current streak" value={profile?.current_streak ? `${profile.current_streak} days` : "Start today"} />
          <Card label="Longest streak" value={`${profile?.longest_streak ?? 0} days`} />
          <Card label="Total study time" value={formatMinutes(totalMinutes)} />
          <Card label="This week" value={formatMinutes(minutes)} />
          <Card label="Items learned" value={String(items.length)} />
          <Card label="Mastered" value={String(mastered)} />
          <Card label="Reviews completed" value={String(reviews)} />
        </div>

        <section className="mt-8">
          <h2 className="text-sm font-medium text-white/70">This week</h2>
          <ul className="mt-3 flex items-end gap-2">
            {dayMinutes.map((day) => (
              <li key={day.label} className="flex flex-1 flex-col items-center gap-2">
                <div className="flex h-24 w-full items-end rounded-lg bg-white/5">
                  <div className="w-full rounded-lg bg-white/80" style={{ height: `${Math.max(6, Math.round((day.minutes / peak) * 100))}%` }} />
                </div>
                <span className="text-[10px] text-white/40">{day.label.slice(0, 2)}</span>
              </li>
            ))}
          </ul>
        </section>

        <section className="mt-8">
          <h2 className="text-sm font-medium text-white/70">By category</h2>
          <ul className="mt-3 space-y-3">
            {[...byCategory.entries()].map(([name, counts]) => (
              <li key={name}>
                <div className="flex justify-between text-sm">
                  <span>{name}</span>
                  <span className="text-white/45">
                    {counts.mastered}/{counts.total} mastered
                  </span>
                </div>
                <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-white/10">
                  <div className="h-full bg-white" style={{ width: `${Math.round((counts.mastered / counts.total) * 100)}%` }} />
                </div>
              </li>
            ))}
          </ul>
        </section>
      </div>
    );
  } catch (error) {
    return <DataError message={error instanceof Error ? error.message : "Could not load progress."} />;
  }
}

function Card({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-4">
      <p className="text-xs uppercase tracking-[0.14em] text-white/40">{label}</p>
      <p className="mt-2 text-2xl font-semibold">{value}</p>
    </div>
  );
}
