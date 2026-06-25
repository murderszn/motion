// ─────────────────────────────────────────────────────────
//  State — constants and mutable params object
// ─────────────────────────────────────────────────────────

import type { Preset, SizeDef, SliderDef, Palette, Params, ThemeDef } from './types';

export const PRESETS: Preset[] = [
  { id: 'aurora',    icon: 'AU', full: 'aurora' },
  { id: 'contour',   icon: 'CN', full: 'contour waves' },
  { id: 'curl',      icon: 'CU', full: 'curl noise' },
  { id: 'electric',  icon: 'EL', full: 'electric' },
  { id: 'flow',      icon: 'FL', full: 'flow' },
  { id: 'glass',     icon: 'GL', full: 'glass' },
  { id: 'grain',     icon: 'GR', full: 'grain' },
  { id: 'halftone',  icon: 'HT', full: 'halftone' },
  { id: 'kaleid',    icon: 'KL', full: 'kaleidoscope' },
  { id: 'lines',     icon: 'LN', full: 'lines' },
  { id: 'marble',    icon: 'MB', full: 'marble' },
  { id: 'orbs',      icon: 'OR', full: 'orbs' },
  { id: 'plasma',    icon: 'PL', full: 'plasma' },
  { id: 'reeded',    icon: 'RD', full: 'reeded' },
  { id: 'rings',     icon: 'RI', full: 'rings' },
  { id: 'rorschach', icon: 'RK', full: 'rorschach' },
  { id: 'ridge',     icon: 'RF', full: 'ridged' },
  { id: 'rosette',   icon: 'RS', full: 'sd rosette' },
  { id: 'truchet',   icon: 'TR', full: 'truchet' },
  { id: 'trilat',    icon: 'TL', full: 'triangle lattice' },
  { id: 'turb',      icon: 'TU', full: 'turbulence' },
  { id: 'waves',     icon: 'WV', full: 'waves' },
];

/** Clamp to a valid preset index (0 … PRESETS.length - 1). */
export function normalizeMode(mode: number): number {
  const m = Math.floor(Number(mode));
  if (!Number.isFinite(m) || m < 0) return 0;
  if (m >= PRESETS.length) return PRESETS.length - 1;
  return m;
}

/**
 * Remap mode indices from the 23-preset layout (golden was index 5).
 * Call once when loading v1 saved settings / projects.
 */
export function migrateLegacyMode(mode: number): number {
  let m = Math.floor(Number(mode));
  if (!Number.isFinite(m) || m < 0) return 0;
  if (m >= 6) m -= 1;
  return normalizeMode(m);
}

export function presetAt(mode: number): Preset {
  return PRESETS[normalizeMode(mode)];
}

export const SIZES: SizeDef[] = [
  { label: '1:1',  w: 1080, h: 1080 },
  { label: '16:9', w: 1920, h: 1080 },
  { label: '9:16', w: 1080, h: 1920 },
  { label: '4:5',  w: 1080, h: 1350 },
];

export const PALETTES: Palette[] = [
  ['#100c16','#7f0616','#e03a3a','#fff5f5'],  // crimson
  ['#03060f','#0b3b4a','#34d399','#e6fff5'],  // aurora
  ['#050507','#2a2a31','#8e8e98','#f4f4f6'],  // noir
  ['#0b0427','#3b0f8e','#8b5cf6','#f3e8ff'],  // violet
  ['#03121d','#075985','#22d3ee','#ecfeff'],  // ocean
  ['#160903','#7c2d12','#fb923c','#fff7ed'],  // ember
  ['#0a1203','#3f6212','#a3e635','#f7fee7'],  // acid
  ['#1a0a12','#9d174d','#fb7185','#fff1f2'],  // rose
  ['#141004','#854d0e','#facc15','#fefce8'],  // gold
  ['#020617','#1e3a8a','#60a5fa','#eff6ff'],  // cobalt
  ['#0c0a09','#44403c','#d6d3d1','#fafaf9'],  // stone
];

export const SLIDERS: SliderDef[] = [
  { id: 'speed',   label: 'speed',      def: 0.50 },
  { id: 'scale',   label: 'scale',      def: 0.45 },
  { id: 'density', label: 'density',    def: 0.55 },
  { id: 'distort', label: 'distortion', def: 0.60 },
  { id: 'detail',  label: 'detail',     def: 0.50 },
  { id: 'grain',   label: 'grain',      def: 0.20 },
];

export const P: Params = {
  mode: 0,
  seed: 9015,
  sizeIdx: 1,
  loop: 4.0,
  colors: [...PALETTES[0]],
  speed: 0.50, scale: 0.45, density: 0.55,
  distort: 0.60, detail: 0.50, grain: 0.20,
  mix: 0, pixel: 0,
  invert: 0,
};

