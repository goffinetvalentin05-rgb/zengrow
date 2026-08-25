import GiftCardsPage from "@/src/components/dashboard/gift-cards/gift-cards-page";
import type { GiftCardRecord } from "@/src/components/dashboard/gift-cards/types";
import DashboardContent from "@/src/components/dashboard/ui/dashboard-content";
import { requireRestaurantSession } from "@/src/lib/auth";
import { GiftVoucherServiceError, listGiftVouchers } from "@/src/lib/gift-vouchers/service";
import { createClient } from "@/src/lib/supabase/server";

export default async function DashboardGiftVouchersPage() {
  const { restaurant } = await requireRestaurantSession();
  const supabase = await createClient();

  let initialCards: GiftCardRecord[] = [];
  try {
    initialCards = await listGiftVouchers(supabase, restaurant.id);
  } catch (error) {
    if (!(error instanceof GiftVoucherServiceError)) throw error;
    initialCards = [];
  }

  return (
    <DashboardContent>
      <GiftCardsPage initialCards={initialCards} />
    </DashboardContent>
  );
}
