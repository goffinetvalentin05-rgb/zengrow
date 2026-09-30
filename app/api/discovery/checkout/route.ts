import { createLearnCheckout } from "@/src/lib/billing/checkout";

/** Legacy Discovery URL. Same user billing as /api/billing/checkout. */
export async function POST() {
  return createLearnCheckout();
}
