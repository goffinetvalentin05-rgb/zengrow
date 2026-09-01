"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
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
import { COUNTRY_PRESETS } from "@/src/lib/discovery/media";
import { categoryHref } from "@/src/lib/discovery/routes";
import type { ExploreFilters } from "@/src/lib/discovery/types";
import Button from "@/src/components/ui/button";

function hrefFor(slug: string, filters: ExploreFilters) {
  const params = new URLSearchParams();
  if (filters.location) params.set("location", filters.location);
  if (filters.profileType) params.set("type", filters.profileType);
  if (filters.age) params.set("age", filters.age);
  if (filters.audience) params.set("audience", filters.audience);
  if (filters.platform) params.set("platform", filters.platform);
  if (filters.activity) params.set("activity", filters.activity);
  const qs = params.toString();
  return qs ? `${categoryHref(slug)}?${qs}` : categoryHref(slug);
}

const selectClass =
  "h-11 w-full rounded-2xl border border-white/[0.08] bg-[#0d0c12] px-3 text-sm text-white";

export function CategoryFilters({
  slug,
  filters,
  extraLocations = [],
}: {
  slug: string;
  filters: ExploreFilters;
  extraLocations?: string[];
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const locations = [...new Set([...COUNTRY_PRESETS, ...extraLocations])];
  const activeCount = [
    filters.location,
    filters.profileType,
    filters.age,
    filters.audience,
    filters.platform,
    filters.activity,
  ].filter(Boolean).length;

  function go(patch: Partial<ExploreFilters>) {
    router.push(hrefFor(slug, { ...filters, ...patch }));
  }

  return (
    <>
      <Button type="button" variant="secondary" onClick={() => setOpen(true)}>
        Filters{activeCount ? ` · ${activeCount}` : ""}
      </Button>
      {open ? (
        <div className="fixed inset-0 z-50 flex items-end bg-black/70 md:items-center md:justify-center md:p-6">
          <div className="max-h-[86dvh] w-full max-w-md overflow-y-auto rounded-t-3xl bg-[#121118] p-5 md:rounded-3xl">
            <div className="mb-5 flex items-center justify-between">
              <h2 className="font-[family-name:var(--font-zg-display)] text-2xl text-white">Filters</h2>
              <button type="button" className="text-sm text-white/40" onClick={() => setOpen(false)}>
                Done
              </button>
            </div>
            <Field label="Location">
              <select className={selectClass} value={filters.location ?? ""} onChange={(e) => go({ location: e.target.value || null })}>
                <option value="">Anywhere</option>
                {locations.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Profile type">
              <select
                className={selectClass}
                value={filters.profileType ?? ""}
                onChange={(e) => go({ profileType: (e.target.value || null) as ExploreFilters["profileType"] })}
              >
                <option value="">All</option>
                {PROFILE_TYPES.filter((type) => type !== "coach" && type !== "investor" && type !== "other").map((type) => (
                  <option key={type} value={type}>
                    {PROFILE_TYPE_LABELS[type]}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Age">
              <select className={selectClass} value={filters.age ?? ""} onChange={(e) => go({ age: e.target.value || null })}>
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
                value={filters.audience ?? ""}
                onChange={(e) => go({ audience: e.target.value || null })}
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
                value={filters.platform ?? ""}
                onChange={(e) => go({ platform: (e.target.value || null) as ExploreFilters["platform"] })}
              >
                <option value="">Any</option>
                {SOCIAL_PLATFORMS.filter((p) => p !== "website").map((platform) => (
                  <option key={platform} value={platform}>
                    {SOCIAL_PLATFORM_LABELS[platform]}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Sort">
              <select
                className={selectClass}
                value={filters.activity ?? "rising"}
                onChange={(e) => go({ activity: (e.target.value || null) as ExploreFilters["activity"] })}
              >
                {ACTIVITY_FILTERS.map((activity) => (
                  <option key={activity} value={activity}>
                    {ACTIVITY_LABELS[activity]}
                  </option>
                ))}
              </select>
            </Field>
            <button
              type="button"
              className="mt-4 text-sm text-white/40"
              onClick={() => router.push(categoryHref(slug))}
            >
              Clear filters
            </button>
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
