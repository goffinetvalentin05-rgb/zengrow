import type { ItemStatus, Rating } from "@/src/lib/learn/types";

/**
 * Simple deterministic scheduler.
 *
 * Mastered means the interval is long enough to trust (21+ days and 4+ successful steps).
 * Mastered cards stay in the queue and come back on due_at. "Again" sends them back to learning.
 *
 * Again is due in 10 minutes (interval_days stays 0). Other ratings move by whole days.
 */
export type SrsState = {
  dueAt: string;
  intervalDays: number;
  ease: number;
  repetitions: number;
  lapses: number;
  status: ItemStatus;
};

const MIN_EASE = 1.3;
const AGAIN_DELAY_MS = 10 * 60 * 1000;

function addDays(from: Date, days: number) {
  return new Date(from.getTime() + days * 24 * 60 * 60 * 1000);
}

function roundEase(value: number) {
  return Math.round(Math.max(MIN_EASE, value) * 100) / 100;
}

export function initialSrsState(now: Date): SrsState {
  return {
    dueAt: now.toISOString(),
    intervalDays: 0,
    ease: 2.5,
    repetitions: 0,
    lapses: 0,
    status: "new",
  };
}

export function statusForProgress(repetitions: number, intervalDays: number): ItemStatus {
  if (repetitions >= 4 && intervalDays >= 21) return "mastered";
  if (repetitions <= 0) return "new";
  return "learning";
}

export function applyReview(state: SrsState, rating: Rating, now: Date): { state: SrsState; intervalDaysAfter: number } {
  let ease = state.ease;
  let repetitions = state.repetitions;
  let lapses = state.lapses;
  let interval = state.intervalDays;

  if (rating === "again") {
    lapses += 1;
    repetitions = 0;
    interval = 0;
    ease = roundEase(ease - 0.2);
    return {
      intervalDaysAfter: 0,
      state: {
        dueAt: new Date(now.getTime() + AGAIN_DELAY_MS).toISOString(),
        intervalDays: 0,
        ease,
        repetitions,
        lapses,
        status: "learning",
      },
    };
  }

  if (rating === "hard") {
    ease = roundEase(ease - 0.15);
    interval = Math.max(1, Math.round((interval || 1) * 1.2));
    if (repetitions === 0) repetitions = 1;
  } else if (rating === "good") {
    repetitions += 1;
    if (repetitions === 1) interval = 1;
    else if (repetitions === 2) interval = 3;
    else interval = Math.max(1, Math.round(Math.max(interval, 1) * ease));
  } else {
    repetitions += 1;
    ease = roundEase(ease + 0.15);
    if (repetitions === 1) interval = 4;
    else interval = Math.max(1, Math.round(Math.max(interval, 1) * ease * 1.3));
  }

  return {
    intervalDaysAfter: interval,
    state: {
      dueAt: addDays(now, interval).toISOString(),
      intervalDays: interval,
      ease,
      repetitions,
      lapses,
      status: statusForProgress(repetitions, interval),
    },
  };
}
