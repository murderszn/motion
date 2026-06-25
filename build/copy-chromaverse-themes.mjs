import { cpSync, mkdirSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

const srcDir = 'chromaverse';
const destDir = 'dist/chromaverse';

mkdirSync(destDir, { recursive: true });

let copied = 0;
for (const file of readdirSync(srcDir)) {
  if (!file.endsWith('.html') || file === 'index.html') continue;
  cpSync(join(srcDir, file), join(destDir, file));
  copied += 1;
}

console.log(`[copy-chromaverse] copied ${copied} theme pages to ${destDir}/`);