// Compresses/resizes an image in the browser before upload. This is what
// makes the store load fast: a 4 MB phone photo becomes a ~100–250 KB image
// with no visible quality loss, so product pages open quickly and the free
// hosting quota lasts far longer.
//
// Runs entirely on the visitor's device — no server, no cost.

const MAX_DIMENSION = 1400; // longest side, in pixels
const TARGET_TYPE = 'image/webp'; // smallest good-quality format
const QUALITY = 0.82;

// Draws the image onto a canvas at a reduced size and returns the canvas.
async function drawScaled(file, maxDim) {
  const bitmap = await createImageBitmap(file);
  let { width, height } = bitmap;
  if (width > maxDim || height > maxDim) {
    const scale = maxDim / Math.max(width, height);
    width = Math.round(width * scale);
    height = Math.round(height * scale);
  }
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  canvas.getContext('2d').drawImage(bitmap, 0, 0, width, height);
  bitmap.close?.();
  return canvas;
}

export async function compressImage(file) {
  // Non-images or tiny files: leave them alone.
  if (!file.type.startsWith('image/')) return file;

  try {
    const canvas = await drawScaled(file, MAX_DIMENSION);
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

// Compresses harder and returns a data URL string, for storing the image
// directly inside the Firestore product document (no external host). Uses a
// smaller size so several images comfortably fit under Firestore's 1 MB
// per-document limit.
const DB_MAX_DIMENSION = 1000;
const DB_QUALITY = 0.7;
const DB_MAX_BYTES = 700 * 1024; // safety cap per image

export async function compressToDataUrl(file) {
  const canvas = await drawScaled(file, DB_MAX_DIMENSION);
  // Try WebP first (smallest); fall back to JPEG for old browsers.
  let dataUrl = canvas.toDataURL('image/webp', DB_QUALITY);
  if (!dataUrl.startsWith('data:image/webp')) {
    dataUrl = canvas.toDataURL('image/jpeg', DB_QUALITY);
  }
  if (dataUrl.length > DB_MAX_BYTES) {
    throw new Error(
      'This photo is too detailed to store in the database. Use a simpler photo, or switch to Cloudinary in the Images tab.'
    );
  }
  return dataUrl;
}
