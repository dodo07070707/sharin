// Resolves to null (rather than rejecting) on any load failure — e.g. the artwork
// CDN not granting CORS — so a canvas still renders, just without that image.
export function loadImage(url) {
  return new Promise((resolve) => {
    if (!url) {
      resolve(null);
      return;
    }
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = () => resolve(null);
    img.src = url;
  });
}

// Crops an uploaded photo to its centre square and re-encodes it as a small JPEG data
// URL. A data URL is same-origin, so a canvas it's drawn into can still be exported, and
// at this size it's small enough (~40KB) to store inside a Firestore document.
export async function fileToSquareDataUrl(file, size = 480) {
  const url = URL.createObjectURL(file);
  try {
    const img = await loadImage(url);
    if (!img) throw new Error('이미지를 읽지 못했어요.');
    const side = Math.min(img.width, img.height);
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    canvas
      .getContext('2d')
      .drawImage(img, (img.width - side) / 2, (img.height - side) / 2, side, side, 0, 0, size, size);
    return canvas.toDataURL('image/jpeg', 0.8);
  } finally {
    URL.revokeObjectURL(url);
  }
}

// Opens the OS share sheet where files can be shared (on a phone that's where Instagram
// shows up), and falls back to a plain download everywhere else — including when the
// share sheet refuses to open, which is different from the user cancelling it.
export async function shareOrDownloadImage(blob, filename) {
  const file = new File([blob], filename, { type: blob.type });
  if (navigator.canShare && navigator.canShare({ files: [file] })) {
    try {
      await navigator.share({ files: [file] });
      return;
    } catch (err) {
      if (err.name === 'AbortError') return;
    }
  }
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
