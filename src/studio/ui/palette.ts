import { PALETTES, P } from '../state';
import type { Palette } from '../types';
import { refreshPresetThumbnails } from './presets';
import { CHROMAVERSE_THEMES } from '../chromaverse_themes';

const $ = (id: string) => document.getElementById(id)!;

let colEls: HTMLInputElement[];

// ── Color classification helpers ─────────────────────────

interface Rgb { r: number; g: number; b: number; }

function hexToRgb(hex: string): Rgb {
  const h = hex.replace('#', '');
  const r = parseInt(h.length === 3 ? h[0] + h[0] : h.substring(0, 2), 16);
  const g = parseInt(h.length === 3 ? h[1] + h[1] : h.substring(2, 4), 16);
  const b = parseInt(h.length === 3 ? h[2] + h[2] : h.substring(4, 6), 16);
  return { r, g, b };
}

const BASE_COLORS: { [key: string]: Rgb } = {
  red: { r: 224, g: 58, b: 58 },
  orange: { r: 234, g: 88, b: 12 },
  yellow: { r: 217, g: 119, b: 6 },
  green: { r: 5, g: 150, b: 105 },
  blue: { r: 37, g: 99, b: 235 },
  purple: { r: 124, g: 58, b: 237 },
  pink: { r: 219, g: 39, b: 119 },
};

function classifyThemeColor(colors: [string, string, string, string]): string {
  const hex = colors[2] || colors[1];
  const rgb = hexToRgb(hex);
  
  const max = Math.max(rgb.r, rgb.g, rgb.b);
  const min = Math.min(rgb.r, rgb.g, rgb.b);
  if (max - min < 40) {
    return 'monochrome';
  }
  
  let bestGroup = 'monochrome';
  let minDist = 999999;
  for (const [group, base] of Object.entries(BASE_COLORS)) {
    const dist = Math.pow(rgb.r - base.r, 2) + Math.pow(rgb.g - base.g, 2) + Math.pow(rgb.b - base.b, 2);
    if (dist < minDist) {
      minDist = dist;
      bestGroup = group;
    }
  }
  return bestGroup;
}

export function getRandomPalette(): Palette {
  const all = [...PALETTES, ...CHROMAVERSE_THEMES.map(t => t.colors)];
  return all[Math.floor(Math.random() * all.length)];
}

export function applyInvertUI(): void {
  const btn = $('btnInvert') as HTMLButtonElement | null;
  if (btn) {
    btn.textContent = P.invert ? 'invert colors: on' : 'invert colors: off';
  }
}

// Global cached themes to category mappings
let themeCategories: { [slug: string]: string } = {};

export function setPalette(pal: Palette): void {
  P.colors = [...pal];
  colEls?.forEach((el, i) => { el.value = pal[i]; });
  applyInvertUI();
  refreshPresetThumbnails();

  const groupSel = document.getElementById('colorGroupSelector') as HTMLSelectElement | null;
  const selectedName = document.getElementById('selectedThemeName');
  const selectedColors = document.getElementById('selectedThemeColors');

  if (selectedName && selectedColors) {
    const matched = CHROMAVERSE_THEMES.find(t => 
      t.colors[0].toLowerCase() === pal[0].toLowerCase() &&
      t.colors[1].toLowerCase() === pal[1].toLowerCase() &&
      t.colors[2].toLowerCase() === pal[2].toLowerCase() &&
      t.colors[3].toLowerCase() === pal[3].toLowerCase()
    );

    if (matched) {
      selectedName.textContent = matched.name;
      selectedColors.innerHTML = '';
      matched.colors.forEach(c => {
        const dot = document.createElement('div');
        dot.className = 'color-dot';
        dot.style.backgroundColor = c;
        selectedColors.appendChild(dot);
      });

      const cat = themeCategories[matched.slug] || 'all';
      if (groupSel && groupSel.value !== cat && groupSel.value !== 'all') {
        groupSel.value = cat;
        repopulateThemesDropdown(cat);
      }
    } else {
      selectedName.textContent = '-- Custom / Select Theme --';
      selectedColors.innerHTML = '';
    }
  }
}

