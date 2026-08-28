import LoyaltyPage from "@/src/components/dashboard/loyalty/loyalty-page";
import DashboardContent from "@/src/components/dashboard/ui/dashboard-content";
import { requireRestaurantSession } from "@/src/lib/auth";
import { LoyaltyServiceError } from "@/src/lib/loyalty/errors";
import { defaultLoyaltySettings } from "@/src/lib/loyalty/schemas";
import { getLoyaltySettings, listLoyaltyCards, listLoyaltyRewards } from "@/src/lib/loyalty/service";
import type { LoyaltyCardRecord, LoyaltyProgramSettings, LoyaltyReward } from "@/src/lib/loyalty/types";
import { createClient } from "@/src/lib/supabase/server";

type DashboardLoyaltyPageProps = {
  searchParams: Promise<{ scan?: string; add?: string; tab?: string }>;
};

export default async function DashboardLoyaltyPage({ searchParams }: DashboardLoyaltyPageProps) {
  const { restaurant } = await requireRestaurantSession();
  const supabase = await createClient();
  const params = await searchParams;

  let initialCards: LoyaltyCardRecord[] = [];
  let initialRewards: LoyaltyReward[] = [];
  let initialSettings: LoyaltyProgramSettings = defaultLoyaltySettings();
  try {
    [initialCards, initialRewards, initialSettings] = await Promise.all([
      listLoyaltyCards(supabase, restaurant.id),
      listLoyaltyRewards(supabase, restaurant.id),
      getLoyaltySettings(supabase, restaurant.id),
    ]);
  } catch (error) {
    if (!(error instanceof LoyaltyServiceError)) throw error;
  }

  return (
    <DashboardContent>
      <LoyaltyPage
        initialCards={initialCards}
        initialRewards={initialRewards}
        initialSettings={initialSettings}
        initialScan={params.scan === "1"}
        initialAdd={params.add === "1"}
        initialTab={params.tab === "rewards" ? "rewards" : "clients"}
      />
    </DashboardContent>
  );
}
