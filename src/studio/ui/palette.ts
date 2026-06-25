// ─────────────────────────────────────────────────────────
//  Palette swatch inputs + random dice
// ─────────────────────────────────────────────────────────

import { PALETTES, P } from '../state';
import type { Palette } from '../types';
import { refreshPresetThumbnails } from './presets';

const $ = (id: string) => document.getElementById(id)!;

let colEls: HTMLInputElement[];

export function applyInvertUI(): void {
  const btn = $('btnInvert') as HTMLButtonElement | null;
  if (btn) {
    btn.textContent = P.invert ? 'invert colors: on' : 'invert colors: off';
  }
}

export function setPalette(pal: Palette): void {
  P.colors = [...pal];
  colEls?.forEach((el, i) => { el.value = pal[i]; });
  applyInvertUI();
  refreshPresetThumbnails();
}

export function initPalette(): void {
  colEls = [0, 1, 2, 3].map(i => $('col' + i) as HTMLInputElement);
  setPalette(P.colors);
  colEls.forEach((el, i) => {
    el.addEventListener('pointerdown', () => {
      window.dispatchEvent(new CustomEvent('lumen:historyBefore'));
    });
    el.addEventListener('input', () => {
      P.colors[i] = el.value;
      refreshPresetThumbnails();
      window.dispatchEvent(new CustomEvent('lumen:presetChanged'));
    });
  });
  ($('palDice') as HTMLButtonElement).onclick = () => {
    window.dispatchEvent(new CustomEvent('lumen:historyBefore'));
    setPalette(PALETTES[Math.floor(Math.random() * PALETTES.length)]);
    window.dispatchEvent(new CustomEvent('lumen:log', { detail: { msg: 'palette shuffled', cls: 'ok' } }));
  };
  const btnInvert = $('btnInvert') as HTMLButtonElement | null;
  if (btnInvert) {
    btnInvert.onclick = () => {
      window.dispatchEvent(new CustomEvent('lumen:historyBefore'));
      P.invert = P.invert === 1 ? 0 : 1;
      applyInvertUI();
      refreshPresetThumbnails();
      window.dispatchEvent(new CustomEvent('lumen:log', { detail: { msg: 'shader colors ' + (P.invert ? 'inverted' : 'restored'), cls: 'info' } }));
    };
  }
}
