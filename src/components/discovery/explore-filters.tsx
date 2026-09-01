"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  ACTIVITY_FILTERS,
  ACTIVITY_LABELS,
  AGE_RANGES,
  AUDIENCE_RANGES,
  PROFILE_TYPE_LABELS,
  PROFILE_TYPES,
  SOCIAL_PLATFORM_LABELS,
  SOCIAL_PLATFORMS,
} from "@/src/lib/discovery/constants";
import { countActiveFilters, categoryDiscoveryHref, exploreHref } from "@/src/lib/discovery/filters";
import { COUNTRY_PRESETS } from "@/src/lib/discovery/media";
import type { ExploreFilters } from "@/src/lib/discovery/types";
import Button from "@/src/components/ui/button";

const selectClass =
  "h-11 w-full rounded-2xl border border-white/[0.08] bg-[#0d0c12] px-3 text-sm text-white";

const ROLE_FILTERS = PROFILE_TYPES.filter((type) => type !== "coach" && type !== "other");

export function DiscoveryFiltersSheet({
  filters,
  extraLocations = [],
  hrefFor,
}: {
  filters: ExploreFilters;
  extraLocations?: string[];
  hrefFor?: (next: ExploreFilters) => string;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState<ExploreFilters>(filters);
  const locations = [...new Set([...COUNTRY_PRESETS, ...extraLocations])];
  const activeCount = countActiveFilters(filters);
  const toHref =
    hrefFor ?? ((next: ExploreFilters) => (next.niche ? categoryDiscoveryHref(next.niche, next) : exploreHref(next)));

  useEffect(() => {
    if (open) setDraft(filters);
  }, [open, filters]);

  function apply(next = draft) {
    setOpen(false);
    router.push(toHref(next), { scroll: false });
  }

  return (
    <>
      <Button type="button" variant="secondary" size="sm" onClick={() => setOpen(true)}>
        Filters{activeCount ? ` · ${activeCount}` : ""}
      </Button>
      {open ? (
        <div
          className="fixed inset-0 z-50 flex items-end bg-black/70 md:items-center md:justify-center md:p-6"
          onClick={() => setOpen(false)}
        >
          <div
            className="max-h-[86dvh] w-full max-w-md overflow-y-auto rounded-t-3xl bg-[#121118] p-5 md:rounded-3xl"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="mb-5 flex items-center justify-between">
              <h2 className="font-[family-name:var(--font-zg-display)] text-2xl text-white">Filters</h2>
              <button type="button" className="min-h-10 text-sm text-white/40" onClick={() => setOpen(false)}>
                Close
              </button>
            </div>
            <Field label="Location">
              <select
                className={selectClass}
                value={draft.location ?? ""}
                onChange={(event) => setDraft((current) => ({ ...current, location: event.target.value || null }))}
              >
                <option value="">Anywhere</option>
                {locations.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Role">
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
                <option value="">All</option>
                {ROLE_FILTERS.map((type) => (
                  <option key={type} value={type}>
                    {PROFILE_TYPE_LABELS[type]}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Age">
              <select
                className={selectClass}
                value={draft.age ?? ""}
                onChange={(event) => setDraft((current) => ({ ...current, age: event.target.value || null }))}
              >
                <option value="">Any</option>
                {AGE_RANGES.map((range) => (
                  <option key={range.id} value={range.id}>
                    {range.label}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Audience">
              <select
                className={selectClass}
                value={draft.audience ?? ""}
                onChange={(event) => setDraft((current) => ({ ...current, audience: event.target.value || null }))}
              >
                <option value="">Any</option>
                {AUDIENCE_RANGES.map((range) => (
                  <option key={range.id} value={range.id}>
                    {range.label}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Platform">
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
                <option value="">Any</option>
                {SOCIAL_PLATFORMS.filter((platform) => platform !== "website").map((platform) => (
                  <option key={platform} value={platform}>
                    {SOCIAL_PLATFORM_LABELS[platform]}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Sort">
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
                    {ACTIVITY_LABELS[activity]}
                  </option>
                ))}
              </select>
            </Field>
            <div className="mt-2 flex items-center gap-3">
              <Button type="button" className="flex-1" onClick={() => apply()}>
                Apply
              </Button>
              <button
                type="button"
                className="text-sm text-white/40"
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
                Clear
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="mb-4 block">
      <span className="mb-2 block text-[11px] uppercase tracking-[0.14em] text-white/40">{label}</span>
      {children}
    </label>
  );
}
