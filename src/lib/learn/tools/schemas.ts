import { z } from "zod";
import { ITEM_KINDS, RATINGS, SOURCE_KINDS } from "@/src/lib/learn/types";

export const LEARN_ACTIONS = [
  "addVocabulary",
  "addExpression",
  "addCorrection",
  "addGrammarRule",
  "assignToCategory",
  "getVocabulary",
  "getDueReviews",
  "getRecurringMistakes",
  "getLearningContext",
  "getWeeklyPlan",
] as const;

export type LearnActionName = (typeof LEARN_ACTIONS)[number];

const sourceKind = z.enum(SOURCE_KINDS).optional();
const externalRef = z.string().trim().min(1).max(200).optional();

export const addVocabularySchema = z.object({
  title: z.string().trim().min(1).max(300),
  translation: z.string().trim().max(500).optional(),
  body: z.string().trim().max(2000).optional(),
  example: z.string().trim().max(1000).optional(),
  categoryName: z.string().trim().max(80).optional(),
  sourceKind: sourceKind,
  sourceLabel: z.string().trim().max(200).optional(),
  externalRef,
});

export const addExpressionSchema = addVocabularySchema;
export const addGrammarSchema = z.object({
  title: z.string().trim().min(1).max(300),
  body: z.string().trim().max(4000).optional(),
  example: z.string().trim().max(1000).optional(),
  categoryName: z.string().trim().max(80).optional(),
  sourceKind: sourceKind,
  sourceLabel: z.string().trim().max(200).optional(),
  externalRef,
});

export const addCorrectionSchema = z.object({
  title: z.string().trim().max(300).optional(),
  incorrectForm: z.string().trim().min(1).max(1000),
  correctForm: z.string().trim().min(1).max(1000),
  body: z.string().trim().max(2000).optional(),
  categoryName: z.string().trim().max(80).optional(),
  sourceKind: sourceKind,
  sourceLabel: z.string().trim().max(200).optional(),
  externalRef,
});

export const assignCategorySchema = z.object({
  itemId: z.string().uuid(),
  categoryId: z.string().uuid().optional(),
  categoryName: z.string().trim().min(1).max(80).optional(),
});

export const listLimitSchema = z.object({
  limit: z.number().int().min(1).max(50).optional(),
});

export function stripClientIdentity(input: unknown) {
  if (!input || typeof input !== "object" || Array.isArray(input)) return {};
  const copy = { ...(input as Record<string, unknown>) };
  delete copy.user_id;
  delete copy.userId;
  delete copy.user;
  return copy;
}

export function parseActionInput(action: LearnActionName, input: unknown) {
  const clean = stripClientIdentity(input);
  const schema = {
    addVocabulary: addVocabularySchema,
    addExpression: addExpressionSchema,
    addCorrection: addCorrectionSchema,
    addGrammarRule: addGrammarSchema,
    assignToCategory: assignCategorySchema,
    getVocabulary: listLimitSchema,
    getDueReviews: listLimitSchema,
    getRecurringMistakes: listLimitSchema,
    getLearningContext: z.object({}).passthrough(),
    getWeeklyPlan: z.object({}).passthrough(),
  }[action];
  return schema.safeParse(clean);
}

export const kindForAction: Partial<Record<LearnActionName, (typeof ITEM_KINDS)[number]>> = {
  addVocabulary: "vocabulary",
  addExpression: "expression",
  addCorrection: "correction",
  addGrammarRule: "grammar",
};

export { RATINGS };
