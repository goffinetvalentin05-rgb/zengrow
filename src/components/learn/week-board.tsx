"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Button from "@/src/components/ui/button";
import EmptyState from "@/src/components/ui/empty-state";
import Modal, { fieldClass, labelClass } from "@/src/components/learn/modal";
import { actionCompleteSlot, actionDeleteSlot, actionLogStudy, actionSaveSlot } from "@/src/lib/learn/actions";
import { formatMinutes, WEEKDAY_LABELS } from "@/src/lib/learn/calendar";
import { ACTIVITIES, ACTIVITY_LABELS, type Activity } from "@/src/lib/learn/types";
import type { PlanSlot } from "@/src/lib/learn/db";

export default function WeekBoard({
  weekStart,
  slots,
  targetMinutes,
  completedMinutes,
}: {
  weekStart: string;
  slots: PlanSlot[];
  targetMinutes: number | null;
  completedMinutes: number;
}) {
  const router = useRouter();
  const [editing, setEditing] = useState<PlanSlot | { weekday: number } | null>(null);
  const [logging, setLogging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const planned = slots.reduce((total, slot) => total + slot.minutes, 0);

  async function save(form: FormData) {
    if (!editing) return;
    const id = "id" in editing ? editing.id : undefined;
    const result = await actionSaveSlot({
      weekStart,
      id,
      weekday: Number(form.get("weekday")),
      minutes: Number(form.get("minutes")),
      activity: String(form.get("activity")) as Activity,
      note: String(form.get("note") || ""),
    });
    if (!result.ok) {
      setError(result.error);
      return;
    }
    setEditing(null);
    setError(null);
    router.refresh();
  }

  async function finish(id: string) {
    const result = await actionCompleteSlot(id);
    if (!result.ok) setError(result.error);
    else router.refresh();
  }

  async function remove(id: string) {
    const result = await actionDeleteSlot(id);
    if (!result.ok) setError(result.error);
    else router.refresh();
  }

  async function log(form: FormData) {
    const result = await actionLogStudy({
      activity: String(form.get("activity")) as Activity,
      minutes: Number(form.get("minutes")),
      sourceLabel: String(form.get("sourceLabel") || ""),
    });
    if (!result.ok) {
      setError(result.error);
      return;
    }
    setLogging(false);
    router.refresh();
  }

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Week</h1>
          <p className="mt-1 text-sm text-white/50">Week of {weekStart}</p>
        </div>
        <div className="flex gap-2">
          <Button type="button" variant="secondary" onClick={() => setLogging(true)}>
            Log study time
          </Button>
          <Button type="button" onClick={() => setEditing({ weekday: 1 })}>
            Add
          </Button>
        </div>
      </div>

      <div className="mt-6 grid gap-3 sm:grid-cols-3">
        <Stat label="Planned" value={formatMinutes(planned)} />
        <Stat label="Completed" value={formatMinutes(completedMinutes)} />
        <Stat label="Weekly target" value={targetMinutes ? formatMinutes(targetMinutes) : "Not set"} />
      </div>
      {targetMinutes ? (
        <div className="mt-4 h-2 overflow-hidden rounded-full bg-white/10">
          <div
            className="h-full rounded-full bg-white"
            style={{ width: `${Math.min(100, Math.round((completedMinutes / targetMinutes) * 100))}%` }}
          />
        </div>
      ) : null}
      {error ? <p className="mt-4 text-sm text-red-300">{error}</p> : null}

      {slots.length === 0 ? (
        <div className="mt-8">
          <EmptyState
            title="Plan your English for the week."
            description="A conversation, a podcast, a chapter. Pick the days and the time."
            action={
              <Button type="button" onClick={() => setEditing({ weekday: 1 })}>
                Add an activity
              </Button>
            }
          />
        </div>
      ) : (
        <div className="mt-6 grid gap-3 lg:grid-cols-7">
          {WEEKDAY_LABELS.map((label, index) => {
            const weekday = index + 1;
            const daySlots = slots.filter((slot) => slot.weekday === weekday);
            return (
              <section key={label} className="rounded-2xl border border-white/10 bg-white/[0.03] p-3">
                <div className="flex items-center justify-between">
                  <h2 className="text-sm font-medium">{label}</h2>
                  <button type="button" className="text-xs text-white/40 hover:text-white" onClick={() => setEditing({ weekday })}>
                    Add
                  </button>
                </div>
                <ul className="mt-3 space-y-2">
                  {daySlots.map((slot) => (
                    <li key={slot.id} className="rounded-xl bg-black/20 p-2.5">
                      <p className="text-sm">{ACTIVITY_LABELS[slot.activity]}</p>
                      <p className="text-xs text-white/45">{formatMinutes(slot.minutes)}</p>
                      {slot.note ? <p className="mt-1 text-xs text-white/40">{slot.note}</p> : null}
                      <div className="mt-2 flex flex-wrap gap-2 text-xs">
                        {slot.completedAt ? (
                          <span className="text-emerald-300">Done</span>
                        ) : (
                          <button type="button" className="text-white/70 hover:text-white" onClick={() => void finish(slot.id)}>
                            Mark done
                          </button>
                        )}
                        <button type="button" className="text-white/40 hover:text-white" onClick={() => setEditing(slot)}>
                          Edit
                        </button>
                        <button type="button" className="text-white/40 hover:text-red-200" onClick={() => void remove(slot.id)}>
                          Delete
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              </section>
            );
          })}
        </div>
      )}

      {editing ? (
        <Modal title={"id" in editing ? "Edit activity" : "Add activity"} onClose={() => setEditing(null)}>
          <form
            className="space-y-3"
            onSubmit={(event) => {
              event.preventDefault();
              void save(new FormData(event.currentTarget));
            }}
          >
            <label className={labelClass}>
              Day
              <select name="weekday" defaultValue={"weekday" in editing ? editing.weekday : 1} className={fieldClass}>
                {WEEKDAY_LABELS.map((label, index) => (
                  <option key={label} value={index + 1}>
                    {label}
                  </option>
                ))}
              </select>
            </label>
            <label className={labelClass}>
              Activity
              <select name="activity" defaultValue={"activity" in editing ? editing.activity : "conversation"} className={fieldClass}>
                {ACTIVITIES.map((activity) => (
                  <option key={activity} value={activity}>
                    {ACTIVITY_LABELS[activity]}
                  </option>
                ))}
              </select>
            </label>
            <label className={labelClass}>
              Minutes
              <input name="minutes" type="number" min={1} max={600} required defaultValue={"minutes" in editing ? editing.minutes : 20} className={fieldClass} />
            </label>
            <label className={labelClass}>
              Note
              <input name="note" defaultValue={"note" in editing ? (editing.note ?? "") : ""} className={fieldClass} />
            </label>
            <Button type="submit">Save</Button>
          </form>
        </Modal>
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

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3">
      <p className="text-xs uppercase tracking-[0.14em] text-white/40">{label}</p>
      <p className="mt-1 text-xl font-semibold">{value}</p>
    </div>
  );
}
