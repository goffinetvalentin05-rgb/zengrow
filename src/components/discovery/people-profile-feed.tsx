"use client";

import { useEffect, useRef, useState } from "react";
import { ProfileFeedCard } from "@/src/components/discovery/profile-feed-card";
import { trackDiscoveryEvent } from "@/src/lib/discovery/track";
import type { ProfileCardModel } from "@/src/lib/discovery/types";

export function PeopleProfileFeed({
  profiles,
  source = "explore",
  isLoggedIn = true,
  hasMore = false,
  onNearEnd,
}: {
  profiles: ProfileCardModel[];
  source?: string;
  isLoggedIn?: boolean;
  hasMore?: boolean;
  onNearEnd?: () => void;
}) {
  const scroller = useRef<HTMLDivElement>(null);
  const onNearEndRef = useRef(onNearEnd);
  const [activeId, setActiveId] = useState(profiles[0]?.id ?? "");
  const impressed = useRef(new Set<string>());
  const nearEndSent = useRef(false);
  onNearEndRef.current = onNearEnd;

  useEffect(() => {
    nearEndSent.current = false;
  }, [profiles.length]);

  useEffect(() => {
    if (!profiles.length) return;
    if (!profiles.some((profile) => profile.id === activeId)) {
      setActiveId(profiles[0].id);
    }
  }, [profiles, activeId]);

  useEffect(() => {
    const track = scroller.current;
    if (!track || !profiles.length) return;

    const desktop = window.matchMedia("(min-width: 768px)");
    const root = desktop.matches ? document.getElementById("discovery-scroll") : track;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (!visible) return;
        const id = (visible.target as HTMLElement).dataset.profileId;
        if (!id) return;
        setActiveId(id);
        if (!impressed.current.has(id)) {
          impressed.current.add(id);
          trackDiscoveryEvent({
            profileId: id,
            eventType: "profile_impression",
            source,
          });
        }
        const index = profiles.findIndex((profile) => profile.id === id);
        if (index >= 0 && index >= profiles.length - 3 && !nearEndSent.current) {
          nearEndSent.current = true;
          onNearEndRef.current?.();
        }
      },
      { root, threshold: [0.55, 0.72] },
    );

    const nodes = track.querySelectorAll<HTMLElement>("[data-profile-id]");
    nodes.forEach((node) => observer.observe(node));
    return () => observer.disconnect();
  }, [profiles, source]);

  if (!profiles.length) return null;

  return (
    <div className="relative h-full min-h-0 md:h-auto">
      <div ref={scroller} id="explore-feed-scroll" className="sz-person-feed">
        {profiles.map((profile, index) => (
          <section key={profile.id} data-profile-id={profile.id} className="sz-person-slide">
            <ProfileFeedCard
              profile={profile}
              source={source}
              isLoggedIn={isLoggedIn}
              active={profile.id === activeId}
              eager={index === 0}
              showEnd={!hasMore && index === profiles.length - 1}
            />
          </section>
        ))}
      </div>
    </div>
  );
}
