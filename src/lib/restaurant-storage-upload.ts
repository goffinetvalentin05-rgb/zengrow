import type { SupabaseClient } from "@supabase/supabase-js";

/** Bucket public configuré dans les migrations Supabase. */
export const RESTAURANT_STORAGE_BUCKET = "restaurants" as const;

export const MAX_RESTAURANT_IMAGE_BYTES = 10 * 1024 * 1024;
export const MAX_RESTAURANT_PDF_BYTES = 20 * 1024 * 1024;

const IMAGE_MIME = new Set(["image/jpeg", "image/png", "image/webp", "image/jpg", "image/pjpeg"]);

export type RestaurantAssetFolder =
  | "logo"
  | "hero"
  | "gallery"
  | "sections"
  | "offers"
  | "menus"
  | "gift-vouchers";

function randomSuffix(): string {
  return Math.random().toString(36).slice(2, 9);
}

/** Valide type et taille d’une image pour la page publique. */
export function validateRestaurantImageFile(file: File): string | null {
  const ext = file.name.split(".").pop()?.toLowerCase() ?? "";
  const extOk = ext === "jpg" || ext === "jpeg" || ext === "png" || ext === "webp";
  const mimeOk = file.type ? IMAGE_MIME.has(file.type.toLowerCase()) : false;
  if (!mimeOk && !extOk) {
    return "Format non accepté. Importez une image JPG, PNG ou WebP.";
  }
  if (file.size > MAX_RESTAURANT_IMAGE_BYTES) {
    return `Image trop volumineuse (maximum ${MAX_RESTAURANT_IMAGE_BYTES / 1024 / 1024} Mo).`;
  }
  return null;
}

/** Valide un PDF menu. */
export function validateRestaurantPdfFile(file: File): string | null {
  const ext = file.name.split(".").pop()?.toLowerCase() ?? "";
  const isPdfMime = file.type === "application/pdf" || file.type === "application/x-pdf";
  if (!isPdfMime && ext !== "pdf") {
    return "Format non accepté. Importez un fichier PDF.";
  }
  if (file.size > MAX_RESTAURANT_PDF_BYTES) {
    return `Fichier trop volumineux (maximum ${MAX_RESTAURANT_PDF_BYTES / 1024 / 1024} Mo).`;
  }
  return null;
}

export function imageExtensionForUpload(file: File): string {
  const ext = file.name.split(".").pop()?.toLowerCase();
  if (ext === "png") return "png";
  if (ext === "webp") return "webp";
  if (ext === "jpg" || ext === "jpeg") return "jpg";
  const t = file.type.toLowerCase();
  if (t === "image/png") return "png";
  if (t === "image/webp") return "webp";
  return "jpg";
}

/**
 * Extrait le chemin objet dans le bucket à partir d’une URL publique Supabase.
 */
export function objectPathFromPublicUrl(publicUrl: string, bucketId: string): string | null {
  const trimmed = publicUrl.trim();
  if (!trimmed) return null;
  try {
    const marker = `/object/public/${bucketId}/`;
    const idx = trimmed.indexOf(marker);
    if (idx === -1) return null;
    const raw = trimmed.slice(idx + marker.length);
    const path = raw.split("?")[0];
    return path ? decodeURIComponent(path) : null;
  } catch {
    return null;
  }
}

/**
 * Téléverse un fichier vers `restaurants/{restaurantId}/{folder}/…`.
 */
export async function uploadRestaurantPublicAsset(
  supabase: SupabaseClient,
  restaurantId: string,
  folder: RestaurantAssetFolder,
  file: File,
  options: { extension: string },
): Promise<{ publicUrl: string; path: string }> {
  const safeExt = options.extension.replace(/[^a-z0-9]/gi, "").slice(0, 5) || "bin";
  const path = `${restaurantId}/${folder}/${Date.now()}-${randomSuffix()}.${safeExt}`;
  const { error } = await supabase.storage.from(RESTAURANT_STORAGE_BUCKET).upload(path, file, {
    upsert: false,
    contentType: file.type || undefined,
  });
  if (error) throw new Error(error.message);
  const { data } = supabase.storage.from(RESTAURANT_STORAGE_BUCKET).getPublicUrl(path);
  return { publicUrl: data.publicUrl, path };
}

/**
 * Supprime un objet du bucket si l’URL correspond bien à ce bucket (ne lève pas en cas d’échec).
 */
export async function tryRemoveRestaurantPublicObject(
  supabase: SupabaseClient,
  publicUrl: string | null | undefined,
): Promise<void> {
  const path = objectPathFromPublicUrl(publicUrl ?? "", RESTAURANT_STORAGE_BUCKET);
  if (!path) return;
  const { error } = await supabase.storage.from(RESTAURANT_STORAGE_BUCKET).remove([path]);
  if (error) console.warn("[storage] remove object:", error.message);
}

/** Nom de fichier lisible depuis une URL (pour l’UI PDF). */
export function displayFileNameFromUrl(url: string): string {
  try {
    const u = new URL(url);
    const last = u.pathname.split("/").filter(Boolean).pop();
    if (last) return decodeURIComponent(last);
  } catch {
    /* ignore */
  }
  const parts = url.split("/").filter(Boolean);
  const last = parts[parts.length - 1];
  if (last) {
    try {
      return decodeURIComponent(last.split("?")[0]);
    } catch {
      return last.split("?")[0];
    }
  }
  return "document.pdf";
}
