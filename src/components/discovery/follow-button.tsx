"use client";

import { useRouter } from "next/navigation";
import { useState, type CSSProperties } from "react";
import Button from "@/src/components/ui/button";
import { cn } from "@/src/lib/utils";
import { DISCOVERY_ROUTES } from "@/src/lib/discovery/routes";

export function FollowButton({
  profileId,
  initialFollowing,
  source = "explore",
  size = "sm",
  className,
  style,
  silent = false,
  isLoggedIn = true,
}: {
  profileId: string;
  initialFollowing?: boolean;
  source?: string;
  size?: "sm" | "md";
  className?: string;
  style?: CSSProperties;
  silent?: boolean;
  isLoggedIn?: boolean;
}) {
  const router = useRouter();
  const [following, setFollowing] = useState(Boolean(initialFollowing));
  const [pending, setPending] = useState(false);

  async function toggle() {
    if (pending) return;
    if (!isLoggedIn) {
      const next = encodeURIComponent(
        typeof window === "undefined" ? DISCOVERY_ROUTES.explore : window.location.pathname + window.location.search,
      );
      router.push(`${DISCOVERY_ROUTES.login}?next=${next}`);
      return;
    }
    setPending(true);
    const next = !following;
    setFollowing(next);
    const response = await fetch("/api/discovery/follow", {
      method: next ? "POST" : "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ profileId, source }),
    });
    if (response.status === 401) {
      setFollowing(!next);
      const dest = encodeURIComponent(window.location.pathname + window.location.search);
      router.push(`${DISCOVERY_ROUTES.login}?next=${dest}`);
      setPending(false);
      return;
    }
    if (!response.ok) setFollowing(!next);
    setPending(false);
    if (!silent) router.refresh();
  }

  return (
    <Button
      type="button"
      size={size}
      variant={following ? "secondary" : "primary"}
      onClick={toggle}
      disabled={pending}
      style={following ? undefined : style}
      className={cn("min-w-[5.5rem]", className)}
    >
      {following ? "Following" : "Follow"}
    </Button>
  );
}
