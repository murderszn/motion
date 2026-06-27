// ─────────────────────────────────────────────────────────
//  Render loop — RAF, phase tracking, FPS, pause
// ─────────────────────────────────────────────────────────

import { P } from './state';
import { draw } from './webgl';

let phase    = 0;
let paused   = false;
let exporting = false;
let last     = performance.now();
let fpsAcc   = 0;
let fpsN     = 0;
let fpsLast  = performance.now();

export function getPhase(): number    { return phase; }
export function setPhase(v: number)   { phase = v; }
export function isPaused(): boolean   { return paused; }
export function isExporting(): boolean { return exporting; }
export function setExporting(v: boolean) { exporting = v; }

/** Callback fired every ~500 ms with current fps value */
let onFpsUpdate: ((fps: number) => void) | null = null;
export function setFpsCallback(cb: (fps: number) => void) { onFpsUpdate = cb; }

export function togglePause(btnEl: HTMLButtonElement): void {
  paused = !paused;
  btnEl.textContent = paused ? 'play' : 'pause';
}

function frame(now: number): void {
  const dt = Math.min((now - last) / 1000, 0.1);
  last = now;

  if (!paused && !exporting) {
    phase = (phase + dt / P.loop * Math.PI * 2) % (Math.PI * 2);
  }
  if (!exporting) draw(phase);

  fpsAcc += dt;
  fpsN++;
  if (now - fpsLast > 500) {
    onFpsUpdate?.(Math.round(fpsN / fpsAcc));
    fpsAcc = 0; fpsN = 0; fpsLast = now;
  }

  requestAnimationFrame(frame);
}

export function startRenderLoop(): void {
  last = performance.now();
  requestAnimationFrame(frame);
  // Expose draw + P for Playwright loop-seam tests
  if (typeof window !== 'undefined') {
    (window as any).draw = draw;
  }
}
