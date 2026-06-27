// ─────────────────────────────────────────────────────────
//  Export — PNG/JPG/WebP, WebM, GIF
// ─────────────────────────────────────────────────────────

import { P } from '../state';
import { draw, canvas, gl, withRenderSize } from '../webgl';
import { getPhase, setPhase, setExporting } from '../render';
import { composeExportCanvas, renderTextOnCanvas } from './text';
import { setStatusMsg } from './statusbar';
import {
  showExportProgress, updateExportProgress, updateExportEncoding, hideExportProgress,
} from './export_progress';
import type { ExportFormat } from './settings';
import {
  STILL_FORMAT_META, buildExportFilename, resolveExportTarget,
} from '../export_targets';
import { refreshExportSpec } from './export_targets_ui';

const $ = (id: string) => document.getElementById(id)!;

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
      if (err && (err as { name?: string }).name === 'AbortError') throw err;
    }
  }
  return (blob: Blob) => { anchorDownload(blob, name); return Promise.resolve(); };
}

function msg(t: string): void { setStatusMsg(t); }

function stillBlob(
  cv: HTMLCanvasElement,
  fmt: keyof typeof STILL_FORMAT_META,
): Promise<Blob | null> {
  const meta = STILL_FORMAT_META[fmt];
  return new Promise(res => {
    cv.toBlob(b => res(b), meta.mime, meta.qual);
  });
}

function attemptStillExport(w: number, h: number, phase: number): HTMLCanvasElement {
  return withRenderSize(w, h, () => {
    draw(phase);
    gl.finish();
    return composeExportCanvas(canvas, w, h);
  });
}

// ── Still image (PNG / JPG / WebP) ───────────────────────

