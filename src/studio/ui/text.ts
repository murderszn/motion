// ─────────────────────────────────────────────────────────
//  Text render helpers: selectors, canvas composition, export
// ─────────────────────────────────────────────────────────

import { P } from '../state';

import type { TextElem, TextAlign, TextEffect } from '../types';
import { canvas } from '../webgl';

const $ = (id: string) => document.getElementById(id)!;

export let texts: TextElem[] = [];
let nextTextId = 0;
export let selectedText: number | null = null;
export let textToolActive = false;

// ── Overlay DOM render ───────────────────────────────────

export function renderTextOverlay(): void {
  const el = $('text-overlay');
  if (!el) return;
  const h = el.offsetHeight || (canvas.height * (el.offsetWidth / canvas.width)) || canvas.height;
  el.innerHTML = '';
  texts.forEach(t => {
    const d = document.createElement('div');
    d.className = 'text-elem' + (t.id === selectedText ? ' selected' : '');
    (d as HTMLElement & { dataset: DOMStringMap }).dataset.id = String(t.id);
    d.style.left    = (t.x * 100) + '%';
    d.style.top     = (t.y * 100) + '%';
    d.style.fontSize    = (t.fontSize * h) + 'px';
    d.style.fontFamily  = t.fontFamily;
    d.style.color       = t.color;
    d.style.fontWeight  = t.bold ? 'bold' : '400';
    d.style.fontStyle   = t.italic ? 'italic' : 'normal';
    d.style.opacity     = String(t.opacity);
    d.style.letterSpacing = t.tracking + 'em';

    if (t.align === 'left')       d.style.transform = 'translate(0%, -50%)';
    else if (t.align === 'right') d.style.transform = 'translate(-100%, -50%)';
    else                          d.style.transform = 'translate(-50%, -50%)';
    d.style.textAlign = t.align;

    // Reset effects
    d.style.textShadow       = '';
    (d.style as CSSStyleDeclaration & { webkitTextStroke?: string }).webkitTextStroke = '';
    d.style.background       = '';
    d.style.backdropFilter   = '';
    (d.style as CSSStyleDeclaration & { webkitBackdropFilter?: string }).webkitBackdropFilter = '';
    d.style.padding          = '';
    d.style.borderRadius     = '';
    d.style.border           = '';

    switch (t.effect) {
      case 'shadow':  d.style.textShadow = '0 4px 15px rgba(0,0,0,0.6)'; break;
      case 'neon':    d.style.textShadow = `0 0 10px ${t.color}, 0 0 20px ${t.color}`; break;
      case 'outline': (d.style as CSSStyleDeclaration & { webkitTextStroke?: string }).webkitTextStroke = '1.5px #000000'; break;
      case 'badge':
        d.style.background = t.bgColor; d.style.padding = '4px 10px'; d.style.borderRadius = '4px'; break;
      case 'glass':
        d.style.background       = 'rgba(0,0,0,0.55)';
        d.style.backdropFilter   = 'blur(10px)';
        (d.style as CSSStyleDeclaration & { webkitBackdropFilter?: string }).webkitBackdropFilter = 'blur(10px)';
        d.style.padding = '4px 10px'; d.style.borderRadius = '4px';
        d.style.border = '1px solid rgba(255,255,255,0.1)'; break;
    }
    d.textContent = t.content || 'Text';
    d.addEventListener('mousedown', e => { e.stopPropagation(); selectText(t.id); startTextDrag(e as MouseEvent, t); });
    d.addEventListener('dblclick', () => { ($('tbContent') as HTMLTextAreaElement).focus(); });
    el.appendChild(d);
  });
}

// ── Canvas bake (for export) ─────────────────────────────

