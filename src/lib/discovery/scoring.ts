import type { ProfileCardModel } from "@/src/lib/discovery/types";

/**
 * Rising / discovery ranking for the MVP.
 *
 * We do not invent follower or traffic stats. Score uses only data we own:
 * - profile completeness
 * - Sharpz follower count
 * - recency of join
 * - admin curation (featured / editor pick / featured_rank)
 *
 * When discovery_events exist, callers should pass views7d / follows7d.
 * Missing stats stay at 0 — never simulated.
 */
export type RisingSignals = {
  views7d?: number;
  follows7d?: number;
};

export function risingScore(profile: ProfileCardModel, signals: RisingSignals = {}): number {
  const ageDays = Math.max(
    0,
    (Date.now() - new Date(profile.createdAt).getTime()) / (1000 * 60 * 60 * 24),
  );
  const recency = Math.max(0, 40 - ageDays);
  const completeness = profile.completeness * 0.5;
  const follows = (signals.follows7d ?? 0) * 5;
  const views = (signals.views7d ?? 0) * 2;
  const socialProof = Math.min(profile.followersCount, 50);
  const featured = profile.isFeatured ? 40 : 0;
  const editor = profile.editorPick ? 35 : 0;
  const rankBoost = profile.featuredRank != null ? Math.max(0, 30 - profile.featuredRank) : 0;
  return recency + completeness + follows + views + socialProof + featured + editor + rankBoost;
}

export function sortByRising<T extends ProfileCardModel>(
  profiles: T[],
  signalMap: Record<string, RisingSignals> = {},
): T[] {
  return [...profiles].sort(
    (a, b) => risingScore(b, signalMap[b.id]) - risingScore(a, signalMap[a.id]),
  );
}
