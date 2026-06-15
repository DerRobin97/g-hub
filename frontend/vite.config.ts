import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // @g-hub/shared ist als CommonJS gebaut (für das Nest-Backend). Damit Rollup
  // (Production-Build) und esbuild (Dev) die benannten Exporte erkennen:
  optimizeDeps: {
    include: ['@g-hub/shared'],
  },
  build: {
    commonjsOptions: {
      include: [/packages\/shared/, /node_modules/],
    },
  },
  server: {
    port: 5173,
    host: true,
    // /api → Backend (NestJS) im Dev, damit Cookies/Same-Origin einfach bleiben
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
    },
  },
});
