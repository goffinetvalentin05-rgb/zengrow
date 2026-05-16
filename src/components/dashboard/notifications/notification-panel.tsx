"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useId, useRef } from "react";
import Button from "@/src/components/ui/button";
import NotificationListItem from "@/src/components/dashboard/notifications/notification-list-item";
import {
  useNotificationActions,
  useNotificationData,
} from "@/src/components/dashboard/notifications/notification-provider";
import { cn } from "@/src/lib/utils";

const LIST_LIMIT = 10;

type NotificationPanelProps = {
  open: boolean;
  onClose: () => void;
  panelId: string;
};

export default function NotificationPanel({ open, onClose, panelId }: NotificationPanelProps) {
  const router = useRouter();
  const { items, totalCount, loading, refresh } = useNotificationData();
  const { markAsRead, markAllAsRead } = useNotificationActions();
  const listRef = useRef<HTMLDivElement>(null);
  const headingId = useId();

  useEffect(() => {
    if (open) void refresh();
  }, [open, refresh]);

  useEffect(() => {
    if (!open) return;
    const first = listRef.current?.querySelector<HTMLButtonElement>("button[type='button']");
    first?.focus();
  }, [open, items.length, loading]);

  const handleItemActivate = useCallback(
    async (id: string, actionUrl: string | null, read: boolean) => {
      if (!read) await markAsRead(id);
      onClose();
      if (actionUrl) {
        router.push(actionUrl);
      }
    },
    [markAsRead, onClose, router],
  );

  const showViewAll = totalCount > LIST_LIMIT;

  if (!open) return null;

  return (
    <div
      id={panelId}
      role="dialog"
      aria-modal="false"
      aria-labelledby={headingId}
      className={cn(
        "absolute right-0 z-50 mt-2 flex w-[min(100vw-2rem,380px)] flex-col overflow-hidden rounded-2xl border border-zg-border bg-zg-surface shadow-2xl shadow-black/35",
        "max-h-[min(70vh,520px)]",
      )}
    >
      <div className="flex items-center justify-between gap-2 border-b border-zg-border px-4 py-3">
        <h2 id={headingId} className="text-sm font-semibold text-zg-fg">
          Notifications
        </h2>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="h-8 shrink-0 px-2 text-xs text-zg-text-secondary"
          disabled={loading || items.every((n) => n.read)}
          onClick={() => void markAllAsRead()}
        >
          Tout marquer comme lu
        </Button>
      </div>

      <div ref={listRef} className="flex-1 overflow-y-auto overscroll-contain px-2 py-2">
        {loading && items.length === 0 ? (
          <p className="px-3 py-8 text-center text-sm text-zg-text-muted">Chargement…</p>
        ) : items.length === 0 ? (
          <p className="px-3 py-8 text-center text-sm text-zg-text-muted">Aucune notification pour le moment.</p>
        ) : (
          <ul className="space-y-0.5" role="list">
            {items.map((notification) => (
              <li key={notification.id}>
                <NotificationListItem
                  notification={notification}
                  onActivate={() =>
                    void handleItemActivate(notification.id, notification.action_url, notification.read)
                  }
                />
              </li>
            ))}
          </ul>
        )}
      </div>

      {showViewAll ? (
        <div className="border-t border-zg-border px-4 py-3">
          <Link
            href="/dashboard/notifications"
            className="block text-center text-sm font-semibold text-zg-accent hover:text-zg-fg"
            onClick={onClose}
          >
            Voir tout ({totalCount})
          </Link>
        </div>
      ) : null}
    </div>
  );
}
