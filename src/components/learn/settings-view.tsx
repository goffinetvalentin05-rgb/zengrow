"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import BillingActions from "@/src/components/app/billing-actions";
import Button from "@/src/components/ui/button";
import { actionCreateToken, actionDeleteCategory, actionRevokeToken, actionSaveCategory, actionUpdateProfile } from "@/src/lib/learn/actions";
import { ENGLISH_LEVELS, LEARNING_ACTIVITIES, UI_LANGUAGES, WEEKLY_MINUTES } from "@/src/lib/learn/onboarding";
import { LEARN_ROUTES } from "@/src/lib/learn/routes";
import { createClient } from "@/src/lib/supabase/client";
import type { LearningCategory } from "@/src/lib/learn/types";
import { fieldClass, labelClass } from "@/src/components/learn/modal";

type TokenRow = {
  id: string;
  name: string;
  prefix: string;
  lastUsedAt: string | null;
  revokedAt: string | null;
  createdAt: string;
};

export default function SettingsView({
  email,
  displayName,
  uiLanguage,
  level,
  timezone,
  weeklyMinutes,
  preferredActivities,
  weekStart,
  categories,
  tokens,
  isPro,
  status,
  hasCustomer,
  notice,
}: {
  email: string | null;
  displayName: string;
  uiLanguage: string;
  level: string;
  timezone: string;
  weeklyMinutes: number;
  preferredActivities: string[];
  weekStart: string;
  categories: LearningCategory[];
  tokens: TokenRow[];
  isPro: boolean;
  status: string;
  hasCustomer: boolean;
  notice: string | null;
}) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [freshToken, setFreshToken] = useState<string | null>(null);
  const [categoryName, setCategoryName] = useState("");

  async function saveProfile(form: FormData) {
    const activities = LEARNING_ACTIVITIES.map((item) => item.value).filter((value) => form.getAll("activities").includes(value));
    const result = await actionUpdateProfile({
      displayName: String(form.get("displayName") || ""),
      uiLanguage: String(form.get("uiLanguage") || "en"),
      level: String(form.get("level") || "A2"),
      timezone: String(form.get("timezone") || "UTC"),
      weeklyMinutes: Number(form.get("weeklyMinutes")),
      preferredActivities: activities,
      weekStart,
    });
    if (!result.ok) setError(result.error);
    else {
      setError(null);
      router.refresh();
    }
  }

  async function addCategory(event: React.FormEvent) {
    event.preventDefault();
    const result = await actionSaveCategory(categoryName);
    if (!result.ok) setError(result.error);
    else {
      setCategoryName("");
      router.refresh();
    }
  }

  async function rename(id: string, name: string) {
    const next = window.prompt("Category name", name);
    if (!next || next.trim() === name) return;
    const result = await actionSaveCategory(next, id);
    if (!result.ok) setError(result.error);
    else router.refresh();
  }

  async function removeCategory(id: string) {
    const result = await actionDeleteCategory(id);
    if (!result.ok) setError(result.error);
    else router.refresh();
  }

  async function createToken() {
    const result = await actionCreateToken("ChatGPT");
    if (!result.ok) {
      setError(result.error);
      return;
    }
    setFreshToken(result.token);
    router.refresh();
  }

  async function logout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push(LEARN_ROUTES.login);
    router.refresh();
  }

  return (
    <div className="mx-auto max-w-xl space-y-4">
      <h1 className="text-3xl font-semibold tracking-tight">Settings</h1>
      {notice ? <p className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white/75">{notice}</p> : null}
      {error ? <p className="text-sm text-red-300">{error}</p> : null}

      <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
        <h2 className="text-sm font-medium">Profile</h2>
        <form
          className="mt-4 space-y-3"
          onSubmit={(event) => {
            event.preventDefault();
            void saveProfile(new FormData(event.currentTarget));
          }}
        >
          <label className={labelClass}>
            Display name
            <input name="displayName" defaultValue={displayName} className={fieldClass} />
          </label>
          <label className={labelClass}>
            UI language
            <select name="uiLanguage" defaultValue={uiLanguage} className={fieldClass}>
              {UI_LANGUAGES.map((language) => (
                <option key={language.value} value={language.value}>
                  {language.label}
                </option>
              ))}
            </select>
          </label>
          <label className={labelClass}>
            Level
            <select name="level" defaultValue={level} className={fieldClass}>
              {ENGLISH_LEVELS.map((value) => (
                <option key={value} value={value}>
                  {value}
                </option>
              ))}
            </select>
          </label>
          <h3 className="pt-2 text-sm font-medium">Learning</h3>
          <label className={labelClass}>
            Weekly goal (minutes)
            <select name="weeklyMinutes" defaultValue={weeklyMinutes} className={fieldClass}>
              {WEEKLY_MINUTES.map((minutes) => (
                <option key={minutes} value={minutes}>
                  {minutes} min
                </option>
              ))}
            </select>
          </label>
          <fieldset>
            <legend className="text-sm text-white/70">Preferred activities</legend>
            <div className="mt-2 space-y-2">
              {LEARNING_ACTIVITIES.map((activity) => (
                <label key={activity.value} className="flex items-center gap-2 text-sm">
                  <input type="checkbox" name="activities" value={activity.value} defaultChecked={preferredActivities.includes(activity.value)} />
                  {activity.label}
                </label>
              ))}
            </div>
          </fieldset>
          <label className={labelClass}>
            Timezone
            <input name="timezone" defaultValue={timezone} className={fieldClass} />
          </label>
          <Button type="submit">Save</Button>
        </form>
      </section>

      <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
        <h2 className="text-sm font-medium">Categories</h2>
        <ul className="mt-3 space-y-2">
          {categories.map((category) => (
            <li key={category.id} className="flex items-center justify-between gap-3 text-sm">
              <span>{category.name}</span>
              <span className="flex gap-3 text-xs text-white/45">
                <button type="button" onClick={() => void rename(category.id, category.name)}>
                  Rename
                </button>
                <button type="button" onClick={() => void removeCategory(category.id)}>
                  Delete
                </button>
              </span>
            </li>
          ))}
        </ul>
        <form className="mt-4 flex gap-2" onSubmit={(event) => void addCategory(event)}>
          <input value={categoryName} onChange={(event) => setCategoryName(event.target.value)} placeholder="New category" className={fieldClass} />
          <Button type="submit" variant="secondary">
            Add
          </Button>
        </form>
        <p className="mt-3 text-xs text-white/40">Deleting a category keeps your items.</p>
      </section>

      <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
        <h2 className="text-sm font-medium">ChatGPT connection</h2>
        <p className="mt-2 text-sm text-white/55">Create a personal token. It is shown once. Send it as Authorization: Bearer lg_…</p>
        <Button className="mt-4" type="button" onClick={() => void createToken()}>
          Create connection token
        </Button>
        {freshToken ? (
          <p className="mt-4 break-all rounded-xl bg-black/30 p-3 text-sm">
            {freshToken}
            <span className="mt-2 block text-xs text-white/45">Copy it now. It will not be shown again.</span>
          </p>
        ) : null}
        <ul className="mt-4 space-y-3 text-sm">
          {tokens.length === 0 ? <li className="text-white/40">No connections yet.</li> : null}
          {tokens.map((token) => (
            <li key={token.id} className="rounded-xl bg-black/20 px-3 py-2">
              <p>
                {token.name} · {token.prefix}…
              </p>
              <p className="text-xs text-white/40">
                Created {new Date(token.createdAt).toLocaleDateString()}
                {token.lastUsedAt ? ` · Last used ${new Date(token.lastUsedAt).toLocaleString()}` : " · Never used"}
                {token.revokedAt ? " · Revoked" : ""}
              </p>
              {!token.revokedAt ? (
                <button
                  type="button"
                  className="mt-1 text-xs text-white/50 hover:text-white"
                  onClick={() => void actionRevokeToken(token.id).then(() => router.refresh())}
                >
                  Revoke
                </button>
              ) : null}
            </li>
          ))}
        </ul>
      </section>

      <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
        <h2 className="text-sm font-medium">Subscription</h2>
        <p className="mt-2 text-lg font-medium">{isPro ? "Pro" : "Free"}</p>
        <p className="text-sm text-white/45">Status: {status}</p>
        <BillingActions hasCustomer={hasCustomer} />
      </section>

      <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
        <h2 className="text-sm font-medium">Account</h2>
        <p className="mt-2 text-sm">{email}</p>
        <Button className="mt-4" type="button" variant="secondary" onClick={() => void logout()}>
          Log out
        </Button>
      </section>
    </div>
  );
}
