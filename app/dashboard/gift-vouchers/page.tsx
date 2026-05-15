import PageHeader from "@/src/components/dashboard/page-header";
import GiftVouchersDashboard, {
  type GiftVoucherRow,
} from "@/src/components/dashboard/gift-vouchers-dashboard";
import DashboardContent from "@/src/components/dashboard/ui/dashboard-content";
import { requireRestaurant } from "@/src/lib/auth";
import { createClient } from "@/src/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function DashboardGiftVouchersPage() {
  const supabase = await createClient();
  const restaurant = await requireRestaurant();

  const { data, error } = await supabase
    .from("gift_voucher_requests")
    .select(
      [
        "id",
        "created_at",
        "requester_first_name",
        "requester_last_name",
        "requester_email",
        "requester_phone",
        "amount_hint",
        "beneficiary_name",
        "occasion",
        "message",
        "status",
      ].join(", "),
    )
    .eq("restaurant_id", restaurant.id)
    .order("created_at", { ascending: false })
    .limit(500);

  if (error) {
    throw new Error(error.message);
  }

  const rows = (data ?? []) as unknown as GiftVoucherRow[];

  return (
    <DashboardContent>
      <div className="space-y-10">
        <PageHeader
          title="Bons cadeaux"
          subtitle="Demandes reçues depuis votre page publique. Vous préparez le bon et l’envoyez au client."
        />
        <GiftVouchersDashboard initialRows={rows} />
      </div>
    </DashboardContent>
  );
}
