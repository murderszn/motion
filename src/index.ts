// ─────────────────────────────────────────────────────────
//  src/index.ts — splash page script (was inline <script>)
// ─────────────────────────────────────────────────────────

(() => {
  'use strict';

  /* --------------------------------------------------
     KEYBOARD: Enter → studio
  -------------------------------------------------- */
  window.addEventListener('keydown', (e: KeyboardEvent) => {
    if (e.key === 'Enter') window.location.href = 'studio.html';
  });

  /* --------------------------------------------------
     THEME — restore saved preference (no toggle UI on this page)
  -------------------------------------------------- */
  const themes = ['motion-dark', 'motion-dim', 'motion-contrast', 'motion-light'];
  const savedTheme = localStorage.getItem('motion-theme') ?? 'motion-dark';
  if (themes.includes(savedTheme) && savedTheme !== 'motion-dark') {
    document.documentElement.setAttribute('data-theme', savedTheme);
  }

  /* --------------------------------------------------
     ROSTER: cycle the "live" highlight
  -------------------------------------------------- */
  const rosterEls = document.querySelectorAll<HTMLElement>('#roster span');
  if (rosterEls.length) {
    let liveIdx = 3;
    setInterval(() => {
      rosterEls[liveIdx].classList.remove('live');
      liveIdx = (liveIdx + 1) % rosterEls.length;
      rosterEls[liveIdx].classList.add('live');
    }, 2400);
  }

  /* --------------------------------------------------
     TIMER
  -------------------------------------------------- */
  const timerEl = document.getElementById('timer');
  if (timerEl) {
    const t0 = performance.now();
    let lastSec = -1;
    function tick(): void {
      const s = Math.floor((performance.now() - t0) / 1000);
      if (s !== lastSec) {
        lastSec = s;
        timerEl!.textContent = Math.floor(s / 60) + ':' + String(s % 60).padStart(2, '0');
      }
      requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }

  /* --------------------------------------------------
     BACKGROUND — video only (halftone loop)
  -------------------------------------------------- */
  const video  = document.getElementById('bg-video') as HTMLVideoElement | null;
  let   activeBg: HTMLElement | null = null;

  function startVideo(): void {
    if (!video) return;
    activeBg = video;
    video.classList.add('bg-active');
    document.body.setAttribute('data-bg', 'video');

    video.addEventListener('error', () => { video.style.display = 'none'; }, { once: true });

    if (!video.querySelector('source')) {
      const s = document.createElement('source');
      s.src  = 'motion-halftone-1992.webm';
      s.type = 'video/webm';
      video.appendChild(s);
      video.load();
    }
    video.play().catch(() => {
      if (video.readyState < 2) return;
      const playOverlay = document.createElement('div');
      playOverlay.style.cssText =
        'position:fixed;inset:0;z-index:999;display:grid;place-items:center;' +
        'background:rgba(6,4,10,0.85);cursor:pointer;';
      playOverlay.innerHTML =
        '<span style="font-family:Inter,sans-serif;font-weight:200;' +
        'font-size:1.2rem;letter-spacing:0.3em;color:rgba(255,255,255,0.7);' +
        'border:1px solid rgba(255,255,255,0.2);padding:1.2rem 2.4rem;">' +
        'click to enter</span>';
      playOverlay.addEventListener('click', () => { video!.play(); playOverlay.remove(); });
      document.body.appendChild(playOverlay);
    });
  }

  startVideo();

  /* --------------------------------------------------
     PARALLAX
  -------------------------------------------------- */
  document.addEventListener('mousemove', (e: MouseEvent) => {
    if (!activeBg) return;
    const x = (e.clientX / window.innerWidth  - 0.5) * 6;
    const y = (e.clientY / window.innerHeight - 0.5) * 6;
    activeBg.style.transform = `translate(${x}px, ${y}px) scale(1.03)`;
  });
  document.addEventListener('mouseleave', () => {
    if (activeBg) activeBg.style.transform = 'translate(0,0) scale(1)';
  });

  /* --------------------------------------------------
     INTERSECTION OBSERVER — reveal on scroll
  -------------------------------------------------- */
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) entry.target.classList.add('visible');
    });
  }, { threshold: 0.15 });
  document.querySelectorAll('.reveal').forEach(el => observer.observe(el));
})();
