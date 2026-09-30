import {
  createItem,
  findCategoryByName,
  learningContext,
  listDueItems,
  listItems,
  listWeekSlots,
  loadLearner,
  recurringMistakes,
  saveCategory,
  updateItem,
  type LearnDb,
} from "@/src/lib/learn/db";
import { calendarDateInTimezone, weekStartIso } from "@/src/lib/learn/calendar";
import { LEARN_ACTIONS, kindForAction, parseActionInput, type LearnActionName } from "@/src/lib/learn/tools/schemas";

export type ToolSuccess = { ok: true; action: LearnActionName; data: unknown };
export type ToolFailure = { ok: false; action?: string; error: string };

async function categoryIdForName(db: LearnDb, name?: string) {
  if (!name?.trim()) return null;
  const found = await findCategoryByName(db, name);
  if (found) return found.id;
  await saveCategory(db, name);
  const created = await findCategoryByName(db, name);
  return created?.id ?? null;
}

export async function executeLearnAction(db: LearnDb, action: string, input: unknown, now = new Date()): Promise<ToolSuccess | ToolFailure> {
  if (!LEARN_ACTIONS.includes(action as LearnActionName)) {
    return { ok: false, error: "Unknown action." };
  }
  const name = action as LearnActionName;
  const parsed = parseActionInput(name, input);
  if (!parsed.success) return { ok: false, action: name, error: "Invalid input." };
  const data = parsed.data as Record<string, unknown>;

  try {
    if (name === "addVocabulary" || name === "addExpression" || name === "addGrammarRule" || name === "addCorrection") {
      const kind = kindForAction[name];
      if (!kind) return { ok: false, action: name, error: "Unknown action." };
      const categoryId = await categoryIdForName(db, data.categoryName as string | undefined);
      const title =
        (data.title as string | undefined)?.trim() ||
        (kind === "correction" ? (data.incorrectForm as string) : "");
      const result = await createItem(
        db,
        {
          kind,
          title,
          body: (data.body as string | undefined) ?? null,
          translation: (data.translation as string | undefined) ?? null,
          example: (data.example as string | undefined) ?? null,
          incorrectForm: (data.incorrectForm as string | undefined) ?? null,
          correctForm: (data.correctForm as string | undefined) ?? null,
          categoryId,
          sourceKind: (data.sourceKind as "chatgpt" | undefined) ?? "chatgpt",
          sourceLabel: (data.sourceLabel as string | undefined) ?? null,
          origin: "chatgpt",
          externalRef: (data.externalRef as string | undefined) ?? null,
        },
        now,
      );
      return { ok: true, action: name, data: { id: result.item.id, created: result.created, title: result.item.title } };
    }

    if (name === "assignToCategory") {
      let categoryId = (data.categoryId as string | undefined) ?? null;
      if (!categoryId && data.categoryName) categoryId = await categoryIdForName(db, data.categoryName as string);
      if (!categoryId) return { ok: false, action: name, error: "Category is required." };
      await updateItem(db, data.itemId as string, { categoryId });
      return { ok: true, action: name, data: { itemId: data.itemId, categoryId } };
    }

    if (name === "getVocabulary") {
      const limit = (data.limit as number | undefined) ?? 30;
      const items = (await listItems(db))
        .filter((item) => item.kind === "vocabulary" || item.kind === "expression")
        .filter((item) => item.status !== "mastered")
        .slice(0, limit)
        .map((item) => ({
          id: item.id,
          kind: item.kind,
          title: item.title,
          translation: item.translation,
          example: item.example,
          status: item.status,
          category: item.categoryName,
        }));
      return { ok: true, action: name, data: { items } };
    }

    if (name === "getDueReviews") {
      const limit = (data.limit as number | undefined) ?? 20;
      const due = (await listDueItems(db, now)).slice(0, limit).map((item) => ({
        id: item.id,
        kind: item.kind,
        title: item.title,
        status: item.status,
        dueAt: item.dueAt,
      }));
      return { ok: true, action: name, data: { count: due.length, items: due } };
    }

    if (name === "getRecurringMistakes") {
      const mistakes = await recurringMistakes(db);
      return { ok: true, action: name, data: { mistakes } };
    }

    if (name === "getLearningContext") {
      return { ok: true, action: name, data: await learningContext(db, now) };
    }

    const profile = await loadLearner(db);
    const today = calendarDateInTimezone(now, profile?.timezone || "UTC");
    const weekStart = weekStartIso(today);
    const slots = await listWeekSlots(db, weekStart);
    return { ok: true, action: name, data: { weekStart, slots } };
  } catch (error) {
    return { ok: false, action: name, error: error instanceof Error ? error.message : "Action failed." };
  }
}

export function toolDefinitions() {
  return [
    { name: "addVocabulary", description: "Save a word the learner wants to remember." },
    { name: "addExpression", description: "Save an expression or phrase." },
    { name: "addCorrection", description: "Save a mistake and its correction." },
    { name: "addGrammarRule", description: "Save a grammar rule." },
    { name: "assignToCategory", description: "Move a learning item into one of the learner's categories." },
    { name: "getVocabulary", description: "List words and expressions still being learned." },
    { name: "getDueReviews", description: "List cards that are due now." },
    { name: "getRecurringMistakes", description: "List corrections the learner still struggles with." },
    { name: "getLearningContext", description: "Compact snapshot of level, due reviews, recent items, mistakes and the week." },
    { name: "getWeeklyPlan", description: "The current week's planned activities." },
  ];
}