export function renderTextOnCanvas(ctx: CanvasRenderingContext2D, w: number, h: number): void {
  texts.forEach(t => {
    if (!t.content) return;
    ctx.save();
    ctx.globalAlpha = t.opacity;
    ctx.font = `${t.italic ? 'italic ' : ''}${t.bold ? 'bold ' : ''}${t.fontSize * h}px ${t.fontFamily}`;
    ctx.textAlign = t.align;
    ctx.textBaseline = 'middle';
    const textWidth = ctx.measureText(t.content).width;
    const textHeight = t.fontSize * h;
    const tx = t.x * w, ty = t.y * h;
    const pX = 12 * (h / 1080), pY = 6 * (h / 1080);
    let left = tx - textWidth / 2 - pX;
    const top  = ty - textHeight / 2 - pY;
    const boxW = textWidth + 2 * pX;
    const boxH = textHeight + 2 * pY;
    if (t.align === 'left')       left = tx - pX;
    else if (t.align === 'right') left = tx - textWidth - pX;

    if (t.effect === 'badge') {
      ctx.fillStyle = t.bgColor;
      ctx.beginPath();
      if (ctx.roundRect) ctx.roundRect(left, top, boxW, boxH, 4 * (h / 1080));
      else ctx.rect(left, top, boxW, boxH);
      ctx.fill();
    } else if (t.effect === 'glass') {
      ctx.fillStyle = 'rgba(0,0,0,0.55)';
      ctx.beginPath();
      if (ctx.roundRect) ctx.roundRect(left, top, boxW, boxH, 4 * (h / 1080));
      else ctx.rect(left, top, boxW, boxH);
      ctx.fill();
      ctx.strokeStyle = 'rgba(255,255,255,0.1)'; ctx.lineWidth = 1; ctx.stroke();
    }
    if (t.effect === 'shadow') { ctx.shadowColor = 'rgba(0,0,0,0.65)'; ctx.shadowBlur = 12 * (h / 1080); ctx.shadowOffsetY = 4 * (h / 1080); }
    else if (t.effect === 'neon') { ctx.shadowColor = t.color; ctx.shadowBlur = 10 * (h / 1080); }
    if (t.effect === 'outline') { ctx.strokeStyle = '#000000'; ctx.lineWidth = 4 * (h / 1080); ctx.strokeText(t.content, tx, ty); }
    ctx.fillStyle = t.color;
    ctx.fillText(t.content, tx, ty);
    ctx.restore();
  });
}

export function composeExportCanvas(srcCanvas: HTMLCanvasElement, w: number, h: number): HTMLCanvasElement {
  const c = document.createElement('canvas');
  c.width = w; c.height = h;
  const ctx = c.getContext('2d', { willReadFrequently: true })!;
  if ((P.pixel ?? 0) < 0.001) {
    ctx.drawImage(srcCanvas, 0, 0, w, h);
    renderTextOnCanvas(ctx, w, h);
    return c;
  }

  try {
    const scale = Math.max(0.02, 1 - (P.pixel ?? 0));
    const sw = Math.max(1, Math.floor(w * scale));
    const sh = Math.max(1, Math.floor(h * scale));
    const tmp = document.createElement('canvas');
    tmp.width = sw; tmp.height = sh;
    const tctx = tmp.getContext('2d', { willReadFrequently: true })!;
    tctx.imageSmoothingEnabled = true;
    tctx.drawImage(srcCanvas, 0, 0, sw, sh);
    ctx.imageSmoothingEnabled = false;
    ctx.drawImage(tmp, 0, 0, w, h);
    renderTextOnCanvas(ctx, w, h);
    return c;
  } catch {
    ctx.drawImage(srcCanvas, 0, 0, w, h);
    renderTextOnCanvas(ctx, w, h);
    return c;
  }
}

// ── Select / create / delete ─────────────────────────────

export function selectText(id: number | null): void {
  selectedText = id;
  const t = texts.find(x => x.id === id);
  renderTextOverlay();
  if (!t) return;

  ($('tbContent') as HTMLTextAreaElement).value = t.content;
  ($('tbSize') as HTMLInputElement).value = String(Math.round(t.fontSize * 2000));
  $('tbSizeVal').textContent = String(Math.round(t.fontSize * 2000));
  ($('tbFont') as HTMLSelectElement).value = t.fontFamily;
  ($('tbColor') as HTMLInputElement).value = t.color;
  const aligns = ['left','center','right'] as const;
  ['tbAlignL','tbAlignC','tbAlignR'].forEach((id2, i) =>
    $(id2).classList.toggle('active', aligns[i] === t.align));
  $('tbBold').classList.toggle('active', t.bold);
  $('tbItalic').classList.toggle('active', t.italic);
  ($('tbTracking') as HTMLInputElement).value = String(t.tracking);
  $('tbTrackingVal').textContent = t.tracking.toFixed(2);
  ($('tbOpacity') as HTMLInputElement).value = String(Math.round(t.opacity * 100));
  $('tbOpacityVal').textContent = Math.round(t.opacity * 100) + '%';
  ($('tbEffect') as HTMLSelectElement).value = t.effect;
  ($('tbBgColor') as HTMLInputElement).value = t.bgColor;
  $('tbBgColorGroup').style.display = t.effect === 'badge' ? 'block' : 'none';
}

