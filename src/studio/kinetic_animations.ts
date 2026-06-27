export interface AnimParams {
  text: string;
  font: string;
  fontSize: number;
  speed: number;
  scale: number;
  color1: string;
  color2: string;
  bgColor: string;
  transparentBg: boolean;
}

function getCharWidths(ctx: CanvasRenderingContext2D, text: string): number[] {
  return text.split('').map(c => ctx.measureText(c).width);
}

function totalWidth(text: string, charWidths: number[]): number {
  return charWidths.reduce((a, b) => a + b, 0);
}

function drawChars(
  ctx: CanvasRenderingContext2D,
  text: string,
  charWidths: number[],
  cx: number,
  cy: number,
  cb: (char: string, x: number, y: number, idx: number, charW: number) => void
): void {
  const tw = totalWidth(text, charWidths);
  let curX = cx - tw / 2;
  text.split('').forEach((c, i) => {
    const w = charWidths[i];
    cb(c, curX + w / 2, cy, i, w);
    curX += w;
  });
}

function normPhase(phase: number): number {
  const p = phase % (Math.PI * 2);
  return (p < 0 ? p + Math.PI * 2 : p) / (Math.PI * 2);
}

export function drawImplode(
  ctx: CanvasRenderingContext2D, w: number, h: number, t: number, p: AnimParams
): void {
  const cx = w / 2, cy = h / 2;
  const size = p.fontSize;
  const speed = p.speed;
  const phase = t * speed * 2;
  const norm = normPhase(phase);

  ctx.save();
  const cw = getCharWidths(ctx, p.text);
  const tw = totalWidth(p.text, cw);
  let curX = cx - tw / 2;

  p.text.split('').forEach((c, i) => {
    ctx.save();
    const charDelay = i * 0.03;
    const localPhase = Math.max(0, Math.min(1, (norm - charDelay) / (1 - charDelay)));
    let s = 1;
    let opacity = 1;
    let rot = 0;
    let blur = 0;

    if (localPhase < 0.6) {
      const prog = localPhase / 0.6;
      const eased = 1 - Math.pow(1 - prog, 3);
      s = eased;
      rot = eased * 140;
      opacity = eased;
      blur = eased * 6;
    } else {
      s = 1;
      opacity = 1;
    }

    const charX = curX + cw[i] / 2;
    ctx.translate(charX, cy);
    ctx.translate(-charX, -cy);
    const towardCx = cx + (charX - cx) * (1 - s);
    const towardCy = cy + (cy - cy) * (1 - s);

    ctx.translate(towardCx, towardCy);
    ctx.scale(s, s);
    ctx.rotate(rot * Math.PI / 180);
    ctx.translate(-towardCx, -towardCy);
    ctx.globalAlpha = opacity;
    if (blur > 0.5) ctx.filter = `blur(${blur}px)`;
    ctx.fillStyle = p.color1;
    ctx.fillText(c, charX, cy);
    ctx.restore();
    curX += cw[i];
  });
  ctx.restore();
}

export function drawShake(
  ctx: CanvasRenderingContext2D, w: number, h: number, t: number, p: AnimParams
): void {
  const cx = w / 2, cy = h / 2;
  const phase = t * p.speed * 2;
  const norm = normPhase(phase);

  ctx.save();

  let s = 6;
  let opacity = 0;
  let ls = '0em';

  if (norm < 0.15) {
    const prog = norm / 0.15;
    s = 6 - prog * 5;
    opacity = prog;
  } else if (norm < 0.45) {
    s = 1;
    opacity = 1;
    ls = '0.06em';
    const shakeX = Math.sin(t * 120) * 7;
    const shakeY = Math.sin(t * 150) * 3;
    ctx.translate(shakeX, shakeY);
  } else if (norm < 0.6) {
    s = 1;
    opacity = 1;
  } else {
    const prog = (norm - 0.6) / 0.4;
    s = 1 - prog * 0.8;
    opacity = 1 - prog;
    if (prog > 0.3) ctx.filter = `blur(${(prog - 0.3) * 24}px)`;
  }

  ctx.save();
  const cw = getCharWidths(ctx, p.text);
  ctx.translate(cx, cy);
  ctx.scale(s, s);
  ctx.translate(-cx, -cy);

  ctx.fillStyle = p.color2;
  ctx.globalAlpha = opacity;
  drawChars(ctx, p.text, cw, cx, cy, (c, x, y) => {
    ctx.fillText(c, x, y);
  });
  ctx.restore();

  ctx.restore();
}

