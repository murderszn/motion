import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        index:  resolve(__dirname, 'index.html'),
        studio: resolve(__dirname, 'studio.html'),
        roadmap: resolve(__dirname, 'studio-roadmap.html'),
        splash: resolve(__dirname, 'splash.html'),
        kinetic: resolve(__dirname, 'kinetic-typography.html'),
        chromaverse: resolve(__dirname, 'chromaverse/index.html'),
        gallery: resolve(__dirname, 'gallery.html'),
      },
    },
    outDir: 'dist',
  },
  server: {
    port: 5173,
    watch: {
      ignored: ['**/tests/**', '**/node_modules/**'],
    },
    // Proxy /terminal WebSocket to the existing node-pty server (npm run server)
    proxy: {
      '/terminal': {
        target: 'http://localhost:3000',
        ws: true,
        changeOrigin: true,
      },
      '/api': {
        target: 'http://localhost:3001',
      },
    },
  },
});
