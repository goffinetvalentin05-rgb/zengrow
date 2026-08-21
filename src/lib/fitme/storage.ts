import { STYLE_INPUTS_BUCKET, STYLE_RESULTS_BUCKET } from "@/src/lib/fitme/constants";
import { createAdminClient } from "@/src/lib/supabase/admin";

export async function createSignedResultUrl(path: string, expiresIn = 60 * 30) {
  const admin = createAdminClient();
  const { data, error } = await admin.storage.from(STYLE_RESULTS_BUCKET).createSignedUrl(path, expiresIn);
  if (error || !data?.signedUrl) return null;
  return data.signedUrl;
}

export async function createSignedInputUrl(path: string, expiresIn = 60 * 20) {
  const admin = createAdminClient();
  const { data, error } = await admin.storage.from(STYLE_INPUTS_BUCKET).createSignedUrl(path, expiresIn);
  if (error || !data?.signedUrl) return null;
  return data.signedUrl;
}

export async function listUserInputPaths(userId: string) {
  const admin = createAdminClient();
  const { data, error } = await admin.storage.from(STYLE_INPUTS_BUCKET).list(userId, {
    limit: 100,
    offset: 0,
  });
  if (error) return [];
  return data ?? [];
}

async function removeTree(bucket: string, prefix: string) {
  const admin = createAdminClient();
  const { data: entries } = await admin.storage.from(bucket).list(prefix, { limit: 1000 });
  if (!entries?.length) return;

  const files: string[] = [];
  for (const entry of entries) {
    const path = prefix ? `${prefix}/${entry.name}` : entry.name;
    if (entry.id) {
      files.push(path);
    } else {
      await removeTree(bucket, path);
    }
  }
  if (files.length) {
    await admin.storage.from(bucket).remove(files);
  }
}

export async function removeAnalysisSourcePhotos(userId: string, analysisId: string) {
  const admin = createAdminClient();
  const prefix = `${userId}/${analysisId}`;
  await removeTree(STYLE_INPUTS_BUCKET, prefix);
  await admin.from("style_analysis_images").delete().eq("analysis_id", analysisId).eq("is_generated", false);
}

export async function removeUserStylePhotos(userId: string) {
  const admin = createAdminClient();
  await removeTree(STYLE_INPUTS_BUCKET, userId);
  await removeTree(STYLE_RESULTS_BUCKET, userId);
  await admin.from("style_analysis_images").delete().eq("user_id", userId);
}

export async function signedSourcePhotos(analysisId: string) {
  const admin = createAdminClient();
  const { data: rows } = await admin
    .from("style_analysis_images")
    .select("type, storage_path, created_at")
    .eq("analysis_id", analysisId)
    .eq("is_generated", false)
    .order("created_at", { ascending: true });

  const photos: { type: string; url: string; storagePath: string }[] = [];
  for (const row of rows ?? []) {
    const url = await createSignedInputUrl(row.storage_path);
    if (url) photos.push({ type: row.type, url, storagePath: row.storage_path });
  }
  return photos;
}

export async function countGeneratedLooks(analysisId: string) {
  const admin = createAdminClient();
  const { count } = await admin
    .from("style_analysis_images")
    .select("id", { count: "exact", head: true })
    .eq("analysis_id", analysisId)
    .eq("is_generated", true);
  return count ?? 0;
}
