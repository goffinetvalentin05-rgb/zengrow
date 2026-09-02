"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Button from "@/src/components/ui/button";
import Input from "@/src/components/ui/input";
import {
  MAX_NICHES,
  ONBOARDING_PROJECT_STATUSES,
  ONBOARDING_ROLES,
  SOCIAL_PLATFORM_LABELS,
  SOCIAL_PLATFORMS,
  type ProfileType,
  type ProjectStatus,
} from "@/src/lib/discovery/constants";
import { COUNTRY_PRESETS } from "@/src/lib/discovery/media";
import { DISCOVERY_ROUTES } from "@/src/lib/discovery/routes";
import { getBrandedProfilePreview, type PublicSlugStatus } from "@/src/lib/discovery/public-link";
import { slugifyUsername } from "@/src/lib/discovery/slug";
import { PROFILE_THEME_KEYS, PROFILE_THEMES, profileThemeVars, resolveProfileTheme } from "@/src/lib/discovery/appearance";
import {
  ONBOARDING_STEPS,
  canLeaveOnboardingStep,
  emptyOnboardingDraft,
  markOnboardingJustFinished,
  readOnboardingDraft,
  writeOnboardingDraft,
  type OnboardingDraft,
  type OnboardingStepId,
} from "@/src/lib/discovery/onboarding";
import { OnboardingAvatarPick, OnboardingCoverPick, OnboardingLogoPick } from "@/src/components/discovery/onboarding-media";
import { DiscoveryAvatar } from "@/src/components/discovery/avatar";
import { FadeImg } from "@/src/components/discovery/sz-ui";
import type { Category, Profile, Project, SocialLink } from "@/src/lib/discovery/types";
import { cn } from "@/src/lib/utils";
import { useI18n } from "@/src/i18n/provider";
import { interpolate } from "@/src/locales/app";
import { translateDiscoveryError } from "@/src/lib/discovery/error-i18n";

const inputClass =
  "sz-focus h-12 w-full rounded-2xl border border-white/[0.08] bg-[#0c0c0e] px-3.5 text-sm text-white outline-none placeholder:text-white/28";

