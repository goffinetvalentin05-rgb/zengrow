import { redirect } from "next/navigation";

export default function EditGiftVoucherOfferRedirect() {
  redirect("/dashboard/loyalty?tab=rewards");
}
