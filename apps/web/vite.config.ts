import { execSync } from 'child_process';

import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

// Verify this config file is actually loaded
console.log('[vite] Loaded apps/web/vite.config.ts');

// Get git commit hash at build time
function getGitCommit(): string {
  // First check if GIT_COMMIT env var is set (from Docker build)
  if (process.env.GIT_COMMIT) {
    return process.env.GIT_COMMIT;
  }
  // Railway provides RAILWAY_GIT_COMMIT_SHA
  if (process.env.RAILWAY_GIT_COMMIT_SHA) {
    return process.env.RAILWAY_GIT_COMMIT_SHA;
  }
  // Otherwise try to get it from git
  try {
    return execSync('git rev-parse HEAD').toString().trim();
  } catch {
    return 'unknown';
  }
}

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
  },
  // Tell Vite where to find .env files (current directory which is apps/web)
  envDir: '.',
  define: {
    __GIT_COMMIT__: JSON.stringify(getGitCommit()),
  },
});
