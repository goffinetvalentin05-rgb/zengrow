import { NextResponse } from "next/server";
import { requireFitmeApiUser } from "@/src/lib/fitme/auth";
import { createStyleProfileCheckout } from "@/src/lib/fitme/checkout";
import { jsonError } from "@/src/lib/fitme/http";
import { getAnalysisForUser } from "@/src/lib/fitme/routing";

type Params = { params: Promise<{ id: string }> };

export async function POST(request: Request, { params }: Params) {
  const auth = await requireFitmeApiUser();
  if (auth.unauthorized) return auth.unauthorized;
  const user = auth.user;
  const { id } = await params;
  const analysis = await getAnalysisForUser(id, user.id);
  if (!analysis) return jsonError("Analyse introuvable.", 404);

  if (analysis.status !== "completed") {
    return jsonError("L’analyse n’est pas encore prête.", 409);
  }
  if (analysis.is_unlocked && analysis.payment_status === "paid") {
    return NextResponse.json({ url: `/style-profile`, alreadyPaid: true });
  }

  try {
    const origin = new URL(request.url).origin;
    const checkout = await createStyleProfileCheckout({
      userId: user.id,
      email: user.email,
      analysisId: analysis.id,
      origin,
    });
    return NextResponse.json({ url: checkout.url });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Impossible de démarrer le paiement.";
    return jsonError(message, 500);
  }
}
