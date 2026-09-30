"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Button from "@/src/components/ui/button";
import EmptyState from "@/src/components/ui/empty-state";
import { actionReview } from "@/src/lib/learn/actions";
import { LEARN_ROUTES } from "@/src/lib/learn/routes";
import { KIND_LABELS, RATINGS, type LearningItem, type Rating } from "@/src/lib/learn/types";

function question(item: LearningItem) {
  if (item.kind === "correction") return item.incorrectForm || item.title;
  return item.title;
}

function answer(item: LearningItem) {
  if (item.kind === "correction") return item.correctForm || "No correction saved.";
  if (item.kind === "grammar") return [item.body, item.example].filter(Boolean).join("\n\n") || "No explanation saved.";
  return item.translation || item.body || "No translation saved.";
}

function hint(item: LearningItem) {
  if (item.kind === "correction") return "What should this have been?";
  if (item.kind === "grammar") return "Recall the rule, then reveal it.";
  return "What does this mean?";
}

export default function ReviewSession({ items }: { items: LearningItem[] }) {
  const router = useRouter();
  const [started, setStarted] = useState(false);
  const [index, setIndex] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const [note, setNote] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(0);
  const [pending, setPending] = useState(false);

  if (items.length === 0) {
    return (
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">Review</h1>
        <div className="mt-8">
          <EmptyState
            title="You're all caught up."
            description="Nothing is due right now. Add something you met today, or come back when the next card is ready."
            action={
              <Link href={LEARN_ROUTES.library} className="text-sm font-medium text-white underline-offset-4 hover:underline">
                Open library
              </Link>
            }
          />
        </div>
      </div>
    );
  }

  const item = items[index];

  async function rate(rating: Rating) {
    if (!item || pending) return;
    setPending(true);
    setError(null);
    const result = await actionReview(item.id, rating);
    setPending(false);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    const when = result.intervalDays === 0 ? "in a few minutes" : result.intervalDays === 1 ? "tomorrow" : `in ${result.intervalDays} days`;
    setNote(rating === "again" ? `Again — back ${when}` : `${rating} — next ${when}`);
    setDone((value) => value + 1);
    setRevealed(false);
    if (index + 1 >= items.length) {
      setIndex(items.length);
      router.refresh();
      return;
    }
    setIndex((value) => value + 1);
  }

  return (
    <div>
      <h1 className="text-3xl font-semibold tracking-tight">Review</h1>
      <p className="mt-2 text-sm text-white/55">{items.length} due today</p>

      {!started ? (
        <div className="mt-8 rounded-3xl border border-white/10 bg-white/[0.03] p-6">
          <p className="text-lg">Ready when you are.</p>
          <p className="mt-2 text-sm text-white/50">One card at a time. Reveal the answer, then say how it felt.</p>
          <Button className="mt-6" onClick={() => setStarted(true)}>
            Start review
          </Button>
        </div>
      ) : !item ? (
        <div className="mt-8 rounded-3xl border border-emerald-400/20 bg-emerald-400/10 p-6">
          <p className="text-xl font-medium">Session done.</p>
          <p className="mt-2 text-sm text-white/70">{done} reviewed.</p>
          {note ? <p className="mt-3 text-sm text-emerald-100">{note}</p> : null}
        </div>
      ) : (
        <div className="mt-8">
          <p className="text-xs uppercase tracking-[0.16em] text-white/40">
            {KIND_LABELS[item.kind]} · {index + 1} / {items.length}
          </p>
          <div className="mt-4 rounded-3xl border border-white/10 bg-white/[0.04] px-5 py-10 text-center sm:px-10">
            <p className="text-3xl font-semibold tracking-tight sm:text-4xl">{question(item)}</p>
            <p className="mt-4 text-sm text-white/45">{hint(item)}</p>
            {revealed ? <p className="mt-8 whitespace-pre-wrap text-lg text-white/85">{answer(item)}</p> : null}
            {item.kind !== "grammar" && item.example && revealed ? (
              <p className="mt-3 text-sm text-white/45">{item.example}</p>
            ) : null}
          </div>
          {note ? <p className="mt-4 text-center text-sm text-emerald-200">{note}</p> : null}
          {error ? <p className="mt-4 text-center text-sm text-red-300">{error}</p> : null}
          <div className="mt-6 flex flex-wrap justify-center gap-2">
            {!revealed ? (
              <Button type="button" onClick={() => setRevealed(true)}>
                Reveal answer
              </Button>
            ) : (
              RATINGS.map((rating) => (
                <Button key={rating} type="button" variant={rating === "again" ? "danger" : "secondary"} disabled={pending} onClick={() => void rate(rating)}>
                  {rating[0].toUpperCase() + rating.slice(1)}
                </Button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
