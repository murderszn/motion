// ─────────────────────────────────────────────────────────
//  Menu Bar — File/Edit/View/Workspace/Help dropdown actions
// ─────────────────────────────────────────────────────────

import { P } from '../state';
import { applyProjectState } from './url_api';
import { logToTerminal } from './terminal';
import { setStatusMsg } from './statusbar';

const $ = (id: string) => document.getElementById(id)!;

export function initMenuBar(): void {
  const items = document.querySelectorAll('.menu-item');
  let isMenuOpen = false;

  // Toggle dropdown on click
  items.forEach(item => {
    const trigger = item.querySelector('.menu-trigger') as HTMLButtonElement | null;
    if (!trigger) return;

    trigger.onclick = (e) => {
      e.stopPropagation();
      const parent = item;
      const isOpen = parent.classList.contains('open');

      closeAllMenus();

      if (!isOpen) {
        parent.classList.add('open');
        isMenuOpen = true;
      } else {
        isMenuOpen = false;
      }
    };

    // Transition hover menu if already open (standard desktop behavior)
    trigger.onmouseenter = () => {
      if (isMenuOpen) {
        closeAllMenus();
        item.classList.add('open');
      }
    };
  });

  // Close menus when clicking outside
  document.addEventListener('click', () => {
    closeAllMenus();
    isMenuOpen = false;
  });

  // Attach action dispatchers to global window
  (window as any).triggerFileAction = triggerFileAction;
  (window as any).triggerEditAction = triggerEditAction;
  (window as any).triggerViewAction = triggerViewAction;
  (window as any).triggerHelpAction = triggerHelpAction;

  // Initialize About Modal
  const aboutModal = $('aboutModal');
  const aboutClose = $('aboutCloseBtn');
  if (aboutClose && aboutModal) {
    aboutClose.onclick = () => {
      aboutModal.style.display = 'none';
    };
    // Close modal on click outside content
    aboutModal.onclick = (e) => {
      if (e.target === aboutModal) {
        aboutModal.style.display = 'none';
      }
    };
  }
}

function closeAllMenus() {
  document.querySelectorAll('.menu-item').forEach(item => {
    item.classList.remove('open');
  });
}

function triggerFileAction(action: string) {
  closeAllMenus();
  
  if (action === 'save-png') {
    const saveBtn = $('btnSave');
    if (saveBtn) saveBtn.click();
  } else if (action === 'save-preset') {
    const saveProjBtn = $('btnSaveProj');
    if (saveProjBtn) saveProjBtn.click();
  } else if (action === 'load-preset') {
    const loadProjBtn = $('btnLoadProj');
    if (loadProjBtn) loadProjBtn.click();
  } else if (action === 'import-image') {
    const imgBtn = $('imgBtn');
    if (imgBtn) imgBtn.click();
  } else if (action === 'clear-image') {
    const imgRemove = $('imgRemove');
    if (imgRemove) {
      imgRemove.click();
    } else {
      logToTerminal('No active image overlay to remove', 'err');
    }
  } else if (action === 'export-embed') {
    const expEmbed = $('expEmbed');
    if (expEmbed) expEmbed.click();
  }
}

function triggerEditAction(action: string) {
  closeAllMenus();

  if (action === 'undo') {
    const undoBtn = $('histUndo');
    if (undoBtn) undoBtn.click();
  } else if (action === 'redo') {
    const redoBtn = $('histRedo');
    if (redoBtn) redoBtn.click();
  } else if (action === 'randomize') {
    const randBtn = $('btnRandom2');
    if (randBtn) randBtn.click();
  } else if (action === 'random-seed') {
    const seedDice = $('seedDice');
    if (seedDice) seedDice.click();
  } else if (action === 'random-palette') {
    const palDice = $('palDice');
    if (palDice) palDice.click();
  } else if (action === 'invert-colors') {
    const invertBtn = $('btnInvert');
    if (invertBtn) invertBtn.click();
  }
}

function triggerViewAction(action: string) {
  closeAllMenus();

  if (action === 'toggle-panel') {
    const panelBtn = $('togPanel');
    if (panelBtn) panelBtn.click();
  } else if (action === 'toggle-terminal') {
    const termBtn = $('togTerm');
    if (termBtn) termBtn.click();
  } else if (action === 'toggle-left') {
    const leftNav = $('left');
    if (leftNav) {
      document.body.classList.toggle('left-closed');
      logToTerminal('toggled left sidebar view', 'info');
    }
  } else if (action === 'toggle-fullscreen') {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen()
        .then(() => logToTerminal('Entered Fullscreen Mode', 'ok'))
        .catch(err => logToTerminal('Fullscreen request failed: ' + err.message, 'err'));
    } else {
      document.exitFullscreen();
    }
  }
}

function triggerHelpAction(action: string) {
  closeAllMenus();

  if (action === 'shortcuts') {
    // Show terminal problems panel or trigger command palette
    const cmdPaletteBtn = $('togTerm'); // or we can log help
    logToTerminal('Keyboard Shortcuts: (r) Randomize, (s) Save PNG, (g) Focus Generator Settings, (⌘B) Toggle Panel, (⌃`) Toggle Terminal', 'info');
    // Open terminal and click Hotkeys tab
    const hotkeysTab = $('tabHotkeys');
    const togTerm = $('togTerm');
    if (document.body.classList.contains('term-closed') && togTerm) {
      togTerm.click();
    }
    if (hotkeysTab) hotkeysTab.click();
  } else if (action === 'guide') {
    window.open('/developer-training.html', '_blank');
  } else if (action === 'about') {
    const aboutModal = $('aboutModal');
    if (aboutModal) {
      // Query WebGL info to populate modal
      const webglInfoEl = $('aboutWebglInfo');
      const canvasEl = $('cv') as HTMLCanvasElement | null;
      if (canvasEl && webglInfoEl) {
        const glCtx = (canvasEl.getContext('webgl') || canvasEl.getContext('experimental-webgl')) as WebGLRenderingContext | null;
        if (glCtx) {
          const renderer = glCtx.getParameter(glCtx.RENDERER);
          webglInfoEl.textContent = String(renderer).replace('ANGLE (', '').replace(' Direct3D11 vs_5_0 ps_5_0)', '').slice(0, 32);
        }
      }
      aboutModal.style.display = 'flex';
    }
  }
}
