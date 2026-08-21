import { NextResponse } from "next/server";
import { requireFitmeApiUser } from "@/src/lib/fitme/auth";
import { jsonError } from "@/src/lib/fitme/http";
import { getAnalysisForUser } from "@/src/lib/fitme/routing";
import { isFullyUnlockedProfile, parseStoredResult, toPreview, toPublicStatus } from "@/src/lib/style-analysis/serialize";
import { PAYWALL_STATUSES } from "@/src/lib/fitme/constants";
import { createAdminClient } from "@/src/lib/supabase/admin";
import { createSignedResultUrl } from "@/src/lib/fitme/storage";

type Params = { params: Promise<{ id: string }> };

export async function GET(request: Request, { params }: Params) {
  const auth = await requireFitmeApiUser();
  if (auth.unauthorized) return auth.unauthorized;
  const user = auth.user;
  const { id } = await params;
  const analysis = await getAnalysisForUser(id, user.id);
  if (!analysis) return jsonError("Analyse introuvable.", 404);

  const url = new URL(request.url);
  const view = url.searchParams.get("view") ?? "status";

  if (view === "preview") {
    if (!(PAYWALL_STATUSES as readonly string[]).includes(analysis.status) && analysis.status !== "failed") {
      return jsonError("L’aperçu n’est pas disponible.", 409);
    }
    return NextResponse.json({ preview: toPreview(analysis) });
  }

  if (view === "full") {
    if (!isFullyUnlockedProfile(analysis)) {
      return jsonError("Le Style Profile n’est pas encore débloqué.", 403);
    }
    const result = parseStoredResult(analysis);
    if (!result) return jsonError("Résultat incomplet.", 409);

    const admin = createAdminClient();
    const { data: looks } = await admin
      .from("style_analysis_images")
      .select("id, generated_style, storage_path")
      .eq("analysis_id", analysis.id)
      .eq("is_generated", true)
      .order("created_at", { ascending: true });

    const signedLooks = [];
    for (const look of looks ?? []) {
      const signed = await createSignedResultUrl(look.storage_path);
      if (signed) {
        signedLooks.push({
          id: look.id as string,
          style: (look.generated_style as string) ?? result.primaryStyle.name,
          url: signed,
        });
      }
    }

    return NextResponse.json({
      profile: {
        ...toPublicStatus(analysis),
        primaryStyle: result.primaryStyle,
        secondaryStyle: result.secondaryStyle,
        bestColors: result.bestColors,
        lessFlatteringColors: result.lessFlatteringColors,
        notes: result.notes,
        looks: signedLooks,
      },
    });
  }

  return NextResponse.json({ analysis: toPublicStatus(analysis) });
}
