// ─────────────────────────────────────────────────────────
//  Palette swatch inputs + random dice
// ─────────────────────────────────────────────────────────

import { PALETTES, P } from '../state';
import type { Palette } from '../types';

const $ = (id: string) => document.getElementById(id)!;

let colEls: HTMLInputElement[];

export function setPalette(pal: Palette): void {
  P.colors = [...pal];
  colEls.forEach((el, i) => { el.value = pal[i]; });
}

export function initPalette(): void {
  colEls = [0, 1, 2, 3].map(i => $('col' + i) as HTMLInputElement);
  colEls.forEach((el, i) => {
    el.addEventListener('input', () => { P.colors[i] = el.value; });
  });
  ($('palDice') as HTMLButtonElement).onclick = () => {
    setPalette(PALETTES[Math.floor(Math.random() * PALETTES.length)]);
    window.dispatchEvent(new CustomEvent('lumen:log', { detail: { msg: 'palette shuffled', cls: 'ok' } }));
  };
}
