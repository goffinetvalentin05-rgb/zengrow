import { redirect } from "next/navigation";

export default function NewGiftVoucherOfferRedirect() {
  redirect("/dashboard/loyalty?tab=rewards");
}
