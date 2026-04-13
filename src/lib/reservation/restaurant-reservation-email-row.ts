/**
 * Forme des lignes `restaurants` utilisées pour l’e-mail de confirmation (alignée sur la migration SQL).
 * Assertion nécessaire tant que les types Supabase générés n’incluent pas ces colonnes.
 */
export type RestaurantReservationEmailDbRow = {
  id: string;
  name: string;
  owner_id?: string;
  phone: string | null;
  email: string | null;
  logo_url: string | null;
  primary_color: string | null;
  reservation_confirmation_mode: string;
  reservation_confirmation_email_subject: string | null;
  reservation_confirmation_email_body: string | null;
  subscription_status: string;
  trial_end_date: string | null;
  stripe_subscription_id: string | null;
};

export function asRestaurantReservationEmailRow(row: unknown): RestaurantReservationEmailDbRow {
  return row as RestaurantReservationEmailDbRow;
}
