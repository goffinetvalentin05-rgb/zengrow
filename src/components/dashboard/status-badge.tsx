import Badge from "@/src/components/ui/badge";

type ReservationStatus = "pending" | "confirmed" | "refused" | "completed" | "cancelled" | "no-show";

const labels: Record<ReservationStatus, string> = {
  pending: "En attente",
  confirmed: "Confirmée",
  refused: "Refusée",
  completed: "Terminée",
  cancelled: "Annulée",
  "no-show": "Absent",
};

const tones: Record<ReservationStatus, "neutral" | "success" | "warning" | "danger" | "sand"> = {
  pending: "warning",
  confirmed: "success",
  refused: "danger",
  completed: "success",
  cancelled: "danger",
  "no-show": "sand",
};

export default function StatusBadge({
  status,
  displayLabel,
}: {
  status: ReservationStatus;
  /** Libellé affiché à la place de celui par défaut (ex. « Archivée » en mode auto). */
  displayLabel?: string;
}) {
  return <Badge tone={tones[status]}>{displayLabel ?? labels[status]}</Badge>;
}
