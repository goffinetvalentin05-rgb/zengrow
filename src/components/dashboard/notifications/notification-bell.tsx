"use client";

import { useEffect, useId, useRef, useState } from "react";
import { Bell } from "lucide-react";
import NotificationBadge from "@/src/components/dashboard/notifications/notification-badge";
import NotificationPanel from "@/src/components/dashboard/notifications/notification-panel";
import { useNotificationUnreadCount } from "@/src/components/dashboard/notifications/notification-provider";
import { cn } from "@/src/lib/utils";

export default function NotificationBell() {
  const unreadCount = useNotificationUnreadCount();
  const panelId = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const ariaLabel =
    unreadCount > 0
      ? `Notifications, ${unreadCount > 9 ? "plus de 9" : unreadCount} non lue${unreadCount > 1 ? "s" : ""}`
      : "Notifications";

  useEffect(() => {
    function onPointerDown(e: PointerEvent) {
      if (!open) return;
      const root = rootRef.current;
      if (!root?.contains(e.target as Node)) setOpen(false);
    }

    function onKeyDown(e: KeyboardEvent) {
      if (!open) return;
      if (e.key === "Escape") setOpen(false);
    }

    window.addEventListener("pointerdown", onPointerDown);
    window.addEventListener("keydown", onKeyDown);
    return () => {
      window.removeEventListener("pointerdown", onPointerDown);
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        className={cn(
          "relative inline-flex h-10 w-10 items-center justify-center rounded-full text-zg-text-secondary transition-colors duration-200 ease-out",
          "hover:bg-white/[0.05] hover:text-zg-fg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/25",
          open && "bg-white/[0.07] text-zg-fg",
        )}
        aria-label={ariaLabel}
        aria-haspopup="dialog"
        aria-controls={panelId}
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
      >
        <Bell className="h-[18px] w-[18px]" strokeWidth={1.75} />
        <NotificationBadge />
      </button>

      <NotificationPanel open={open} onClose={() => setOpen(false)} panelId={panelId} />
    </div>
  );
}
