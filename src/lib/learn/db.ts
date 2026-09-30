import type { SupabaseClient } from "@supabase/supabase-js";
import { calendarDateInTimezone, shiftIsoDate, sumMinutesInWeek, weekStartIso, weekdayFromIso } from "@/src/lib/learn/calendar";
import { rankRecurringMistakes } from "@/src/lib/learn/mistakes";
import { applyReview, initialSrsState } from "@/src/lib/learn/srs";
import { nextStreak } from "@/src/lib/learn/streak";
import {
  STARTER_CATEGORIES,
  type Activity,
  type ItemKind,
  type ItemOrigin,
  type ItemStatus,
  type LearningCategory,
  type LearningItem,
  type Rating,
  type SourceKind,
} from "@/src/lib/learn/types";

export type LearnDb = {
  supabase: SupabaseClient;
  userId: string;
};

export function dbErrorMessage(error: { message?: string; code?: string } | null) {
  if (!error) return null;
  const message = error.message ?? "";
  if (error.code === "42P01" || /does not exist/i.test(message) || /schema cache/i.test(message)) {
    return "Learning tables are not available yet. Apply the Supabase migrations, then refresh.";
  }
  return message || "Something went wrong.";
}

function slugify(name: string) {
  const base = name
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return base.slice(0, 70) || "category";
}

type ItemRow = {
  id: string;
  user_id: string;
  kind: ItemKind;
  title: string;
  body: string | null;
  translation: string | null;
  example: string | null;
  incorrect_form: string | null;
  correct_form: string | null;
  category_id: string | null;
  source_kind: SourceKind | null;
  source_label: string | null;
  status: ItemStatus;
  origin: ItemOrigin;
  external_ref: string | null;
  created_at: string;
  updated_at: string;
  learning_categories?: { name: string } | { name: string }[] | null;
  review_states?: { due_at: string; interval_days: number; lapses: number } | { due_at: string; interval_days: number; lapses: number }[] | null;
};

function one<T>(value: T | T[] | null | undefined): T | null {
  if (!value) return null;
  return Array.isArray(value) ? (value[0] ?? null) : value;
}

function mapItem(row: ItemRow): LearningItem {
  const category = one(row.learning_categories);
  const review = one(row.review_states);
  return {
    id: row.id,
    userId: row.user_id,
    kind: row.kind,
    title: row.title,
    body: row.body,
    translation: row.translation,
    example: row.example,
    incorrectForm: row.incorrect_form,
    correctForm: row.correct_form,
    categoryId: row.category_id,
    categoryName: category?.name ?? null,
    sourceKind: row.source_kind,
    sourceLabel: row.source_label,
    status: row.status,
    origin: row.origin,
    externalRef: row.external_ref,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    dueAt: review?.due_at ?? null,
    intervalDays: review?.interval_days ?? null,
    lapses: review?.lapses ?? 0,
  };
}

const ITEM_SELECT =
  "id, user_id, kind, title, body, translation, example, incorrect_form, correct_form, category_id, source_kind, source_label, status, origin, external_ref, created_at, updated_at, learning_categories(name), review_states(due_at, interval_days, lapses)";

export async function listCategories(db: LearnDb): Promise<LearningCategory[]> {
  const { data, error } = await db.supabase
    .from("learning_categories")
    .select("id, name, slug")
    .eq("user_id", db.userId)
    .order("name");
  if (error) throw new Error(dbErrorMessage(error) ?? "Could not load categories.");
  return (data ?? []) as LearningCategory[];
}

export async function ensureStarterCategories(db: LearnDb) {
  const existing = await listCategories(db);
  if (existing.length > 0) return existing;
  const { error } = await db.supabase.from("learning_categories").insert(
    STARTER_CATEGORIES.map((category) => ({
      user_id: db.userId,
      name: category.name,
      slug: category.slug,
    })),
  );
  if (error) throw new Error(dbErrorMessage(error) ?? "Could not create categories.");
  return listCategories(db);
}

