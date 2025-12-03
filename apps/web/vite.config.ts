import * as react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

// Verify this config file is actually loaded
console.log('[vite] Loaded apps/web/vite.config.ts');

export default defineConfig({
  plugins: [react.default()],
  server: {
    port: 5173,
  },
  // Tell Vite where to find .env files (current directory which is apps/web)
  envDir: '.',
});
