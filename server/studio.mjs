#!/usr/bin/env node
/**
 * Unified dev entry — Vite (HMR) + PTY server in one command.
 * Usage: npm run studio  →  http://localhost:5173/studio.html
 */
import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const VITE_PORT = process.env.VITE_PORT || '5173';
const PTY_PORT = process.env.PORT || '3000';

const children = [];

function run(label, cmd, args, env = {}) {
  const child = spawn(cmd, args, {
    cwd: ROOT,
    stdio: 'inherit',
    shell: process.platform === 'win32',
    env: { ...process.env, ...env },
  });
  child.on('exit', (code, signal) => {
    if (!shuttingDown) {
      console.error(`\n  [studio] ${label} exited (${signal || code})\n`);
      shutdown(code ?? 1);
    }
  });
  children.push(child);
  return child;
}

let shuttingDown = false;

function shutdown(code = 0) {
  if (shuttingDown) return;
  shuttingDown = true;
  for (const c of children) {
    try { c.kill('SIGTERM'); } catch { /* ignore */ }
  }
  setTimeout(() => process.exit(code), 300);
}

process.on('SIGINT', () => shutdown(0));
process.on('SIGTERM', () => shutdown(0));

console.log('\n  /motion studio — starting dev stack\n');
console.log(`  UI (Vite)      → http://localhost:${VITE_PORT}/studio.html`);
console.log(`  PTY (node-pty) → ws://localhost:${PTY_PORT}/terminal\n`);

run('vite', 'npx', ['vite', '--port', VITE_PORT]);
run('pty', 'node', ['server/server.mjs'], { PORT: PTY_PORT });