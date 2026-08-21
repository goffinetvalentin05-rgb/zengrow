import { handleStartAnalysis } from "@/src/lib/fitme/handlers";

export const maxDuration = 120;

type Params = { params: Promise<{ id: string }> };

export async function POST(_request: Request, { params }: Params) {
  const { id } = await params;
  return handleStartAnalysis(new Request("http://local", { method: "POST", body: JSON.stringify({ analysisId: id }) }), id);
}