export function drawSkewReveal(
  ctx: CanvasRenderingContext2D, w: number, h: number, t: number, p: AnimParams
): void {
  const cx = w / 2, cy = h / 2;
  const phase = t * p.speed * 2;

  ctx.save();
  const cw = getCharWidths(ctx, p.text);
  drawChars(ctx, p.text, cw, cx, cy, (c, x, y, i) => {
    ctx.save();
    const pOffset = (phase - i * 0.025) % (Math.PI * 2);
    const norm = (pOffset < 0 ? pOffset + Math.PI * 2 : pOffset) / (Math.PI * 2);
    let yOff = 0;
    let opacity = 1;
    let skew = 0;

    if (norm < 0.25) {
      const prog = norm / 0.25;
      const eased = prog * prog;
      yOff = (1 - eased) * 130;
      opacity = eased;
      skew = (1 - eased) * 9;
    } else if (norm > 0.8) {
      const prog = (norm - 0.8) / 0.2;
      yOff = -prog * 60;
      opacity = 1 - prog;
      skew = (1 - prog) * 9;
    }

    ctx.transform(1, 0, Math.tan(skew * Math.PI / 180), 1, 0, 0);
    ctx.fillStyle = p.color1;
    ctx.globalAlpha = opacity;
    ctx.fillText(c, x, y + yOff * p.scale);
    ctx.restore();
  });
  ctx.restore();
}

export function drawBands(
  ctx: CanvasRenderingContext2D, w: number, h: number, t: number, p: AnimParams
): void {
  const cx = w / 2, cy = h / 2;
  const phase = t * p.speed * 2;
  const norm = normPhase(phase);

  ctx.save();

  const bandCount = 3;
  const bandH = h / bandCount;
  const colors = [p.color2, p.bgColor, p.color2];

  for (let i = 0; i < bandCount; i++) {
    ctx.save();
    const bandDelay = i * 0.08;
    const localNorm = Math.max(0, Math.min(1, (norm - bandDelay) / (1 - bandDelay + 0.01)));
    const sweep = localNorm * 2 - 1;
    const y = bandH * i;
    const sweepW = Math.abs(sweep) * w * 1.1;
    const sx = sweep > 0 ? w * 1.05 - sweepW : -w * 0.05;

    ctx.beginPath();
    ctx.rect(sx, y, sweepW, bandH);

    ctx.fillStyle = colors[i];
    ctx.globalAlpha = localNorm < 0.05 ? localNorm / 0.05 : 1;
    ctx.fill();
    ctx.restore();
  }

  ctx.globalAlpha = Math.min(1, (norm + 0.5));
  const cw = getCharWidths(ctx, p.text);
  ctx.fillStyle = p.color1;
  drawChars(ctx, p.text, cw, cx, cy, (c, x, y) => {
    ctx.fillText(c, x, y);
  });

  ctx.restore();
}

