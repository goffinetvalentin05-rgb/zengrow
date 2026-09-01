import { readUtmMedium, readUtmSource, referrerHostFromUrl, sanitizeTrackingPlatform } from "@/src/lib/discovery/public-link";
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
  if (input.eventType === "profile_view" && sessionFlag(`sz_view:${input.profileId}`)) return;
  if (input.eventType === "profile_impression" && sessionFlag(`sz_imp:${input.profileId}`)) return;
  if (input.eventType === "profile_view") setSessionFlag(`sz_view:${input.profileId}`);
  if (input.eventType === "profile_impression") setSessionFlag(`sz_imp:${input.profileId}`);

  const search = window.location.search;
  void fetch("/api/discovery/events", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      ...input,
      visitorToken: getAnonymousVisitorToken(),
      utmSource: input.utmSource ?? sanitizeTrackingPlatform(readUtmSource(search)),
      utmMedium: input.utmMedium ?? sanitizeTrackingPlatform(readUtmMedium(search)),
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
