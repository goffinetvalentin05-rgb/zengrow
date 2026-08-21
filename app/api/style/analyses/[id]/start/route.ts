import { NextResponse, after } from "next/server";
import { requireFitmeApiUser } from "@/src/lib/fitme/auth";
import { jsonError } from "@/src/lib/fitme/http";
import { getAnalysisForUser } from "@/src/lib/fitme/routing";
import { createAdminClient } from "@/src/lib/supabase/admin";
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

  if (["analyzing", "queued"].includes(analysis.status)) {
    after(() => {
      void createStyleAnalysis(id);
    });
    return NextResponse.json({ ok: true, status: analysis.status, alreadyStarted: true });
  }
  if (["preview_ready", "awaiting_payment", "generating_looks", "completed"].includes(analysis.status)) {
    return NextResponse.json({ ok: true, status: analysis.status, alreadyStarted: true });
  }
  if (analysis.status === "failed" && analysis.payment_status === "paid") {
    return jsonError("L’analyse est déjà payée. Reprenez la génération des looks.", 409);
  }
  if (!["uploaded", "failed"].includes(analysis.status)) {
    return jsonError("Ajoutez d’abord vos photos pour lancer l’analyse.", 409);
  }

  const admin = createAdminClient();
  await admin.from("style_analyses").update({ status: "queued" }).eq("id", id).eq("user_id", user.id);
  await admin.from("profiles").update({ onboarding_completed: true }).eq("id", user.id);

  after(() => {
    void createStyleAnalysis(id);
  });

  return NextResponse.json({ ok: true, status: "queued" });
}
