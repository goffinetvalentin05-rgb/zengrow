import type { PostgrestError } from "@supabase/supabase-js";

export function mapReservationRpcError(
  error: PostgrestError | null,
  fallback: string,
  maxPartySize: number,
): string {
  const raw = (error?.message ?? fallback).toLowerCase();
  if (raw.includes("slot_full") || raw.includes("slot is full")) {
    return "Ce créneau n'a plus assez de places disponibles.";
  }
  if (raw.includes("max_party") || raw.includes("max party")) {
    return `Le nombre maximum de personnes par réservation est de ${maxPartySize}.`;
  }
  if (raw.includes("invalid_slot") || raw.includes("invalid slot")) {
    return "Ce créneau n'est pas valide.";
  }
  if (raw.includes("invalid_time")) {
    return "Ce créneau n'est pas valide.";
  }
  if (raw.includes("table_required") || raw.includes("table_taken") || raw.includes("table_capacity")) {
    return "Aucune table n'est disponible pour ce créneau et ce nombre de convives.";
  }
  if (raw.includes("settings_not_found")) {
    return "Paramètres du restaurant introuvables.";
  }
  return error?.message ?? fallback;
}
