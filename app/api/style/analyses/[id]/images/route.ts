import { NextResponse } from "next/server";
import { requireFitmeApiUser } from "@/src/lib/fitme/auth";
import { jsonError, parseJson, readJson } from "@/src/lib/fitme/http";
import { getAnalysisForUser } from "@/src/lib/fitme/routing";
import { confirmImagesSchema } from "@/src/lib/style-analysis/schemas";
import { createAdminClient } from "@/src/lib/supabase/admin";

type Params = { params: Promise<{ id: string }> };

export async function POST(request: Request, { params }: Params) {
  const auth = await requireFitmeApiUser();
  if (auth.unauthorized) return auth.unauthorized;
  const user = auth.user;
  const { id } = await params;
  const analysis = await getAnalysisForUser(id, user.id);
  if (!analysis) return jsonError("Analyse introuvable.", 404);
  if (!["draft", "uploaded", "failed"].includes(analysis.status)) {
    return jsonError("Les photos ne peuvent plus être modifiées.", 409);
  }

  const parsed = parseJson(confirmImagesSchema, await readJson(request));
  if (!parsed.ok) return jsonError(parsed.error);

  const expectedPrefix = `${user.id}/${id}/`;
  for (const image of parsed.data.images) {
    if (!image.storagePath.startsWith(expectedPrefix)) {
      return jsonError("Chemin de fichier invalide.");
    }
  }

  const hasPortrait = parsed.data.images.some((image) => image.type === "portrait");
  const hasFullBody = parsed.data.images.some((image) => image.type === "full_body");
  if (!hasPortrait || !hasFullBody) {
    return jsonError("Ajoutez un portrait et une photo plein pied.");
  }

  const admin = createAdminClient();
  await admin.from("style_analysis_images").delete().eq("analysis_id", id).eq("is_generated", false);

  const { error } = await admin.from("style_analysis_images").insert(
    parsed.data.images.map((image) => ({
      analysis_id: id,
      user_id: user.id,
      type: image.type,
      storage_path: image.storagePath,
      is_generated: false,
    })),
  );
  if (error) return jsonError(error.message, 500);

  await admin.from("style_analyses").update({ status: "uploaded" }).eq("id", id).eq("user_id", user.id);
  return NextResponse.json({ ok: true });
}