export function updateText(id: number, props: Partial<TextElem>): void {
  const t = texts.find(x => x.id === id);
  if (!t) return;
  Object.assign(t, props);
  selectText(id);
  window.dispatchEvent(new CustomEvent('lumen:textChanged'));
}

export function deleteText(id: number): void {
  window.dispatchEvent(new CustomEvent('lumen:historyBefore'));
  const idx = texts.findIndex(x => x.id === id);
  if (idx !== -1) texts.splice(idx, 1);
  if (selectedText === id)
    selectedText = texts.length ? texts[texts.length - 1].id : null;
  selectText(selectedText);
  renderTextOverlay();
  window.dispatchEvent(new CustomEvent('lumen:log', { detail: { msg: 'text deleted', cls: 'info' } }));
}

export function toggleTextTool(): void {
  textToolActive = !textToolActive;
  const btn = $('btnTextTab') as HTMLElement | null;
  if (btn) btn.classList.toggle('active', textToolActive);
  ($('canvas-wrap') as HTMLElement).style.cursor = textToolActive ? 'crosshair' : '';
  window.dispatchEvent(new CustomEvent('lumen:log', { detail: { msg: textToolActive ? 'text tool armed — click canvas to place' : 'text tool off', cls: 'info' } }));
}

export function addText(x?: number, y?: number): void {
  window.dispatchEvent(new CustomEvent('lumen:historyBefore'));
  const t: TextElem = {
    id: nextTextId++,
    x: x ?? 0.5, y: y ?? 0.5,
    content: 'text',
    fontSize: 0.05,
    fontFamily: 'Inter, sans-serif',
    color: '#ffffff',
    align: 'center',
    bold: false, italic: false,
    tracking: 0, opacity: 1,
    effect: 'none', bgColor: '#e03a3a',
  };
  texts.push(t);
  window.dispatchEvent(new CustomEvent('lumen:selectTab', { detail: 'text' }));
  selectText(t.id);
  const tc = $('tbContent') as HTMLTextAreaElement;
  tc.focus(); tc.select();
  window.dispatchEvent(new CustomEvent('lumen:log', { detail: { msg: 'text added', cls: 'ok' } }));
}

// ── Drag ────────────────────────────────────────────────

let dragTextId: number | null = null, dragOffX = 0, dragOffY = 0;

function startTextDrag(e: MouseEvent, t: TextElem): void {
  window.dispatchEvent(new CustomEvent('lumen:historyBefore'));
  dragTextId = t.id;
  const wr = ($('canvas-wrap') as HTMLElement).getBoundingClientRect();
  dragOffX = e.clientX - wr.left - t.x * wr.width;
  dragOffY = e.clientY - wr.top  - t.y * wr.height;
  document.body.classList.add('dragging-term');
  document.addEventListener('mousemove', onTextDrag);
  document.addEventListener('mouseup', endTextDrag);
}

function onTextDrag(e: MouseEvent): void {
  if (dragTextId === null) return;
  const wr = ($('canvas-wrap') as HTMLElement).getBoundingClientRect();
  const nx = Math.max(0, Math.min(1, (e.clientX - wr.left - dragOffX) / wr.width));
  const ny = Math.max(0, Math.min(1, (e.clientY - wr.top  - dragOffY) / wr.height));
  updateText(dragTextId, { x: nx, y: ny });
}

function endTextDrag(): void {
  dragTextId = null;
  document.body.classList.remove('dragging-term');
  document.removeEventListener('mousemove', onTextDrag);
  document.removeEventListener('mouseup', endTextDrag);
}

// ── Control panel wiring ─────────────────────────────────

