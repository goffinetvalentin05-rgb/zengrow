import { NextResponse } from "next/server";
import { requireFitmeApiUser } from "@/src/lib/fitme/auth";
import { jsonError } from "@/src/lib/fitme/http";
import { getAnalysisForUser } from "@/src/lib/fitme/routing";
import { createStyleAnalysis } from "@/src/lib/style-analysis/pipeline";

export const maxDuration = 60;

type Params = { params: Promise<{ id: string }> };

export async function POST(_request: Request, { params }: Params) {
  const auth = await requireFitmeApiUser();
  if (auth.unauthorized) return auth.unauthorized;
  const user = auth.user;
  const { id } = await params;
  const analysis = await getAnalysisForUser(id, user.id);
  if (!analysis) return jsonError("Analyse introuvable.", 404);

  if (analysis.status === "completed") {
    return NextResponse.json({ ok: true, status: "completed" });
  }

  const result = await createStyleAnalysis(id);
  if (!result.ok) {
    return jsonError(result.error ?? "L’analyse a échoué.", 500);
  }
  return NextResponse.json({ ok: true });
}