export async function saveCategory(db: LearnDb, name: string, id?: string) {
  const trimmed = name.trim();
  if (!trimmed) throw new Error("Category name is required.");
  if (id) {
    const { error } = await db.supabase
      .from("learning_categories")
      .update({ name: trimmed, slug: slugify(trimmed) })
      .eq("id", id)
      .eq("user_id", db.userId);
    if (error) throw new Error(dbErrorMessage(error) ?? "Could not rename category.");
    return;
  }
  let slug = slugify(trimmed);
  const categories = await listCategories(db);
  if (categories.some((category) => category.slug === slug)) slug = `${slug}-${categories.length + 1}`;
  const { error } = await db.supabase.from("learning_categories").insert({
    user_id: db.userId,
    name: trimmed,
    slug,
  });
  if (error) throw new Error(dbErrorMessage(error) ?? "Could not create category.");
}

export async function deleteCategory(db: LearnDb, id: string) {
  const { error } = await db.supabase.from("learning_categories").delete().eq("id", id).eq("user_id", db.userId);
  if (error) throw new Error(dbErrorMessage(error) ?? "Could not delete category.");
}

export async function findCategoryByName(db: LearnDb, name: string) {
  const target = name.trim().toLowerCase();
  const categories = await listCategories(db);
  return categories.find((category) => category.name.toLowerCase() === target || category.slug === slugify(name)) ?? null;
}

export async function listItems(db: LearnDb) {
  const { data, error } = await db.supabase
    .from("learning_items")
    .select(ITEM_SELECT)
    .eq("user_id", db.userId)
    .order("updated_at", { ascending: false });
  if (error) throw new Error(dbErrorMessage(error) ?? "Could not load library.");
  return ((data ?? []) as unknown as ItemRow[]).map(mapItem);
}

export type ItemDraft = {
  kind: ItemKind;
  title: string;
  body?: string | null;
  translation?: string | null;
  example?: string | null;
  incorrectForm?: string | null;
  correctForm?: string | null;
  categoryId?: string | null;
  sourceKind?: SourceKind | null;
  sourceLabel?: string | null;
  origin?: ItemOrigin;
  externalRef?: string | null;
};

export async function createItem(db: LearnDb, draft: ItemDraft, now = new Date()) {
  const externalRef = draft.externalRef?.trim() || null;
  if (externalRef) {
    const { data: existing } = await db.supabase
      .from("learning_items")
      .select(ITEM_SELECT)
      .eq("user_id", db.userId)
      .eq("external_ref", externalRef)
      .maybeSingle();
    if (existing) return { item: mapItem(existing as unknown as ItemRow), created: false };
  }

  const { data, error } = await db.supabase
    .from("learning_items")
    .insert({
      user_id: db.userId,
      kind: draft.kind,
      title: (draft.title.trim() || draft.incorrectForm?.trim() || "Untitled").slice(0, 300),
      body: draft.body?.trim() || null,
      translation: draft.translation?.trim() || null,
      example: draft.example?.trim() || null,
      incorrect_form: draft.incorrectForm?.trim() || null,
      correct_form: draft.correctForm?.trim() || null,
      category_id: draft.categoryId || null,
      source_kind: draft.sourceKind || null,
      source_label: draft.sourceLabel?.trim() || null,
      status: "new",
      origin: draft.origin ?? "manual",
      external_ref: externalRef,
    })
    .select("id")
    .single();
  if (error?.code === "23505" && externalRef) {
    const { data: raced } = await db.supabase
      .from("learning_items")
      .select(ITEM_SELECT)
      .eq("user_id", db.userId)
      .eq("external_ref", externalRef)
      .maybeSingle();
    if (raced) return { item: mapItem(raced as unknown as ItemRow), created: false };
  }
  if (error || !data) throw new Error(dbErrorMessage(error) ?? "Could not save this item.");

  const initial = initialSrsState(now);
  const { error: reviewError } = await db.supabase.from("review_states").insert({
    item_id: data.id,
    user_id: db.userId,
    due_at: initial.dueAt,
    interval_days: initial.intervalDays,
    ease: initial.ease,
    repetitions: initial.repetitions,
    lapses: initial.lapses,
  });
  if (reviewError) throw new Error(dbErrorMessage(reviewError) ?? "Could not schedule the first review.");

  const items = await listItems(db);
  const item = items.find((entry) => entry.id === data.id);
  if (!item) throw new Error("Saved item could not be reloaded.");
  return { item, created: true };
}

