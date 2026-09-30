"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getAuthSession } from "@/src/lib/auth/user-session";
import { calendarDateInTimezone, weekStartIso } from "@/src/lib/learn/calendar";
import {
  completeSlot,
  createItem,
  deleteCategory,
  deleteItem,
  deleteSlot,
  ensureStarterCategories,
  ensureWeekGoal,
  listCategories,
  logStudy,
  saveCategory,
  saveSlot,
  submitReview,
  updateItem,
  updateLearner,
  updateWeekGoal,
  type ItemDraft,
  type LearnDb,
} from "@/src/lib/learn/db";
import { LEARN_ROUTES } from "@/src/lib/learn/routes";
import { generateApiToken } from "@/src/lib/learn/tokens";
import type { Activity, ItemStatus, Rating } from "@/src/lib/learn/types";

async function context(): Promise<LearnDb> {
  const { supabase, user } = await getAuthSession();
  if (!user) redirect(LEARN_ROUTES.login);
  return { supabase, userId: user.id };
}

function refresh() {
  for (const path of ["/today", "/library", "/review", "/week", "/progress", "/settings"]) {
    revalidatePath(path);
  }
}

function fail(error: unknown) {
  return { ok: false as const, error: error instanceof Error ? error.message : "Something went wrong." };
}

export async function actionCreateItem(draft: ItemDraft) {
  try {
    const db = await context();
    await createItem(db, { ...draft, origin: "manual" });
    refresh();
    return { ok: true as const };
  } catch (error) {
    return fail(error);
  }
}

export async function actionUpdateItem(id: string, patch: Partial<ItemDraft> & { status?: ItemStatus }) {
  try {
    await updateItem(await context(), id, patch);
    refresh();
    return { ok: true as const };
  } catch (error) {
    return fail(error);
  }
}

export async function actionDeleteItem(id: string) {
  try {
    await deleteItem(await context(), id);
    refresh();
    return { ok: true as const };
  } catch (error) {
    return fail(error);
  }
}

export async function actionReview(itemId: string, rating: Rating) {
  try {
    const state = await submitReview(await context(), itemId, rating);
    refresh();
    return { ok: true as const, dueAt: state.dueAt, status: state.status, intervalDays: state.intervalDays };
  } catch (error) {
    return fail(error);
  }
}

export async function actionSaveCategory(name: string, id?: string) {
  try {
    await saveCategory(await context(), name, id);
    refresh();
    return { ok: true as const };
  } catch (error) {
    return fail(error);
  }
}

export async function actionDeleteCategory(id: string) {
  try {
    await deleteCategory(await context(), id);
    refresh();
    return { ok: true as const };
  } catch (error) {
    return fail(error);
  }
}

export async function actionSaveSlot(input: {
  weekStart: string;
  id?: string;
  weekday: number;
  minutes: number;
  activity: Activity;
  note?: string;
}) {
  try {
    await saveSlot(await context(), input.weekStart, input);
    refresh();
    return { ok: true as const };
  } catch (error) {
    return fail(error);
  }
}

export async function actionDeleteSlot(id: string) {
  try {
    await deleteSlot(await context(), id);
    refresh();
    return { ok: true as const };
  } catch (error) {
    return fail(error);
  }
}

export async function actionCompleteSlot(id: string) {
  try {
    await completeSlot(await context(), id);
    refresh();
    return { ok: true as const };
  } catch (error) {
    return fail(error);
  }
}

export async function actionLogStudy(input: { minutes: number; activity: Activity; sourceLabel?: string }) {
  try {
    await logStudy(await context(), input);
    refresh();
    return { ok: true as const };
  } catch (error) {
    return fail(error);
  }
}

export async function actionUpdateProfile(patch: {
  displayName?: string;
  uiLanguage?: string;
  level?: string;
  timezone?: string;
  weeklyMinutes?: number;
  preferredActivities?: string[];
  weekStart?: string;
}) {
  try {
    const db = await context();
    await updateLearner(db, patch);
    if (patch.weeklyMinutes && patch.weekStart) await updateWeekGoal(db, patch.weekStart, patch.weeklyMinutes);
    refresh();
    return { ok: true as const };
  } catch (error) {
    return fail(error);
  }
}

export async function actionCreateToken(name: string) {
  try {
    const db = await context();
    const token = generateApiToken();
    const { error } = await db.supabase.from("api_tokens").insert({
      user_id: db.userId,
      name: name.trim() || "ChatGPT",
      token_hash: token.tokenHash,
      prefix: token.prefix,
    });
    if (error) return fail(error);
    refresh();
    return { ok: true as const, token: token.raw, prefix: token.prefix };
  } catch (error) {
    return fail(error);
  }
}

export async function actionRevokeToken(id: string) {
  try {
    const db = await context();
    const { error } = await db.supabase
      .from("api_tokens")
      .update({ revoked_at: new Date().toISOString() })
      .eq("id", id)
      .eq("user_id", db.userId);
    if (error) return fail(error);
    refresh();
    return { ok: true as const };
  } catch (error) {
    return fail(error);
  }
}

export async function actionPrepareLearner() {
  const db = await context();
  const categories = await ensureStarterCategories(db);
  const { data: profile } = await db.supabase
    .from("learner_profiles")
    .select("timezone, weekly_minutes")
    .eq("user_id", db.userId)
    .maybeSingle();
  const zone = profile?.timezone || "UTC";
  const weekStart = weekStartIso(calendarDateInTimezone(new Date(), zone));
  if (profile?.weekly_minutes) await ensureWeekGoal(db, weekStart, profile.weekly_minutes);
  return { categories, weekStart };
}

export async function loadCategoryOptions() {
  return listCategories(await context());
}
