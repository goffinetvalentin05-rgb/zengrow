"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { DISCOVERY_ROUTES } from "@/src/lib/discovery/routes";
import type { ExploreFilters } from "@/src/lib/discovery/types";
import {
  ACTIVITY_FILTERS,
  AUDIENCE_RANGES,
  PROFILE_TYPE_LABELS,
  PROFILE_TYPES,
  SOCIAL_PLATFORM_LABELS,
  SOCIAL_PLATFORMS,
} from "@/src/lib/discovery/constants";

function hrefWith(filters: ExploreFilters, patch: Partial<ExploreFilters>) {
  const next = { ...filters, ...patch };
  const params = new URLSearchParams();
  if (next.niche) params.set("niche", next.niche);
  if (next.location) params.set("location", next.location);
  if (next.profileType) params.set("type", next.profileType);
  if (next.audience) params.set("audience", next.audience);
  if (next.platform) params.set("platform", next.platform);
  if (next.activity) params.set("activity", next.activity);
  const qs = params.toString();
  return qs ? `${DISCOVERY_ROUTES.explore}?${qs}` : DISCOVERY_ROUTES.explore;
}

const selectClass =
  "h-10 rounded-full border border-white/[0.08] bg-[#0d0c12] px-3 text-sm text-white/80 outline-none";

export function ExploreFiltersBar({ filters }: { filters: ExploreFilters }) {
  const router = useRouter();
  function go(patch: Partial<ExploreFilters>) {
    router.push(hrefWith(filters, patch));
  }

  return (
    <div className="flex flex-wrap gap-2">
      <select
        className={selectClass}
        defaultValue={filters.profileType ?? ""}
        onChange={(event) =>
          go({ profileType: (event.target.value || null) as ExploreFilters["profileType"] })
        }
      >
        <option value="">Profile type</option>
        {PROFILE_TYPES.map((type) => (
          <option key={type} value={type}>
            {PROFILE_TYPE_LABELS[type]}
          </option>
        ))}
      </select>
      <select
        className={selectClass}
        defaultValue={filters.audience ?? ""}
        onChange={(event) => go({ audience: event.target.value || null })}
      >
        <option value="">Audience size</option>
        {AUDIENCE_RANGES.map((range) => (
          <option key={range.id} value={range.id}>
            {range.label}
          </option>
        ))}
      </select>
      <select
        className={selectClass}
        defaultValue={filters.platform ?? ""}
        onChange={(event) =>
          go({ platform: (event.target.value || null) as ExploreFilters["platform"] })
        }
      >
        <option value="">Platform</option>
        {SOCIAL_PLATFORMS.map((platform) => (
          <option key={platform} value={platform}>
            {SOCIAL_PLATFORM_LABELS[platform]}
          </option>
        ))}
      </select>
      <select
        className={selectClass}
        defaultValue={filters.activity ?? ""}
        onChange={(event) =>
          go({ activity: (event.target.value || null) as ExploreFilters["activity"] })
        }
      >
        <option value="">Activity</option>
        {ACTIVITY_FILTERS.map((activity) => (
          <option key={activity} value={activity}>
            {activity === "new" ? "New" : activity === "rising" ? "Rising" : "Most followed"}
          </option>
        ))}
      </select>
      {filters.location ? (
        <Link
          href={hrefWith(filters, { location: null })}
          className="inline-flex h-10 items-center rounded-full border border-white/[0.08] px-3 text-sm text-white/60"
        >
          {filters.location} ×
        </Link>
      ) : null}
    </div>
  );
}
