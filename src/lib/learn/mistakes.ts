export type MistakeInput = {
  id: string;
  title: string;
  incorrectForm: string | null;
  correctForm: string | null;
  lapses: number;
  againCount: number;
  hardCount: number;
};

export function mistakeScore(input: Pick<MistakeInput, "lapses" | "againCount" | "hardCount">) {
  return input.lapses * 3 + input.againCount * 2 + input.hardCount;
}

export function rankRecurringMistakes(items: MistakeInput[], limit = 8) {
  return items
    .map((item) => ({ ...item, score: mistakeScore(item) }))
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score || a.title.localeCompare(b.title))
    .slice(0, limit);
}
