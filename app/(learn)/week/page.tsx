import WeekBoard from "@/src/components/learn/week-board";
import { DataError } from "@/src/components/learn/states";
import { listWeekSlots, loadLearner, todayKey, weekMinutes } from "@/src/lib/learn/db";
import { requireLearnDb } from "@/src/lib/learn/page-db";

export default async function WeekPage() {
  const db = await requireLearnDb();
  try {
    const profile = await loadLearner(db);
    const zone = profile?.timezone || "UTC";
    const { weekStart } = todayKey(new Date(), zone);
    const [slots, minutes, goal] = await Promise.all([
      listWeekSlots(db, weekStart),
      weekMinutes(db, weekStart, zone),
      db.supabase.from("learning_goals").select("target_minutes").eq("user_id", db.userId).eq("week_start", weekStart).maybeSingle(),
    ]);
    return (
      <WeekBoard
        weekStart={weekStart}
        slots={slots}
        completedMinutes={minutes}
        targetMinutes={(goal.data?.target_minutes as number | null) ?? profile?.weekly_minutes ?? null}
      />
    );
  } catch (error) {
    return <DataError message={error instanceof Error ? error.message : "Could not load the week."} />;
  }
}
