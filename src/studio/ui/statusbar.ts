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
export function setStatusMsg(val: string): void    { $('stMsg').textContent = val; }
