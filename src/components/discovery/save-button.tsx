"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Bookmark } from "lucide-react";
import { cn } from "@/src/lib/utils";

export function SaveButton({
  profileId,
  initialSaved,
  className,
}: {
  profileId: string;
  initialSaved?: boolean;
  className?: string;
}) {
  const router = useRouter();
  const [saved, setSaved] = useState(Boolean(initialSaved));
  const [pending, setPending] = useState(false);

  async function toggle() {
    if (pending) return;
    setPending(true);
    const next = !saved;
    setSaved(next);
    const response = await fetch("/api/discovery/save", {
      method: next ? "POST" : "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ profileId }),
    });
    if (!response.ok) setSaved(!next);
    setPending(false);
    router.refresh();
  }

  return (
    <button
      type="button"
      onClick={toggle}
      disabled={pending}
      aria-label={saved ? "Unsave profile" : "Save profile"}
      className={cn(
        "inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/[0.1] text-white/50 transition hover:border-white/20 hover:text-white",
        saved && "border-white/25 bg-white/[0.08] text-white",
        className,
      )}
    >
      <Bookmark className="h-4 w-4" fill={saved ? "currentColor" : "none"} strokeWidth={1.75} />
    </button>
  );
}
