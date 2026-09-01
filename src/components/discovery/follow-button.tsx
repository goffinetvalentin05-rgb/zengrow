"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Button from "@/src/components/ui/button";
import { cn } from "@/src/lib/utils";

export function FollowButton({
  profileId,
  initialFollowing,
  source = "explore",
  size = "sm",
  className,
}: {
  profileId: string;
  initialFollowing?: boolean;
  source?: string;
  size?: "sm" | "md";
  className?: string;
}) {
  const router = useRouter();
  const [following, setFollowing] = useState(Boolean(initialFollowing));
  const [pending, setPending] = useState(false);

  async function toggle() {
    if (pending) return;
    setPending(true);
    const next = !following;
    setFollowing(next);
    const response = await fetch("/api/discovery/follow", {
      method: next ? "POST" : "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ profileId, source }),
    });
    if (!response.ok) setFollowing(!next);
    setPending(false);
    router.refresh();
  }

  return (
    <Button
      type="button"
      size={size}
      variant={following ? "secondary" : "primary"}
      onClick={toggle}
      disabled={pending}
      className={cn("min-w-[5.5rem]", className)}
    >
      {following ? "Following" : "Follow"}
    </Button>
  );
}
