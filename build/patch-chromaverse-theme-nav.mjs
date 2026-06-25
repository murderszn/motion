import { readFileSync, writeFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

const dir = 'chromaverse';
const skip = new Set(['index.html', 'theme_template.html', 'builder_theme_shell.html']);

const oldHeader = `        .theme-header {
            position: sticky;
            top: 0;
            z-index: 100;
            border-bottom: 1px solid var(--border);
            background: var(--bg-alt);
            flex-shrink: 0;
            transition: background-color 0.25s, border-color 0.25s;
            padding: 0 clamp(24px, 5vw, 64px);
        }

        /* Aligns header and page content to the same 1240px rail */
        .theme-header-inner {
            display: flex;
            align-items: center;
            justify-content: space-between;
            height: 64px;
            max-width: 1240px;
            margin: 0 auto;
            padding: 0;
        }

        .theme-header-brand {
            font-size: 1.1rem;
            font-weight: 900;
            text-transform: uppercase;
            letter-spacing: -0.015em;
            color: var(--text);
        }`;

const newHeader = `        .theme-header {
            position: sticky;
            top: 0;
            z-index: 100;
            border-bottom: 1px solid var(--border);
            background: var(--bg-alt);
            flex-shrink: 0;
            transition: background-color 0.25s, border-color 0.25s;
            padding: 0;
        }

        /* Same 1240px rail + horizontal padding as .section-inner */
        .theme-header-inner {
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: var(--sp-3);
            min-height: 64px;
            height: auto;
            flex-wrap: wrap;
            width: 100%;
            max-width: 1240px;
            min-width: 0;
            margin: 0 auto;
            padding: var(--sp-3) clamp(24px, 5vw, 64px);
            box-sizing: border-box;
        }

        .theme-header-brand {
            font-size: 1.1rem;
            font-weight: 900;
            text-transform: uppercase;
            letter-spacing: -0.015em;
            color: var(--text);
            min-width: 0;
            flex: 1 1 auto;
        }

        .theme-header-actions {
            display: flex;
            align-items: center;
            gap: var(--sp-4);
            flex-wrap: wrap;
            justify-content: flex-end;
            min-width: 0;
            flex-shrink: 0;
        }`;

const oldNavPreview = `        .nav-preview {
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: var(--sp-4);
            padding: var(--sp-4) var(--sp-6);
            border: 1px solid var(--border);
            background: var(--nav-bg);
            backdrop-filter: blur(12px);
            border-radius: var(--r-md);
            box-shadow: var(--shadow-sm);
            margin-bottom: var(--sp-6);
        }`;

const newNavPreview = `        .nav-preview {
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: var(--sp-4);
            flex-wrap: wrap;
            width: 100%;
            max-width: 100%;
            box-sizing: border-box;
            padding: var(--sp-4) var(--sp-5);
            border: 1px solid var(--border);
            background: var(--nav-bg);
            backdrop-filter: blur(12px);
            border-radius: var(--r-md);
            box-shadow: var(--shadow-sm);
            margin-bottom: var(--sp-6);
        }`;

const oldMedia = `        @media (max-width: 840px) {

            .page-header {
                grid-template-columns: 1fr;
            }`;

const newMedia = `        @media (max-width: 840px) {

            .theme-header-inner {
                align-items: flex-start;
            }

            .theme-header-actions {
                width: 100%;
                justify-content: space-between;
            }

            .page-header {
                grid-template-columns: 1fr;
            }`;

const oldActionsHtml = '<div style="display: flex; align-items: center; gap: var(--sp-4);">';
const newActionsHtml = '<div class="theme-header-actions">';

let patched = 0;
for (const file of readdirSync(dir)) {
  if (!file.endsWith('.html') || skip.has(file)) continue;
  const path = join(dir, file);
  let text = readFileSync(path, 'utf8');
  const original = text;
  text = text.replace(oldHeader, newHeader);
  text = text.replace(oldNavPreview, newNavPreview);
  text = text.replace(oldMedia, newMedia);
  text = text.replace(oldActionsHtml, newActionsHtml);
  if (text !== original) {
    writeFileSync(path, text);
    patched += 1;
  }
}

console.log(`[patch-chromaverse-nav] updated ${patched} theme pages`);