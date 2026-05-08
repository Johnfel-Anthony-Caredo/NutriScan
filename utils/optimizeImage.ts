/**
 * optimizeImage — resize and compress captured images before analysis/upload.
 *
 * Uses expo-image-manipulator to downscale and compress, then
 * reads the result as base64 using expo-file-system/legacy.
 *
 * Logs original vs optimized size so you can verify compression.
 */

import { EncodingType, getInfoAsync, readAsStringAsync } from 'expo-file-system/legacy';
import { manipulateAsync, SaveFormat, type ImageResult } from 'expo-image-manipulator';

export interface OptimizedImageResult {
  /** Local file URI of the optimized image */
  uri: string;
  /** Base64-encoded content for API upload */
  base64: string;
  /** Original file size in bytes */
  originalSizeBytes: number;
  /** Optimized file size in bytes */
  optimizedSizeBytes: number;
  /** Compression ratio as a decimal (0.5 = 50% smaller) */
  compressionRatio: number;
  /** MIME type of the output image */
  mimeType: string;
}

/**
 * Default optimization options.
 * - maxWidth: 1200px — plenty for food analysis
 * - compress: 0.6 — good balance of quality vs size
 * - format: JPEG — universally supported, smaller than PNG
 */
export const DEFAULT_OPTIMIZE_OPTIONS = {
  maxWidth: 1200,
  compress: 0.6,
  format: SaveFormat.JPEG,
};

/**
 * Optimize a captured image for upload:
 * 1. Get original file size
 * 2. Resize to maxWidth while maintaining aspect ratio
 * 3. Compress to JPEG with the given quality
 * 4. Read the result as base64
 * 5. Log size comparison
 *
 * @param uri - Local file URI of the captured image
 * @param options - Optimization options
 * @returns OptimizedImageResult with uri, base64, and size stats
 */
export async function optimizeImage(
  uri: string,
  options: {
    maxWidth?: number;
    compress?: number;
    format?: SaveFormat;
  } = {},
): Promise<OptimizedImageResult> {
  const { maxWidth, compress, format } = { ...DEFAULT_OPTIMIZE_OPTIONS, ...options };

  // 1. Get original file size
  const originalInfo = await getInfoAsync(uri, { size: true });
  const originalSizeBytes = originalInfo.exists ? originalInfo.size ?? 0 : 0;

  // 2. Resize and compress
  const result: ImageResult = await manipulateAsync(
    uri,
    [{ resize: { width: maxWidth } }],
    {
      compress,
      format,
    },
  );

  // 3. Get optimized file size
  const optimizedInfo = await getInfoAsync(result.uri, { size: true });
  const optimizedSizeBytes = optimizedInfo.exists ? optimizedInfo.size ?? 0 : 0;

  // 4. Read as base64
  const base64 = await readAsStringAsync(result.uri, {
    encoding: EncodingType.Base64,
  });

  // 5. Calculate stats
  const compressionRatio =
    originalSizeBytes > 0
      ? Math.round((1 - optimizedSizeBytes / originalSizeBytes) * 100) / 100
      : 0;

  const mimeType = format === SaveFormat.PNG ? 'image/png' : 'image/jpeg';

  // 6. Log for debugging
  console.log(
    `[optimizeImage] original=${(originalSizeBytes / 1024).toFixed(1)}KB → ` +
    `optimized=${(optimizedSizeBytes / 1024).toFixed(1)}KB ` +
    `(${(compressionRatio * 100).toFixed(0)}% smaller, ${format})`,
  );

  return {
    uri: result.uri,
    base64,
    originalSizeBytes,
    optimizedSizeBytes,
    compressionRatio,
    mimeType,
  };
}

/**
 * Quick one-liner: optimize an image and return just the base64 + MIME type.
 * Use this in scan-preview when you only need the upload payload.
 */
export async function optimizeImageForUpload(
  uri: string,
  options?: { maxWidth?: number; compress?: number; format?: SaveFormat },
): Promise<{ base64: string; mimeType: string }> {
  const result = await optimizeImage(uri, options);
  return { base64: result.base64, mimeType: result.mimeType };
}
