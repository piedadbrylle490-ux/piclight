// compressor.js — PicLight core
// 100% Canvas API. Zero libraries. Zero server. Zero uploads.

const PRESETS = {
  whatsapp: { maxW: 1280, maxH: 1280, quality: 0.82, label: 'WhatsApp', targetKB: 300 },
  email:    { maxW: 1600, maxH: 1600, quality: 0.85, label: 'Email',     targetKB: 500 },
  instagram:{ maxW: 1080, maxH: 1080, quality: 0.88, label: 'Instagram', targetKB: 400 },
  web:      { maxW: 1920, maxH: 1080, quality: 0.80, label: 'Web',       targetKB: 200 },
  custom:   { maxW: null,  maxH: null,  quality: 0.82, label: 'Custom',   targetKB: null },
};

// Compress a File object, returns { blob, originalSize, compressedSize, dataURL }
async function compressImage(file, presetKey, customQuality) {
  return new Promise((resolve, reject) => {
    const preset = PRESETS[presetKey] || PRESETS.whatsapp;
    const quality = customQuality !== undefined ? customQuality : preset.quality;

    const img = new Image();
    const objectURL = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(objectURL);

      let { width, height } = img;
      const maxW = preset.maxW || width;
      const maxH = preset.maxH || height;

      // Scale down proportionally if needed
      if (width > maxW || height > maxH) {
        const ratio = Math.min(maxW / width, maxH / height);
        width  = Math.round(width  * ratio);
        height = Math.round(height * ratio);
      }

      const canvas = document.createElement('canvas');
      canvas.width  = width;
      canvas.height = height;

      const ctx = canvas.getContext('2d');
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      ctx.drawImage(img, 0, 0, width, height);

      // Output as JPEG for photos (best compression), PNG for transparency
      const outputType = file.type === 'image/png' && hasTransparency(ctx, width, height)
        ? 'image/png'
        : 'image/jpeg';

      canvas.toBlob(blob => {
        if (!blob) { reject(new Error('Compression failed')); return; }

        const reader = new FileReader();
        reader.onload = e => resolve({
          blob,
          dataURL:        e.target.result,
          originalSize:   file.size,
          compressedSize: blob.size,
          width,
          height,
          outputType,
        });
        reader.readAsDataURL(blob);
      }, outputType, quality);
    };

    img.onerror = () => reject(new Error('Could not read image'));
    img.src = objectURL;
  });
}

// Quick transparency check — sample corner pixels only (fast)
function hasTransparency(ctx, w, h) {
  const samples = [
    ctx.getImageData(0, 0, 1, 1).data,
    ctx.getImageData(w - 1, 0, 1, 1).data,
    ctx.getImageData(0, h - 1, 1, 1).data,
    ctx.getImageData(w - 1, h - 1, 1, 1).data,
  ];
  return samples.some(d => d[3] < 255);
}

// Format bytes nicely
function formatBytes(bytes) {
  if (bytes < 1024)        return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
}

// Saving % string
function savingPercent(original, compressed) {
  return Math.round((1 - compressed / original) * 100);
}
