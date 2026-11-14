import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import fs from 'fs';
import path from 'path';

function syncRootForGhPages() {
  return {
    name: 'sync-root-gh-pages',
    closeBundle() {
      const rootDir = path.resolve(__dirname, '..');
      const distIndex = path.resolve(__dirname, 'dist/index.html');
      const rootIndex = path.resolve(rootDir, 'index.html');
      const distAssets = path.resolve(__dirname, 'dist/assets');
      const rootAssets = path.resolve(rootDir, 'assets');

      if (fs.existsSync(distIndex)) {
        fs.copyFileSync(distIndex, rootIndex);
      }
      if (fs.existsSync(distAssets)) {
        if (fs.existsSync(rootAssets)) {
          fs.rmSync(rootAssets, { recursive: true, force: true });
        }
        fs.cpSync(distAssets, rootAssets, { recursive: true });
      }
    }
  };
}

export default defineConfig({
  base: './',
  plugins: [react(), syncRootForGhPages()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true
      }
    }
  }
});