export function OnboardingFlow({
  userId,
  profile,
  categories,
  initialNicheIds,
  initialProject,
  initialSocials,
}: {
  userId: string;
  profile: Profile;
  categories: Category[];
  initialNicheIds: string[];
  initialProject: Project | null;
  initialSocials: SocialLink[];
}) {
  const router = useRouter();
  const { t } = useI18n();
  const seeded = useMemo(
    () =>
      emptyOnboardingDraft(profile.id, {
        niches: initialNicheIds.slice(0, MAX_NICHES),
        profileType: profile.profileType ?? "",
        displayName: profile.displayName,
        username: profile.username || slugifyUsername(profile.displayName || profile.email || "member"),
        bio: profile.bio ?? "",
        location: profile.location ?? "",
        country: profile.country ?? "",
        skipProject: false,
        projectName: initialProject?.name ?? "",
        projectDescription: initialProject?.description ?? "",
        projectUrl: initialProject?.url ?? "",
        projectLogoUrl: initialProject?.logoUrl ?? "",
        projectCategory: initialProject?.category ?? "",
        projectStatus: (initialProject?.status as ProjectStatus) ?? "building",
        themeKey: profile.themeKey || "obsidian",
        avatarUrl: profile.avatarUrl ?? "",
        coverImageUrl: profile.coverImageUrl ?? "",
        links: Object.fromEntries(initialSocials.map((link) => [link.platform, link.url])),
      }),
    [profile, initialNicheIds, initialProject, initialSocials],
  );
  const [draft, setDraft] = useState<OnboardingDraft>(seeded);
  const [hydrated, setHydrated] = useState(false);
  const [direction, setDirection] = useState<"fwd" | "back">("fwd");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [usernameStatus, setUsernameStatus] = useState<PublicSlugStatus | null>(null);
  const started = useRef(false);

  useEffect(() => {
    const stored = readOnboardingDraft(profile.id);
    if (stored) setDraft(stored);
    setHydrated(true);
  }, [profile.id]);

  useEffect(() => {
    if (!hydrated) return;
    writeOnboardingDraft(draft);
  }, [draft, hydrated]);

  useEffect(() => {
    if (started.current) return;
    started.current = true;
    void fetch("/api/discovery/onboarding", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ intent: "progress", step: "interests" }),
    });
  }, []);

  useEffect(() => {
    const username = slugifyUsername(draft.username);
    if (username.length < 3) {
      setUsernameStatus(null);
      return;
    }
    const timer = window.setTimeout(() => {
      void fetch(`/api/discovery/username?value=${encodeURIComponent(username)}`)
        .then((response) => response.json())
        .then((payload: { status?: PublicSlugStatus }) => {
          if (payload.status) setUsernameStatus(payload.status);
        })
        .catch(() => setUsernameStatus(null));
    }, 350);
    return () => window.clearTimeout(timer);
  }, [draft.username]);

  const stepIndex = ONBOARDING_STEPS.indexOf(draft.step);
  const usernameTaken = usernameStatus === "taken" || usernameStatus === "reserved" || usernameStatus === "invalid";
  const canContinue =
    canLeaveOnboardingStep(draft.step, draft) &&
    (draft.step !== "identity" || (usernameStatus !== "taken" && usernameStatus !== "reserved"));

  function go(next: OnboardingStepId, dir: "fwd" | "back") {
    setError(null);
    setDirection(dir);
    setDraft((current) => ({ ...current, step: next }));
    void fetch("/api/discovery/onboarding", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ intent: "progress", step: next }),
    });
  }

  function continueStep() {
    if (!canContinue) return;
    if (draft.step === "appearance") {
      void finish();
      return;
    }
    const next = ONBOARDING_STEPS[stepIndex + 1];
    if (next) go(next, "fwd");
  }

  async function finish() {
    if (pending) return;
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
      setError(translateDiscoveryError(payload.error, t));
      if (payload.error?.toLowerCase().includes("taken") || response.status === 409) {
        go("identity", "back");
      }
      return;
    }
    markOnboardingJustFinished();
    router.push(DISCOVERY_ROUTES.explore);
    router.refresh();
  }

  return (
    <div className="sz-app mx-auto flex min-h-dvh w-full max-w-[440px] flex-col px-5 pt-5 md:max-w-[480px] md:pt-10">
      <div className="mb-7">
        <p className="sz-label">
          {stepIndex + 1} / {ONBOARDING_STEPS.length}
        </p>
        <div className="mt-3 h-px overflow-hidden rounded-full bg-white/[0.08]">
          <div
            className="h-full bg-white transition-[width] duration-300 ease-out"
            style={{ width: `${((stepIndex + 1) / ONBOARDING_STEPS.length) * 100}%` }}
          />
        </div>
      </div>

      <div key={draft.step} className={cn("flex-1 pb-6", direction === "back" ? "sz-step-back" : "sz-step-fwd")}>
        {draft.step === "interests" ? <InterestsStep categories={categories} draft={draft} setDraft={setDraft} /> : null}
        {draft.step === "identity" ? (
          <IdentityStep draft={draft} setDraft={setDraft} usernameStatus={usernameStatus} usernameTaken={usernameTaken} />
        ) : null}
        {draft.step === "project" ? (
          <ProjectStep userId={userId} categories={categories} draft={draft} setDraft={setDraft} />
        ) : null}
        {draft.step === "appearance" ? <AppearanceStep userId={userId} draft={draft} setDraft={setDraft} /> : null}
      </div>

      {error ? <p className="mb-3 text-sm text-red-300">{error}</p> : null}

      <div className="sticky bottom-0 -mx-5 mt-auto border-t border-white/[0.06] bg-[#050506]/92 px-5 py-4 backdrop-blur-md pb-[max(1rem,env(safe-area-inset-bottom))]">
        <div className="flex items-center justify-between gap-3">
          {stepIndex > 0 ? (
            <button
              type="button"
              className="min-h-11 text-sm text-white/40"
              onClick={() => go(ONBOARDING_STEPS[stepIndex - 1], "back")}
            >
              {t.common.back}
            </button>
          ) : (
            <span />
          )}
          <Button type="button" className="sz-press min-h-11 min-w-[9.5rem]" disabled={!canContinue || pending} onClick={continueStep}>
            {pending ? t.common.saving : draft.step === "appearance" ? t.onboarding.startDiscovering : t.common.continue}
          </Button>
        </div>
      </div>
    </div>
  );
}

