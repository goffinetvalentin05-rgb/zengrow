import { handleGetPreview, handleGetResult, handleGetStatus } from "@/src/lib/fitme/handlers";
import { jsonError } from "@/src/lib/fitme/http";

type Params = { params: Promise<{ id: string }> };

export async function GET(request: Request, { params }: Params) {
  const { id } = await params;
  const view = new URL(request.url).searchParams.get("view") ?? "status";
  if (view === "preview") return handleGetPreview(id);
  if (view === "full") return handleGetResult(id);
  if (view === "status") return handleGetStatus(id);
  return jsonError("Vue invalide.");
}
