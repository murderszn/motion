// ─────────────────────────────────────────────────────────
//  Export destination sizes (Fluid-style grouped targets)
// ─────────────────────────────────────────────────────────

export interface ExportTarget {
  id: string;
  label: string;
  w: number;
  h: number;
  heavy?: boolean;
}

export interface ExportTargetGroup {
  group: string;
  items: ExportTarget[];
}

export const EXPORT_GROUPS: ExportTargetGroup[] = [
  {
    group: 'canvas',
    items: [{ id: 'custom', label: 'canvas', w: 0, h: 0 }],
  },
  {
    group: 'wallpaper',
    items: [
      { id: 'desk-1080', label: '1080p', w: 1920, h: 1080 },
      { id: 'desk-1440', label: '1440p', w: 2560, h: 1440 },
      { id: 'desk-4k', label: '4k', w: 3840, h: 2160, heavy: true },
      { id: 'ultrawide', label: 'ultra', w: 3440, h: 1440, heavy: true },
      { id: 'phone-xl', label: 'phone xl', w: 1170, h: 2532 },
      { id: 'phone', label: 'phone', w: 1080, h: 2340 },
    ],
  },
  {
    group: 'web',
    items: [
      { id: 'hero', label: 'hero', w: 1920, h: 1080 },
      { id: 'og', label: 'og', w: 1200, h: 630 },
      { id: 'web-bg', label: 'bg', w: 2560, h: 1440 },
      { id: 'tw-header', label: 'x header', w: 1500, h: 500 },
    ],
  },
  {
    group: 'social',
    items: [
      { id: 'ig-post', label: 'post', w: 1080, h: 1080 },
      { id: 'ig-story', label: 'story', w: 1080, h: 1920 },
    ],
  },
  {
    group: 'icon',
    items: [
      { id: 'icon-512', label: '512', w: 512, h: 512 },
      { id: 'icon-256', label: '256', w: 256, h: 256 },
    ],
  },
];

const TARGET_MAP = new Map<string, ExportTarget>();
EXPORT_GROUPS.forEach(g => g.items.forEach(it => TARGET_MAP.set(it.id, it)));

/** Long-edge 2048 custom target from aspect ratio (matches Fluid default). */
export function customTargetFromAspect(ar: number): ExportTarget {
  const a = Math.max(0.1, ar);
  return a >= 1
    ? { id: 'custom', label: 'canvas', w: 2048, h: Math.round(2048 / a) }
    : { id: 'custom', label: 'canvas', w: Math.round(2048 * a), h: 2048 };
}

export function resolveExportTarget(
  targetId: string,
  canvasW: number,
  canvasH: number,
): ExportTarget {
  if (targetId === 'custom' || !TARGET_MAP.has(targetId)) {
    if (canvasW > 0 && canvasH > 0) {
      return { id: 'custom', label: 'canvas', w: canvasW, h: canvasH };
    }
    return customTargetFromAspect(1);
  }
  const t = TARGET_MAP.get(targetId)!;
  return { id: t.id, label: t.label, w: t.w, h: t.h, heavy: t.heavy };
}

export type StillImageFormat = 'png' | 'jpg' | 'webp';

export const STILL_FORMAT_META: Record<StillImageFormat, { mime: string; ext: string; qual?: number }> = {
  png: { mime: 'image/png', ext: 'png' },
  jpg: { mime: 'image/jpeg', ext: 'jpg', qual: 0.92 },
  webp: { mime: 'image/webp', ext: 'webp', qual: 0.9 },
};

const NAME_A = ['molten', 'ghost', 'neon', 'liquid', 'phantom', 'solar', 'void', 'velvet',
  'plasma', 'feral', 'hollow', 'static', 'prism', 'opal', 'acid', 'glacial'];
const NAME_B = ['signal', 'bloom', 'mirage', 'relic', 'spectre', 'current', 'halo', 'flux',
  'veil', 'pulse', 'drift', 'echo', 'orbit', 'siren', 'meridian', 'vapor'];

export function exportCodename(seed: number, mode: number): string {
  const s = Math.round(seed * 100) + mode * 131;
  return NAME_A[s % NAME_A.length] + '-' + NAME_B[Math.floor(s / NAME_A.length) % NAME_B.length];
}

export function buildExportFilename(
  caption: string,
  seed: number,
  mode: number,
  ext: string,
): string {
  const slug = caption.toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 40)
    .replace(/-+$/, '');
  return (slug || exportCodename(seed, mode)) + '.' + ext;
}

export function exportSpecNote(
  target: ExportTarget,
  fmt: StillImageFormat,
  canvasW: number,
  canvasH: number,
): string {
  const fmtUp = fmt.toUpperCase();
  if (target.id === 'custom') {
    const matches = target.w === canvasW && target.h === canvasH;
    return `${target.w}×${target.h} · ${fmtUp} · ${matches ? 'matches canvas' : 'canvas size'}`;
  }
  const note = fmt === 'jpg' ? 'no transparency'
    : target.heavy ? 'heavy — may scale down'
      : fmt === 'png' ? 'lossless' : 'compressed';
  return `${target.w}×${target.h} · ${fmtUp} · ${note}`;
}