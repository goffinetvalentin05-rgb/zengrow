"use client";

import { FormEvent, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Button from "@/src/components/ui/button";
import {
  ENGLISH_LEVELS,
  LEARNING_ACTIVITIES,
  LEARNING_GOALS,
  UI_LANGUAGES,
  WEEKLY_MINUTES,
  type OnboardingInput,
} from "@/src/lib/learn/onboarding";
import { LEARN_ROUTES } from "@/src/lib/learn/routes";

const fieldClass =
  "mt-2 w-full rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2.5 text-sm text-white outline-none focus:border-white/30";

export default function OnboardingForm() {
  const router = useRouter();
  const browserTimezone = useMemo(() => {
    try {
      return Intl.DateTimeFormat().resolvedOptions().timeZone || "";
    } catch {
      return "";
    }
  }, []);
  const [uiLanguage, setUiLanguage] = useState<OnboardingInput["uiLanguage"]>("fr");
  const [level, setLevel] = useState<OnboardingInput["level"]>("B1");
  const [primaryGoal, setPrimaryGoal] = useState<OnboardingInput["primaryGoal"]>("everyday");
  const [weeklyMinutes, setWeeklyMinutes] = useState<OnboardingInput["weeklyMinutes"]>(90);
  const [activities, setActivities] = useState<OnboardingInput["preferredActivities"]>(["conversation", "review"]);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  function toggleActivity(value: OnboardingInput["preferredActivities"][number]) {
    setActivities((current) => {
      if (current.includes(value)) return current.filter((item) => item !== value);
      return [...current, value];
    });
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    if (activities.length === 0) {
      setError("Choose at least one way you like to learn.");
      return;
    }
    setPending(true);
    try {
      const response = await fetch("/api/learn/onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          uiLanguage,
          level,
          primaryGoal,
          weeklyMinutes,
          preferredActivities: activities,
          timezone: browserTimezone || undefined,
        }),
      });
      const payload = (await response.json().catch(() => ({}))) as { error?: string };
      if (!response.ok) {
        setError(payload.error ?? "Could not save onboarding.");
        return;
      }
      router.push(LEARN_ROUTES.today);
      router.refresh();
    } catch {
      setError("Could not save onboarding.");
    } finally {
      setPending(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mx-auto max-w-lg space-y-6">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">Set up your learning</h1>
        <p className="mt-2 text-sm text-white/55">A few choices so the app can follow your pace. No curriculum.</p>
      </div>

      <label className="block text-sm">
        Interface language
        <select className={fieldClass} value={uiLanguage} onChange={(event) => setUiLanguage(event.target.value as OnboardingInput["uiLanguage"])}>
          {UI_LANGUAGES.map((item) => (
            <option key={item.value} value={item.value}>
              {item.label}
            </option>
          ))}
        </select>
      </label>

      <label className="block text-sm">
        English level
        <select className={fieldClass} value={level} onChange={(event) => setLevel(event.target.value as OnboardingInput["level"])}>
          {ENGLISH_LEVELS.map((item) => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </select>
      </label>

      <label className="block text-sm">
        Main goal
        <select className={fieldClass} value={primaryGoal} onChange={(event) => setPrimaryGoal(event.target.value as OnboardingInput["primaryGoal"])}>
          {LEARNING_GOALS.map((item) => (
            <option key={item.value} value={item.value}>
              {item.label}
            </option>
          ))}
        </select>
      </label>

      <label className="block text-sm">
        Time per week
        <select
          className={fieldClass}
          value={weeklyMinutes}
          onChange={(event) => setWeeklyMinutes(Number(event.target.value) as OnboardingInput["weeklyMinutes"])}
        >
          {WEEKLY_MINUTES.map((minutes) => (
            <option key={minutes} value={minutes}>
              {minutes} min
            </option>
          ))}
        </select>
      </label>

      <fieldset>
        <legend className="text-sm">Preferred ways to learn</legend>
        <div className="mt-3 flex flex-col gap-2">
          {LEARNING_ACTIVITIES.map((activity) => (
            <label key={activity.value} className="flex items-center gap-3 rounded-xl border border-white/10 px-3 py-2.5 text-sm">
              <input
                type="checkbox"
                checked={activities.includes(activity.value)}
                onChange={() => toggleActivity(activity.value)}
              />
              {activity.label}
            </label>
          ))}
        </div>
      </fieldset>

      {error ? <p className="text-sm text-red-300">{error}</p> : null}

      <Button type="submit" disabled={pending}>
        {pending ? "Saving…" : "Continue"}
      </Button>
    </form>
  );
}
