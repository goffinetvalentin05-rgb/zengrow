import Badge from "@/src/components/ui/badge";

type ReservationStatus = "pending" | "confirmed" | "rejected" | "completed" | "cancelled" | "no-show";

const labels: Record<ReservationStatus, string> = {
  pending: "En attente",
  confirmed: "Confirmée",
  rejected: "Refusée",
  completed: "Terminée",
  cancelled: "Annulée",
  "no-show": "Absent",
};

const tones: Record<ReservationStatus, "neutral" | "success" | "warning" | "danger" | "sand"> = {
  pending: "warning",
  confirmed: "success",
  rejected: "danger",
  completed: "success",
  cancelled: "danger",
  "no-show": "sand",
};

export default function StatusBadge({ status }: { status: ReservationStatus }) {
  return <Badge tone={tones[status]}>{labels[status]}</Badge>;
}
