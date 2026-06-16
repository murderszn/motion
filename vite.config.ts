import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        index:  resolve(__dirname, 'index.html'),
        studio: resolve(__dirname, 'studio.html'),
      },
    },
    outDir: 'dist',
  },
  server: {
    port: 5173,
    // Proxy /terminal WebSocket to the existing node-pty server (npm run server)
    proxy: {
      '/terminal': {
        target: 'ws://localhost:3000',
        ws: true,
      },
      '/api': {
        target: 'http://localhost:3001',
      },
    },
  },
});
