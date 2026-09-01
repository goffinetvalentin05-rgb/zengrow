"use client";

import { useEffect, useRef, useState } from "react";
import { ProfileDiscoveryCard } from "@/src/components/discovery/profile-discovery-card";
import type { ProfileCardModel } from "@/src/lib/discovery/types";
import { cn } from "@/src/lib/utils";

const AXIS_THRESHOLD = 10;

export function PeopleSwipeDeck({
  profiles,
  source = "explore",
  isLoggedIn = true,
  onNearEnd,
}: {
  profiles: ProfileCardModel[];
  source?: string;
  isLoggedIn?: boolean;
  onNearEnd?: () => void;
}) {
  const scroller = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);
  const nearEndSent = useRef(false);

  useEffect(() => {
    nearEndSent.current = false;
  }, [profiles.length]);

  useEffect(() => {
    const node = scroller.current;
    if (!node) return;

    let startX = 0;
    let startY = 0;
    let startScroll = 0;
    let axis: "x" | "y" | null = null;

    function onStart(event: TouchEvent) {
      const touch = event.touches[0];
      if (!touch) return;
      startX = touch.clientX;
      startY = touch.clientY;
      startScroll = node.scrollLeft;
      axis = null;
    }

    function onMove(event: TouchEvent) {
      const touch = event.touches[0];
      if (!touch) return;
      const dx = touch.clientX - startX;
      const dy = touch.clientY - startY;
      if (!axis) {
        if (Math.abs(dx) < AXIS_THRESHOLD && Math.abs(dy) < AXIS_THRESHOLD) return;
        axis = Math.abs(dx) > Math.abs(dy) + AXIS_THRESHOLD ? "x" : "y";
        if (axis === "x") node.style.scrollSnapType = "none";
      }
      if (axis !== "x") return;
      event.preventDefault();
      node.scrollLeft = startScroll - dx;
    }

    function onEnd() {
      node.style.scrollSnapType = "";
      axis = null;
    }

    node.addEventListener("touchstart", onStart, { passive: true });
    node.addEventListener("touchmove", onMove, { passive: false });
    node.addEventListener("touchend", onEnd);
    node.addEventListener("touchcancel", onEnd);
    return () => {
      node.style.scrollSnapType = "";
      node.removeEventListener("touchstart", onStart);
      node.removeEventListener("touchmove", onMove);
      node.removeEventListener("touchend", onEnd);
      node.removeEventListener("touchcancel", onEnd);
    };
  }, [profiles.length]);

  function updateActive() {
    const node = scroller.current;
    if (!node || !node.firstElementChild) return;
    const card = node.firstElementChild as HTMLElement;
    const styles = window.getComputedStyle(node);
    const gap = Number.parseFloat(styles.columnGap || styles.gap || "12") || 12;
    const width = card.offsetWidth + gap;
    if (!width) return;
    const index = Math.round(node.scrollLeft / width);
    setActive(Math.min(profiles.length - 1, Math.max(0, index)));
    const remaining = node.scrollWidth - node.clientWidth - node.scrollLeft;
    if (remaining < 640 && !nearEndSent.current) {
      nearEndSent.current = true;
      onNearEnd?.();
    }
  }

  if (!profiles.length) return null;

  return (
    <div>
      <div
        ref={scroller}
        onScroll={updateActive}
        className="-mx-5 flex snap-x snap-mandatory gap-3 overflow-x-auto overflow-y-hidden overscroll-x-contain scroll-px-5 px-5 pb-2 touch-pan-y [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
      >
        {profiles.map((profile, index) => (
          <div
            key={profile.id}
            className={cn(
              "sz-swipe-card h-auto w-[min(84vw,380px)] shrink-0 snap-start touch-pan-y",
              index === active && "is-active",
            )}
          >
            <ProfileDiscoveryCard
              profile={profile}
              source={source}
              variant="swipe"
              isLoggedIn={isLoggedIn}
            />
          </div>
        ))}
      </div>
      <p className="sz-meta mt-3 text-center tabular-nums">
        {active + 1} / {profiles.length}
      </p>
    </div>
  );
}