function repopulateThemesDropdown(category: string): void {
  const themeOptions = document.getElementById('themeOptions') as HTMLDivElement | null;
  if (!themeOptions) return;

  themeOptions.innerHTML = '';

  const filtered = CHROMAVERSE_THEMES.filter(t => {
    if (category === 'all') return true;
    return themeCategories[t.slug] === category;
  });

  if (filtered.length === 0) {
    const empty = document.createElement('div');
    empty.style.padding = '8px';
    empty.style.color = 'var(--dim)';
    empty.style.fontSize = '11px';
    empty.style.textAlign = 'center';
    empty.textContent = 'No themes found';
    themeOptions.appendChild(empty);
    return;
  }

  filtered.forEach(t => {
    const opt = document.createElement('div');
    opt.className = 'combobox-option';
    
    const isSelected = P.colors[0].toLowerCase() === t.colors[0].toLowerCase() &&
                       P.colors[1].toLowerCase() === t.colors[1].toLowerCase() &&
                       P.colors[2].toLowerCase() === t.colors[2].toLowerCase() &&
                       P.colors[3].toLowerCase() === t.colors[3].toLowerCase();
    if (isSelected) {
      opt.classList.add('selected');
    }

    const nameSpan = document.createElement('span');
    nameSpan.textContent = t.name;
    opt.appendChild(nameSpan);

    const colorsDiv = document.createElement('div');
    colorsDiv.className = 'option-colors';
    t.colors.forEach(c => {
      const dot = document.createElement('div');
      dot.className = 'color-dot';
      dot.style.backgroundColor = c;
      colorsDiv.appendChild(dot);
    });
    opt.appendChild(colorsDiv);

    // Prevent trigger blur before click is tracked
    opt.addEventListener('mousedown', (e) => {
      e.preventDefault();
    });

    opt.addEventListener('click', () => {
      window.dispatchEvent(new CustomEvent('lumen:historyBefore'));
      setPalette(t.colors);
      themeOptions.style.display = 'none';
      const dropdown = $('themeDropdown');
      if (dropdown) dropdown.classList.remove('open');
      window.dispatchEvent(new CustomEvent('lumen:log', { detail: { msg: `applied theme: ${t.name}`, cls: 'ok' } }));
      window.dispatchEvent(new CustomEvent('lumen:presetChanged'));
    });

    themeOptions.appendChild(opt);
  });
}

export function initPalette(): void {
  colEls = [0, 1, 2, 3].map(i => $('col' + i) as HTMLInputElement);

  // Pre-classify themes
  CHROMAVERSE_THEMES.forEach(t => {
    themeCategories[t.slug] = classifyThemeColor(t.colors);
  });

  const groupSel = $('colorGroupSelector') as HTMLSelectElement | null;
  const themeDropdown = $('themeDropdown') as HTMLDivElement | null;
  const themeTrigger = $('themeTrigger') as HTMLDivElement | null;
  const themeOptions = $('themeOptions') as HTMLDivElement | null;

  if (groupSel && themeDropdown && themeTrigger && themeOptions) {
    repopulateThemesDropdown('all');

    groupSel.addEventListener('change', () => {
      repopulateThemesDropdown(groupSel.value);
    });

    themeTrigger.addEventListener('click', (e) => {
      e.stopPropagation();
      const isOpen = themeOptions.style.display === 'block';
      if (isOpen) {
        themeOptions.style.display = 'none';
        themeDropdown.classList.remove('open');
      } else {
        themeOptions.style.display = 'block';
        themeDropdown.classList.add('open');
        // Refresh options highlights on open
        const cat = groupSel.value;
        repopulateThemesDropdown(cat);
      }
    });

    // Close on click outside
    document.addEventListener('click', (e) => {
      if (!themeDropdown.contains(e.target as Node)) {
        themeOptions.style.display = 'none';
        themeDropdown.classList.remove('open');
      }
    });
  }

  setPalette(P.colors);
  colEls.forEach((el, i) => {
    el.addEventListener('pointerdown', () => {
      window.dispatchEvent(new CustomEvent('lumen:historyBefore'));
    });
    el.addEventListener('input', () => {
      P.colors[i] = el.value;
      refreshPresetThumbnails();
      
      // Update selected state label when custom adjustments occur
      const selectedName = $('selectedThemeName');
      const selectedColors = $('selectedThemeColors');
      if (selectedName) selectedName.textContent = '-- Custom / Select Theme --';
      if (selectedColors) selectedColors.innerHTML = '';
      
      window.dispatchEvent(new CustomEvent('lumen:presetChanged'));
    });
  });
  
  ($('palDice') as HTMLButtonElement).onclick = () => {
    window.dispatchEvent(new CustomEvent('lumen:historyBefore'));
    setPalette(getRandomPalette());
    window.dispatchEvent(new CustomEvent('lumen:log', { detail: { msg: 'palette shuffled', cls: 'ok' } }));
  };
  
  const btnInvert = $('btnInvert') as HTMLButtonElement | null;
  if (btnInvert) {
    btnInvert.onclick = () => {
      window.dispatchEvent(new CustomEvent('lumen:historyBefore'));
      P.invert = P.invert === 1 ? 0 : 1;
      applyInvertUI();
      refreshPresetThumbnails();
      window.dispatchEvent(new CustomEvent('lumen:log', { detail: { msg: 'preset colors ' + (P.invert ? 'inverted' : 'restored'), cls: 'info' } }));
    };
  }
}