export async function updateItem(db: LearnDb, id: string, patch: Partial<ItemDraft> & { status?: ItemStatus }) {
  const { error } = await db.supabase
    .from("learning_items")
    .update({
      ...(patch.title !== undefined ? { title: patch.title.trim() } : {}),
      ...(patch.body !== undefined ? { body: patch.body?.trim() || null } : {}),
      ...(patch.translation !== undefined ? { translation: patch.translation?.trim() || null } : {}),
      ...(patch.example !== undefined ? { example: patch.example?.trim() || null } : {}),
      ...(patch.incorrectForm !== undefined ? { incorrect_form: patch.incorrectForm?.trim() || null } : {}),
      ...(patch.correctForm !== undefined ? { correct_form: patch.correctForm?.trim() || null } : {}),
      ...(patch.categoryId !== undefined ? { category_id: patch.categoryId } : {}),
      ...(patch.sourceKind !== undefined ? { source_kind: patch.sourceKind } : {}),
      ...(patch.sourceLabel !== undefined ? { source_label: patch.sourceLabel?.trim() || null } : {}),
      ...(patch.status !== undefined ? { status: patch.status } : {}),
    })
    .eq("id", id)
    .eq("user_id", db.userId);
  if (error) throw new Error(dbErrorMessage(error) ?? "Could not update this item.");
}

export async function deleteItem(db: LearnDb, id: string) {
  const { error } = await db.supabase.from("learning_items").delete().eq("id", id).eq("user_id", db.userId);
  if (error) throw new Error(dbErrorMessage(error) ?? "Could not delete this item.");
}

async function touchStreak(db: LearnDb, now: Date) {
  const { data: profile, error } = await db.supabase
    .from("learner_profiles")
    .select("timezone, current_streak, longest_streak, last_study_on")
    .eq("user_id", db.userId)
    .maybeSingle();
  if (error || !profile) return;
  const today = calendarDateInTimezone(now, profile.timezone || "UTC");
  const next = nextStreak(
    {
      currentStreak: profile.current_streak ?? 0,
      longestStreak: profile.longest_streak ?? 0,
      lastStudyOn: profile.last_study_on,
    },
    today,
  );
  await db.supabase
    .from("learner_profiles")
    .update({
      current_streak: next.currentStreak,
      longest_streak: next.longestStreak,
      last_study_on: next.lastStudyOn,
    })
    .eq("user_id", db.userId);
}

export async function submitReview(db: LearnDb, itemId: string, rating: Rating, now = new Date()) {
  const { data: state, error } = await db.supabase
    .from("review_states")
    .select("due_at, interval_days, ease, repetitions, lapses")
    .eq("item_id", itemId)
    .eq("user_id", db.userId)
    .maybeSingle();
  if (error || !state) throw new Error(dbErrorMessage(error) ?? "This card is not in your review queue.");

  const next = applyReview(
    {
      dueAt: state.due_at,
      intervalDays: state.interval_days,
      ease: Number(state.ease),
      repetitions: state.repetitions,
      lapses: state.lapses,
      status: "learning",
    },
    rating,
    now,
  );

  const { error: updateError } = await db.supabase
    .from("review_states")
    .update({
      due_at: next.state.dueAt,
      interval_days: next.state.intervalDays,
      ease: next.state.ease,
      repetitions: next.state.repetitions,
      lapses: next.state.lapses,
    })
    .eq("item_id", itemId)
    .eq("user_id", db.userId);
  if (updateError) throw new Error(dbErrorMessage(updateError) ?? "Could not save this review.");

  await db.supabase.from("learning_items").update({ status: next.state.status }).eq("id", itemId).eq("user_id", db.userId);
  await db.supabase.from("review_logs").insert({
    user_id: db.userId,
    item_id: itemId,
    reviewed_at: now.toISOString(),
    rating,
    interval_days_after: next.intervalDaysAfter,
  });
  await touchStreak(db, now);
  return next.state;
}

export async function listDueItems(db: LearnDb, now = new Date()) {
  const { data, error } = await db.supabase
    .from("review_states")
    .select("item_id")
    .eq("user_id", db.userId)
    .lte("due_at", now.toISOString())
    .order("due_at");
  if (error) throw new Error(dbErrorMessage(error) ?? "Could not load reviews.");
  const ids = new Set((data ?? []).map((row) => row.item_id as string));
  const items = await listItems(db);
  return items.filter((item) => ids.has(item.id));
}

