// ─────────────────────────────────────────────────────────
//  Export progress — bar, frame counter, ETA, cancel
// ─────────────────────────────────────────────────────────

export type ExportPhase = 'idle' | 'video' | 'gif-render' | 'gif-encode' | 'png';

let exportStart = 0;

const $ = (id: string) => document.getElementById(id)!;

function panel(): HTMLElement {
  return $('exportProgress');
}

export function showExportProgress(phase: ExportPhase, label: string): void {
  exportStart = performance.now();
  panel().classList.add('on');
  $('exportLabel').textContent = label;
  $('exportPhase').textContent = phase === 'gif-encode' ? 'encoding' : phase === 'gif-render' ? 'rendering' : 'recording';
  $('exportFrame').textContent = '0/0';
  $('exportBar').style.width = '0%';
  $('exportPct').textContent = '0%';
  $('exportEta').textContent = '—';
}

export function updateExportProgress(current: number, total: number, detail?: string): void {
  const pct = total > 0 ? Math.min(100, Math.round((current / total) * 100)) : 0;
  $('exportFrame').textContent = `${current}/${total}`;
  $('exportBar').style.width = pct + '%';
  $('exportPct').textContent = pct + '%';

  if (detail) $('exportLabel').textContent = detail;

  if (current > 2 && total > 0) {
    const elapsed = (performance.now() - exportStart) / 1000;
    const rate = current / elapsed;
    const remaining = Math.max(0, (total - current) / rate);
    $('exportEta').textContent = remaining < 1 ? '<1s' : `~${Math.ceil(remaining)}s`;
  }
}

export function updateExportEncoding(pct: number): void {
  const rounded = Math.round(pct * 100);
  $('exportPhase').textContent = 'encoding';
  $('exportBar').style.width = rounded + '%';
  $('exportPct').textContent = rounded + '%';
  $('exportFrame').textContent = rounded + '%';
  $('exportLabel').textContent = 'encoding gif…';
}

export function hideExportProgress(): void {
  panel().classList.remove('on');
}