import { notFound } from "next/navigation";
import GiftVoucherOfferEditor from "@/src/components/dashboard/gift-cards/gift-voucher-offer-editor";
import DashboardContent from "@/src/components/dashboard/ui/dashboard-content";
import { requireRestaurantSession } from "@/src/lib/auth";
import { GiftVoucherServiceError } from "@/src/lib/gift-vouchers/errors";
import { getGiftVoucherOffer } from "@/src/lib/gift-vouchers/offers/service";
import type { GiftVoucherOffer } from "@/src/lib/gift-vouchers/offers/types";
import { createClient } from "@/src/lib/supabase/server";

type EditGiftVoucherOfferPageProps = {
  params: Promise<{ id: string }>;
};

export default async function EditGiftVoucherOfferPage({ params }: EditGiftVoucherOfferPageProps) {
  const { restaurant } = await requireRestaurantSession();
  const { id } = await params;
  const supabase = await createClient();
  let offer: GiftVoucherOffer;
  try {
    offer = await getGiftVoucherOffer(supabase, restaurant.id, id);
  } catch (error) {
    if (error instanceof GiftVoucherServiceError && error.status === 404) notFound();
    throw error;
  }

  return (
    <DashboardContent width="wide">
      <GiftVoucherOfferEditor restaurantId={restaurant.id} offer={offer} />
    </DashboardContent>
  );
}
