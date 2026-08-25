import Badge from "@/src/components/ui/badge";
import type { GiftCardStatus } from "@/src/components/dashboard/gift-cards/types";

const STATUS_LABEL: Record<GiftCardStatus, string> = {
  active: "Actif",
  used: "Utilisé",
  expired: "Expiré",
  disabled: "Désactivé",
};

const STATUS_TONE: Record<GiftCardStatus, "success" | "info" | "warning" | "neutral"> = {
  active: "success",
  used: "info",
  expired: "warning",
  disabled: "neutral",
};

export default function GiftCardStatusBadge({ status }: { status: GiftCardStatus }) {
  return <Badge tone={STATUS_TONE[status]}>{STATUS_LABEL[status]}</Badge>;
}
