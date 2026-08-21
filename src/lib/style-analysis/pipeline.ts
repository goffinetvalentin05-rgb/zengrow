import { createAdminClient } from "@/src/lib/supabase/admin";
import { getStyleAIProvider } from "@/src/lib/ai/style-provider";
import type { StyleImageInput } from "@/src/lib/ai/style-provider";
import { STYLE_INPUTS_BUCKET, STYLE_RESULTS_BUCKET } from "@/src/lib/fitme/constants";
import type { StyleAnalysisRow } from "@/src/lib/fitme/routing";
import { styleAnalysisResultSchema, stylePreferencesSchema } from "@/src/lib/style-analysis/schemas";
import { parseStoredResult } from "@/src/lib/style-analysis/serialize";
import type { StyleAnalysisResult } from "@/src/lib/style-analysis/schemas";

const SOURCE_TYPES = ["portrait", "full_body", "extra"] as const;
const LOOK_CLAIM_STATUSES = ["preview_ready", "awaiting_payment", "failed"] as const;

function mimeFromPath(path: string) {
  if (path.endsWith(".png")) return "image/png";
  if (path.endsWith(".webp")) return "image/webp";
  return "image/jpeg";
}

function isStale(updatedAt: string, minutes = 4) {
  return Date.now() - new Date(updatedAt).getTime() > minutes * 60 * 1000;
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

async function persistAnalysisResult(analysisId: string, result: StyleAnalysisResult) {
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
        primaryIdentified: true,
        secondaryIdentified: true,
        paletteReady: true,
        looksPending: true,
      },
      status: "preview_ready",
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

async function claimTextAnalysis(analysisId: string) {
  const admin = createAdminClient();
  const { data } = await admin.from("style_analyses").select("*").eq("id", analysisId).maybeSingle();
  const row = data as StyleAnalysisRow | null;
  if (!row) throw new Error("Analyse introuvable.");

  if (["preview_ready", "awaiting_payment", "generating_looks", "completed"].includes(row.status)) {
    return { row, claimed: false };
  }

  const stale = row.status === "analyzing" && isStale(row.updated_at);
  if (row.status === "analyzing" && !stale) return { row, claimed: false };

  const allowed = stale ? ["uploaded", "queued", "failed", "analyzing"] : ["uploaded", "queued", "failed"];
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
  const { row, claimed } = await claimTextAnalysis(analysisId);
  if (!claimed) {
    return { ok: true as const, alreadyComplete: ["preview_ready", "awaiting_payment", "generating_looks", "completed"].includes(row.status) };
  }

  try {
    const images = await downloadSourceImages(row);
    const preferences = stylePreferencesSchema.catch({ universes: [] }).parse(row.preferences ?? {});
    const provider = getStyleAIProvider();
    const result = styleAnalysisResultSchema.parse(
      await provider.analyzeStyleProfile({
        images,
        preferences,
      }),
    );
    await persistAnalysisResult(analysisId, result);
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

export async function claimLookGeneration(analysisId: string) {
  const admin = createAdminClient();
  const { data } = await admin.from("style_analyses").select("*").eq("id", analysisId).maybeSingle();
  const row = data as StyleAnalysisRow | null;
  if (!row) return { claimed: false as const, row: null, reason: "missing" as const };

  if (row.payment_status !== "paid" || !row.is_unlocked) {
    return { claimed: false as const, row, reason: "unpaid" as const };
  }
  if (row.status === "completed") {
    return { claimed: false as const, row, reason: "completed" as const };
  }

  const staleLooks = row.status === "generating_looks" && isStale(row.updated_at);
  if (row.status === "generating_looks" && !staleLooks) {
    return { claimed: false as const, row, reason: "in_progress" as const };
  }

  const allowed = staleLooks
    ? [...LOOK_CLAIM_STATUSES, "generating_looks"]
    : [...LOOK_CLAIM_STATUSES];

  const { data: claimed } = await admin
    .from("style_analyses")
    .update({ status: "generating_looks", error_message: null, looks_job_started_at: null })
    .eq("id", analysisId)
    .eq("payment_status", "paid")
    .eq("is_unlocked", true)
    .in("status", allowed)
    .select("*")
    .maybeSingle();

  if (!claimed) {
    return { claimed: false as const, row, reason: "in_progress" as const };
  }

  return { claimed: true as const, row: claimed as StyleAnalysisRow, reason: "claimed" as const };
}

export async function generateStyleLooks(analysisId: string) {
  const claimed = await claimLookGeneration(analysisId);
  if (!claimed.claimed) {
    if (claimed.reason === "completed") return { ok: true as const, alreadyComplete: true };
    if (claimed.reason === "in_progress") return { ok: true as const, alreadyComplete: false };
    if (claimed.reason === "unpaid") return { ok: false as const, error: "Paiement non confirmé." };
    return { ok: false as const, error: "Analyse introuvable." };
  }

  return runClaimedLookGeneration(claimed.row.id);
}

export async function runClaimedLookGeneration(analysisId: string) {
  const admin = createAdminClient();
  const staleCutoff = new Date(Date.now() - 4 * 60 * 1000).toISOString();

  const takeJob = async () => {
    const { data: fresh } = await admin
      .from("style_analyses")
      .update({ looks_job_started_at: new Date().toISOString() })
      .eq("id", analysisId)
      .eq("status", "generating_looks")
      .eq("payment_status", "paid")
      .eq("is_unlocked", true)
      .is("looks_job_started_at", null)
      .select("*")
      .maybeSingle();
    if (fresh) return fresh as StyleAnalysisRow;

    const { data: stale } = await admin
      .from("style_analyses")
      .update({ looks_job_started_at: new Date().toISOString() })
      .eq("id", analysisId)
      .eq("status", "generating_looks")
      .eq("payment_status", "paid")
      .eq("is_unlocked", true)
      .lt("looks_job_started_at", staleCutoff)
      .select("*")
      .maybeSingle();
    return (stale as StyleAnalysisRow | null) ?? null;
  };

  const row = await takeJob();
  if (!row) {
    const { data: current } = await admin.from("style_analyses").select("status").eq("id", analysisId).maybeSingle();
    if (current?.status === "completed") return { ok: true as const, alreadyComplete: true };
    return { ok: true as const, alreadyComplete: false };
  }

  try {
    const result = parseStoredResult(row);
    if (!result) throw new Error("Résultat d’analyse introuvable.");

    const images = await downloadSourceImages(row);
    const source = pickLookSource(images);
    const provider = getStyleAIProvider();
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

    await admin
      .from("style_analyses")
      .update({
        status: "completed",
        completed_at: new Date().toISOString(),
        error_message: null,
        preview_data: {
          primaryIdentified: true,
          secondaryIdentified: true,
          paletteReady: true,
          looksPending: false,
        },
      })
      .eq("id", analysisId);

    return { ok: true as const, alreadyComplete: false };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "La génération des looks a échoué.";
    await markFailed(analysisId, message);
    return { ok: false as const, error: message };
  }
}
