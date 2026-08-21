import { createAdminClient } from "@/src/lib/supabase/admin";
import { getStyleAIProvider } from "@/src/lib/ai/style-provider";
import type { StyleImageInput } from "@/src/lib/ai/style-provider";
import { STYLE_INPUTS_BUCKET, STYLE_RESULTS_BUCKET } from "@/src/lib/fitme/constants";
import type { StyleAnalysisRow } from "@/src/lib/fitme/routing";
import { styleAnalysisResultSchema, stylePreferencesSchema } from "@/src/lib/style-analysis/schemas";
import type { StyleAnalysisResult } from "@/src/lib/style-analysis/schemas";

const SOURCE_TYPES = ["portrait", "full_body", "extra"] as const;

function mimeFromPath(path: string) {
  if (path.endsWith(".png")) return "image/png";
  if (path.endsWith(".webp")) return "image/webp";
  return "image/jpeg";
}

async function downloadSourceImages(analysis: StyleAnalysisRow): Promise<StyleImageInput[]> {
  const admin = createAdminClient();
  const { data: rows, error } = await admin
    .from("style_analysis_images")
    .select("type, storage_path")
    .eq("analysis_id", analysis.id)
    .eq("is_generated", false)
    .order("created_at", { ascending: true });

  if (error || !rows?.length) {
    throw new Error("Photos introuvables.");
  }

  const images: StyleImageInput[] = [];
  for (const row of rows) {
    if (!SOURCE_TYPES.includes(row.type as (typeof SOURCE_TYPES)[number])) continue;
    const { data, error: downloadError } = await admin.storage.from(STYLE_INPUTS_BUCKET).download(row.storage_path);
    if (downloadError || !data) {
      throw new Error("Une photo n’a pas pu être lue.");
    }
    const bytes = Buffer.from(await data.arrayBuffer());
    images.push({
      type: row.type as StyleImageInput["type"],
      bytes,
      mimeType: mimeFromPath(row.storage_path),
      filename: row.storage_path.split("/").pop() ?? "photo.jpg",
    });
  }

  if (images.length < 2) {
    throw new Error("Ajoutez au moins un portrait et une photo plein pied.");
  }

  return images;
}

function pickLookSource(images: StyleImageInput[]) {
  return images.find((image) => image.type === "full_body") ?? images[0];
}

async function persistResult(analysisId: string, result: StyleAnalysisResult, looksCount: number) {
  const admin = createAdminClient();
  await admin
    .from("style_analyses")
    .update({
      primary_style: result.primaryStyle.name,
      primary_style_score: result.primaryStyle.score,
      secondary_style: result.secondaryStyle.name,
      secondary_style_score: result.secondaryStyle.score,
      color_profile: {
        bestColors: result.bestColors,
        lessFlatteringColors: result.lessFlatteringColors,
      },
      style_notes: {
        result,
        notes: result.notes,
      },
      preview_data: {
        stylesIdentified: 2,
        colorsSelected: result.bestColors.length + result.lessFlatteringColors.length,
        looksGenerated: looksCount,
      },
      status: "completed",
      completed_at: new Date().toISOString(),
      error_message: null,
    })
    .eq("id", analysisId);
}

async function markFailed(analysisId: string, message: string) {
  const admin = createAdminClient();
  await admin
    .from("style_analyses")
    .update({
      status: "failed",
      error_message: message,
    })
    .eq("id", analysisId);
}

async function claimAnalysis(analysisId: string) {
  const admin = createAdminClient();
  const { data } = await admin
    .from("style_analyses")
    .select("*")
    .eq("id", analysisId)
    .maybeSingle();

  const row = data as StyleAnalysisRow | null;
  if (!row) throw new Error("Analyse introuvable.");
  if (row.status === "completed") return { row, claimed: false };
  const stale =
    (row.status === "analyzing" || row.status === "generating") &&
    Date.now() - new Date(row.updated_at).getTime() > 4 * 60 * 1000;

  if ((row.status === "analyzing" || row.status === "generating") && !stale) {
    return { row, claimed: false };
  }

  if (!["uploaded", "queued", "failed", "analyzing", "generating"].includes(row.status)) {
    throw new Error("Cette analyse ne peut pas encore être lancée.");
  }

  const allowed = stale ? ["uploaded", "queued", "failed", "analyzing", "generating"] : ["uploaded", "queued", "failed"];
  const { data: claimed } = await admin
    .from("style_analyses")
    .update({ status: "analyzing", error_message: null })
    .eq("id", analysisId)
    .in("status", allowed)
    .select("*")
    .maybeSingle();

  return { row: (claimed as StyleAnalysisRow | null) ?? row, claimed: Boolean(claimed) };
}

export async function createStyleAnalysis(analysisId: string) {
  const admin = createAdminClient();
  const { row, claimed } = await claimAnalysis(analysisId);
  if (!claimed) {
    if (row.status === "completed") return { ok: true as const, alreadyComplete: true };
    return { ok: true as const, alreadyComplete: false };
  }

  try {
    const images = await downloadSourceImages(row);
    const preferences = stylePreferencesSchema.catch({ universes: [] }).parse(row.preferences ?? {});
    const provider = getStyleAIProvider();

    await admin.from("style_analyses").update({ status: "analyzing" }).eq("id", analysisId);

    const result = styleAnalysisResultSchema.parse(
      await provider.analyzeStyleProfile({
        images,
        preferences,
      }),
    );

    await admin.from("style_analyses").update({ status: "generating" }).eq("id", analysisId);

    const source = pickLookSource(images);
    const looks = [
      { label: `${result.primaryStyle.name} — look 1`, style: result.primaryStyle.name },
      { label: `${result.primaryStyle.name} — look 2`, style: result.primaryStyle.name },
      { label: `${result.secondaryStyle.name} — look 3`, style: result.secondaryStyle.name },
    ];

    await admin.from("style_analysis_images").delete().eq("analysis_id", analysisId).eq("is_generated", true);

    for (const [index, look] of looks.entries()) {
      const generated = await provider.generateStyleLook({
        sourceImage: source,
        style: look.style,
        colorPalette: result.bestColors,
        label: look.label,
      });
      const ext = generated.mimeType.includes("png") ? "png" : "jpg";
      const storagePath = `${row.user_id}/${analysisId}/look-${index + 1}.${ext}`;
      const { error: uploadError } = await admin.storage.from(STYLE_RESULTS_BUCKET).upload(storagePath, generated.bytes, {
        contentType: generated.mimeType,
        upsert: true,
      });
      if (uploadError) throw new Error("Impossible d’enregistrer un look généré.");

      const { error: insertError } = await admin.from("style_analysis_images").insert({
        analysis_id: analysisId,
        user_id: row.user_id,
        type: "generated",
        storage_path: storagePath,
        generated_style: look.style,
        is_generated: true,
      });
      if (insertError) throw new Error(insertError.message);
    }

    await persistResult(analysisId, result, looks.length);
    return { ok: true as const, alreadyComplete: false };
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Quelque chose n’a pas fonctionné pendant la création de votre profil.";
    await markFailed(analysisId, message);
    return { ok: false as const, error: message };
  }
}
