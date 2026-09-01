"use client";

import { useEffect, useRef, useState } from "react";
import { ProfileDiscoveryCard } from "@/src/components/discovery/profile-discovery-card";
import type { ProfileCardModel } from "@/src/lib/discovery/types";
import { cn } from "@/src/lib/utils";

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

  function updateActive() {
    const node = scroller.current;
    if (!node || !node.firstElementChild) return;
    const card = node.firstElementChild as HTMLElement;
    const gap = 12;
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
        className="-mx-5 flex snap-x snap-mandatory gap-3 overflow-x-auto overscroll-x-contain scroll-px-5 px-5 pb-2 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
        style={{ scrollSnapType: "x mandatory", WebkitOverflowScrolling: "touch" }}
      >
        {profiles.map((profile, index) => (
          <div
            key={profile.id}
            className={cn("sz-swipe-card w-[min(84vw,380px)] shrink-0 snap-start", index === active && "is-active")}
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
