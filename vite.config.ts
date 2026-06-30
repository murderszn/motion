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
      '/pollinations-image': {
        target: 'https://image.pollinations.ai',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/pollinations-image/, ''),
        configure: (proxy) => {
          proxy.on('proxyReq', (proxyReq) => {
            proxyReq.removeHeader('origin');
            proxyReq.removeHeader('referer');
          });
        }
      },
      '/pollinations-text': {
        target: 'https://text.pollinations.ai',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/pollinations-text/, ''),
        configure: (proxy) => {
          proxy.on('proxyReq', (proxyReq) => {
            proxyReq.removeHeader('origin');
            proxyReq.removeHeader('referer');
          });
        }
      },
    },
  },
});
