import GiftVoucherOfferEditor from "@/src/components/dashboard/gift-cards/gift-voucher-offer-editor";
import DashboardContent from "@/src/components/dashboard/ui/dashboard-content";
import { requireRestaurantSession } from "@/src/lib/auth";

export default async function NewGiftVoucherOfferPage() {
  const { restaurant } = await requireRestaurantSession();
  return (
    <DashboardContent width="wide">
      <GiftVoucherOfferEditor restaurantId={restaurant.id} />
    </DashboardContent>
  );
}
