// ─────────────────────────────────────────────────────────
//  Export — PNG, WebM, GIF
// ─────────────────────────────────────────────────────────

import { P, PRESETS } from '../state';
import { draw, canvas, gl } from '../webgl';
import { getPhase, setPhase, isPaused, setExporting } from '../render';
import { composeExportCanvas, renderTextOnCanvas } from './text';
import { setStatusMsg } from './statusbar';

const $ = (id: string) => document.getElementById(id)!;

function fname(ext: string): string {
  return 'lumen-' + PRESETS[P.mode].id + '-' + String(P.seed).padStart(4, '0') + '.' + ext;
}
function anchorDownload(blob: Blob, name: string): void {
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = name;
  a.style.display = 'none';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(a.href), 5000);
}

export type Saver = (blob: Blob) => Promise<void>;

// Acquire a file saver while we still hold the user's click activation.
//
// Prefer the File System Access API: it writes straight to a user-chosen file
// and never creates a chrome.downloads item, so download-manager extensions
// can't intercept it and discard the `download` filename (that interception is
// what produces the UUID-named, extension-less files in a normal browser).
// Anywhere the API is unavailable (Firefox/Safari, insecure contexts) we fall
// back to a plain anchor download, which preserves the name fine there.
export async function pickSaver(name: string, mime: string): Promise<Saver> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const picker = (window as any).showSaveFilePicker;
  if (typeof picker === 'function') {
    try {
      const ext = name.slice(name.lastIndexOf('.') + 1).toLowerCase();
      const handle = await picker.call(window, {
        suggestedName: name,
        types: [{ accept: { [mime || 'application/octet-stream']: ['.' + ext] } }],
      });
      return async (blob: Blob) => {
        const writable = await handle.createWritable();
        await writable.write(blob);
        await writable.close();
      };
    } catch (err) {
      // User dismissed the save dialog — propagate so the export aborts.
      if (err && (err as { name?: string }).name === 'AbortError') throw err;
      // Any other failure (e.g. no activation, insecure context): fall back.
    }
  }
  return (blob: Blob) => { anchorDownload(blob, name); return Promise.resolve(); };
}
function msg(t: string): void { setStatusMsg(t); }

// ── PNG ──────────────────────────────────────────────────

export async function exportPNG(): Promise<void> {
  let saver: Saver;
  try { saver = await pickSaver(fname('png'), 'image/png'); }
  catch { return; } // save dialog cancelled
  draw(getPhase());
  gl.finish();
  const ec = composeExportCanvas(canvas, canvas.width, canvas.height);
  ec.toBlob(async b => { if (b) { await saver(b); msg('image saved'); } }, 'image/png');
}

// ── WebM / MP4 Video ─────────────────────────────────────

let recorder: MediaRecorder | null = null;
let exportCv: HTMLCanvasElement | null = null;
let ectx: CanvasRenderingContext2D | null = null;
let videoAnimId: number | null = null;
let activeExportExt = 'webm';
let videoSaver: Saver | null = null;

