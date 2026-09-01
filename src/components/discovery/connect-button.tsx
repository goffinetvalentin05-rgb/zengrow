"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import Button from "@/src/components/ui/button";
import { DISCOVERY_ROUTES } from "@/src/lib/discovery/routes";
import type { ConnectionUiStatus } from "@/src/lib/discovery/types";
import { cn } from "@/src/lib/utils";

const LABELS: Record<ConnectionUiStatus, string> = {
  none: "Connect",
  pending_out: "Requested",
  pending_in: "Accept",
  accepted: "Connected",
};

export function ConnectButton({
  profileId,
  initialStatus = "none",
  size = "sm",
  className,
  isLoggedIn = true,
  silent = false,
  onStatusChange,
}: {
  profileId: string;
  initialStatus?: ConnectionUiStatus;
  size?: "sm" | "md";
  className?: string;
  isLoggedIn?: boolean;
  silent?: boolean;
  onStatusChange?: (status: ConnectionUiStatus) => void;
}) {
  const router = useRouter();
  const [status, setStatus] = useState<ConnectionUiStatus>(initialStatus);
  const [pending, setPending] = useState(false);

  async function run(action: "request" | "accept" | "cancel") {
    if (pending || status === "accepted" || status === "pending_out") return;
    if (!isLoggedIn) {
      const next = encodeURIComponent(
        typeof window === "undefined" ? DISCOVERY_ROUTES.explore : window.location.pathname + window.location.search,
      );
      router.push(`${DISCOVERY_ROUTES.login}?next=${next}`);
      return;
    }
    setPending(true);
    const previous = status;
    const optimistic: ConnectionUiStatus =
      action === "cancel" ? "none" : action === "accept" || status === "pending_in" ? "accepted" : "pending_out";
    setStatus(optimistic);
    onStatusChange?.(optimistic);
    const response = await fetch("/api/discovery/connect", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ profileId, action: status === "pending_in" ? "accept" : action }),
    });
    if (response.status === 401) {
      setStatus(previous);
      onStatusChange?.(previous);
      const dest = encodeURIComponent(window.location.pathname + window.location.search);
      router.push(`${DISCOVERY_ROUTES.login}?next=${dest}`);
      setPending(false);
      return;
    }
    const payload = (await response.json().catch(() => ({}))) as { status?: string; error?: string };
    if (!response.ok) {
      setStatus(previous);
      onStatusChange?.(previous);
      setPending(false);
      return;
    }
    const next: ConnectionUiStatus =
      payload.status === "accepted"
        ? "accepted"
        : payload.status === "pending"
          ? "pending_out"
          : payload.status === "none" || payload.status === "declined"
            ? "none"
            : optimistic;
    setStatus(next);
    onStatusChange?.(next);
    setPending(false);
    if (!silent) router.refresh();
  }

  const connected = status === "accepted";
  const requested = status === "pending_out";

  return (
    <Button
      type="button"
      size={size}
      variant={connected || requested ? "secondary" : status === "pending_in" ? "primary" : "secondary"}
      onClick={() => run(status === "pending_in" ? "accept" : "request")}
      disabled={pending || connected || requested}
      aria-pressed={connected}
      className={cn("sz-press min-h-11 min-w-[6.5rem] rounded-2xl", className)}
    >
      <span key={status} className="sz-copied inline-block">
        {LABELS[status]}
      </span>
    </Button>
  );
}
