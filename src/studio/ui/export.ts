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
function download(blob: Blob, name: string): void {
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = name;
  a.style.display = 'none';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(a.href), 5000);
}
function msg(t: string): void { setStatusMsg(t); }

// ── PNG ──────────────────────────────────────────────────

export function exportPNG(): void {
  draw(getPhase());
  gl.finish();
  const ec = composeExportCanvas(canvas, canvas.width, canvas.height);
  ec.toBlob(b => { if (b) { download(b, fname('png')); msg('image saved'); } }, 'image/png');
}

// ── WebM / MP4 Video ─────────────────────────────────────

let recorder: MediaRecorder | null = null;
let exportCv: HTMLCanvasElement | null = null;
let ectx: CanvasRenderingContext2D | null = null;
let videoAnimId: number | null = null;
let activeExportExt = 'webm';

export function startWebmExport(pauseBtn: HTMLButtonElement): void {
  if (recorder) return;
  setExporting(true);

  // Determine supported container and codec
  let mime = 'video/webm';
  activeExportExt = 'webm';
  if (MediaRecorder.isTypeSupported('video/webm;codecs=vp9')) {
    mime = 'video/webm;codecs=vp9';
  } else if (MediaRecorder.isTypeSupported('video/webm;codecs=vp8')) {
    mime = 'video/webm;codecs=vp8';
  } else if (MediaRecorder.isTypeSupported('video/webm')) {
    mime = 'video/webm';
  } else if (MediaRecorder.isTypeSupported('video/mp4;codecs=avc1')) {
    mime = 'video/mp4;codecs=avc1';
    activeExportExt = 'mp4';
  } else if (MediaRecorder.isTypeSupported('video/mp4')) {
    mime = 'video/mp4';
    activeExportExt = 'mp4';
  }

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
    if (chunks.length) {
      const baseMime = mime.split(';')[0];
      download(new Blob(chunks, { type: baseMime }), fname(activeExportExt));
      msg('video saved');
    }
    recorder = null; exportCv = null; ectx = null;
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
