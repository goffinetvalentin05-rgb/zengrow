import type { DiscoveryEventInput } from "@/src/lib/discovery/types";

export function trackDiscoveryEvent(input: DiscoveryEventInput) {
  if (typeof window === "undefined") return;
  void fetch("/api/discovery/events", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
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