export const THEMES: Record<string, ThemeDef> = {
  'lumen-dark': {
    name: 'lumen dark',
    variables: {
      '--bg':        '#0a0808',
      '--panel':     '#130f0f',
      '--bar-bg':    '#0e0b0b',
      '--line':      '#231c1a',
      '--text':      '#e8e4e2',
      '--dim':       '#786b66',
      '--accent':    '#e03a3a',
      '--white':     '#ffffff',
      '--term-bg':   '#0a0808',
      '--term-text': '#9ca3af',
    },
  },
  'lumen-dim': {
    name: 'lumen dim',
    variables: {
      '--bg':        '#0f0f14',
      '--panel':     '#16161e',
      '--bar-bg':    '#121217',
      '--line':      '#252530',
      '--text':      '#c0c0cb',
      '--dim':       '#686875',
      '--accent':    '#e54b4b',
      '--white':     '#f7f7f9',
      '--term-bg':   '#0a0a0f',
      '--term-text': '#a3be8c',
    },
  },
  'lumen-contrast': {
    name: 'lumen contrast',
    variables: {
      '--bg':        '#000000',
      '--panel':     '#080808',
      '--bar-bg':    '#000000',
      '--line':      '#383838',
      '--text':      '#e0e0e0',
      '--dim':       '#a0a0a0',
      '--accent':    '#ff3b30',
      '--white':     '#ffffff',
      '--term-bg':   '#000000',
      '--term-text': '#ffffff',
    },
  },
  'lumen-light': {
    name: 'lumen light',
    variables: {
      '--bg':        '#f4f4f6',
      '--panel':     '#ffffff',
      '--bar-bg':    '#eaeaea',
      '--line':      '#d1d1d6',
      '--text':      '#2c2c2e',
      '--dim':       '#8e8e93',
      '--accent':    '#d32f2f',
      '--white':     '#1c1c1e',
      '--term-bg':   '#f4f4f6',
      '--term-text': '#1e293b',
    },
  },
  'lumen-cyberpunk': {
    name: 'neon midnight',
    variables: {
      '--bg':        '#0a0612',
      '--panel':     '#120b20',
      '--bar-bg':    '#0d0818',
      '--line':      '#25183d',
      '--text':      '#a291b5',
      '--dim':       '#5e4d73',
      '--accent':    '#ff0055',
      '--white':     '#00ffff',
      '--term-bg':   '#07040d',
      '--term-text': '#00ffff',
    },
  },
  'lumen-forest': {
    name: 'moss forest',
    variables: {
      '--bg':        '#0c0e0d',
      '--panel':     '#131816',
      '--bar-bg':    '#0f1211',
      '--line':      '#232a26',
      '--text':      '#a0b0a5',
      '--dim':       '#54665c',
      '--accent':    '#10b981',
      '--white':     '#ecfdf5',
      '--term-bg':   '#080b09',
      '--term-text': '#34d399',
    },
  },
  'lumen-nord': {
    name: 'arctic frost',
    variables: {
      '--bg':        '#1a1c23',
      '--panel':     '#222530',
      '--bar-bg':    '#1d2029',
      '--line':      '#353a4a',
      '--text':      '#abb2c4',
      '--dim':       '#5c6370',
      '--accent':    '#88c0d0',
      '--white':     '#eceff4',
      '--term-bg':   '#16181f',
      '--term-text': '#81a1c1',
    },
  },
  'lumen-synthwave': {
    name: 'synthwave dream',
    variables: {
      '--bg':        '#120924',
      '--panel':     '#1d0e3a',
      '--bar-bg':    '#170b2e',
      '--line':      '#341b63',
      '--text':      '#e5cff7',
      '--dim':       '#8c7b9e',
      '--accent':    '#ff7e67',
      '--white':     '#ffffff',
      '--term-bg':   '#0c0618',
      '--term-text': '#fca311',
    },
  },
  'lumen-dracula': {
    name: 'dracula noir',
    variables: {
      '--bg':        '#1e1f29',
      '--panel':     '#282a36',
      '--bar-bg':    '#21222c',
      '--line':      '#44475a',
      '--text':      '#f8f8f2',
      '--dim':       '#6272a4',
      '--accent':    '#ff79c6',
      '--white':     '#8be9fd',
      '--term-bg':   '#191a21',
      '--term-text': '#50fa7b',
    },
  },
  'lumen-sakura': {
    name: 'cherry blossom',
    variables: {
      '--bg':        '#1a0f14',
      '--panel':     '#25171d',
      '--bar-bg':    '#1f1318',
      '--line':      '#402834',
      '--text':      '#f5e6ee',
      '--dim':       '#9b7a8a',
      '--accent':    '#ffb7c5',
      '--white':     '#ffffff',
      '--term-bg':   '#120b0e',
      '--term-text': '#ffb7c5',
    },
  },
  'lumen-coffee': {
    name: 'warm espresso',
    variables: {
      '--bg':        '#14100e',
      '--panel':     '#1e1815',
      '--bar-bg':    '#181310',
      '--line':      '#332924',
      '--text':      '#e8ded6',
      '--dim':       '#8e7e75',
      '--accent':    '#d4a373',
      '--white':     '#fcfaf7',
      '--term-bg':   '#0f0b09',
      '--term-text': '#faedcd',
    },
  },
  'lumen-cream': {
    name: 'claude cream',
    variables: {
      '--bg':        '#fbfaf7',
      '--panel':     '#f5f0e6',
      '--bar-bg':    '#ebdcc9',
      '--line':      '#dfd5c0',
      '--text':      '#2c2621',
      '--dim':       '#7c7062',
      '--accent':    '#c45514',
      '--white':     '#1c1815',
      '--term-bg':   '#241e1a',
      '--term-text': '#f5ece2',
      '--term-accent': '#ff843d',
    },
  },
  'lumen-accessibility': {
    name: 'colorblind friendly',
    variables: {
      '--bg':        '#080a0f',
      '--panel':     '#11141a',
      '--bar-bg':    '#0b0d12',
      '--line':      '#2d3545',
      '--text':      '#f4f6fa',
      '--dim':       '#8a95a5',
      '--accent':    '#1a73e8',
      '--white':     '#ffffff',
      '--term-bg':   '#05070a',
      '--term-text': '#66b0ff',
      '--term-accent': '#ffc107',
    },
  },
};
