import GiftCardsPage from "@/src/components/dashboard/gift-cards/gift-cards-page";
import DashboardContent from "@/src/components/dashboard/ui/dashboard-content";
import { requireRestaurant } from "@/src/lib/auth";

export default async function DashboardGiftVouchersPage() {
  await requireRestaurant();

  return (
    <DashboardContent>
      <GiftCardsPage />
    </DashboardContent>
  );
}