export async function exportPNG(): Promise<void> {
  const fmt = P.imageFormat;
  const meta = STILL_FORMAT_META[fmt];
  const target = resolveExportTarget(P.exportTargetId, canvas.width, canvas.height);
  const fname = buildExportFilename(P.exportCaption, P.seed, P.mode, meta.ext);
  let saver: Saver;
  try { saver = await pickSaver(fname, meta.mime); }
  catch { return; }

  const phase = getPhase();
  let W = target.w;
  let H = target.h;
  let ec = attemptStillExport(W, H, phase);
  let blob = await stillBlob(ec, fmt);

  if (!blob || (gl.isContextLost && gl.isContextLost())) {
    W = Math.max(2, Math.round(W / 2));
    H = Math.max(2, Math.round(H / 2));
    ec = attemptStillExport(W, H, phase);
    blob = await stillBlob(ec, fmt);
    if (blob) {
      await saver(blob);
      msg(`saved ${W}×${H} (scaled down)`);
      refreshExportSpec();
      return;
    }
    msg('export failed — try a smaller size');
    return;
  }

  await saver(blob);
  msg(`saved ${W}×${H} ${fmt}`);
  refreshExportSpec();
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

  const candidates: Array<[string, string]> = [
    ['video/mp4;codecs=avc1.42E01E', 'mp4'],
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

  const vTarget = resolveExportTarget(P.exportTargetId, canvas.width, canvas.height);
  const vw = vTarget.w;
  const vh = vTarget.h;
  const vname = buildExportFilename(P.exportCaption, P.seed, P.mode, activeExportExt);

  try { videoSaver = await pickSaver(vname, mime.split(';')[0]); }
  catch { return; }

  setExporting(true);
  showExportProgress('video', 'recording video…');

  exportCv = document.createElement('canvas');
  exportCv.width = vw;
  exportCv.height = vh;
  exportCv.style.cssText = 'position:fixed;top:0;left:0;width:1px;height:1px;opacity:0;pointer-events:none;z-index:-9999';
  document.body.appendChild(exportCv);
  ectx = exportCv.getContext('2d')!;

  const pixelCv = document.createElement('canvas');
  const pctx = pixelCv.getContext('2d')!;

  const stream = exportCv.captureStream(60);
  const chunks: BlobPart[] = [];
  recorder = new MediaRecorder(stream, { mimeType: mime, videoBitsPerSecond: 18_000_000 });
  recorder.ondataavailable = e => { if ((e as BlobEvent).data.size) chunks.push((e as BlobEvent).data); };
  recorder.onstop = () => {
    hideExportProgress();
    if (exportCv?.parentNode) exportCv.parentNode.removeChild(exportCv);
    if (chunks.length && videoSaver) {
      const baseMime = mime.split(';')[0];
      videoSaver(new Blob(chunks, { type: baseMime })).then(() => msg('video saved'));
    }
    recorder = null; exportCv = null; ectx = null; videoSaver = null;
    setExporting(false);
  };

  setPhase(0);
  pauseBtn.textContent = 'pause';

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
    const frame = withRenderSize(vw, vh, () => {
      draw(phase);
      gl.finish();
      return composeExportCanvas(canvas, vw, vh);
    });

    if (P.pixel && P.pixel > 0.001) {
      const scale = Math.max(0.02, 1 - P.pixel);
      const sw = Math.max(1, Math.floor(exportCv.width * scale));
      const sh = Math.max(1, Math.floor(exportCv.height * scale));
      if (pixelCv.width !== sw || pixelCv.height !== sh) {
        pixelCv.width = sw; pixelCv.height = sh;
      }
      pctx.imageSmoothingEnabled = true;
      pctx.drawImage(frame, 0, 0, sw, sh);
      ectx.imageSmoothingEnabled = false;
      ectx.drawImage(pixelCv, 0, 0, exportCv.width, exportCv.height);
    } else {
      ectx.drawImage(frame, 0, 0);
    }

    updateExportProgress(currentFrame + 1, totalFrames, `recording ${activeExportExt}…`);
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
      hideExportProgress();
      if (exportCv?.parentNode) exportCv.parentNode.removeChild(exportCv);
      recorder = null; exportCv = null; ectx = null; videoSaver = null;
      setExporting(false);
    };
    recorder.stop();
    msg('cancelled');
  }
  gifCancel = true;
  hideExportProgress();
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
  if (recorder) return;
  const gTarget = resolveExportTarget(P.exportTargetId, canvas.width, canvas.height);
  const gname = buildExportFilename(P.exportCaption, P.seed, P.mode, 'gif');
  let saver: Saver;
  try { saver = await pickSaver(gname, 'image/gif'); }
  catch { return; }

  setExporting(true); gifCancel = false;
  showExportProgress('gif-render', 'rendering gif frames…');
  try {
    const workerUrl = await loadGifLib();
    const maxDim = 640;
    const tw = Math.min(gTarget.w, maxDim);
    const th = Math.min(gTarget.h, Math.round(gTarget.h * (tw / gTarget.w)));
    const tmp = document.createElement('canvas');
    tmp.width = tw; tmp.height = th;
    const tctx = tmp.getContext('2d')!;

    const fps = 30;
    const frames = Math.round(P.loop * fps);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const gif = new (window as any).GIF({ workers: 2, quality: 8, width: tw, height: th, workerScript: workerUrl });

    for (let i = 0; i < frames; i++) {
      if (gifCancel) throw new Error('cancelled');
      const phase = i / frames * Math.PI * 2;
      const frame = withRenderSize(gTarget.w, gTarget.h, () => {
        draw(phase);
        gl.finish();
        return composeExportCanvas(canvas, gTarget.w, gTarget.h);
      });
      tctx.drawImage(frame, 0, 0, tw, th);
      gif.addFrame(tmp, { copy: true, delay: 1000 / fps });
      updateExportProgress(i + 1, frames, 'rendering gif frames…');
      await new Promise(r => setTimeout(r, 0));
    }
    showExportProgress('gif-encode', 'encoding gif…');
    const blob: Blob = await new Promise((res, rej) => {
      gif.on('finished', res);
      gif.on('progress', (p: number) => updateExportEncoding(p));
      try { gif.render(); } catch (e) { rej(e); }
    });
    await saver(blob); msg('gif saved');
  } catch (e) {
    const err = e instanceof Error ? e.message : String(e);
    msg(err === 'cancelled' ? 'cancelled' : 'gif export needs internet (first use)');
  } finally {
    setExporting(false);
    hideExportProgress();
  }
}

function setExportFormat(fmt: ExportFormat): void {
  window.lumenExportFormat = fmt;
  window.dispatchEvent(new CustomEvent('lumen:exportFormatChanged'));
}

export function initExport(pauseBtn: HTMLButtonElement): void {
  ($('expPng') as HTMLButtonElement).onclick = () => { setExportFormat('png'); exportPNG(); };
  ($('expVid') as HTMLButtonElement).onclick = () => { setExportFormat('webm'); startWebmExport(pauseBtn); };
  ($('expGif') as HTMLButtonElement).onclick = () => { setExportFormat('gif'); exportGIF(); };
  ($('exportCancel') as HTMLButtonElement).onclick = cancelExport;

  window.addEventListener('lumen:applyExportFormat', e => {
    setExportFormat((e as CustomEvent<ExportFormat>).detail);
  });
}

declare global {
  interface Window { lumenExportFormat?: ExportFormat; }
}