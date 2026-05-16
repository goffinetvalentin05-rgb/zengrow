import type { PageBlockId } from "@/src/lib/public-page/editor-config";
import type { PageSectionType } from "@/src/lib/public-page/page-sections";

export const FEATURES = {
  GIFT_CARDS: false,
  // futures features...
} as const;

export function isGiftCardsEnabled(): boolean {
  return FEATURES.GIFT_CARDS;
}

export const GIFT_VOUCHERS_SECTION_TYPE = "gift_vouchers" as const satisfies PageSectionType;
export const GIFT_VOUCHERS_BLOCK_ID = "gift_vouchers" as const satisfies PageBlockId;

export function isGiftVouchersSectionType(type: PageSectionType): boolean {
  return type === GIFT_VOUCHERS_SECTION_TYPE;
}

export function isGiftVouchersBlockId(id: PageBlockId): boolean {
  return id === GIFT_VOUCHERS_BLOCK_ID;
}
