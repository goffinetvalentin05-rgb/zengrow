import TodayView from "@/src/components/learn/today-view";
import { DataError } from "@/src/components/learn/states";
import { todayKey, weekMinutes } from "@/src/lib/learn/db";
import { listDueItems, listWeekSlots, loadLearner } from "@/src/lib/learn/db";
import { requireLearnDb } from "@/src/lib/learn/page-db";

export default async function TodayPage() {
  const db = await requireLearnDb();
  try {
    const profile = await loadLearner(db);
    const zone = profile?.timezone || "UTC";
    const { weekStart, weekday } = todayKey(new Date(), zone);
    const [slots, due, minutes, goal] = await Promise.all([
      listWeekSlots(db, weekStart),
      listDueItems(db),
      weekMinutes(db, weekStart, zone),
      db.supabase.from("learning_goals").select("target_minutes").eq("user_id", db.userId).eq("week_start", weekStart).maybeSingle(),
    ]);
    return (
      <TodayView
        slots={slots.filter((slot) => slot.weekday === weekday)}
        dueCount={due.length}
        completedMinutes={minutes}
        targetMinutes={(goal.data?.target_minutes as number | null) ?? profile?.weekly_minutes ?? null}
        streak={profile?.current_streak ?? 0}
      />
    );
  } catch (error) {
    return <DataError message={error instanceof Error ? error.message : "Could not load today."} />;
  }
}
