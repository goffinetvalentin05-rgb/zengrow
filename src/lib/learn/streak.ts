import { shiftIsoDate } from "@/src/lib/learn/calendar";

export type StreakSnapshot = {
  currentStreak: number;
  longestStreak: number;
  lastStudyOn: string | null;
};

/**
 * A study day counts once. Calling this again on the same calendar day does not increase the streak.
 * Yesterday continues the streak. Any older gap resets it to 1.
 */
export function nextStreak(current: StreakSnapshot, today: string): StreakSnapshot {
  if (current.lastStudyOn === today) {
    const currentStreak = Math.max(current.currentStreak, 1);
    return {
      currentStreak,
      longestStreak: Math.max(current.longestStreak, currentStreak),
      lastStudyOn: today,
    };
  }

  const yesterday = shiftIsoDate(today, -1);
  const currentStreak = current.lastStudyOn === yesterday ? current.currentStreak + 1 : 1;
  return {
    currentStreak,
    longestStreak: Math.max(current.longestStreak, currentStreak),
    lastStudyOn: today,
  };
}
