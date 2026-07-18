// Compresses/resizes an image in the browser before upload. This is what
// makes the store load fast: a 4 MB phone photo becomes a ~100–250 KB image
// with no visible quality loss, so product pages open quickly and the free
// hosting quota lasts far longer.
//
// Runs entirely on the visitor's device — no server, no cost.

const MAX_DIMENSION = 1400; // longest side, in pixels
const TARGET_TYPE = 'image/webp'; // smallest good-quality format
const QUALITY = 0.82;

export async function compressImage(file) {
  // Non-images or tiny files: leave them alone.
  if (!file.type.startsWith('image/')) return file;

  try {
    const bitmap = await createImageBitmap(file);
    let { width, height } = bitmap;

    // Scale the longest side down to MAX_DIMENSION.
    if (width > MAX_DIMENSION || height > MAX_DIMENSION) {
      const scale = MAX_DIMENSION / Math.max(width, height);
      width = Math.round(width * scale);
      height = Math.round(height * scale);
    }

    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(bitmap, 0, 0, width, height);
    bitmap.close?.();

    const blob = await new Promise((resolve) =>
      canvas.toBlob(resolve, TARGET_TYPE, QUALITY)
    );

    // If compression failed or somehow made the file bigger, keep the original.
    if (!blob || blob.size >= file.size) return file;

    const name = file.name.replace(/\.[^.]+$/, '') + '.webp';
    return new File([blob], name, { type: TARGET_TYPE });
  } catch {
    // Any failure (old browser, odd format) → upload the original untouched.
    return file;
  }
}
