// ─────────────────────────────────────────────────────────
//  Pattern-fill text mask — living shader inside letterforms
// ─────────────────────────────────────────────────────────

import { texts } from './ui/text';
import type { TextElem } from './types';

let maskTex: WebGLTexture | null = null;
let maskCanvas: HTMLCanvasElement | null = null;
let maskCtx: CanvasRenderingContext2D | null = null;
let maskAspect = 0;

export function hasPatternText(): boolean {
  return texts.some(t => t.effect === 'pattern' && t.content.trim().length > 0);
}

export function getPatternMaskBg(): [number, number, number] {
  const t = texts.find(x => x.effect === 'pattern');
  const hex = t?.bgColor ?? '#08080a';
  return [
    parseInt(hex.slice(1, 3), 16) / 255,
    parseInt(hex.slice(3, 5), 16) / 255,
    parseInt(hex.slice(5, 7), 16) / 255,
  ];
}

function drawPatternText(ctx: CanvasRenderingContext2D, t: TextElem, W: number, H: number): void {
  if (!t.content.trim()) return;
  ctx.save();
  ctx.globalAlpha = t.opacity;
  const sizePx = t.fontSize * H;
  ctx.font = `${t.italic ? 'italic ' : ''}${t.bold ? 'bold ' : ''}${sizePx}px ${t.fontFamily}`;
  ctx.fillStyle = '#ffffff';
  ctx.textBaseline = 'middle';
  ctx.textAlign = t.align;
  const tx = t.x * W;
  const ty = t.y * H;
  const lines = t.content.split('\n');
  const lh = sizePx * 1.12;
  const y0 = ty - ((lines.length - 1) * lh) / 2;
  if (t.tracking !== 0) {
    lines.forEach((line, i) => {
      let x = tx;
      if (t.align === 'center') {
        const w = [...line].reduce((acc, ch) => acc + ctx.measureText(ch).width + t.tracking * sizePx, 0) - t.tracking * sizePx;
        x = tx - w / 2;
      } else if (t.align === 'right') {
        const w = [...line].reduce((acc, ch) => acc + ctx.measureText(ch).width + t.tracking * sizePx, 0) - t.tracking * sizePx;
        x = tx - w;
      }
      [...line].forEach(ch => {
        ctx.fillText(ch, x, y0 + i * lh);
        x += ctx.measureText(ch).width + t.tracking * sizePx;
      });
    });
  } else {
    lines.forEach((line, i) => ctx.fillText(line, tx, y0 + i * lh));
  }
  ctx.restore();
}

/** Rebuild mask texture at the given pixel dimensions (aspect of the render target). */
export function updateMaskTexture(gl: WebGLRenderingContext, w: number, h: number): void {
  const ar = w / h;
  if (!ar || !isFinite(ar)) return;
  maskAspect = ar;

  if (!hasPatternText()) return;

  if (!maskTex) {
    maskTex = gl.createTexture()!;
    gl.activeTexture(gl.TEXTURE2);
    gl.bindTexture(gl.TEXTURE_2D, maskTex);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.activeTexture(gl.TEXTURE0);
  }

  const LONG = 2048;
  const MW = ar >= 1 ? LONG : Math.round(LONG * ar);
  const MH = ar >= 1 ? Math.round(LONG / ar) : LONG;

  if (!maskCanvas) maskCanvas = document.createElement('canvas');
  if (maskCanvas.width !== MW || maskCanvas.height !== MH) {
    maskCanvas.width = MW;
    maskCanvas.height = MH;
    maskCtx = null;
  }
  const ctx = maskCtx ?? (maskCtx = maskCanvas.getContext('2d')!);
  ctx.fillStyle = '#000000';
  ctx.fillRect(0, 0, MW, MH);
  texts.filter(t => t.effect === 'pattern').forEach(t => drawPatternText(ctx, t, MW, MH));

  gl.activeTexture(gl.TEXTURE2);
  gl.bindTexture(gl.TEXTURE_2D, maskTex);
  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, maskCanvas);
  gl.activeTexture(gl.TEXTURE0);
}

export function bindMaskUniforms(
  gl: WebGLRenderingContext,
  U: Record<string, WebGLUniformLocation | null>,
): void {
  const active = hasPatternText();
  if (active && maskTex) {
    gl.activeTexture(gl.TEXTURE2);
    gl.bindTexture(gl.TEXTURE_2D, maskTex);
    gl.uniform1i(U.u_mask, 2);
    gl.activeTexture(gl.TEXTURE0);
  }
  gl.uniform1f(U.u_hasMask, active ? 1.0 : 0.0);
  const bg = getPatternMaskBg();
  gl.uniform3f(U.u_maskBg, bg[0], bg[1], bg[2]);
}

export function maskAspectChanged(w: number, h: number): boolean {
  const ar = w / h;
  return Math.abs(ar - maskAspect) > 0.002;
}

export function invalidateMask(): void {
  maskAspect = 0;
}