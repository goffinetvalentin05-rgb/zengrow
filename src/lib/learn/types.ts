export const ITEM_KINDS = ["vocabulary", "expression", "correction", "grammar"] as const;
export const ITEM_STATUSES = ["new", "learning", "mastered"] as const;
export const ITEM_ORIGINS = ["manual", "chatgpt"] as const;
export const SOURCE_KINDS = ["chatgpt", "podcast", "book", "video", "work", "other"] as const;
export const RATINGS = ["again", "hard", "good", "easy"] as const;
export const ACTIVITIES = ["conversation", "podcast", "reading", "video", "review", "other"] as const;

export type ItemKind = (typeof ITEM_KINDS)[number];
export type ItemStatus = (typeof ITEM_STATUSES)[number];
export type ItemOrigin = (typeof ITEM_ORIGINS)[number];
export type SourceKind = (typeof SOURCE_KINDS)[number];
export type Rating = (typeof RATINGS)[number];
export type Activity = (typeof ACTIVITIES)[number];

export type LearningItem = {
  id: string;
  userId: string;
  kind: ItemKind;
  title: string;
  body: string | null;
  translation: string | null;
  example: string | null;
  incorrectForm: string | null;
  correctForm: string | null;
  categoryId: string | null;
  categoryName: string | null;
  sourceKind: SourceKind | null;
  sourceLabel: string | null;
  status: ItemStatus;
  origin: ItemOrigin;
  externalRef: string | null;
  createdAt: string;
  updatedAt: string;
  dueAt: string | null;
  intervalDays: number | null;
  lapses: number;
};

export type LearningCategory = {
  id: string;
  name: string;
  slug: string;
};

export const STARTER_CATEGORIES = [
  { name: "Everyday English", slug: "everyday-english" },
  { name: "Business", slug: "business" },
  { name: "Travel", slug: "travel" },
] as const;

export const ACTIVITY_LABELS: Record<Activity, string> = {
  conversation: "ChatGPT conversation",
  podcast: "Podcast",
  reading: "Reading",
  video: "Video / series",
  review: "Review",
  other: "Other",
};

export const KIND_LABELS: Record<ItemKind, string> = {
  vocabulary: "Vocabulary",
  expression: "Expression",
  correction: "Correction",
  grammar: "Grammar",
};

export const SOURCE_LABELS: Record<SourceKind, string> = {
  chatgpt: "ChatGPT",
  podcast: "Podcast",
  book: "Book",
  video: "Video",
  work: "Work",
  other: "Other",
};
