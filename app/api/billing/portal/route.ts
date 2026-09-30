import { createLearnPortal } from "@/src/lib/billing/checkout";

export async function POST(request: Request) {
  return createLearnPortal(request);
}
