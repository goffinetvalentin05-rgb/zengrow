import { handleConfirmPayment } from "@/src/lib/fitme/handlers";

export const maxDuration = 120;

type Params = { params: Promise<{ id: string }> };

export async function POST(_request: Request, { params }: Params) {
  const { id } = await params;
  return handleConfirmPayment(id);
}
