import sharp from "sharp";

/** Largeur utile A4 (595.28 pt) moins le padding horizontal 44 × 2. */
export const PDF_COVER_WIDTH_PT = 507;
export const PDF_COVER_HEIGHT_PT = 210;
export const PDF_COVER_RATIO = PDF_COVER_WIDTH_PT / PDF_COVER_HEIGHT_PT;

/** Résolution 3× pour un rendu net une fois placé dans le PDF. */
export const PDF_COVER_PX_WIDTH = 1521;
export const PDF_COVER_PX_HEIGHT = 630;

/**
 * Recadre une image en bannière (cover, centré), sans étirement.
 * Le JPEG produit a exactement le ratio du bloc PDF : aucune bande
 * de couleur ne peut apparaître derrière une fois l’image posée à 100 %.
 */
export async function cropPdfCoverImage(buffer: Buffer): Promise<Buffer | null> {
  if (!buffer.length) return null;
  try {
    return await sharp(buffer, { failOn: "none" })
      .rotate()
      .resize(PDF_COVER_PX_WIDTH, PDF_COVER_PX_HEIGHT, {
        fit: "cover",
        position: "centre",
        withoutEnlargement: false,
      })
      .jpeg({ quality: 88, mozjpeg: true })
      .toBuffer();
  } catch {
    return null;
  }
}

export async function pdfCoverDimensions(buffer: Buffer): Promise<{ width: number; height: number } | null> {
  try {
    const meta = await sharp(buffer).metadata();
    if (!meta.width || !meta.height) return null;
    return { width: meta.width, height: meta.height };
  } catch {
    return null;
  }
}
