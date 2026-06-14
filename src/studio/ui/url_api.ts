// ─────────────────────────────────────────────────────────
//  URL API — Parse settings from query parameters or generate share link
// ─────────────────────────────────────────────────────────

import { P, PRESETS } from '../state';
import type { SliderKey } from '../types';
import { texts, renderTextOverlay } from './text';
import { setStatusMsg } from './statusbar';
import { logToTerminal } from './terminal';
import { setSeed } from './seed';
import { setPalette } from './palette';
import { setSlider } from './sliders';
import { applyPresetUI } from './presets';
import { applySizeUI } from './sizes';

export function parseUrlParams(): void {
  const params = new URLSearchParams(window.location.search);

  // 1. Preset
  const presetId = params.get('preset');
  if (presetId) {
    const idx = PRESETS.findIndex(p => p.id === presetId || p.full === presetId);
    if (idx !== -1) P.mode = idx;
  }

  // 2. Seed
  const seed = params.get('seed');
  if (seed) {
    const sVal = parseInt(seed, 10);
    if (!isNaN(sVal)) P.seed = sVal;
  }

  // 3. Color Palette (comma separated hex colors, e.g. #ff0000,#00ff00,#0000ff,#ffffff)
  const palette = params.get('palette');
  if (palette) {
    const colors = palette.split(',');
    if (colors.length === 4) {
      P.colors = colors as [string, string, string, string];
    }
  }

  // 4. Sliders (speed, scale, density, distort, detail, grain)
  (['speed', 'scale', 'density', 'distort', 'detail', 'grain'] as SliderKey[]).forEach(key => {
    const val = params.get(key);
    if (val) {
      const parsed = parseFloat(val);
      if (!isNaN(parsed)) P[key] = Math.max(0, Math.min(1, parsed));
    }
  });

  const mix = params.get('mix');
  if (mix) {
    const parsed = parseFloat(mix);
    if (!isNaN(parsed)) P.mix = Math.max(0, Math.min(1, parsed));
  }

  const pixel = params.get('pixel');
  if (pixel) {
    const parsed = parseFloat(pixel);
    if (!isNaN(parsed)) P.pixel = Math.max(0, Math.min(1, parsed));
  }

  const invert = params.get('invert');
  if (invert) {
    const parsed = parseInt(invert, 10);
    if (!isNaN(parsed)) P.invert = parsed === 1 ? 1 : 0;
  }
}

export function generateShareUrl(): string {
  const params = new URLSearchParams();
  params.set('preset', PRESETS[P.mode].id);
  params.set('seed', String(P.seed));
  params.set('palette', P.colors.join(','));
  (['speed', 'scale', 'density', 'distort', 'detail', 'grain'] as SliderKey[]).forEach(key => {
    params.set(key, P[key].toFixed(2));
  });
  if (P.mix > 0.001) params.set('mix', P.mix.toFixed(2));
  if (P.pixel > 0.001) params.set('pixel', P.pixel.toFixed(2));
  if (P.invert === 1) params.set('invert', '1');

  return window.location.origin + window.location.pathname + '?' + params.toString();
}

export function copyShareLink(): void {
  const link = generateShareUrl();
  navigator.clipboard.writeText(link)
    .then(() => {
      logToTerminal('shareable link copied to clipboard: ' + link, 'ok');
      setStatusMsg('link copied');
    })
    .catch(err => {
      logToTerminal('failed to copy link: ' + err, 'err');
    });
}

export function copyStateToClipboard(): void {
  const state = {
    version: '1.0.0',
    params: P,
    texts: [...texts]
  };
  navigator.clipboard.writeText(JSON.stringify(state, null, 2))
    .then(() => {
      logToTerminal('state copied to clipboard as JSON', 'ok');
      setStatusMsg('copied JSON');
    })
    .catch(err => {
      logToTerminal('failed to copy state: ' + err, 'err');
    });
}

export function pasteStateFromClipboard(): void {
  navigator.clipboard.readText()
    .then(text => {
      try {
        const state = JSON.parse(text);
        if (!state.params || !state.texts) {
          throw new Error('Invalid clipboard JSON format');
        }
        Object.assign(P, state.params);
        texts.splice(0, texts.length, ...state.texts);

        // Sync UI elements
        setSeed(P.seed);
        setPalette(P.colors);
        (['speed', 'scale', 'density', 'distort', 'detail', 'grain'] as SliderKey[]).forEach(id => {
          if (P[id] !== undefined) setSlider(id, P[id]);
        });
        applyPresetUI();
        applySizeUI();

        const loopEl = document.getElementById('loop') as HTMLInputElement | null;
        if (loopEl) {
          loopEl.value = String(P.loop);
          const loopVal = document.getElementById('loopVal');
          if (loopVal) loopVal.textContent = P.loop.toFixed(1) + 's';
        }

        const mixRng = document.getElementById('mixRng') as HTMLInputElement | null;
        if (mixRng) {
          mixRng.value = String(Math.round(P.mix * 100));
          const mixVal = document.getElementById('mixVal');
          if (mixVal) mixVal.textContent = Math.round(P.mix * 100) + '%';
        }

        const pixelRng = document.getElementById('pixelRng') as HTMLInputElement | null;
        if (pixelRng) {
          pixelRng.value = String(Math.round(P.pixel * 100));
          const pixelVal = document.getElementById('pixelVal');
          if (pixelVal) pixelVal.textContent = Math.round(P.pixel * 100) + '%';
        }

        renderTextOverlay();
        logToTerminal('state successfully pasted and applied', 'ok');
        setStatusMsg('pasted JSON');
      } catch (err) {
        logToTerminal('failed to parse clipboard state: ' + (err instanceof Error ? err.message : String(err)), 'err');
        setStatusMsg('paste error');
      }
    })
    .catch(err => {
      logToTerminal('failed to read clipboard: ' + err, 'err');
    });
}
