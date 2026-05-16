import { createAdminClient } from "@/src/lib/supabase/admin";
import type { CreateNotificationInput, CreateNotificationResult } from "@/src/lib/notifications/types";

function trimOrNull(value: string | null | undefined): string | null {
  if (value == null) return null;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

/**
 * Insère une notification in-app (service role, contourne RLS INSERT).
 * Appelé depuis les routes API / actions serveur lors d'événements métier.
 */
export async function createNotification(
  input: CreateNotificationInput,
): Promise<CreateNotificationResult> {
  const restaurantId = input.restaurantId.trim();
  const title = input.title.trim();
  const message = input.message.trim();

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
    })
    .select("id")
    .single();

  if (error || !data) {
    console.error("[createNotification]", error?.message ?? "insert failed");
    return { ok: false, error: error?.message ?? "Impossible de créer la notification." };
  }

  return { ok: true, id: data.id };
}
