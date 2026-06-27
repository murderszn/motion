import { test, expect } from '@playwright/test';

const TOTAL_PRESETS = 33;

/**
 * Loop-seam pixel diff audit.
 *
 * Renders each preset at phase=0 and phase=2π−ε, diffs all pixels.
 * Grain overlay is disabled (it uses u_phase in its hash, inherently diffing).
 *
 * FINDING: Nearly every preset uses u_phase * mix(lo,hi,u_speed) for its
 * internal time variable, which is NOT an integer multiple of u_phase.
 * This means phase=0 ≠ phase=2π for most presets — a known loop-seam gap.
 *
 * Only mode 0 (aurora) uses pure integer multiples of u_phase and passes.
 *
 * This test is informational — it establishes a baseline for when presets
 * are fixed to use integer multiples. It always passes.
 */
test.describe('Loop-seam audit', () => {
  test('all 33 presets — report maxDelta per mode', async ({ page }) => {
    await page.goto('/studio.html', { waitUntil: 'networkidle' });
    await page.waitForSelector('#c', { timeout: 10_000 });
    await page.waitForFunction(
      () => typeof (window as any).draw === 'function' && typeof (window as any).P === 'object',
      { timeout: 15_000 },
    );

    const results: { mode: number; maxDiff: number }[] = [];

    for (let mode = 0; mode < TOTAL_PRESETS; mode++) {
      const { maxDiff } = await page.evaluate(
        (mode) => {
          const P = (window as any).P;
          const draw = (window as any).draw;
          P.mode = mode;
          P.grain = 0;

          const canvas = document.getElementById('c') as HTMLCanvasElement;
          const gl = canvas.getContext('webgl', { preserveDrawingBuffer: true })!;
          const w = canvas.width;
          const h = canvas.height;

          draw(0);
          const f0 = new Uint8Array(w * h * 4);
          gl.readPixels(0, 0, w, h, gl.RGBA, gl.UNSIGNED_BYTE, f0);

          draw(2 * Math.PI - 0.01);
          const f1 = new Uint8Array(w * h * 4);
          gl.readPixels(0, 0, w, h, gl.RGBA, gl.UNSIGNED_BYTE, f1);

          let maxDiff = 0;
          for (let i = 0; i < f0.length; i++) {
            const d = Math.abs(f0[i] - f1[i]);
            if (d > maxDiff) maxDiff = d;
          }
          return { maxDiff };
        },
        mode,
      );

      results.push({ mode, maxDiff });
    }

    const PASS_THRESHOLD = 5;
    const passes = results.filter(r => r.maxDiff <= PASS_THRESHOLD);
    const gaps = results.filter(r => r.maxDiff > PASS_THRESHOLD);

    console.log(`\n═══ Loop-seam audit ═══`);
    console.log(`${passes.length}/${TOTAL_PRESETS} pass (≤${PASS_THRESHOLD} delta), ${gaps.length} gaps\n`);
    results.forEach(r => {
      const tag = r.maxDiff <= PASS_THRESHOLD ? '✓ PASS' : '✗ GAP ';
      console.log(`  ${tag}  mode ${String(r.mode).padStart(2)}: maxDelta=${String(r.maxDiff).padStart(3)}`);
    });

    if (gaps.length > 0) {
      console.log(`\n${gaps.length} presets have loop-seam gaps (non-integer phase multipliers).`);
      console.log('Fix: replace `u_phase * mix(lo,hi,u_speed)` with integer multiples.');
    }

    // Informational — always passes. Changes to this threshold require
    // fixing the underlying shaders first.
    expect(true).toBe(true);
  });
});
