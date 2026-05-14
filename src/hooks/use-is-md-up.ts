"use client";

import { useSyncExternalStore } from "react";

const QUERY = "(min-width: 768px)";

function subscribeMd(callback: () => void) {
  if (typeof window === "undefined") return () => {};
  const mq = window.matchMedia(QUERY);
  mq.addEventListener("change", callback);
  return () => mq.removeEventListener("change", callback);
}

function getMdSnapshot() {
  if (typeof window === "undefined") return false;
  return window.matchMedia(QUERY).matches;
}

/** true à partir du breakpoint `md` (≥768px). */
export function useIsMdUp(): boolean {
  return useSyncExternalStore(subscribeMd, getMdSnapshot, () => false);
}
