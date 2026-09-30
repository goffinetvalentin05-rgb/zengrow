"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Button from "@/src/components/ui/button";
import Modal, { fieldClass, labelClass } from "@/src/components/learn/modal";
import { actionCompleteSlot, actionLogStudy } from "@/src/lib/learn/actions";
import { formatMinutes } from "@/src/lib/learn/calendar";
import { LEARN_ROUTES } from "@/src/lib/learn/routes";
import { ACTIVITIES, ACTIVITY_LABELS, type Activity } from "@/src/lib/learn/types";
import type { PlanSlot } from "@/src/lib/learn/db";

export default function TodayView({
  slots,
  dueCount,
  completedMinutes,
  targetMinutes,
  streak,
}: {
  slots: PlanSlot[];
  dueCount: number;
  completedMinutes: number;
  targetMinutes: number | null;
  streak: number;
}) {
  const router = useRouter();
  const [logging, setLogging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const open = slots.filter((slot) => !slot.completedAt);
  const empty = open.length === 0 && dueCount === 0 && completedMinutes === 0 && streak === 0;

  async function done(id: string) {
    const result = await actionCompleteSlot(id);
    if (!result.ok) setError(result.error);
    else router.refresh();
  }

  async function log(form: FormData) {
    const result = await actionLogStudy({
      activity: String(form.get("activity")) as Activity,
      minutes: Number(form.get("minutes")),
      sourceLabel: String(form.get("sourceLabel") || ""),
    });
    if (!result.ok) setError(result.error);
    else {
      setLogging(false);
      router.refresh();
    }
  }

  return (
    <div>
      <p className="text-sm text-white/45">What should I do today?</p>
      <h1 className="mt-1 text-3xl font-semibold tracking-tight">Today</h1>

      {empty ? (
        <div className="mt-8 rounded-3xl border border-white/10 bg-white/[0.03] p-6">
          <p className="text-lg">Nothing planned yet.</p>
          <p className="mt-2 text-sm text-white/55">Review what you already saved, add an activity, or log a short session.</p>
          <div className="mt-5 flex flex-wrap gap-2">
            <Link href={LEARN_ROUTES.review}>
              <Button type="button">Review due cards</Button>
            </Link>
            <Link href={LEARN_ROUTES.week}>
              <Button type="button" variant="secondary">
                Add an activity
              </Button>
            </Link>
            <Button type="button" variant="secondary" onClick={() => setLogging(true)}>
              Start a short session
            </Button>
          </div>
        </div>
      ) : (
        <div className="mt-8 grid gap-4">
          <section className="rounded-3xl border border-white/10 bg-white/[0.04] p-5">
            <p className="text-xs uppercase tracking-[0.16em] text-white/40">Today&apos;s activity</p>
            {open.length === 0 ? (
              <p className="mt-3 text-white/60">Nothing left on today&apos;s plan.</p>
            ) : (
              <ul className="mt-3 space-y-4">
                {open.map((slot) => (
                  <li key={slot.id}>
                    <p className="text-2xl font-semibold">{ACTIVITY_LABELS[slot.activity]}</p>
                    <p className="mt-1 text-white/55">{formatMinutes(slot.minutes)}</p>
                    {slot.note ? <p className="mt-1 text-sm text-white/40">{slot.note}</p> : null}
                    <Button className="mt-4" type="button" onClick={() => void done(slot.id)}>
                      Mark as done
                    </Button>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section className="rounded-3xl border border-white/10 bg-white/[0.03] p-5">
            <p className="text-xs uppercase tracking-[0.16em] text-white/40">Reviews due</p>
            <p className="mt-3 text-2xl font-semibold">{dueCount === 1 ? "1 card to review" : `${dueCount} cards to review`}</p>
            <Link href={LEARN_ROUTES.review} className="mt-4 inline-block">
              <Button type="button" variant={dueCount > 0 ? "primary" : "secondary"}>
                Review now
              </Button>
            </Link>
          </section>

          <div className="grid gap-4 sm:grid-cols-2">
            <section className="rounded-3xl border border-white/10 bg-white/[0.03] p-5">
              <p className="text-xs uppercase tracking-[0.16em] text-white/40">Weekly progress</p>
              <p className="mt-3 text-2xl font-semibold">
                {formatMinutes(completedMinutes)}
                <span className="text-base font-normal text-white/45"> / {targetMinutes ? formatMinutes(targetMinutes) : "—"}</span>
              </p>
              {targetMinutes ? (
                <div className="mt-4 h-2 overflow-hidden rounded-full bg-white/10">
                  <div className="h-full rounded-full bg-white" style={{ width: `${Math.min(100, Math.round((completedMinutes / targetMinutes) * 100))}%` }} />
                </div>
              ) : null}
            </section>
            <section className="rounded-3xl border border-white/10 bg-white/[0.03] p-5">
              <p className="text-xs uppercase tracking-[0.16em] text-white/40">Streak</p>
              <p className="mt-3 text-2xl font-semibold">{streak === 1 ? "1 day" : `${streak} days`}</p>
            </section>
          </div>
        </div>
      )}

      {error ? <p className="mt-4 text-sm text-red-300">{error}</p> : null}
      {!empty ? (
        <button type="button" className="mt-6 text-sm text-white/45 underline-offset-4 hover:text-white hover:underline" onClick={() => setLogging(true)}>
          Log study time
        </button>
      ) : null}

      {logging ? (
        <Modal title="Log study time" onClose={() => setLogging(false)}>
          <form
            className="space-y-3"
            onSubmit={(event) => {
              event.preventDefault();
              void log(new FormData(event.currentTarget));
            }}
          >
            <label className={labelClass}>
              Activity
              <select name="activity" className={fieldClass}>
                {ACTIVITIES.map((activity) => (
                  <option key={activity} value={activity}>
                    {ACTIVITY_LABELS[activity]}
                  </option>
                ))}
              </select>
            </label>
            <label className={labelClass}>
              Minutes
              <input name="minutes" type="number" min={1} max={600} required defaultValue={15} className={fieldClass} />
            </label>
            <label className={labelClass}>
              Source
              <input name="sourceLabel" placeholder="Optional" className={fieldClass} />
            </label>
            <Button type="submit">Save</Button>
          </form>
        </Modal>
      ) : null}
    </div>
  );
}