export function drawCurtain(
  ctx: CanvasRenderingContext2D, w: number, h: number, t: number, p: AnimParams
): void {
  const cx = w / 2, cy = h / 2;
  const phase = t * p.speed * 1.5;
  const norm = normPhase(phase);

  ctx.save();

  const leftCurtain = norm < 0.5
    ? Math.pow(norm / 0.5, 2) * w * 0.55
    : w * 0.55 * (1 - Math.pow((norm - 0.5) / 0.5, 2));

  ctx.fillStyle = p.bgColor;
  ctx.fillRect(0, 0, leftCurtain, h);
  ctx.fillRect(w - leftCurtain, 0, leftCurtain, h);

  const textOpacity = norm > 0.15 && norm < 0.85 ? 1 : 0;
  ctx.globalAlpha = textOpacity;
  const cw = getCharWidths(ctx, p.text);
  const revealNorm = Math.max(0, Math.min(1, (norm - 0.15) / 0.7));
  const skipChars = Math.floor((1 - revealNorm) * cw.length / 2);

  ctx.fillStyle = p.color1;
  let curX = cx - totalWidth(p.text, cw) / 2;
  p.text.split('').forEach((c, i) => {
    ctx.save();
    const revealPhase = Math.max(0, Math.min(1, (norm - 0.15 - i * 0.02) / 0.7));
    ctx.globalAlpha = revealPhase;
    ctx.fillText(c, curX + cw[i] / 2, cy);
    ctx.restore();
    curX += cw[i];
  });

  ctx.restore();
}

export function drawSpinReveal(
  ctx: CanvasRenderingContext2D, w: number, h: number, t: number, p: AnimParams
): void {
  const cx = w / 2, cy = h / 2;
  const phase = t * p.speed * 2;

  ctx.save();
  const cw = getCharWidths(ctx, p.text);
  drawChars(ctx, p.text, cw, cx, cy, (c, x, y, i) => {
    ctx.save();
    const pOffset = (phase - i * 0.03) % (Math.PI * 2);
    const norm = (pOffset < 0 ? pOffset + Math.PI * 2 : pOffset) / (Math.PI * 2);
    let yOff = 0;
    let opacity = 1;
    let rotX = 0;

    if (norm < 0.4) {
      const prog = Math.min(1, norm / 0.4);
      const eased = 1 - Math.pow(1 - prog, 3);
      yOff = (1 - eased) * 120;
      opacity = eased;
      rotX = (1 - eased) * 90;
    } else if (norm > 0.75) {
      const prog = (norm - 0.75) / 0.25;
      yOff = -prog * 130;
      opacity = 1 - prog;
    }

    ctx.translate(x, y + yOff * p.scale);
    ctx.scale(1, Math.cos(rotX * Math.PI / 180));
    ctx.fillStyle = p.color2;
    ctx.globalAlpha = opacity;
    ctx.fillText(c, 0, 0);
    ctx.restore();
  });
  ctx.restore();
}

export function drawBackSlam(
  ctx: CanvasRenderingContext2D, w: number, h: number, t: number, p: AnimParams
): void {
  const cx = w / 2, cy = h / 2;
  const phase = t * p.speed * 2;
  const norm = normPhase(phase);

  ctx.save();
  const cw = getCharWidths(ctx, p.text);
  drawChars(ctx, p.text, cw, cx, cy, (c, x, y, i) => {
    ctx.save();
    const pOffset = (phase - i * 0.03) % (Math.PI * 2);
    const localNorm = (pOffset < 0 ? pOffset + Math.PI * 2 : pOffset) / (Math.PI * 2);
    let s = 2.4;
    let opacity = 0;

    if (localNorm < 0.15) {
      const prog = localNorm / 0.15;
      const backEase = (prog < 0.5)
        ? 2 * prog * prog
        : -1 + (4 - 2 * prog) * prog;
      s = 2.4 - backEase * 1.4;
      opacity = prog;
    } else if (localNorm < 0.6) {
      s = 1;
      opacity = 1;
      const bounce = Math.floor(t * p.speed * 6) % 5;
      if (bounce < 3) {
        ctx.translate(0, -6 * (1 - bounce / 3));
      }
    } else {
      const prog = (localNorm - 0.6) / 0.4;
      s = 1 - prog * 0.4;
      opacity = 1 - prog;
    }

    ctx.translate(x, y);
    ctx.scale(s * p.scale, s * p.scale);
    ctx.translate(-x, -y);
    ctx.fillStyle = p.color2;
    ctx.globalAlpha = opacity;
    ctx.fillText(c, x, y);
    ctx.restore();
  });
  ctx.restore();
}
