import { handleStartAnalysis } from "@/src/lib/fitme/handlers";

export const maxDuration = 120;

export async function POST(request: Request) {
  return handleStartAnalysis(request);
}
