// ─────────────────────────────────────────────────────────
//  Slider controls (speed, scale, density, distort, detail, grain)
// ─────────────────────────────────────────────────────────

import { SLIDERS, P } from '../state';
import type { SliderKey } from '../types';

const $ = (id: string) => document.getElementById(id)!;

export function setSlider(id: SliderKey, v: number): void {
  P[id] = v;
  ($(id + 'Rng') as HTMLInputElement).value = String(v);
  $(id + 'Val').textContent = v.toFixed(2);
}

export function initSliders(): void {
  const slidersEl = $('sliders');
  SLIDERS.forEach(s => {
    const wrap = document.createElement('div');
    wrap.className = 'ctl';
    const val = P[s.id] !== undefined ? P[s.id] : s.def;
    wrap.innerHTML =
      `<div class="ctl-head"><span>${s.label}</span><span class="val" id="${s.id}Val">${val.toFixed(2)}</span></div>` +
      `<input type="range" id="${s.id}Rng" min="0" max="1" step="0.01" value="${val}">`;
    slidersEl.appendChild(wrap);
    const rng = wrap.querySelector('input') as HTMLInputElement;
    rng.addEventListener('pointerdown', () => {
      window.dispatchEvent(new CustomEvent('lumen:historyBefore'));
    });
    rng.addEventListener('input', () => {
      P[s.id] = parseFloat(rng.value);
      $(s.id + 'Val').textContent = P[s.id].toFixed(2);
      window.dispatchEvent(new CustomEvent('lumen:presetChanged'));
    });
  });
}
