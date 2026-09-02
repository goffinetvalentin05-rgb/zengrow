"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Bookmark } from "lucide-react";
import { DISCOVERY_ROUTES } from "@/src/lib/discovery/routes";
import { useI18n } from "@/src/i18n/provider";
import { cn } from "@/src/lib/utils";

export function SaveButton({
  profileId,
  initialSaved,
  source = "explore",
  className,
  isLoggedIn = true,
  silent = false,
  onChange,
}: {
  profileId: string;
  initialSaved?: boolean;
  source?: string;
  className?: string;
  isLoggedIn?: boolean;
  silent?: boolean;
  onChange?: (saved: boolean) => void;
}) {
  const router = useRouter();
  const { t } = useI18n();
  const [saved, setSaved] = useState(Boolean(initialSaved));
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
    const next = !saved;
    setSaved(next);
    onChange?.(next);
    const response = await fetch("/api/discovery/save", {
      method: next ? "POST" : "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ profileId, source }),
    });
    if (response.status === 401) {
      setSaved(!next);
      onChange?.(!next);
      const dest = encodeURIComponent(window.location.pathname + window.location.search);
      router.push(`${DISCOVERY_ROUTES.login}?next=${dest}`);
      setPending(false);
      return;
    }
    if (!response.ok) {
      setSaved(!next);
      onChange?.(!next);
    }
    setPending(false);
    if (!silent) router.refresh();
  }

  return (
    <button
      type="button"
      onClick={toggle}
      disabled={pending}
      aria-label={saved ? t.actions.unsaveProfile : t.actions.saveProfile}
      aria-pressed={saved}
      className={cn(
        "sz-press inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/[0.1] text-white/50 transition-colors duration-150 hover:border-white/20 hover:text-white",
        saved && "border-white/25 bg-white/[0.08] text-white",
        className,
      )}
    >
      <Bookmark className="h-4 w-4" fill={saved ? "currentColor" : "none"} strokeWidth={1.75} />
    </button>
  );
}