export async function listRecentReviewLogs(db: LearnDb) {
  const { data, error } = await db.supabase
    .from("review_logs")
    .select("item_id, rating, reviewed_at")
    .eq("user_id", db.userId)
    .order("reviewed_at", { ascending: false })
    .limit(240);
  if (error) return {};
  const grouped: Record<string, { rating: string; reviewed_at: string }[]> = {};
  for (const row of data ?? []) {
    const itemId = row.item_id as string;
    const list = grouped[itemId] ?? [];
    if (list.length >= 6) continue;
    list.push({ rating: row.rating as string, reviewed_at: row.reviewed_at as string });
    grouped[itemId] = list;
  }
  return grouped;
}

export async function countReviewLogs(db: LearnDb) {
  const { count, error } = await db.supabase
    .from("review_logs")
    .select("id", { count: "exact", head: true })
    .eq("user_id", db.userId);
  if (error) return 0;
  return count ?? 0;
}

export async function recentReviewLogs(db: LearnDb, itemId: string) {
  const { data, error } = await db.supabase
    .from("review_logs")
    .select("rating, reviewed_at, interval_days_after")
    .eq("user_id", db.userId)
    .eq("item_id", itemId)
    .order("reviewed_at", { ascending: false })
    .limit(6);
  if (error) return [];
  return data ?? [];
}

export async function ensureWeekPlan(db: LearnDb, weekStart: string) {
  const { data: existing } = await db.supabase
    .from("weekly_plans")
    .select("id")
    .eq("user_id", db.userId)
    .eq("week_start", weekStart)
    .maybeSingle();
  if (existing) return existing.id as string;
  const { data, error } = await db.supabase
    .from("weekly_plans")
    .insert({ user_id: db.userId, week_start: weekStart })
    .select("id")
    .single();
  if (error || !data) throw new Error(dbErrorMessage(error) ?? "Could not open this week.");
  return data.id as string;
}

export async function ensureWeekGoal(db: LearnDb, weekStart: string, targetMinutes: number) {
  const { data: existing } = await db.supabase
    .from("learning_goals")
    .select("id, target_minutes")
    .eq("user_id", db.userId)
    .eq("week_start", weekStart)
    .maybeSingle();
  if (existing) return existing;
  const { error } = await db.supabase.from("learning_goals").insert({
    user_id: db.userId,
    week_start: weekStart,
    target_minutes: targetMinutes,
  });
  if (error && !/duplicate/i.test(error.message)) throw new Error(dbErrorMessage(error) ?? "Could not save the weekly goal.");
  return { target_minutes: targetMinutes };
}

export async function updateWeekGoal(db: LearnDb, weekStart: string, targetMinutes: number) {
  const { error } = await db.supabase.from("learning_goals").upsert(
    {
      user_id: db.userId,
      week_start: weekStart,
      target_minutes: targetMinutes,
    },
    { onConflict: "user_id,week_start" },
  );
  if (error) throw new Error(dbErrorMessage(error) ?? "Could not update the weekly goal.");
  await db.supabase.from("learner_profiles").update({ weekly_minutes: targetMinutes }).eq("user_id", db.userId);
}

export type PlanSlot = {
  id: string;
  weekday: number;
  minutes: number;
  activity: Activity;
  note: string | null;
  completedAt: string | null;
};

export async function listWeekSlots(db: LearnDb, weekStart: string): Promise<PlanSlot[]> {
  const planId = await ensureWeekPlan(db, weekStart);
  const { data, error } = await db.supabase
    .from("weekly_plan_slots")
    .select("id, weekday, minutes, activity, note, completed_at")
    .eq("user_id", db.userId)
    .eq("plan_id", planId)
    .order("weekday");
  if (error) throw new Error(dbErrorMessage(error) ?? "Could not load the week.");
  return (data ?? []).map((row) => ({
    id: row.id as string,
    weekday: row.weekday as number,
    minutes: row.minutes as number,
    activity: row.activity as Activity,
    note: (row.note as string | null) ?? null,
    completedAt: (row.completed_at as string | null) ?? null,
  }));
}

