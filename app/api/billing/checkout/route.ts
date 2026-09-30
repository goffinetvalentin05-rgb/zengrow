import { createLearnCheckout } from "@/src/lib/billing/checkout";

export async function POST() {
  return createLearnCheckout();
}
