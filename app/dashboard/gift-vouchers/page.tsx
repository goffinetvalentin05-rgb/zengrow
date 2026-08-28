import { redirect } from "next/navigation";

type LegacyGiftVouchersPageProps = {
  searchParams: Promise<{ scan?: string; redeem?: string; code?: string; redeemToken?: string }>;
};

export default async function DashboardGiftVouchersRedirect({ searchParams }: LegacyGiftVouchersPageProps) {
  const params = await searchParams;
  const query = new URLSearchParams();
  if (params.scan === "1" || params.redeem === "1" || params.redeemToken || params.code) {
    query.set("scan", "1");
  }
  const suffix = query.toString() ? `?${query.toString()}` : "";
  redirect(`/dashboard/loyalty${suffix}`);
}
