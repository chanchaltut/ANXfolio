/**
 * WebP quality per kind of image, chosen by measurement (SSIM against the source at served sizes):
 *   q55 → 0.956–0.976 (visible softening), q85 → 0.982–0.987, q90 → 0.986–0.993 (visually lossless).
 * Keep next.config.ts `images.qualities` in sync.
 */
export const IMAGE_QUALITY = {
  /** Video thumbnails, the hero wall, hover previews. */
  content: 85,
  /** Ayush's own photos, which the site is built around. */
  photo: 90,
  /** Images shown through a heavy blur, where detail is invisible. */
  blurred: 50,
} as const;
