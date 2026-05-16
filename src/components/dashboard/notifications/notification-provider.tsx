"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { createClient } from "@/src/lib/supabase/client";
import type { NotificationRow, NotificationType } from "@/src/lib/notifications/types";

const LIST_LIMIT = 10;

type NotificationDbRow = {
  id: string;
  restaurant_id: string;
  type: NotificationType;
  title: string;
  message: string;
  related_entity_type: string | null;
  related_entity_id: string | null;
  action_url: string | null;
  read: boolean;
  created_at: string;
};

function mapRow(row: NotificationDbRow): NotificationRow {
  return {
    id: row.id,
    restaurant_id: row.restaurant_id,
    type: row.type,
    title: row.title,
    message: row.message,
    related_entity_type: row.related_entity_type,
    related_entity_id: row.related_entity_id,
    action_url: row.action_url,
    read: row.read,
    created_at: row.created_at,
  };
}

type NotificationUnreadContextValue = {
  unreadCount: number;
};

type NotificationDataContextValue = {
  items: NotificationRow[];
  totalCount: number;
  loading: boolean;
  refresh: () => Promise<void>;
};

type NotificationActionsContextValue = {
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
};

const NotificationUnreadContext = createContext<NotificationUnreadContextValue>({ unreadCount: 0 });
const NotificationDataContext = createContext<NotificationDataContextValue | null>(null);
const NotificationActionsContext = createContext<NotificationActionsContextValue | null>(null);

export function useNotificationUnreadCount(): number {
  return useContext(NotificationUnreadContext).unreadCount;
}

export function useNotificationData(): NotificationDataContextValue {
  const ctx = useContext(NotificationDataContext);
  if (!ctx) {
    throw new Error("useNotificationData must be used within NotificationProvider");
  }
  return ctx;
}

export function useNotificationActions(): NotificationActionsContextValue {
  const ctx = useContext(NotificationActionsContext);
  if (!ctx) {
    throw new Error("useNotificationActions must be used within NotificationProvider");
  }
  return ctx;
}

type NotificationProviderProps = {
  restaurantId: string;
  children: ReactNode;
};

export function NotificationProvider({ restaurantId, children }: NotificationProviderProps) {
  const supabase = useMemo(() => createClient(), []);
  const [items, setItems] = useState<NotificationRow[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const mountedRef = useRef(true);

  const refresh = useCallback(async () => {
    const [listResult, unreadResult, totalResult] = await Promise.all([
      supabase
        .from("notifications")
        .select(
          "id, restaurant_id, type, title, message, related_entity_type, related_entity_id, action_url, read, created_at",
        )
        .eq("restaurant_id", restaurantId)
        .order("created_at", { ascending: false })
        .limit(LIST_LIMIT),
      supabase
        .from("notifications")
        .select("id", { count: "exact", head: true })
        .eq("restaurant_id", restaurantId)
        .eq("read", false),
      supabase
        .from("notifications")
        .select("id", { count: "exact", head: true })
        .eq("restaurant_id", restaurantId),
    ]);

    if (!mountedRef.current) return;

    if (!listResult.error && listResult.data) {
      setItems((listResult.data as NotificationDbRow[]).map(mapRow));
    }
    if (!unreadResult.error && unreadResult.count != null) {
      setUnreadCount(unreadResult.count);
    }
    if (!totalResult.error && totalResult.count != null) {
      setTotalCount(totalResult.count);
    }
    setLoading(false);
  }, [restaurantId, supabase]);

  useEffect(() => {
    mountedRef.current = true;
    setLoading(true);
    void refresh();
    return () => {
      mountedRef.current = false;
    };
  }, [refresh]);

  const markAsRead = useCallback(
    async (id: string) => {
      const { error } = await supabase
        .from("notifications")
        .update({ read: true })
        .eq("id", id)
        .eq("restaurant_id", restaurantId);

      if (error) {
        console.error("[notifications] markAsRead", error.message);
        return;
      }

      setItems((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
      setUnreadCount((c) => Math.max(0, c - 1));
    },
    [restaurantId, supabase],
  );

  const markAllAsRead = useCallback(async () => {
    const { error } = await supabase
      .from("notifications")
      .update({ read: true })
      .eq("restaurant_id", restaurantId)
      .eq("read", false);

    if (error) {
      console.error("[notifications] markAllAsRead", error.message);
      return;
    }

    setItems((prev) => prev.map((n) => ({ ...n, read: true })));
    setUnreadCount(0);
  }, [restaurantId, supabase]);

  const unreadValue = useMemo(() => ({ unreadCount }), [unreadCount]);

  const dataValue = useMemo(
    () => ({
      items,
      totalCount,
      loading,
      refresh,
    }),
    [items, totalCount, loading, refresh],
  );

  const actionsValue = useMemo(
    () => ({
      markAsRead,
      markAllAsRead,
    }),
    [markAsRead, markAllAsRead],
  );

  return (
    <NotificationUnreadContext.Provider value={unreadValue}>
      <NotificationDataContext.Provider value={dataValue}>
        <NotificationActionsContext.Provider value={actionsValue}>{children}</NotificationActionsContext.Provider>
      </NotificationDataContext.Provider>
    </NotificationUnreadContext.Provider>
  );
}
