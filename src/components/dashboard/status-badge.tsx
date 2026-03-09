import Badge from "@/src/components/ui/badge";

type ReservationStatus = "pending" | "confirmed" | "completed" | "cancelled" | "no-show";

const labels: Record<ReservationStatus, string> = {
  pending: "Pending",
  confirmed: "Confirmed",
  completed: "Completed",
  cancelled: "Cancelled",
  "no-show": "No-show",
};

const tones: Record<ReservationStatus, "neutral" | "success" | "warning" | "danger" | "info"> = {
  pending: "warning",
  confirmed: "info",
  completed: "success",
  cancelled: "danger",
  "no-show": "neutral",
};

export default function StatusBadge({ status }: { status: ReservationStatus }) {
  return <Badge tone={tones[status]}>{labels[status]}</Badge>;
}
