import { randomBytes } from "node:crypto";
import type { SupabaseClient } from "@supabase/supabase-js";

export function generateFeedbackToken(): string {
  return randomBytes(24).toString("base64url");
}

export async function insertPendingFeedbackTokensForReservation(
  admin: SupabaseClient,
  params: {
    restaurantId: string;
    reservationId: string;
    guestName: string | null;
    guestEmail: string | null;
  },
): Promise<{ tokenMoyen: string; tokenNegatif: string }> {
  const { restaurantId, reservationId, guestName, guestEmail } = params;

  await admin
    .from("feedbacks")
    .delete()
    .eq("reservation_id", reservationId)
    .is("responded_at", null)
    .not("token", "is", null);

  const tokenMoyen = generateFeedbackToken();
  const tokenNegatif = generateFeedbackToken();
  const name = guestName?.trim() || "Client";
  const email = guestEmail?.trim() || null;

  const { error } = await admin.from("feedbacks").insert([
    {
      restaurant_id: restaurantId,
      reservation_id: reservationId,
      token: tokenMoyen,
      initial_response: "moyen",
      customer_name: name,
      customer_email: email,
      rating: null,
      message: null,
    },
    {
      restaurant_id: restaurantId,
      reservation_id: reservationId,
      token: tokenNegatif,
      initial_response: "a_ameliorer",
      customer_name: name,
      customer_email: email,
      rating: null,
      message: null,
    },
  ]);

  if (error) {
    throw error;
  }

  return { tokenMoyen, tokenNegatif };
}
