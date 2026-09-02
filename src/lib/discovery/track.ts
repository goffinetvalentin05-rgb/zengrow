import { readUtmCampaign, readUtmMedium, readUtmSource, referrerHostFromUrl, sanitizeTrackingPlatform } from "@/src/lib/discovery/public-link";
import { normalizeStoredSource, readTrackedSourceFromPathname } from "@/src/lib/discovery/attribution";
import type { DiscoveryEventInput } from "@/src/lib/discovery/types";

const VISITOR_TOKEN_KEY = "sz_vid";

export function getAnonymousVisitorToken() {
  if (typeof window === "undefined") return null;
  try {
    const existing = window.localStorage.getItem(VISITOR_TOKEN_KEY);
    if (existing) return existing;
    const next = window.crypto.randomUUID();
    window.localStorage.setItem(VISITOR_TOKEN_KEY, next);
    return next;
  } catch {
    return null;
  }
}

function sessionFlag(key: string) {
  if (typeof window === "undefined") return false;
  try {
    return window.sessionStorage.getItem(key) === "1";
  } catch {
    return false;
  }
}

function setSessionFlag(key: string) {
  if (typeof window === "undefined") return;
  try {
    window.sessionStorage.setItem(key, "1");
  } catch {
    /* private mode */
  }
}

export function trackDiscoveryEvent(input: DiscoveryEventInput) {
  if (typeof window === "undefined") return;
  const search = window.location.search;
  const fromPath = readTrackedSourceFromPathname(window.location.pathname);
  const source = normalizeStoredSource(input.source);
  const utmSource =
    input.utmSource ?? fromPath?.utmSource ?? sanitizeTrackingPlatform(readUtmSource(search));
  const viewKey = `sz_view:${input.profileId}:${source}:${utmSource ?? ""}`;
  const impKey = `sz_imp:${input.profileId}:${source}`;
  if (input.eventType === "profile_view" && sessionFlag(viewKey)) return;
  if (input.eventType === "profile_impression" && sessionFlag(impKey)) return;
  if (input.eventType === "profile_view") setSessionFlag(viewKey);
  if (input.eventType === "profile_impression") setSessionFlag(impKey);

  void fetch("/api/discovery/events", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      ...input,
      source,
      visitorToken: getAnonymousVisitorToken(),
      utmSource,
      utmMedium: input.utmMedium ?? fromPath?.utmMedium ?? sanitizeTrackingPlatform(readUtmMedium(search)),
      utmCampaign: input.utmCampaign ?? sanitizeTrackingPlatform(readUtmCampaign(search)),
      referrerHost: referrerHostFromUrl(document.referrer, window.location.hostname),
    }),
  });
}

export const EXPLORE_SCROLL_KEY = "sharpz-explore-scroll";

export type ExploreScrollState = {
  href: string;
  y: number;
  count: number;
};

function scrollElement(): HTMLElement | null {
  const feed = document.getElementById("explore-feed-scroll");
  if (feed instanceof HTMLElement) return feed;
  const node = document.getElementById("discovery-scroll") ?? document.scrollingElement;
  return node instanceof HTMLElement ? node : null;
}

export function readExploreScroll(): ExploreScrollState | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(EXPLORE_SCROLL_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as ExploreScrollState;
    if (!parsed?.href) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function persistExploreScroll(href: string, count?: number) {
  if (typeof window === "undefined") return;
  const prev = readExploreScroll();
  sessionStorage.setItem(
    EXPLORE_SCROLL_KEY,
    JSON.stringify({
      href,
      y: scrollElement()?.scrollTop ?? 0,
      count: count ?? prev?.count ?? 0,
    } satisfies ExploreScrollState),
  );
}

export function rememberExploreCount(href: string, count: number) {
  if (typeof window === "undefined") return;
  const prev = readExploreScroll();
  sessionStorage.setItem(
    EXPLORE_SCROLL_KEY,
    JSON.stringify({
      href,
      y: prev?.href === href ? prev.y : (scrollElement()?.scrollTop ?? 0),
      count,
    } satisfies ExploreScrollState),
  );
}

export function restoreExploreScroll(href: string) {
  const parsed = readExploreScroll();
  if (!parsed || parsed.href !== href) return;
  const scroller = scrollElement();
  requestAnimationFrame(() => {
    if (scroller) scroller.scrollTop = parsed.y ?? 0;
  });
}
