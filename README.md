# PicLight 🖼️

> **Compress images for WhatsApp & email. Free. No upload. No signup. No server.**

## Problem

When sharing photos on WhatsApp, email, or other platforms, images are often too large and get aggressively compressed by the service, resulting in blurry or low-quality photos. Users typically resort to uploading their sensitive photos to third-party compression services, compromising privacy. There's a need for a simple, client-side image compression tool that respects user privacy.

## Purpose

PicLight is a privacy-first, browser-based image compressor that solves this problem entirely on the client side. Your photos are compressed using your browser's native Canvas API — they never leave your device, never touch a server, and never get stored. The tool is completely free, requires no signup, and works offline after the first load.

## How It Works

Everything runs inside your browser using only the native Canvas API:

1. Select or drag a photo (JPG, PNG, WebP)
2. Choose a preset (WhatsApp, Email, Instagram, Web) or adjust quality manually
3. Preview the compressed result with file size and dimensions
4. Download the optimized image — nothing leaves your device

**No backend. No uploads. No tracking. No cost.**

### Compression Presets

| Preset | Max Size | Quality | Use Case |
|---|---|---|---|
| WhatsApp | 1280×1280 | 82% | WhatsApp, Telegram, messaging apps |
| Email | 1600×1600 | 85% | Email attachments |
| Instagram | 1080×1080 | 88% | Instagram posts and stories |
| Web | 1920×1080 | 80% | Website images, general web use |
| Custom | Original | Slider | Manual fine-tuning |

---

## How the Compression Works

Everything runs inside `js/compressor.js` using only the browser's built-in Canvas API:

```
1. File selected (drag/drop, click, or Ctrl+V paste)
2. File → Blob URL → HTMLImageElement
3. Image drawn onto an offscreen <canvas> at target dimensions
4. canvas.toBlob() re-encodes at target quality (JPEG for photos, PNG if transparent)
5. Blob → download link → user's device
```

**No bytes leave the browser tab.** The Canvas API is available in every major browser since 2010.

---

## Tech Stack

- **Image Processing**: Native Canvas API (browser built-in)
- **File Handling**: File API + Blob (browser built-in)
- **Frontend**: Vanilla HTML + CSS + JavaScript (no framework)
- **Hosting**: Vercel

**No npm. No node_modules. No build step. No backend. No database.**  
Open `index.html` in a browser and it works.

---

## Project Structure

```
piclight/
├── index.html                    ← Main tool page
├── css/
│   └── style.css                 ← Styling
├── js/
│   ├── compressor.js             ← Canvas API compression
│   └── ui.js                     ← Drag/drop, presets, download, quality slider
├── blog/
│   ├── compress-image-whatsapp.html
│   ├── reduce-photo-size-email.html
│   ├── image-compressor-no-upload.html
│   ├── resize-image-instagram.html
│   └── photo-too-large-to-send.html
├── sitemap.xml
├── robots.txt
├── vercel.json
└── README.md
```

---

## Installation

No installation required. Open `index.html` directly in a web browser to use locally, or deploy to any static hosting service.

---

## Privacy & Legal

- **No data collected** — all processing happens in your browser
- **No cookies** — nothing is stored
- **No uploads** — images never leave your device
- **No login** — no account required, no personal information collected
- All compression is performed client-side; the server serves only static files

---

## Source Code

View the source code on GitHub: [piedadbrylle490-ux/piclight](https://github.com/piedadbrylle490-ux/piclight)
