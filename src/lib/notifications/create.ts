import { createAdminClient } from "@/src/lib/supabase/admin";
import type { CreateNotificationInput, CreateNotificationResult } from "@/src/lib/notifications/types";

function trimOrNull(value: string | null | undefined): string | null {
  if (value == null) return null;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

export type CreateNotificationWithDedupInput = CreateNotificationInput & {
  dedupKey?: string | null;
  severity?: "info" | "attention" | "critical" | null;
};

/**
 * Insère une notification in-app (service role).
 * Si dedupKey est fourni et existe déjà pour le restaurant → no-op (pas de doublon).
 */
export async function createNotification(
  input: CreateNotificationWithDedupInput,
): Promise<CreateNotificationResult & { skipped?: boolean }> {
  const restaurantId = input.restaurantId.trim();
  const title = input.title.trim();
  const message = input.message.trim();
  const dedupKey = trimOrNull(input.dedupKey ?? null);

  if (!restaurantId) {
    return { ok: false, error: "restaurantId requis." };
  }
  if (!title || title.length > 120) {
    return { ok: false, error: "title invalide (1–120 caractères)." };
  }
  if (!message || message.length > 500) {
    return { ok: false, error: "message invalide (1–500 caractères)." };
  }

  const actionUrl = trimOrNull(input.actionUrl ?? null);
  if (actionUrl && actionUrl.length > 500) {
    return { ok: false, error: "actionUrl trop long." };
  }

  const admin = createAdminClient();

  if (dedupKey) {
    const { data: existing } = await admin
      .from("notifications")
      .select("id")
      .eq("restaurant_id", restaurantId)
      .eq("dedup_key", dedupKey)
      .maybeSingle();
    if (existing?.id) {
      return { ok: true, id: String(existing.id), skipped: true };
    }
  }

  const { data, error } = await admin
    .from("notifications")
    .insert({
      restaurant_id: restaurantId,
      type: input.type,
      title,
      message,
      related_entity_type: trimOrNull(input.relatedEntityType ?? null),
      related_entity_id: input.relatedEntityId ?? null,
      action_url: actionUrl,
      read: false,
      dedup_key: dedupKey,
      severity: input.severity ?? null,
    })
    .select("id")
    .single();

  if (error || !data) {
    // Course: unique violation → traiter comme skip
    if (error?.code === "23505" && dedupKey) {
      const { data: again } = await admin
        .from("notifications")
        .select("id")
        .eq("restaurant_id", restaurantId)
        .eq("dedup_key", dedupKey)
        .maybeSingle();
      if (again?.id) return { ok: true, id: String(again.id), skipped: true };
    }
    console.error("[createNotification]", error?.message ?? "insert failed");
    return { ok: false, error: error?.message ?? "Impossible de créer la notification." };
  }

  return { ok: true, id: String(data.id) };
}
