import Badge from "@/src/components/ui/badge";
import type { GiftCardType } from "@/src/components/dashboard/gift-cards/types";

const TYPE_LABEL: Record<GiftCardType, string> = {
  digital: "Digital",
  paper: "Papier",
};

const TYPE_TONE: Record<GiftCardType, "accent" | "premium"> = {
  digital: "accent",
  paper: "premium",
};

export default function GiftCardTypeBadge({ type }: { type: GiftCardType }) {
  return <Badge tone={TYPE_TONE[type]}>{TYPE_LABEL[type]}</Badge>;
}