export async function startWebmExport(pauseBtn: HTMLButtonElement): Promise<void> {
  if (recorder) return;

  // Determine supported container and codec.
  // Prefer MP4/H.264 first: it opens natively in QuickTime, Preview, Photos,
  // and every video editor. Plain .webm downloads look like an "unknown
  // format" to macOS and won't open without VLC, so it's only a fallback.
  const candidates: Array<[string, string]> = [
    ['video/mp4;codecs=avc1.42E01E', 'mp4'], // H.264 baseline — most compatible
    ['video/mp4;codecs=avc1', 'mp4'],
    ['video/mp4', 'mp4'],
    ['video/webm;codecs=vp9', 'webm'],
    ['video/webm;codecs=vp8', 'webm'],
    ['video/webm', 'webm'],
  ];
  let mime = 'video/webm';
  activeExportExt = 'webm';
  for (const [m, ext] of candidates) {
    if (MediaRecorder.isTypeSupported(m)) { mime = m; activeExportExt = ext; break; }
  }

  // Grab the save target now, while the click activation is still live —
  // recording finishes seconds later, long after the activation expires.
  try { videoSaver = await pickSaver(fname(activeExportExt), mime.split(';')[0]); }
  catch { return; } // save dialog cancelled

  setExporting(true);

  exportCv = document.createElement('canvas');
  exportCv.width = canvas.width; exportCv.height = canvas.height;
  // Style invisibly and append to DOM so captureStream works in all browsers
  exportCv.style.position = 'fixed';
  exportCv.style.top = '0';
  exportCv.style.left = '0';
  exportCv.style.width = '1px';
  exportCv.style.height = '1px';
  exportCv.style.opacity = '0';
  exportCv.style.pointerEvents = 'none';
  exportCv.style.zIndex = '-9999';
  document.body.appendChild(exportCv);

  ectx = exportCv.getContext('2d')!;
  
  const pixelCv = document.createElement('canvas');
  const pctx = pixelCv.getContext('2d')!;

  const stream = exportCv.captureStream(60);
  const chunks: BlobPart[] = [];
  recorder = new MediaRecorder(stream, { mimeType: mime, videoBitsPerSecond: 18_000_000 });
  recorder.ondataavailable = e => { if ((e as BlobEvent).data.size) chunks.push((e as BlobEvent).data); };
  recorder.onstop = () => {
    $('recStatus').classList.remove('on');
    if (exportCv && exportCv.parentNode) {
      exportCv.parentNode.removeChild(exportCv);
    }
    if (chunks.length && videoSaver) {
      const baseMime = mime.split(';')[0];
      videoSaver(new Blob(chunks, { type: baseMime })).then(() => msg('video saved'));
    }
    recorder = null; exportCv = null; ectx = null; videoSaver = null;
    setExporting(false);
  };

  setPhase(0);
  pauseBtn.textContent = 'pause';
  $('recText').textContent = 'recording';
  $('recStatus').classList.add('on');

  const fps = 60;
  const totalFrames = Math.round(P.loop * fps);
  let currentFrame = 0;

  function recordFrame(): void {
    if (!recorder || !exportCv || !ectx) return;
    if (currentFrame >= totalFrames) {
      recorder.stop();
      return;
    }

    const phase = (currentFrame / totalFrames) * Math.PI * 2;
    draw(phase);
    gl.finish();

    if (P.pixel && P.pixel > 0.001) {
      const scale = Math.max(0.02, 1 - P.pixel);
      const sw = Math.max(1, Math.floor(exportCv.width * scale));
      const sh = Math.max(1, Math.floor(exportCv.height * scale));
      if (pixelCv.width !== sw || pixelCv.height !== sh) {
        pixelCv.width = sw; pixelCv.height = sh;
      }
      pctx.imageSmoothingEnabled = true;
      pctx.drawImage(canvas, 0, 0, sw, sh);
      ectx.imageSmoothingEnabled = false;
      ectx.drawImage(pixelCv, 0, 0, exportCv.width, exportCv.height);
    } else {
      ectx.drawImage(canvas, 0, 0);
    }

    renderTextOnCanvas(ectx, exportCv.width, exportCv.height);
    $('recText').textContent = `recording frame ${currentFrame + 1}/${totalFrames}`;
    
    currentFrame++;
    videoAnimId = requestAnimationFrame(recordFrame);
  }

  recorder.start();
  recordFrame();
}

export function cancelExport(): void {
  if (videoAnimId !== null) {
    cancelAnimationFrame(videoAnimId);
    videoAnimId = null;
  }
  if (recorder) {
    recorder.ondataavailable = null;
    recorder.onstop = () => {
      $('recStatus').classList.remove('on');
      if (exportCv && exportCv.parentNode) {
        exportCv.parentNode.removeChild(exportCv);
      }
      recorder = null;
      exportCv = null;
      ectx = null;
      videoSaver = null;
      setExporting(false);
    };
    recorder.stop();
    msg('cancelled');
  }
  gifCancel = true;
}

// ── GIF ──────────────────────────────────────────────────

