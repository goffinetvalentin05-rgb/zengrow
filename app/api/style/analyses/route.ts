import { NextResponse } from "next/server";
import { requireFitmeApiUser, ensureProfile } from "@/src/lib/fitme/auth";
import { jsonError, parseJson, readJson } from "@/src/lib/fitme/http";
import { getLatestAnalysis } from "@/src/lib/fitme/routing";
import { createAnalysisSchema } from "@/src/lib/style-analysis/schemas";
import { createAdminClient } from "@/src/lib/supabase/admin";

export async function GET() {
  const auth = await requireFitmeApiUser();
  if (auth.unauthorized) return auth.unauthorized;
  const user = auth.user;
  await ensureProfile(user.id, user.email);
  const analysis = await getLatestAnalysis(user.id);
  if (!analysis) return NextResponse.json({ analysis: null });
  return NextResponse.json({
    analysis: {
      id: analysis.id,
      status: analysis.status,
      paymentStatus: analysis.payment_status,
      isUnlocked: analysis.is_unlocked && analysis.payment_status === "paid",
      createdAt: analysis.created_at,
    },
  });
}

export async function POST(request: Request) {
  const auth = await requireFitmeApiUser();
  if (auth.unauthorized) return auth.unauthorized;
  const user = auth.user;
  await ensureProfile(user.id, user.email);
  const parsed = parseJson(createAnalysisSchema, await readJson(request));
  if (!parsed.ok) return jsonError(parsed.error);

  const latest = await getLatestAnalysis(user.id);
  if (latest && ["queued", "analyzing", "generating_looks"].includes(latest.status)) {
    return NextResponse.json({ analysisId: latest.id, resumed: true });
  }
  if (latest && ["draft", "uploaded"].includes(latest.status)) {
    const admin = createAdminClient();
    if (parsed.data.preferences) {
      await admin
        .from("style_analyses")
        .update({ preferences: parsed.data.preferences })
        .eq("id", latest.id)
        .eq("user_id", user.id);
    }
    return NextResponse.json({ analysisId: latest.id, resumed: true });
  }

  const admin = createAdminClient();
  const { data, error } = await admin
    .from("style_analyses")
    .insert({
      user_id: user.id,
      status: "draft",
      preferences: parsed.data.preferences ?? {},
    })
    .select("id")
    .single();

  if (error || !data) return jsonError(error?.message ?? "Impossible de créer l’analyse.", 500);
  return NextResponse.json({ analysisId: data.id, resumed: false });
}
