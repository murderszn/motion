// ─────────────────────────────────────────────────────────
//  Theme tokens — derive studio CSS variables per theme
// ─────────────────────────────────────────────────────────

function parseHex(hex: string): [number, number, number] | null {
  const h = hex.trim().replace(/^#/, '');
  if (h.length === 3) {
    return [
      parseInt(h[0] + h[0], 16),
      parseInt(h[1] + h[1], 16),
      parseInt(h[2] + h[2], 16),
    ];
  }
  if (h.length === 6) {
    return [
      parseInt(h.slice(0, 2), 16),
      parseInt(h.slice(2, 4), 16),
      parseInt(h.slice(4, 6), 16),
    ];
  }
  return null;
}

function luminance(hex: string): number {
  const rgb = parseHex(hex);
  if (!rgb) return 0;
  const [r, g, b] = rgb.map(c => {
    const s = c / 255;
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function hexAlpha(hex: string, alpha: number): string {
  const rgb = parseHex(hex);
  if (!rgb) return `rgba(0,0,0,${alpha})`;
  return `rgba(${rgb[0]},${rgb[1]},${rgb[2]},${alpha})`;
}

/** Expand base theme map with derived studio shell tokens. */
export function expandThemeVariables(vars: Record<string, string>): Record<string, string> {
  const out: Record<string, string> = { ...vars };

  if (vars['--panel']) out['--bg-alt'] = vars['--panel'];
  if (!out['--term-accent'] && vars['--accent']) out['--term-accent'] = vars['--accent'];

  const accent = vars['--accent'];
  if (accent) {
    out['--accent-dim'] = hexAlpha(accent, 0.14);
    out['--accent-border'] = hexAlpha(accent, 0.4);
    out['--accent-glow'] = hexAlpha(accent, 0.22);
    out['--accent-soft'] = hexAlpha(accent, 0.08);
    out['--accent-mid'] = hexAlpha(accent, 0.3);
    out['--on-accent'] = luminance(accent) > 0.55 ? '#0a0808' : '#ffffff';
  }

  const bg = vars['--bg'] ?? '#0a0808';
  const light = luminance(bg) > 0.55;
  const ink = light ? '#000000' : '#ffffff';

  out['--border-subtle'] = hexAlpha(ink, light ? 0.1 : 0.06);
  out['--surface-hover'] = hexAlpha(ink, light ? 0.05 : 0.06);
  out['--surface-raised'] = hexAlpha(ink, light ? 0.04 : 0.04);
  out['--ghost'] = hexAlpha(ink, light ? 0.44 : 0.42);
  out['--brand-sub'] = hexAlpha(ink, light ? 0.38 : 0.28);
  out['--brand-sub-hover'] = hexAlpha(ink, light ? 0.52 : 0.48);
  out['--focus-ring'] = hexAlpha(ink, light ? 0.14 : 0.12);

  return out;
}