export async function saveSlot(
  db: LearnDb,
  weekStart: string,
  input: { id?: string; weekday: number; minutes: number; activity: Activity; note?: string | null },
) {
  const planId = await ensureWeekPlan(db, weekStart);
  if (input.id) {
    const { error } = await db.supabase
      .from("weekly_plan_slots")
      .update({
        weekday: input.weekday,
        minutes: input.minutes,
        activity: input.activity,
        note: input.note?.trim() || null,
      })
      .eq("id", input.id)
      .eq("user_id", db.userId);
    if (error) throw new Error(dbErrorMessage(error) ?? "Could not update this activity.");
    return;
  }
  const { error } = await db.supabase.from("weekly_plan_slots").insert({
    plan_id: planId,
    user_id: db.userId,
    weekday: input.weekday,
    minutes: input.minutes,
    activity: input.activity,
    note: input.note?.trim() || null,
  });
  if (error) throw new Error(dbErrorMessage(error) ?? "Could not add this activity.");
}

export async function deleteSlot(db: LearnDb, id: string) {
  const { error } = await db.supabase.from("weekly_plan_slots").delete().eq("id", id).eq("user_id", db.userId);
  if (error) throw new Error(dbErrorMessage(error) ?? "Could not remove this activity.");
}

export async function completeSlot(db: LearnDb, slotId: string, now = new Date()) {
  const { data: slot, error } = await db.supabase
    .from("weekly_plan_slots")
    .select("id, minutes, activity, note, completed_at")
    .eq("id", slotId)
    .eq("user_id", db.userId)
    .maybeSingle();
  if (error || !slot) throw new Error(dbErrorMessage(error) ?? "Activity not found.");
  if (slot.completed_at) return;

  const { data: existingSession } = await db.supabase
    .from("study_sessions")
    .select("id")
    .eq("user_id", db.userId)
    .eq("plan_slot_id", slotId)
    .maybeSingle();

  const { error: updateError } = await db.supabase
    .from("weekly_plan_slots")
    .update({ completed_at: now.toISOString() })
    .eq("id", slotId)
    .eq("user_id", db.userId);
  if (updateError) throw new Error(dbErrorMessage(updateError) ?? "Could not mark this activity done.");

  if (!existingSession) {
    const { error: sessionError } = await db.supabase.from("study_sessions").insert({
      user_id: db.userId,
      started_at: now.toISOString(),
      ended_at: now.toISOString(),
      minutes: slot.minutes,
      activity: slot.activity,
      source_label: slot.note,
      plan_slot_id: slotId,
    });
    if (sessionError && !/duplicate/i.test(sessionError.message)) {
      throw new Error(dbErrorMessage(sessionError) ?? "Could not record study time.");
    }
  }
  await touchStreak(db, now);
}

export async function logStudy(
  db: LearnDb,
  input: { minutes: number; activity: Activity; sourceLabel?: string | null },
  now = new Date(),
) {
  const { error } = await db.supabase.from("study_sessions").insert({
    user_id: db.userId,
    started_at: now.toISOString(),
    ended_at: now.toISOString(),
    minutes: input.minutes,
    activity: input.activity,
    source_label: input.sourceLabel?.trim() || null,
  });
  if (error) throw new Error(dbErrorMessage(error) ?? "Could not log study time.");
  await touchStreak(db, now);
}

export async function listSessions(db: LearnDb) {
  const { data, error } = await db.supabase
    .from("study_sessions")
    .select("started_at, minutes, activity")
    .eq("user_id", db.userId)
    .order("started_at", { ascending: false })
    .limit(400);
  if (error) throw new Error(dbErrorMessage(error) ?? "Could not load study time.");
  return data ?? [];
}

export async function loadLearner(db: LearnDb) {
  const { data, error } = await db.supabase
    .from("learner_profiles")
    .select("display_name, ui_language, level, timezone, weekly_minutes, preferred_activities, current_streak, longest_streak, last_study_on, primary_goal")
    .eq("user_id", db.userId)
    .maybeSingle();
  if (error) throw new Error(dbErrorMessage(error) ?? "Could not load your profile.");
  return data;
}

