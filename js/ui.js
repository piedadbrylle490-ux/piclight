// ui.js — PicLight UI controller

let currentResult = null;
let currentFile   = null;
let selectedPreset = 'whatsapp';
let customQuality  = 0.82;

const dropzone    = document.getElementById('dropzone');
const fileInput   = document.getElementById('fileInput');
const resultPanel = document.getElementById('resultPanel');
const uploadPanel = document.getElementById('uploadPanel');
const spinner     = document.getElementById('spinner');
const previewImg  = document.getElementById('previewImg');
const originalSz  = document.getElementById('originalSz');
const compressedSz= document.getElementById('compressedSz');
const savingEl    = document.getElementById('saving');
const dlBtn       = document.getElementById('dlBtn');
const qualityRange= document.getElementById('qualityRange');
const qualityVal  = document.getElementById('qualityVal');
const dimensionEl = document.getElementById('dimensionEl');

// --- Preset buttons ---
document.querySelectorAll('.preset-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.preset-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    selectedPreset = btn.dataset.preset;
    if (currentFile) runCompression(currentFile);
  });
});

// --- Quality slider ---
if (qualityRange) {
  // Update gradient background dynamically
  function updateQualityGradient() {
    const min = parseInt(qualityRange.min);
    const max = parseInt(qualityRange.max);
    const value = parseInt(qualityRange.value);
    const percent = ((value - min) / (max - min)) * 100;
    qualityRange.style.background = `linear-gradient(to right, var(--accent) 0%, var(--accent) ${percent}%, var(--border) ${percent}%, var(--border) 100%)`;
  }
  
  qualityRange.addEventListener('input', e => {
    e.stopPropagation();
    customQuality = parseInt(qualityRange.value) / 100;
    qualityVal.textContent = qualityRange.value + '%';
    updateQualityGradient();
    if (currentFile) debounceCompress();
  }, false);
  qualityRange.addEventListener('change', updateQualityGradient, false);
  qualityRange.addEventListener('click', e => e.stopPropagation(), false);
  qualityRange.addEventListener('mousedown', e => e.stopPropagation(), false);
  qualityRange.addEventListener('touchstart', e => e.stopPropagation(), false);
  
  // Set initial gradient
  updateQualityGradient();
}

let debounceTimer;
function debounceCompress() {
  clearTimeout(debounceTimer);
  debounceTimer = setTimeout(() => {
    // Don't show spinner for quality adjustments - just recompress silently
    compressImage(currentFile, selectedPreset, customQuality).then(result => {
      currentResult = result;
      // Update the preview and stats without showing spinner
      previewImg.src = result.dataURL;
      compressedSz.textContent = formatBytes(result.compressedSize);
      const pct = savingPercent(result.originalSize, result.compressedSize);
      savingEl.textContent = pct > 0 ? '−' + pct + '% smaller' : 'Already optimised';
      savingEl.style.color = pct > 0 ? 'var(--accent)' : 'var(--text-muted)';
    }).catch(err => console.error('Recompression failed:', err));
  }, 400);
}

// --- Drag & Drop ---
dropzone.addEventListener('dragover', e => {
  e.preventDefault();
  dropzone.classList.add('drag-over');
});
dropzone.addEventListener('dragleave', () => dropzone.classList.remove('drag-over'));
dropzone.addEventListener('drop', e => {
  e.preventDefault();
  dropzone.classList.remove('drag-over');
  const file = e.dataTransfer.files[0];
  if (file && file.type.startsWith('image/')) handleFile(file);
});

// --- Click to upload ---
dropzone.addEventListener('click', e => {
  if (e.target === dlBtn || e.target === resetBtn) return;
  fileInput.click();
});
fileInput.addEventListener('change', () => {
  if (fileInput.files[0]) handleFile(fileInput.files[0]);
});

// --- Paste support ---
document.addEventListener('paste', e => {
  const items = e.clipboardData?.items;
  if (!items) return;
  for (const item of items) {
    if (item.type.startsWith('image/')) {
      handleFile(item.getAsFile());
      break;
    }
  }
});

// --- Core flow ---
async function handleFile(file) {
  currentFile = file;
  showSpinner();
  await runCompression(file);
}

async function runCompression(file) {
  showSpinner();
  try {
    const result = await compressImage(file, selectedPreset, customQuality);
    currentResult = result;
    showResult(result, file.name);
  } catch (err) {
    showError(err.message);
  }
}

function showSpinner() {
  uploadPanel.style.display  = 'none';
  resultPanel.style.display  = 'none';
  spinner.style.display      = 'flex';
}

function showResult(result, fileName) {
  spinner.style.display = 'none';
  uploadPanel.style.display = 'none';
  resultPanel.style.display = 'flex';
  resultPanel.style.flexDirection = 'column';
  resultPanel.style.alignItems = 'center';

  previewImg.src = result.dataURL;
  originalSz.textContent   = formatBytes(result.originalSize);
  compressedSz.textContent = formatBytes(result.compressedSize);
  dimensionEl.textContent  = result.width + ' × ' + result.height + 'px';

  const pct = savingPercent(result.originalSize, result.compressedSize);
  savingEl.textContent = pct > 0 ? '−' + pct + '% smaller' : 'Already optimised';
  savingEl.style.color = pct > 0 ? 'var(--accent)' : 'var(--text-muted)';

  // Animate the numbers
  resultPanel.classList.remove('revealed');
  requestAnimationFrame(() => resultPanel.classList.add('revealed'));
}

function showError(msg) {
  spinner.style.display = 'none';
  uploadPanel.style.display = 'flex';
  const err = document.getElementById('errorMsg');
  if (err) { err.textContent = '⚠ ' + msg; err.style.display = 'block'; }
}

// --- Download ---
dlBtn.addEventListener('click', () => {
  if (!currentResult) return;
  const ext  = currentResult.outputType === 'image/png' ? 'png' : 'jpg';
  const name = (currentFile?.name.replace(/\.[^.]+$/, '') || 'piclight') + '-compressed.' + ext;
  const a    = document.createElement('a');
  a.href     = URL.createObjectURL(currentResult.blob);
  a.download = name;
  a.click();
  URL.revokeObjectURL(a.href);
  // Show coffee prompt after download
  document.getElementById('coffeePrompt')?.classList.add('visible');
});

// --- Reset ---
dropzone.addEventListener('click', e => {
  if (e.target === dlBtn) return;
  fileInput.click();
});
