import { STYLE_RESULTS_BUCKET } from "@/src/lib/fitme/constants";
import { createAdminClient } from "@/src/lib/supabase/admin";

export async function createSignedResultUrl(path: string, expiresIn = 60 * 30) {
  const admin = createAdminClient();
  const { data, error } = await admin.storage.from(STYLE_RESULTS_BUCKET).createSignedUrl(path, expiresIn);
  if (error || !data?.signedUrl) return null;
  return data.signedUrl;
}

export async function listUserInputPaths(userId: string) {
  const admin = createAdminClient();
  const { data, error } = await admin.storage.from("style-inputs").list(userId, {
    limit: 100,
    offset: 0,
  });
  if (error) return [];
  return data ?? [];
}

export async function removeUserStylePhotos(userId: string) {
  const admin = createAdminClient();

  async function removeTree(bucket: string, prefix: string) {
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

  await removeTree("style-inputs", userId);
  await removeTree("style-results", userId);

  await admin.from("style_analysis_images").delete().eq("user_id", userId);
}