let gifLibPromise: Promise<string> | null = null;
let gifCancel = false;

function loadGifLib(): Promise<string> {
  if (gifLibPromise) return gifLibPromise;
  gifLibPromise = (async () => {
    await new Promise<void>((res, rej) => {
      const s = document.createElement('script');
      s.src = 'https://cdnjs.cloudflare.com/ajax/libs/gif.js/0.2.0/gif.js';
      s.onload = () => res(); s.onerror = () => rej(new Error('gif.js load failed'));
      document.head.appendChild(s);
    });
    const txt = await (await fetch('https://cdnjs.cloudflare.com/ajax/libs/gif.js/0.2.0/gif.worker.js')).text();
    return URL.createObjectURL(new Blob([txt], { type: 'application/javascript' }));
  })();
  return gifLibPromise;
}

export async function exportGIF(): Promise<void> {
  if (recorder) return; // already exporting webm
  let saver: Saver;
  try { saver = await pickSaver(fname('gif'), 'image/gif'); }
  catch { return; } // save dialog cancelled
  setExporting(true); gifCancel = false;
  $('recText').textContent = 'rendering gif';
  $('recStatus').classList.add('on');
  try {
    const workerUrl = await loadGifLib();
    const maxDim = 640;
    const k = Math.min(1, maxDim / Math.max(canvas.width, canvas.height));
    const tw = Math.round(canvas.width * k), th = Math.round(canvas.height * k);
    const tmp = document.createElement('canvas');
    tmp.width = tw; tmp.height = th;
    const tctx = tmp.getContext('2d')!;

    const pixelCv = document.createElement('canvas');
    const pctx = pixelCv.getContext('2d')!;

    const fps = 30;
    const frames = Math.round(P.loop * fps);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const gif = new (window as any).GIF({ workers: 2, quality: 8, width: tw, height: th, workerScript: workerUrl });
    for (let i = 0; i < frames; i++) {
      if (gifCancel) throw new Error('cancelled');
      draw(i / frames * Math.PI * 2);
      gl.finish();

      if (P.pixel && P.pixel > 0.001) {
        const scale = Math.max(0.02, 1 - P.pixel);
        const sw = Math.max(1, Math.floor(tw * scale));
        const sh = Math.max(1, Math.floor(th * scale));
        if (pixelCv.width !== sw || pixelCv.height !== sh) {
          pixelCv.width = sw; pixelCv.height = sh;
        }
        pctx.imageSmoothingEnabled = true;
        pctx.drawImage(canvas, 0, 0, sw, sh);
        tctx.imageSmoothingEnabled = false;
        tctx.drawImage(pixelCv, 0, 0, tw, th);
      } else {
        tctx.drawImage(canvas, 0, 0, tw, th);
      }

      renderTextOnCanvas(tctx, tw, th);
      gif.addFrame(tmp, { copy: true, delay: 1000 / fps });
      $('recText').textContent = 'rendering gif ' + (i + 1) + '/' + frames;
      await new Promise(r => setTimeout(r, 0));
    }
    const blob: Blob = await new Promise((res, rej) => {
      gif.on('finished', res);
      gif.on('progress', (p: number) => { $('recText').textContent = 'encoding gif ' + Math.round(p * 100) + '%'; });
      try { gif.render(); } catch (e) { rej(e); }
    });
    await saver(blob); msg('gif saved');
  } catch (e) {
    const err = e instanceof Error ? e.message : String(e);
    msg(err === 'cancelled' ? 'cancelled' : 'gif export needs internet (first use)');
  } finally {
    setExporting(false);
    $('recStatus').classList.remove('on');
  }
}

export function initExport(pauseBtn: HTMLButtonElement): void {
  ($('expPng') as HTMLButtonElement).onclick = exportPNG;
  ($('expVid') as HTMLButtonElement).onclick = () => startWebmExport(pauseBtn);
  ($('expGif') as HTMLButtonElement).onclick = () => { exportGIF(); };
  ($('recCancel') as HTMLButtonElement).onclick = cancelExport;
}