function InterestsStep({
  categories,
  draft,
  setDraft,
}: {
  categories: Category[];
  draft: OnboardingDraft;
  setDraft: (next: OnboardingDraft | ((current: OnboardingDraft) => OnboardingDraft)) => void;
}) {
  const { t } = useI18n();
  return (
    <>
      <h1 className="sz-display">{t.onboarding.interestsTitle}</h1>
      <p className="sz-sub">{t.onboarding.interestsSub}</p>
      <div className="mt-8 grid grid-cols-2 gap-2.5">
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
                "sz-press min-h-[4.35rem] rounded-[1.25rem] border px-4 py-3 text-left text-[15px] leading-snug transition-colors duration-150",
                active ? "border-white bg-white text-zinc-950" : "border-white/[0.08] bg-white/[0.03] text-white/75",
              )}
            >
              {cat.name}
            </button>
          );
        })}
      </div>
      <p className="sz-meta mt-4">{interpolate(t.onboarding.selected, { n: draft.niches.length, max: MAX_NICHES })}</p>
    </>
  );
}

function IdentityStep({
  draft,
  setDraft,
  usernameStatus,
  usernameTaken,
}: {
  draft: OnboardingDraft;
  setDraft: (next: OnboardingDraft | ((current: OnboardingDraft) => OnboardingDraft)) => void;
  usernameStatus: PublicSlugStatus | null;
  usernameTaken: boolean;
}) {
  const { t } = useI18n();
  const preview = draft.username ? getBrandedProfilePreview(slugifyUsername(draft.username)) : "sharpz.me/username";
  const slugMessage =
    usernameStatus === "taken"
      ? t.slug.taken
      : usernameStatus === "reserved"
        ? t.slug.reserved
        : usernameStatus === "invalid"
          ? t.slug.invalid
          : t.slug.available;
  return (
    <>
      <h1 className="sz-display">{t.onboarding.identityTitle}</h1>
      <p className="sz-sub">{t.onboarding.identitySub}</p>
      <div className="mt-8 space-y-5">
        <Field label={t.onboarding.name}>
          <Input
            value={draft.displayName}
            onChange={(event) => setDraft({ ...draft, displayName: event.target.value })}
            className={inputClass}
            autoComplete="name"
          />
        </Field>
        <Field label={t.onboarding.sharpzLink}>
          <Input
            value={draft.username}
            onChange={(event) =>
              setDraft({ ...draft, username: event.target.value.toLowerCase().replace(/^\/+/, "").replace(/\s/g, "") })
            }
            className={inputClass}
            spellCheck={false}
            autoCapitalize="none"
            autoCorrect="off"
            placeholder="maya"
          />
          <p className={cn("mt-2 text-sm", usernameTaken ? "text-red-300" : "text-white/40")}>
            {preview}
            {usernameStatus && usernameStatus !== "available" && usernameStatus !== "current"
              ? ` · ${slugMessage}`
              : usernameStatus === "available" || usernameStatus === "current"
                ? ` · ${t.onboarding.available}`
                : null}
          </p>
        </Field>
        <div>
          <p className="sz-label mb-3">{t.onboarding.role}</p>
          <div className="grid grid-cols-2 gap-2">
            {ONBOARDING_ROLES.map((role) => {
              const active = draft.profileType === role;
              return (
                <button
                  key={role}
                  type="button"
                  onClick={() => setDraft({ ...draft, profileType: role })}
                  className={cn(
                    "sz-press min-h-12 rounded-[1.1rem] border px-3 text-sm transition-colors duration-150",
                    active ? "border-white bg-white text-zinc-950" : "border-white/[0.08] bg-white/[0.03] text-white/70",
                  )}
                >
                  {t.roles[role as ProfileType]}
                </button>
              );
            })}
          </div>
        </div>
        <Field label={t.onboarding.country}>
          <select
            value={draft.country}
            onChange={(event) => setDraft({ ...draft, country: event.target.value })}
            className={inputClass}
          >
            <option value="">{t.common.optional}</option>
            {COUNTRY_PRESETS.map((country) => (
              <option key={country} value={country}>
                {country}
              </option>
            ))}
          </select>
        </Field>
        <Field label={t.onboarding.city}>
          <Input
            value={draft.location}
            onChange={(event) => setDraft({ ...draft, location: event.target.value })}
            className={inputClass}
            placeholder={t.common.optional}
          />
        </Field>
        <Field label={t.onboarding.bio}>
          <textarea
            value={draft.bio}
            onChange={(event) => setDraft({ ...draft, bio: event.target.value.slice(0, 160) })}
            rows={3}
            placeholder={t.onboarding.bioPlaceholder}
            className="sz-focus w-full rounded-2xl border border-white/[0.08] bg-[#0c0c0e] px-3.5 py-3 text-sm text-white outline-none placeholder:text-white/28"
          />
        </Field>
      </div>
    </>
  );
}

