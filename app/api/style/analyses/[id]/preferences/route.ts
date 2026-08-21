import { NextResponse } from "next/server";
import { requireFitmeApiUser } from "@/src/lib/fitme/auth";
import { jsonError, parseJson, readJson } from "@/src/lib/fitme/http";
import { getAnalysisForUser } from "@/src/lib/fitme/routing";
import { stylePreferencesSchema } from "@/src/lib/style-analysis/schemas";
import { createAdminClient } from "@/src/lib/supabase/admin";

type Params = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, { params }: Params) {
  const auth = await requireFitmeApiUser();
  if (auth.unauthorized) return auth.unauthorized;
  const user = auth.user;
  const { id } = await params;
  const analysis = await getAnalysisForUser(id, user.id);
  if (!analysis) return jsonError("Analyse introuvable.", 404);
  if (!["draft", "uploaded"].includes(analysis.status)) {
    return jsonError("Les préférences ne peuvent plus être modifiées.", 409);
  }

  const parsed = parseJson(stylePreferencesSchema, await readJson(request));
  if (!parsed.ok) return jsonError(parsed.error);

  const admin = createAdminClient();
  await admin.from("style_analyses").update({ preferences: parsed.data }).eq("id", id).eq("user_id", user.id);

  if (parsed.data.firstName) {
    await admin.from("profiles").update({ first_name: parsed.data.firstName }).eq("id", user.id);
  }

  return NextResponse.json({ ok: true });
}
