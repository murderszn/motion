// ─────────────────────────────────────────────────────────
//  Shared types for the lumen·local studio
// ─────────────────────────────────────────────────────────

export interface Preset {
  id: string;
  icon: string;
  full: string;
}

export interface SizeDef {
  label: string;
  w: number;
  h: number;
}

export interface SliderDef {
  id: SliderKey;
  label: string;
  def: number;
}

/** Keys that correspond to numeric shader parameters in Params */
export type SliderKey = 'speed' | 'scale' | 'density' | 'distort' | 'detail' | 'grain';

export type Palette = [string, string, string, string];

export interface Params {
  mode: number;
  seed: number;
  sizeIdx: number;
  loop: number;
  colors: Palette;
  speed: number;
  scale: number;
  density: number;
  distort: number;
  detail: number;
  grain: number;
  mix: number;
  pixel: number;
}

export type TextAlign = 'left' | 'center' | 'right';
export type TextEffect = 'none' | 'shadow' | 'neon' | 'outline' | 'badge' | 'glass';

export interface TextElem {
  id: number;
  x: number;
  y: number;
  content: string;
  fontSize: number;     // fraction of canvas height, e.g. 0.05
  fontFamily: string;
  color: string;
  align: TextAlign;
  bold: boolean;
  italic: boolean;
  tracking: number;     // em units
  opacity: number;      // 0–1
  effect: TextEffect;
  bgColor: string;
}

export interface ThemeDef {
  name: string;
  variables: Record<string, string>;
}

export interface Command {
  name: string;
  action: () => void;
  key?: string;
}

export interface ProjectFile {
  version: string;
  params: Params;
  texts: TextElem[];
  shader: string;
}
