// ─────────────────────────────────────────────────────────
//  Status bar live updates
// ─────────────────────────────────────────────────────────

import { setFpsCallback } from '../render';

const $ = (id: string) => document.getElementById(id)!;

export function initStatusBar(): void {
  setFpsCallback(fps => { $('stFps').textContent = String(fps); });
}

export function setStatusMode(name: string): void  { $('stMode').textContent = name; }
export function setStatusSeed(val: string): void   { $('stSeed').textContent = val; }
let msgTimer: ReturnType<typeof setTimeout> | null = null;

export function setStatusMsg(val: string): void {
  const el = $('stLog');
  if (el) {
    el.textContent = val;
    if (msgTimer) clearTimeout(msgTimer);
    msgTimer = setTimeout(() => {
      if (el.textContent === val) el.textContent = '';
      msgTimer = null;
    }, 3000);
  }
}
