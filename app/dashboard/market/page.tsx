import { redirect } from "next/navigation";

export default function MarketRedirect() {
  redirect("/dashboard/analytics?tab=market");
}
