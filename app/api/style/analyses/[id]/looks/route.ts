import { after, NextResponse } from "next/server";
import { requireFitmeApiUser } from "@/src/lib/fitme/auth";
import { jsonError } from "@/src/lib/fitme/http";
import { getAnalysisForUser } from "@/src/lib/fitme/routing";
import { generateStyleLooks, runClaimedLookGeneration } from "@/src/lib/style-analysis/pipeline";

export const maxDuration = 60;

type Params = { params: Promise<{ id: string }> };

export async function POST(_request: Request, { params }: Params) {
  const auth = await requireFitmeApiUser();
  if (auth.unauthorized) return auth.unauthorized;
  const user = auth.user;
  const { id } = await params;
  const analysis = await getAnalysisForUser(id, user.id);
  if (!analysis) return jsonError("Analyse introuvable.", 404);

  if (analysis.payment_status !== "paid" || !analysis.is_unlocked) {
    return jsonError("Paiement non confirmé.", 403);
  }
  if (analysis.status === "completed") {
    return NextResponse.json({ ok: true, status: "completed" });
  }

  if (analysis.status === "generating_looks") {
    after(() => {
      void runClaimedLookGeneration(id);
    });
    return NextResponse.json({ ok: true, status: "generating_looks" });
  }

  after(() => {
    void generateStyleLooks(id);
  });

  return NextResponse.json({ ok: true, status: "generating_looks" });
}
