// ─────────────────────────────────────────────────────────
//  Preset button grid
// ─────────────────────────────────────────────────────────

import { PRESETS, P } from '../state';

const $ = (id: string) => document.getElementById(id)!;

export let presetsEl: HTMLElement;

export function initPresets(onSelect?: (modeName: string) => void): void {
  presetsEl = $('presets');
  PRESETS.forEach((p, i) => {
    const b = document.createElement('button');
    b.textContent = p.icon;
    b.setAttribute('data-tooltip', p.full);
    if (i === P.mode) b.classList.add('active');
    b.onclick = () => {
      P.mode = i;
      presetsEl.querySelectorAll('button').forEach(x => x.classList.remove('active'));
      b.classList.add('active');
      onSelect?.(p.full);
      window.dispatchEvent(new CustomEvent('lumen:presetChanged'));
    };
    presetsEl.appendChild(b);
  });

  // Terminal event delegation
  presetsEl.addEventListener('click', e => {
    const btn = (e.target as Element).closest('button');
    if (btn) {
      const pName = btn.getAttribute('data-tooltip') || '';
      window.dispatchEvent(new CustomEvent('lumen:log', { detail: { msg: 'preset: ' + pName, cls: 'info' } }));
    }
  });
}

export function applyPresetUI(): void {
  presetsEl.querySelectorAll('button').forEach((x, idx) =>
    x.classList.toggle('active', idx === P.mode));
  window.dispatchEvent(new CustomEvent('lumen:presetChanged'));
}
