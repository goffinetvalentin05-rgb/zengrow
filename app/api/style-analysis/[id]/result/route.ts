import { handleGetResult } from "@/src/lib/fitme/handlers";

type Params = { params: Promise<{ id: string }> };

export async function GET(_request: Request, { params }: Params) {
  const { id } = await params;
  return handleGetResult(id);
}
