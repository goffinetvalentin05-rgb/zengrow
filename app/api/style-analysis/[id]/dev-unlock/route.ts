import { handleDevUnlock } from "@/src/lib/fitme/handlers";

export const maxDuration = 300;

type Params = { params: Promise<{ id: string }> };

export async function POST(_request: Request, { params }: Params) {
  const { id } = await params;
  return handleDevUnlock(id);
}