export function initTextControls(): void {
  const tbAlignL = $('tbAlignL'), tbAlignC = $('tbAlignC'), tbAlignR = $('tbAlignR');
  const histClick = (fn: () => void) => () => {
    window.dispatchEvent(new CustomEvent('lumen:historyBefore'));
    fn();
  };

  tbAlignL.onclick = histClick(() => { if (selectedText !== null) updateText(selectedText, { align: 'left' }); });
  tbAlignC.onclick = histClick(() => { if (selectedText !== null) updateText(selectedText, { align: 'center' }); });
  tbAlignR.onclick = histClick(() => { if (selectedText !== null) updateText(selectedText, { align: 'right' }); });

  $('tbBold').onclick = histClick(() => {
    if (selectedText === null) return;
    const t = texts.find(x => x.id === selectedText);
    if (t) updateText(selectedText, { bold: !t.bold });
  });
  $('tbItalic').onclick = histClick(() => {
    if (selectedText === null) return;
    const t = texts.find(x => x.id === selectedText);
    if (t) updateText(selectedText, { italic: !t.italic });
  });

  ['tbSize', 'tbTracking', 'tbOpacity', 'tbColor', 'tbBgColor'].forEach(id => {
    $(id).addEventListener('pointerdown', () => {
      window.dispatchEvent(new CustomEvent('lumen:historyBefore'));
    });
  });
  ['tbFont', 'tbEffect'].forEach(id => {
    $(id).addEventListener('pointerdown', () => {
      window.dispatchEvent(new CustomEvent('lumen:historyBefore'));
    });
  });
  let contentHistPushed = false;
  ($('tbContent') as HTMLTextAreaElement).addEventListener('keydown', () => {
    if (!contentHistPushed) {
      window.dispatchEvent(new CustomEvent('lumen:historyBefore'));
      contentHistPushed = true;
    }
  });
  ($('tbContent') as HTMLTextAreaElement).addEventListener('blur', () => { contentHistPushed = false; });
  ($('tbContent') as HTMLTextAreaElement).addEventListener('input', function() {
    if (selectedText !== null) updateText(selectedText, { content: (this as HTMLTextAreaElement).value });
  });
  ($('tbSize') as HTMLInputElement).addEventListener('input', function() {
    if (selectedText !== null) {
      updateText(selectedText, { fontSize: parseFloat((this as HTMLInputElement).value) / 2000 });
      $('tbSizeVal').textContent = (this as HTMLInputElement).value;
    }
  });
  ($('tbFont') as HTMLSelectElement).addEventListener('change', function() {
    if (selectedText !== null) updateText(selectedText, { fontFamily: (this as HTMLSelectElement).value });
  });
  ($('tbColor') as HTMLInputElement).addEventListener('input', function() {
    if (selectedText !== null) updateText(selectedText, { color: (this as HTMLInputElement).value });
  });
  ($('tbTracking') as HTMLInputElement).addEventListener('input', function() {
    if (selectedText !== null) {
      const val = parseFloat((this as HTMLInputElement).value);
      updateText(selectedText, { tracking: val });
      $('tbTrackingVal').textContent = val.toFixed(2);
    }
  });
  ($('tbOpacity') as HTMLInputElement).addEventListener('input', function() {
    if (selectedText !== null) {
      const val = parseFloat((this as HTMLInputElement).value) / 100;
      updateText(selectedText, { opacity: val });
      $('tbOpacityVal').textContent = Math.round(val * 100) + '%';
    }
  });
  ($('tbEffect') as HTMLSelectElement).addEventListener('change', function() {
    if (selectedText !== null) {
      const val = (this as HTMLSelectElement).value as TextEffect;
      updateText(selectedText, { effect: val });
      $('tbBgColorGroup').style.display = val === 'badge' ? 'block' : 'none';
    }
  });
  ($('tbBgColor') as HTMLInputElement).addEventListener('input', function() {
    if (selectedText !== null) updateText(selectedText, { bgColor: (this as HTMLInputElement).value });
  });
  $('tbDel').onclick = () => { if (selectedText !== null) deleteText(selectedText); };

  // Canvas click — place text or deselect
  ($('canvas-wrap') as HTMLElement).addEventListener('mousedown', e => {
    const target = e.target as Element;
    const isCanvasBg = target === $('canvas-wrap') || target === $('text-overlay') || target === document.getElementById('c');
    if (!isCanvasBg) return;

    if (textToolActive) {
      const wr = ($('canvas-wrap') as HTMLElement).getBoundingClientRect();
      const nx = (e.clientX - wr.left) / wr.width;
      const ny = (e.clientY - wr.top) / wr.height;
      addText(Math.max(0, Math.min(1, nx)), Math.max(0, Math.min(1, ny)));
    } else {
      selectText(null); renderTextOverlay();
    }
  });

  // Re-render on resize
  window.addEventListener('resize', () => renderTextOverlay());
}
