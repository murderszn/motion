import http from 'http';
import fs from 'fs';
import path from 'path';
import pty from 'node-pty';
import { WebSocketServer } from 'ws';

const PORT = parseInt(process.env.PORT || '3000', 10);
const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');

const MIME = {
    '.html': 'text/html',
    '.css':  'text/css',
    '.js':   'application/javascript',
    '.mjs':  'application/javascript',
    '.json': 'application/json',
    '.png':  'image/png',
    '.gif':  'image/gif',
    '.webm': 'video/webm',
    '.svg':  'image/svg+xml',
};

function serve(req, res) {
    let url = req.url.split('?')[0];
    if (url === '/') url = '/index.html';
    const filePath = path.join(ROOT, url);

    if (!filePath.startsWith(ROOT)) {
        res.writeHead(403); res.end('forbidden');
        return;
    }

    fs.readFile(filePath, (err, data) => {
        if (err) {
            res.writeHead(404, { 'Content-Type': 'text/html' });
            res.end('not found');
            return;
        }
        res.writeHead(200, { 'Content-Type': MIME[path.extname(filePath)] || 'application/octet-stream' });
        res.end(data);
    });
}

/* ─────────────────────────────────────────────
   WebSocket → real PTY shell via node-pty
   ───────────────────────────────────────────── */
const server = http.createServer(serve);
const wss = new WebSocketServer({ server, path: '/terminal' });

wss.on('connection', (ws) => {
    const shell = pty.spawn(process.env.SHELL || 'bash', [], {
        name: 'xterm-256color',
        cols: 80,
        rows: 24,
        env: { ...process.env, TERM: 'xterm-256color' },
    });

    shell.onData((data) => { try { ws.send(data); } catch {} });

    ws.on('message', (raw) => {
        const msg = raw.toString();
        try {
            const cmd = JSON.parse(msg);
            if (cmd.type === 'resize' && cmd.cols && cmd.rows) {
                shell.resize(cmd.cols, cmd.rows);
            }
        } catch {
            shell.write(msg);
        }
    });

    ws.on('close', () => shell.kill());
    shell.on('exit', () => { try { ws.close(); } catch {} });
});

server.listen(PORT, () => {
    console.log(`\n  PTY server → ws://localhost:${PORT}/terminal`);
    console.log(`  shell: ${process.env.SHELL || 'bash'} via node-pty`);
    console.log(`  (use npm run studio for Vite + PTY together)\n`);
});
