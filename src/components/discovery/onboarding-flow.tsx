"use client";

import { FormEvent, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Button from "@/src/components/ui/button";
import Input from "@/src/components/ui/input";
import { MAX_NICHES, PROFILE_TYPE_LABELS, PROFILE_TYPES, SOCIAL_PLATFORMS, SOCIAL_PLATFORM_LABELS } from "@/src/lib/discovery/constants";
import { COUNTRY_PRESETS } from "@/src/lib/discovery/media";
import { DISCOVERY_ROUTES } from "@/src/lib/discovery/routes";
import { isValidPublicSlug } from "@/src/lib/discovery/slug";
import { classifyPublicSlug, getBrandedProfilePreview, publicSlugStatusMessage } from "@/src/lib/discovery/public-link";
import type { Category } from "@/src/lib/discovery/types";
import { cn } from "@/src/lib/utils";

type Draft = {
  niches: string[];
  profileType: string;
  displayName: string;
  username: string;
  bio: string;
  location: string;
  country: string;
  projectName: string;
  projectUrl: string;
  projectDescription: string;
  links: Record<string, string>;
};

export function OnboardingFlow({
  categories,
  initialName,
  initialUsername,
}: {
  categories: Category[];
  initialName: string;
  initialUsername: string;
}) {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [draft, setDraft] = useState<Draft>({
    niches: [],
    profileType: "",
    displayName: initialName,
    username: initialUsername,
    bio: "",
    location: "",
    country: "",
    projectName: "",
    projectUrl: "",
    projectDescription: "",
    links: {},
  });

  const total = 6;
  const canNext = useMemo(() => {
    if (step === 1) return draft.niches.length >= 1 && draft.niches.length <= MAX_NICHES;
    if (step === 2) return Boolean(draft.profileType);
    if (step === 3) return draft.displayName.trim().length >= 2 && isValidPublicSlug(draft.username);
    return true;
  }, [step, draft]);

  async function finish() {
    setPending(true);
    setError(null);
    const response = await fetch("/api/discovery/onboarding", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(draft),
    });
    const payload = (await response.json().catch(() => ({}))) as { error?: string };
    setPending(false);
    if (!response.ok) {
      setError(payload.error ?? "Could not save your profile.");
      return;
    }
    setStep(6);
  }

  async function onContinue(event: FormEvent) {
    event.preventDefault();
    if (step === 5) {
      await finish();
      return;
    }
    setStep((current) => current + 1);
  }

  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-xl flex-col justify-center px-5 py-12">
      <p className="text-xs uppercase tracking-[0.18em] text-white/35">
        Step {Math.min(step, 5)} of 5
      </p>
      {step === 1 ? (
        <>
          <h1 className="mt-3 font-[family-name:var(--font-zg-display)] text-4xl text-white">Choose your worlds.</h1>
          <p className="mt-2 text-sm text-white/45">Pick 1 to 5 niches. Your favorites come first on Explore.</p>
          <div className="mt-8 flex flex-wrap gap-2">
            {categories.map((cat) => {
              const active = draft.niches.includes(cat.id);
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() =>
                    setDraft((current) => {
                      if (current.niches.includes(cat.id)) {
                        return { ...current, niches: current.niches.filter((id) => id !== cat.id) };
                      }
                      if (current.niches.length >= MAX_NICHES) return current;
                      return { ...current, niches: [...current.niches, cat.id] };
                    })
                  }
                  className={cn(
                    "rounded-full border px-4 py-2 text-sm",
                    active ? "border-white bg-white text-zinc-950" : "border-white/10 text-white/70",
                  )}
                >
                  {cat.name}
                </button>
              );
            })}
          </div>
        </>
      ) : null}

      {step === 2 ? (
        <>
          <h1 className="mt-3 font-[family-name:var(--font-zg-display)] text-4xl text-white">Who are you?</h1>
          <div className="mt-8 grid grid-cols-2 gap-2">
            {PROFILE_TYPES.map((type) => (
              <button
                key={type}
                type="button"
                onClick={() => setDraft((current) => ({ ...current, profileType: type }))}
                className={cn(
                  "rounded-2xl border px-4 py-4 text-left text-sm",
                  draft.profileType === type ? "border-white bg-white text-zinc-950" : "border-white/10 text-white/70",
                )}
              >
                {PROFILE_TYPE_LABELS[type]}
              </button>
            ))}
          </div>
        </>
      ) : null}

      {step === 3 ? (
        <>
          <h1 className="mt-3 font-[family-name:var(--font-zg-display)] text-4xl text-white">Build your profile.</h1>
          <form className="mt-8 space-y-4" onSubmit={onContinue}>
            <Field label="Name">
              <Input value={draft.displayName} onChange={(e) => setDraft({ ...draft, displayName: e.target.value })} required />
            </Field>
            <Field label="Your Sharpz link">
              <Input
                value={draft.username}
                onChange={(e) => setDraft({ ...draft, username: e.target.value.toLowerCase().replace(/^\/+/, "") })}
                required
                spellCheck={false}
                autoCapitalize="none"
                placeholder="valentin"
              />
              {draft.username ? (
                <p className="mt-2 text-sm text-white/40">
                  {(() => {
                    const check = classifyPublicSlug(draft.username);
                    return check === "ok"
                      ? getBrandedProfilePreview(draft.username)
                      : publicSlugStatusMessage(check);
                  })()}
                </p>
              ) : null}
            </Field>
            <Field label="Short bio">
              <textarea
                value={draft.bio}
                onChange={(e) => setDraft({ ...draft, bio: e.target.value })}
                rows={3}
                className="w-full rounded-2xl border border-white/[0.1] bg-white/[0.035] px-3.5 py-2.5 text-sm text-white outline-none"
              />
            </Field>
            <Field label="City">
              <Input
                value={draft.location}
                onChange={(e) => setDraft({ ...draft, location: e.target.value })}
                placeholder="Optional"
              />
            </Field>
            <Field label="Country">
              <select
                value={draft.country}
                onChange={(e) => setDraft({ ...draft, country: e.target.value })}
                className="h-11 w-full rounded-2xl border border-white/[0.1] bg-[#0d0c12] px-3 text-sm text-white"
              >
                <option value="">Optional</option>
                {COUNTRY_PRESETS.map((country) => (
                  <option key={country} value={country}>
                    {country}
                  </option>
                ))}
              </select>
            </Field>
          </form>
        </>
      ) : null}

      {step === 4 ? (
        <>
          <h1 className="mt-3 font-[family-name:var(--font-zg-display)] text-4xl text-white">What are you building?</h1>
          <p className="mt-2 text-sm text-white/45">Optional. You can skip this.</p>
          <div className="mt-8 space-y-4">
            <Field label="Project name">
              <Input value={draft.projectName} onChange={(e) => setDraft({ ...draft, projectName: e.target.value })} />
            </Field>
            <Field label="URL">
              <Input value={draft.projectUrl} onChange={(e) => setDraft({ ...draft, projectUrl: e.target.value })} />
            </Field>
            <Field label="Short description">
              <Input value={draft.projectDescription} onChange={(e) => setDraft({ ...draft, projectDescription: e.target.value })} />
            </Field>
          </div>
        </>
      ) : null}

      {step === 5 ? (
        <>
          <h1 className="mt-3 font-[family-name:var(--font-zg-display)] text-4xl text-white">Where can people find you?</h1>
          <div className="mt-8 space-y-4">
            {SOCIAL_PLATFORMS.map((platform) => (
              <Field key={platform} label={SOCIAL_PLATFORM_LABELS[platform]}>
                <Input
                  value={draft.links[platform] ?? ""}
                  onChange={(e) => setDraft({ ...draft, links: { ...draft.links, [platform]: e.target.value } })}
                  placeholder="https://"
                />
              </Field>
            ))}
          </div>
        </>
      ) : null}

      {step === 6 ? (
        <>
          <h1 className="mt-3 font-[family-name:var(--font-zg-display)] text-4xl text-white">Your Sharpz is ready.</h1>
          <p className="mt-3 text-sm text-white/50">Go discover people worth knowing.</p>
          <Button className="mt-8" onClick={() => router.push(DISCOVERY_ROUTES.explore)}>
            Start exploring
          </Button>
        </>
      ) : (
        <div className="mt-10 flex items-center justify-between gap-3">
          {step > 1 ? (
            <button type="button" className="text-sm text-white/40" onClick={() => setStep((s) => s - 1)}>
              Back
            </button>
          ) : (
            <span />
          )}
          <div className="flex gap-3">
            {step === 4 || step === 5 ? (
              <button
                type="button"
                className="text-sm text-white/40"
                onClick={() => (step === 4 ? setStep(5) : finish())}
              >
                Skip
              </button>
            ) : null}
            <Button type="button" disabled={!canNext || pending} onClick={() => (step === 5 ? finish() : setStep((s) => s + 1))}>
              {pending ? "Saving…" : step === 5 ? "Finish" : "Continue"}
            </Button>
          </div>
        </div>
      )}
      {error ? <p className="mt-4 text-sm text-red-300">{error}</p> : null}
      <p className="mt-8 text-[11px] text-white/20">
        {total} steps, kept short on purpose.
      </p>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-2 block text-[11px] uppercase tracking-[0.14em] text-white/40">{label}</span>
      {children}
    </label>
  );
}
