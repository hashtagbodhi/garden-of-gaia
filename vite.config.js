import { defineConfig } from 'vite';
import { resolve } from 'node:path';
export default defineConfig({
  base: './',
  build: { target: 'es2022', assetsInlineLimit: 0, chunkSizeWarningLimit: 1500, rollupOptions: { input: { garden: resolve(import.meta.dirname, 'index.html'), classic: resolve(import.meta.dirname, 'classic.html') } } },
});
