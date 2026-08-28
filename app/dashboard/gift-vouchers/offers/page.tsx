import { redirect } from "next/navigation";

export default function GiftVoucherOffersRedirect() {
  redirect("/dashboard/loyalty?tab=rewards");
}
