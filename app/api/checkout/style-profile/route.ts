import { handleCheckout } from "@/src/lib/fitme/handlers";

export async function POST(request: Request) {
  return handleCheckout(request);
}
