// ─────────────────────────────────────────────────────────
//  Seed input + dice button
// ─────────────────────────────────────────────────────────

import { P } from '../state';

const $ = (id: string) => document.getElementById(id)!;

let seedEl: HTMLInputElement;

export function setSeed(n: number, onUpdate?: (val: string) => void): void {
  let val = Math.round(n);
  if (isNaN(val)) val = 0;
  P.seed = ((val % 10000) + 10000) % 10000;
  seedEl.value = String(P.seed).padStart(4, '0');
  onUpdate?.(seedEl.value);
}

export function initSeed(onUpdate?: (val: string) => void): void {
  seedEl = $('seed') as HTMLInputElement;
  setSeed(P.seed, onUpdate);

  seedEl.addEventListener('change', () => {
    setSeed(parseInt(seedEl.value, 10) || 0, onUpdate);
    window.dispatchEvent(new CustomEvent('lumen:log', { detail: { msg: 'seed: ' + seedEl.value, cls: 'info' } }));
  });

  ($('seedDice') as HTMLButtonElement).onclick = () => {
    setSeed(Math.floor(Math.random() * 10000), onUpdate);
    window.dispatchEvent(new CustomEvent('lumen:log', { detail: { msg: 'seed → ' + seedEl.value } }));
  };
}
