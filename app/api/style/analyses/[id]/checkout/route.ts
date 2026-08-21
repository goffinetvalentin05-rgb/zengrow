import { handleCheckout } from "@/src/lib/fitme/handlers";

type Params = { params: Promise<{ id: string }> };

export async function POST(request: Request, { params }: Params) {
  const { id } = await params;
  return handleCheckout(request, id);
}
