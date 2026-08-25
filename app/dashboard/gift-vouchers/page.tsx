import GiftCardsPage from "@/src/components/dashboard/gift-cards/gift-cards-page";
import type { GiftCardRecord } from "@/src/components/dashboard/gift-cards/types";
import DashboardContent from "@/src/components/dashboard/ui/dashboard-content";
import { requireRestaurantSession } from "@/src/lib/auth";
import { GiftVoucherServiceError, listGiftVouchers } from "@/src/lib/gift-vouchers/service";
import { createClient } from "@/src/lib/supabase/server";

type DashboardGiftVouchersPageProps = {
  searchParams: Promise<{ redeem?: string; code?: string; redeemToken?: string; scan?: string }>;
};

export default async function DashboardGiftVouchersPage({ searchParams }: DashboardGiftVouchersPageProps) {
  const { restaurant } = await requireRestaurantSession();
  const supabase = await createClient();
  const params = await searchParams;

  let initialCards: GiftCardRecord[] = [];
  try {
    initialCards = await listGiftVouchers(supabase, restaurant.id);
  } catch (error) {
    if (!(error instanceof GiftVoucherServiceError)) throw error;
    initialCards = [];
  }

  return (
    <DashboardContent>
      <GiftCardsPage
        restaurantId={restaurant.id}
        initialCards={initialCards}
        initialRedeem={params.redeem === "1"}
        initialRedeemCode={params.code?.trim() ?? ""}
        initialRedeemToken={params.redeemToken?.trim() ?? ""}
        initialScan={params.scan === "1"}
      />
    </DashboardContent>
  );
}
