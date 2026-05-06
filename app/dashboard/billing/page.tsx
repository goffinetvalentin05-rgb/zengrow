import { redirect } from "next/navigation";

export default async function DashboardBillingPage() {
  redirect("/dashboard/settings?section=subscription");
}
