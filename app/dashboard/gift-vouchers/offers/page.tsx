import GiftVoucherOffersCatalog from "@/src/components/dashboard/gift-cards/gift-voucher-offers-catalog";
import DashboardContent from "@/src/components/dashboard/ui/dashboard-content";
import { requireRestaurantSession } from "@/src/lib/auth";
import { GiftVoucherServiceError } from "@/src/lib/gift-vouchers/errors";
import { listGiftVoucherOffersWithStats } from "@/src/lib/gift-vouchers/offers/service";
import type { GiftVoucherOfferListItem } from "@/src/lib/gift-vouchers/offers/types";
import { createClient } from "@/src/lib/supabase/server";

export default async function GiftVoucherOffersPage() {
  const { restaurant } = await requireRestaurantSession();
  const supabase = await createClient();
  let initialOffers: GiftVoucherOfferListItem[] = [];
  try {
    initialOffers = await listGiftVoucherOffersWithStats(supabase, restaurant.id);
  } catch (error) {
    if (!(error instanceof GiftVoucherServiceError)) throw error;
    initialOffers = [];
  }

  return (
    <DashboardContent width="wide">
      <GiftVoucherOffersCatalog
        publicPath={restaurant.slug ? `/r/${restaurant.slug}` : null}
        initialOffers={initialOffers}
      />
    </DashboardContent>
  );
}