export async function updateLearner(
  db: LearnDb,
  patch: {
    displayName?: string;
    uiLanguage?: string;
    level?: string;
    timezone?: string;
    weeklyMinutes?: number;
    preferredActivities?: string[];
  },
) {
  const { error } = await db.supabase
    .from("learner_profiles")
    .update({
      ...(patch.displayName !== undefined ? { display_name: patch.displayName.trim() || null } : {}),
      ...(patch.uiLanguage !== undefined ? { ui_language: patch.uiLanguage } : {}),
      ...(patch.level !== undefined ? { level: patch.level } : {}),
      ...(patch.timezone !== undefined ? { timezone: patch.timezone } : {}),
      ...(patch.weeklyMinutes !== undefined ? { weekly_minutes: patch.weeklyMinutes } : {}),
      ...(patch.preferredActivities !== undefined ? { preferred_activities: patch.preferredActivities } : {}),
    })
    .eq("user_id", db.userId);
  if (error) throw new Error(dbErrorMessage(error) ?? "Could not update your profile.");
}

export async function weekMinutes(db: LearnDb, weekStart: string, timeZone: string) {
  const sessions = await listSessions(db);
  return sumMinutesInWeek(
    sessions.map((session) => ({
      startedOn: calendarDateInTimezone(new Date(session.started_at as string), timeZone),
      minutes: session.minutes as number | null,
    })),
    weekStart,
  );
}

export async function recurringMistakes(db: LearnDb) {
  const items = (await listItems(db)).filter((item) => item.kind === "correction");
  if (items.length === 0) return [];
  const { data: logs } = await db.supabase
    .from("review_logs")
    .select("item_id, rating")
    .eq("user_id", db.userId)
    .in(
      "item_id",
      items.map((item) => item.id),
    );
  const counts = new Map<string, { again: number; hard: number }>();
  for (const log of logs ?? []) {
    const current = counts.get(log.item_id as string) ?? { again: 0, hard: 0 };
    if (log.rating === "again") current.again += 1;
    if (log.rating === "hard") current.hard += 1;
    counts.set(log.item_id as string, current);
  }
  return rankRecurringMistakes(
    items.map((item) => ({
      id: item.id,
      title: item.title,
      incorrectForm: item.incorrectForm,
      correctForm: item.correctForm,
      lapses: item.lapses,
      againCount: counts.get(item.id)?.again ?? 0,
      hardCount: counts.get(item.id)?.hard ?? 0,
    })),
  );
}

export async function learningContext(db: LearnDb, now = new Date()) {
  const profile = await loadLearner(db);
  const timeZone = profile?.timezone || "UTC";
  const today = calendarDateInTimezone(now, timeZone);
  const weekStart = weekStartIso(today);
  const [categories, due, items, slots, mistakes, minutes] = await Promise.all([
    listCategories(db),
    listDueItems(db, now),
    listItems(db),
    listWeekSlots(db, weekStart),
    recurringMistakes(db),
    weekMinutes(db, weekStart, timeZone),
  ]);
  const { data: goal } = await db.supabase
    .from("learning_goals")
    .select("target_minutes, target_reviews")
    .eq("user_id", db.userId)
    .eq("week_start", weekStart)
    .maybeSingle();

  return {
    level: profile?.level ?? null,
    goal: profile?.primary_goal ?? null,
    timezone: timeZone,
    categories: categories.map((category) => category.name),
    dueCount: due.length,
    recentItems: items.slice(0, 8).map((item) => ({
      kind: item.kind,
      title: item.title,
      translation: item.translation,
      status: item.status,
    })),
    recentCorrections: items
      .filter((item) => item.kind === "correction")
      .slice(0, 5)
      .map((item) => ({
        incorrect: item.incorrectForm,
        correct: item.correctForm,
        title: item.title,
      })),
    recurringMistakes: mistakes.slice(0, 5).map((item) => ({
      title: item.title,
      incorrect: item.incorrectForm,
      correct: item.correctForm,
      score: item.score,
    })),
    weeklyGoalMinutes: (goal?.target_minutes as number | null) ?? profile?.weekly_minutes ?? null,
    weeklyMinutes: minutes,
    plan: slots.map((slot) => ({
      weekday: slot.weekday,
      activity: slot.activity,
      minutes: slot.minutes,
      done: Boolean(slot.completedAt),
      note: slot.note,
    })),
  };
}

export function todayKey(now: Date, timeZone: string) {
  const today = calendarDateInTimezone(now, timeZone);
  return { today, weekStart: weekStartIso(today), weekday: weekdayFromIso(today) };
}

export { shiftIsoDate };
