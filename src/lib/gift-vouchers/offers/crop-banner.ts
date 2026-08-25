/** Ratio bannière des cartes publiques (16:10). */
export const OFFER_BANNER_RATIO = 16 / 10;
export const OFFER_BANNER_WIDTH = 1600;
export const OFFER_BANNER_HEIGHT = 1000;

export type CoverCropRect = {
  sx: number;
  sy: number;
  sw: number;
  sh: number;
};

/**
 * Rectangle source pour un recadrage cover, sans étirement.
 * focalX / focalY ∈ [0, 1] : 0.5 = centré.
 */
export function coverCropRect(
  imageWidth: number,
  imageHeight: number,
  targetRatio = OFFER_BANNER_RATIO,
  focalX = 0.5,
  focalY = 0.5,
): CoverCropRect {
  const width = Math.max(1, imageWidth);
  const height = Math.max(1, imageHeight);
  const imageRatio = width / height;
  let sw: number;
  let sh: number;
  if (imageRatio > targetRatio) {
    sh = height;
    sw = height * targetRatio;
  } else {
    sw = width;
    sh = width / targetRatio;
  }
  const maxX = Math.max(0, width - sw);
  const maxY = Math.max(0, height - sh);
  const fx = Math.min(1, Math.max(0, focalX));
  const fy = Math.min(1, Math.max(0, focalY));
  return {
    sx: maxX * fx,
    sy: maxY * fy,
    sw,
    sh,
  };
}