function ProjectStep({
  userId,
  categories,
  draft,
  setDraft,
}: {
  userId: string;
  categories: Category[];
  draft: OnboardingDraft;
  setDraft: (next: OnboardingDraft | ((current: OnboardingDraft) => OnboardingDraft)) => void;
}) {
  const { t } = useI18n();
  return (
    <>
      <h1 className="sz-display">{t.onboarding.projectTitle}</h1>
      <p className="sz-sub">{t.onboarding.projectSub}</p>
      <button
        type="button"
        onClick={() => setDraft({ ...draft, skipProject: !draft.skipProject })}
        className="mt-5 text-sm text-white/40 underline-offset-4 hover:text-white/70 hover:underline"
      >
        {draft.skipProject ? t.onboarding.unskipProject : t.onboarding.skipProject}
      </button>
      {draft.skipProject ? (
        <p className="sz-body mt-8">{t.onboarding.skipHint}</p>
      ) : (
        <div className="mt-8 space-y-5">
          <Field label={t.onboarding.projectName}>
            <Input
              value={draft.projectName}
              onChange={(event) => setDraft({ ...draft, projectName: event.target.value })}
              className={inputClass}
              placeholder="Northloop"
            />
          </Field>
          <Field label={t.onboarding.projectDescription}>
            <Input
              value={draft.projectDescription}
              onChange={(event) => setDraft({ ...draft, projectDescription: event.target.value })}
              className={inputClass}
              placeholder={t.common.optional}
            />
          </Field>
          <Field label={t.onboarding.projectUrl}>
            <Input
              value={draft.projectUrl}
              onChange={(event) => setDraft({ ...draft, projectUrl: event.target.value })}
              className={inputClass}
              placeholder={t.common.optional}
            />
          </Field>
          <div>
            <p className="sz-label mb-3">{t.common.logo}</p>
            <OnboardingLogoPick
              userId={userId}
              url={draft.projectLogoUrl}
              onChange={(projectLogoUrl) => setDraft({ ...draft, projectLogoUrl })}
            />
          </div>
          <Field label={t.onboarding.category}>
            <select
              value={draft.projectCategory}
              onChange={(event) => setDraft({ ...draft, projectCategory: event.target.value })}
              className={inputClass}
            >
              <option value="">{t.common.optional}</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.name}>
                  {cat.name}
                </option>
              ))}
            </select>
          </Field>
          <div>
            <p className="sz-label mb-3">{t.onboarding.status}</p>
            <div className="grid grid-cols-2 gap-2">
              {ONBOARDING_PROJECT_STATUSES.map((status) => {
                const active = draft.projectStatus === status;
                return (
                  <button
                    key={status}
                    type="button"
                    onClick={() => setDraft({ ...draft, projectStatus: status })}
                    className={cn(
                      "sz-press min-h-11 rounded-[1.1rem] border px-3 text-sm",
                      active ? "border-white bg-white text-zinc-950" : "border-white/[0.08] bg-white/[0.03] text-white/70",
                    )}
                  >
                    {t.projectStatus[status]}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function AppearanceStep({
  userId,
  draft,
  setDraft,
}: {
  userId: string;
  draft: OnboardingDraft;
  setDraft: (next: OnboardingDraft | ((current: OnboardingDraft) => OnboardingDraft)) => void;
}) {
  const { t } = useI18n();
  const theme = resolveProfileTheme(draft.themeKey);
  return (
    <>
      <h1 className="sz-display">{t.onboarding.appearanceTitle}</h1>
      <p className="sz-sub">{t.onboarding.appearanceSub}</p>
      <div className="mt-7 overflow-hidden rounded-[1.5rem] ring-1 ring-white/[0.08]" style={profileThemeVars(theme)}>
        <div className="relative h-24">
          {draft.coverImageUrl ? (
            <FadeImg src={draft.coverImageUrl} alt="" className="h-full w-full object-cover" />
          ) : (
            <div
              className="h-full w-full"
              style={{
                background: `radial-gradient(ellipse 90% 80% at 50% -20%, ${theme.heroFrom}, transparent 58%), linear-gradient(180deg, ${theme.heroVia}, ${theme.heroTo})`,
              }}
            />
          )}
        </div>
        <div className="relative -mt-7 flex items-end gap-3 px-4 pb-4">
          <DiscoveryAvatar name={draft.displayName || t.common.you} src={draft.avatarUrl || null} size="lg" className="ring-[3px] ring-[#050506]" />
          <div className="min-w-0 pb-0.5">
            <p className="truncate font-[family-name:var(--font-zg-display)] text-xl leading-none text-white">
              {draft.displayName || t.common.yourName}
            </p>
            <p className="mt-1 truncate text-sm text-white/40">@{slugifyUsername(draft.username) || "username"}</p>
          </div>
        </div>
      </div>
      <div className="mt-8 space-y-6">
        <div>
          <p className="sz-label mb-3">{t.onboarding.avatar}</p>
          <OnboardingAvatarPick
            userId={userId}
            name={draft.displayName || t.common.you}
            url={draft.avatarUrl}
            onChange={(avatarUrl) => setDraft({ ...draft, avatarUrl })}
          />
        </div>
        <div>
          <p className="sz-label mb-3">{t.onboarding.cover}</p>
          <OnboardingCoverPick
            userId={userId}
            url={draft.coverImageUrl}
            onChange={(coverImageUrl) => setDraft({ ...draft, coverImageUrl })}
          />
        </div>
        <div>
          <p className="sz-label mb-3">{t.onboarding.theme}</p>
          <div className="grid grid-cols-5 gap-2">
            {PROFILE_THEME_KEYS.map((key) => {
              const item = PROFILE_THEMES[key];
              const active = draft.themeKey === key;
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => setDraft({ ...draft, themeKey: key })}
                  className={cn(
                    "sz-press flex flex-col items-center gap-2 rounded-2xl py-3 ring-1",
                    active ? "bg-white/[0.08] ring-white/30" : "ring-white/[0.06]",
                  )}
                >
                  <span className="h-8 w-8 rounded-full" style={{ background: item.swatch }} />
                  <span className="text-[10px] text-white/55">{item.label}</span>
                </button>
              );
            })}
          </div>
        </div>
        <div>
          <p className="sz-label mb-3">{t.onboarding.socials}</p>
          <div className="space-y-3">
            {SOCIAL_PLATFORMS.map((platform) => (
              <Field key={platform} label={SOCIAL_PLATFORM_LABELS[platform]}>
                <Input
                  value={draft.links[platform] ?? ""}
                  onChange={(event) =>
                    setDraft({ ...draft, links: { ...draft.links, [platform]: event.target.value } })
                  }
                  className={inputClass}
                  placeholder={t.common.optional}
                />
              </Field>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="sz-label mb-2 block">{label}</span>
      {children}
    </label>
  );
}
