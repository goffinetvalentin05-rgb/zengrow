import { handleCreateAnalysis } from "@/src/lib/fitme/handlers";

export async function POST(request: Request) {
  return handleCreateAnalysis(request);
}
