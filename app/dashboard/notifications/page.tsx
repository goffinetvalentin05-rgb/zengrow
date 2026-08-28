"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import PageHeader from "@/src/components/dashboard/page-header";
import DashboardContent from "@/src/components/dashboard/ui/dashboard-content";
import NotificationListItem from "@/src/components/dashboard/notifications/notification-list-item";
import {
  useNotificationActions,
  useNotificationData,
} from "@/src/components/dashboard/notifications/notification-provider";
import Button from "@/src/components/ui/button";
import { createClient } from "@/src/lib/supabase/client";
import type { NotificationRow, NotificationType } from "@/src/lib/notifications/types";
import { isGrowthNotificationType } from "@/src/lib/notifications/types";
import { SHARPZ_ROUTES } from "@/src/lib/sharpz/routes";

const PAGE_LIMIT = 50;

export default function DashboardNotificationsPage() {
  const { refresh } = useNotificationData();
  const { markAsRead, markAllAsRead } = useNotificationActions();
  const [items, setItems] = useState<NotificationRow[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = useMemo(() => createClient(), []);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        await fetch("/api/sharpz/notifications/sync", { method: "POST" });
      } catch {
        /* ignore */
      }
      const { data } = await supabase
        .from("notifications")
        .select(
          "id, restaurant_id, type, title, message, related_entity_type, related_entity_id, action_url, read, created_at, severity",
        )
        .order("created_at", { ascending: false })
        .limit(PAGE_LIMIT);
      if (cancelled) return;
      setItems((data as NotificationRow[] | null) ?? []);
      setLoading(false);
      await refresh();
    })();
    return () => {
      cancelled = true;
    };
  }, [refresh, supabase]);

  async function handleActivate(id: string, actionUrl: string | null, read: boolean) {
    if (!read) await markAsRead(id);
    setItems((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
    if (actionUrl) window.location.href = actionUrl;
  }

  return (
    <DashboardContent>
      <PageHeader
        title="Notifications"
        subtitle="Alertes Growth Sharpz et événements restaurant — uniquement des faits réels."
      />
      <div className="mt-4 flex flex-wrap gap-2">
        <Button type="button" size="sm" variant="secondary" onClick={() => void markAllAsRead()}>
          Tout marquer comme lu
        </Button>
        <Link href={SHARPZ_ROUTES.dashboard} className="inline-flex items-center text-sm text-zg-fg hover:underline">
          Retour au Dashboard
        </Link>
      </div>

      {loading ? (
        <p className="mt-8 text-sm text-zg-muted">Chargement…</p>
      ) : items.length === 0 ? (
        <p className="mt-8 text-sm text-zg-muted">Aucune notification pour le moment.</p>
      ) : (
        <ul className="mt-6 divide-y divide-white/[0.06] rounded-2xl border border-white/[0.08]">
          {items.map((notification) => (
            <li key={notification.id} className="flex items-start gap-2 px-2">
              <span className="mt-3 shrink-0 rounded-full border border-white/[0.08] px-2 py-0.5 text-[10px] uppercase tracking-wide text-zg-muted">
                {isGrowthNotificationType(notification.type as NotificationType) ? "Growth" : "Legacy"}
              </span>
              <div className="min-w-0 flex-1">
                <NotificationListItem
                  notification={notification}
                  onActivate={() =>
                    void handleActivate(notification.id, notification.action_url, notification.read)
                  }
                />
              </div>
            </li>
          ))}
        </ul>
      )}
    </DashboardContent>
  );
}
