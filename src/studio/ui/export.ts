// ─────────────────────────────────────────────────────────
//  Export — PNG, WebM, GIF
// ─────────────────────────────────────────────────────────

import { P, PRESETS } from '../state';
import { draw, canvas } from '../webgl';
import { getPhase, setPhase, isPaused, setExporting } from '../render';
import { composeExportCanvas, renderTextOnCanvas } from './text';

const $ = (id: string) => document.getElementById(id)!;

function fname(ext: string): string {
  return 'lumen-' + PRESETS[P.mode].id + '-' + String(P.seed).padStart(4, '0') + '.' + ext;
}
function download(blob: Blob, name: string): void {
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = name; a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 5000);
}
function msg(t: string): void { $('stMsg').textContent = t; }

// ── PNG ──────────────────────────────────────────────────

export function exportPNG(): void {
  draw(getPhase());
  const ec = composeExportCanvas(canvas, canvas.width, canvas.height);
  ec.toBlob(b => { if (b) { download(b, fname('png')); msg('image saved'); } }, 'image/png');
}

// ── WebM video ───────────────────────────────────────────

let recorder: MediaRecorder | null = null;
let recTimer: ReturnType<typeof setTimeout> | null = null;
let exportCv: HTMLCanvasElement | null = null;
let ectx: CanvasRenderingContext2D | null = null;

export function startWebmExport(pauseBtn: HTMLButtonElement): void {
  if (recorder) return;
  setExporting(true);
  exportCv = document.createElement('canvas');
  exportCv.width = canvas.width; exportCv.height = canvas.height;
  ectx = exportCv.getContext('2d')!;
  const stream = exportCv.captureStream(60);
  const mime = MediaRecorder.isTypeSupported('video/webm;codecs=vp9')
    ? 'video/webm;codecs=vp9' : 'video/webm';
  const chunks: BlobPart[] = [];
  recorder = new MediaRecorder(stream, { mimeType: mime, videoBitsPerSecond: 18_000_000 });
  recorder.ondataavailable = e => { if ((e as BlobEvent).data.size) chunks.push((e as BlobEvent).data); };
  recorder.onstop = () => {
    $('recStatus').classList.remove('on');
    if (chunks.length) { download(new Blob(chunks, { type: 'video/webm' }), fname('webm')); msg('video saved'); }
    recorder = null; exportCv = null; ectx = null;
    setExporting(false);
  };
  setPhase(0);
  pauseBtn.textContent = 'pause';
  $('recText').textContent = 'recording ' + P.loop.toFixed(1) + 's';
  $('recStatus').classList.add('on');

  let lastTime = performance.now();
  let phase = 0;
  function vidComposite(now: number): void {
    if (!recorder || !exportCv || !ectx) return;
    const dt = Math.min((now - lastTime) / 1000, 0.1);
    lastTime = now;
    phase = (phase + dt / P.loop * Math.PI * 2) % (Math.PI * 2);
    draw(phase);
    ectx.drawImage(canvas, 0, 0);
    renderTextOnCanvas(ectx, exportCv.width, exportCv.height);
    requestAnimationFrame(vidComposite);
  }
  vidComposite(performance.now());
  recorder.start();
  recTimer = setTimeout(() => recorder?.stop(), P.loop * 1000);
}

export function cancelExport(): void {
  if (recorder) {
    if (recTimer !== null) clearTimeout(recTimer);
    recorder.ondataavailable = null;
    recorder.onstop = () => {
      $('recStatus').classList.remove('on');
      recorder = null;
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
    const fps = 30;
    const frames = Math.round(P.loop * fps);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const gif = new (window as any).GIF({ workers: 2, quality: 8, width: tw, height: th, workerScript: workerUrl });
    for (let i = 0; i < frames; i++) {
      if (gifCancel) throw new Error('cancelled');
      draw(i / frames * Math.PI * 2);
      tctx.drawImage(canvas, 0, 0, tw, th);
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
    download(blob, fname('gif')); msg('gif saved');
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
