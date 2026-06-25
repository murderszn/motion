#!/usr/bin/env node
/**
 * Record motion-chromaverse-commercial.html → social-ready MP4.
 *
 * Usage:
 *   node examples/export-commercial-mp4.mjs
 *   node examples/export-commercial-mp4.mjs --width 1080 --height 1080
 *
 * Requires: npx playwright (chromium), ffmpeg on PATH.
 */

import { chromium } from 'playwright';
import { spawnSync, execSync } from 'node:child_process';
import { mkdirSync, unlinkSync, existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const HTML = path.join(__dirname, 'motion-chromaverse-commercial.html');
const OUT_DIR = path.join(__dirname, 'out');
const DURATION_MS = 24500; // 24s spot + 0.5s tail

const args = process.argv.slice(2);
function flag(name, fallback) {
  const i = args.indexOf(name);
  return i >= 0 && args[i + 1] ? args[i + 1] : fallback;
}

const PRESETS = {
  twitter:  { w: 1920, h: 1080 },
  linkedin: { w: 1920, h: 1080 },
  tiktok:   { w: 1080, h: 1920 },
  reels:    { w: 1080, h: 1920 },
  'ig-feed':{ w: 1080, h: 1080 },
  'ig-portrait': { w: 1080, h: 1350 },
};

const preset = flag('--preset', null);
let WIDTH, HEIGHT;
if (preset && PRESETS[preset]) {
  WIDTH = PRESETS[preset].w;
  HEIGHT = PRESETS[preset].h;
  console.log(`Using preset: ${preset} (${WIDTH}×${HEIGHT})`);
} else {
  WIDTH = Number(flag('--width', '1920'));
  HEIGHT = Number(flag('--height', '1080'));
  if (preset) {
    console.log(`Unknown preset "${preset}". Available: ${Object.keys(PRESETS).join(', ')}`);
    process.exit(1);
  }
}
const OUT_MP4 = path.join(OUT_DIR, `motion-chromaverse-commercial-${WIDTH}x${HEIGHT}.mp4`);

function ensureFfmpeg() {
  const r = spawnSync('ffmpeg', ['-version'], { stdio: 'ignore' });
  if (r.status !== 0) {
    console.error('ffmpeg not found. Install: brew install ffmpeg');
    process.exit(1);
  }
}

function ensurePlaywright() {
  try {
    execSync('npx playwright --version', { stdio: 'ignore' });
  } catch {
    console.error('Playwright not available. Run: npx playwright install chromium');
    process.exit(1);
  }
}

async function main() {
  ensureFfmpeg();
  ensurePlaywright();
  mkdirSync(OUT_DIR, { recursive: true });

  const url = `file://${HTML}?export=1`;
  console.log(`Recording ${WIDTH}×${HEIGHT} from ${path.basename(HTML)} …`);

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: WIDTH, height: HEIGHT },
    deviceScaleFactor: 1,
    recordVideo: {
      dir: OUT_DIR,
      size: { width: WIDTH, height: HEIGHT }
    }
  });

  const page = await context.newPage();
  await page.goto(url, { waitUntil: 'load', timeout: 60000 });
  await page.waitForFunction(() => window.__ready === true, { timeout: 30000 });
  await page.waitForTimeout(DURATION_MS);

  const video = page.video();
  await context.close();
  await browser.close();

  if (!video) {
    console.error('No video recorded.');
    process.exit(1);
  }

  const webmPath = await video.path();
  const tmpMp4 = path.join(OUT_DIR, '_commercial-tmp.mp4');

  console.log('Encoding H.264 MP4 (social-ready with silent audio) …');
  const ffmpeg = spawnSync('ffmpeg', [
    '-y',
    '-i', webmPath,
    '-f', 'lavfi', '-i', 'anullsrc=r=44100:cl=stereo',
    '-t', '24',
    '-c:v', 'libx264',
    '-pix_fmt', 'yuv420p',
    '-crf', '20',
    '-preset', 'medium',
    '-movflags', '+faststart',
    '-c:a', 'aac', '-b:a', '1k',
    '-shortest',
    tmpMp4
  ], { stdio: 'inherit' });

  if (ffmpeg.status !== 0) {
    console.error('ffmpeg encode failed.');
    process.exit(1);
  }

  if (existsSync(OUT_MP4)) unlinkSync(OUT_MP4);
  execSync(`mv "${tmpMp4}" "${OUT_MP4}"`);

  try { unlinkSync(webmPath); } catch { /* ignore */ }

  const probe = spawnSync('ffprobe', [
    '-v', 'error',
    '-show_entries', 'format=duration:stream=width,height,codec_name',
    '-of', 'default=noprint_wrappers=1',
    OUT_MP4
  ], { encoding: 'utf8' });

  console.log('\nDone.');
  console.log(probe.stdout.trim());
  console.log(`\n${OUT_MP4}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});