// ─────────────────────────────────────────────────────────
//  State — constants and mutable params object
// ─────────────────────────────────────────────────────────

import type { Preset, SizeDef, SliderDef, Palette, Params, ThemeDef } from './types';

export const PRESETS: Preset[] = [
  { id: 'reeded',   icon: 'RD', full: 'reeded' },
  { id: 'flow',     icon: 'FL', full: 'flow' },
  { id: 'orbs',     icon: 'OR', full: 'orbs' },
  { id: 'waves',    icon: 'WV', full: 'waves' },
  { id: 'halftone', icon: 'HT', full: 'halftone' },
  { id: 'grain',    icon: 'GR', full: 'grain' },
  { id: 'glass',    icon: 'GL', full: 'glass' },
  { id: 'aurora',   icon: 'AU', full: 'aurora' },
  { id: 'electric', icon: 'EL', full: 'electric' },
  { id: 'kaleid',   icon: 'KL', full: 'kaleidoscope' },
  { id: 'rings',    icon: 'RI', full: 'rings' },
  { id: 'plasma',   icon: 'PL', full: 'plasma' },
  { id: 'displace', icon: 'DI', full: 'displace' },
  { id: 'melt',     icon: 'ME', full: 'melt' },
];

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
};

export const THEMES: Record<string, ThemeDef> = {
  'lumen-dark': {
    name: 'lumen dark',
    variables: {
      '--bg':        '#08080a',
      '--panel':     '#0e0e12',
      '--bar-bg':    '#0a0a0e',
      '--line':      '#1c1c22',
      '--text':      '#b8b8c0',
      '--dim':       '#55555e',
      '--accent':    '#e03a3a',
      '--white':     '#f4f4f6',
      '--term-bg':   '#060608',
      '--term-text': '#88c0d0',
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
      '--term-text': '#5e81ac',
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
      '--term-text': '#5e81ac',
    },
  },
};
