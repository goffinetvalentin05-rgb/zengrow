"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { SlidersHorizontal } from "lucide-react";
import {
  ACTIVITY_FILTERS,
  AGE_RANGES,
  AUDIENCE_RANGES,
  PROFILE_TYPES,
  SOCIAL_PLATFORM_LABELS,
  SOCIAL_PLATFORMS,
  type ActivityFilter,
  type ProfileType,
} from "@/src/lib/discovery/constants";
import { countActiveFilters, categoryDiscoveryHref, exploreHref } from "@/src/lib/discovery/filters";
import { COUNTRY_PRESETS } from "@/src/lib/discovery/media";
import type { ExploreFilters } from "@/src/lib/discovery/types";
import Button from "@/src/components/ui/button";
import { DiscoverySheet } from "@/src/components/discovery/mobile-sheet";
import { useI18n } from "@/src/i18n/provider";

const selectClass =
  "sz-focus h-11 w-full rounded-2xl border border-white/[0.08] bg-[#0c0c0e] px-3 text-sm text-white outline-none";

const ROLE_FILTERS = PROFILE_TYPES.filter((type) => type !== "coach" && type !== "other");

export function DiscoveryFiltersSheet({
  filters,
  extraLocations = [],
  hrefFor,
  onNavigate,
  compact = false,
}: {
  filters: ExploreFilters;
  extraLocations?: string[];
  hrefFor?: (next: ExploreFilters) => string;
  onNavigate?: () => void;
  compact?: boolean;
}) {
  const router = useRouter();
  const { t } = useI18n();
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState<ExploreFilters>(filters);
  const locations = [...new Set([...COUNTRY_PRESETS, ...extraLocations])];
  const activeCount = countActiveFilters(filters);
  const toHref =
    hrefFor ?? ((next: ExploreFilters) => (next.niche ? categoryDiscoveryHref(next.niche, next) : exploreHref(next)));

  const audienceLabels: Record<string, string> = {
    "under-1k": t.filters.audienceUnder1k,
    "1k-5k": t.filters.audience1k5k,
    "under-5k": t.filters.audienceUnder5k,
    "5k-25k": t.filters.audience5k25k,
    "25k-plus": t.filters.audience25kPlus,
  };
  const activityLabels: Record<ActivityFilter, string> = {
    recommended: t.activity.recommended,
    rising: t.activity.rising,
    new: t.activity.new,
    "most-followed": t.activity.mostFollowed,
  };

  useEffect(() => {
    if (open) setDraft(filters);
  }, [open, filters]);

  function apply(next = draft) {
    setOpen(false);
    onNavigate?.();
    router.push(toHref(next), { scroll: false });
  }

  return (
    <>
      {compact ? (
        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-label={t.filters.button}
          className="sz-press relative inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-white/12 bg-black/45 text-white backdrop-blur-md"
        >
          <SlidersHorizontal className="h-4 w-4" strokeWidth={1.75} />
          {activeCount ? (
            <span className="absolute -right-0.5 -top-0.5 inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-white px-1 text-[10px] font-medium text-zinc-950">
              {activeCount}
            </span>
          ) : null}
        </button>
      ) : (
        <Button type="button" variant="secondary" size="sm" className="sz-press min-h-11" onClick={() => setOpen(true)}>
          {t.filters.button}
          {activeCount ? ` · ${activeCount}` : ""}
        </Button>
      )}
      <DiscoverySheet
        open={open}
        title={t.filters.title}
        onClose={() => setOpen(false)}
        labelledBy="sz-filters-title"
        footer={
          <div className="flex items-center gap-3">
            <Button type="button" className="min-h-11 flex-1" onClick={() => apply()}>
              {t.filters.apply}
            </Button>
            <button
              type="button"
              className="min-h-11 px-2 text-sm text-white/40"
              onClick={() =>
                apply({
                  niche: filters.niche,
                  location: null,
                  profileType: null,
                  age: null,
                  audience: null,
                  platform: null,
                  activity: null,
                })
              }
            >
              {t.filters.clear}
            </button>
          </div>
        }
      >
        <Field label={t.filters.location}>
          <select
            className={selectClass}
            value={draft.location ?? ""}
            onChange={(event) => setDraft((current) => ({ ...current, location: event.target.value || null }))}
          >
            <option value="">{t.common.anywhere}</option>
            {locations.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </Field>
        <Field label={t.filters.role}>
          <select
            className={selectClass}
            value={draft.profileType ?? ""}
            onChange={(event) =>
              setDraft((current) => ({
                ...current,
                profileType: (event.target.value || null) as ExploreFilters["profileType"],
              }))
            }
          >
            <option value="">{t.common.all}</option>
            {ROLE_FILTERS.map((type) => (
              <option key={type} value={type}>
                {t.roles[type as ProfileType]}
              </option>
            ))}
          </select>
        </Field>
        <Field label={t.filters.age}>
          <select
            className={selectClass}
            value={draft.age ?? ""}
            onChange={(event) => setDraft((current) => ({ ...current, age: event.target.value || null }))}
          >
            <option value="">{t.common.any}</option>
            {AGE_RANGES.map((range) => (
              <option key={range.id} value={range.id}>
                {range.label}
              </option>
            ))}
          </select>
        </Field>
        <Field label={t.filters.audience}>
          <select
            className={selectClass}
            value={draft.audience ?? ""}
            onChange={(event) => setDraft((current) => ({ ...current, audience: event.target.value || null }))}
          >
            <option value="">{t.common.any}</option>
            {AUDIENCE_RANGES.map((range) => (
              <option key={range.id} value={range.id}>
                {audienceLabels[range.id] ?? range.label}
              </option>
            ))}
          </select>
        </Field>
        <Field label={t.filters.platform}>
          <select
            className={selectClass}
            value={draft.platform ?? ""}
            onChange={(event) =>
              setDraft((current) => ({
                ...current,
                platform: (event.target.value || null) as ExploreFilters["platform"],
              }))
            }
          >
            <option value="">{t.common.any}</option>
            {SOCIAL_PLATFORMS.filter((platform) => platform !== "website").map((platform) => (
              <option key={platform} value={platform}>
                {SOCIAL_PLATFORM_LABELS[platform]}
              </option>
            ))}
          </select>
        </Field>
        <Field label={t.filters.sort}>
          <select
            className={selectClass}
            value={draft.activity ?? "recommended"}
            onChange={(event) =>
              setDraft((current) => ({
                ...current,
                activity: (event.target.value || null) as ExploreFilters["activity"],
              }))
            }
          >
            {ACTIVITY_FILTERS.map((activity) => (
              <option key={activity} value={activity}>
                {activityLabels[activity]}
              </option>
            ))}
          </select>
        </Field>
      </DiscoverySheet>
    </>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="mb-4 block">
      <span className="sz-label mb-2 block">{label}</span>
      {children}
    </label>
  );
}
