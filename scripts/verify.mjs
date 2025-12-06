#!/usr/bin/env node
/**
 * API smoke test: start the built API server and hit the health endpoint.
 * Run this AFTER `npm run build` to verify the server starts correctly.
 *
 * This script assumes:
 * - Build has already been run (apps/api/dist exists)
 * - Database is available (if DATABASE_URL is set)
 */
import { spawn } from 'node:child_process';
import { createConnection } from 'node:net';
import path from 'node:path';

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function waitForPort(port, host = '127.0.0.1', timeoutMs = 30000) {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    try {
      await new Promise((resolve, reject) => {
        const socket = createConnection({ port, host }, () => {
          socket.end();
          resolve(undefined);
        });
        socket.on('error', reject);
      });
      return;
    } catch {
      await sleep(500);
    }
  }
  throw new Error(`Timeout waiting for ${host}:${port}`);
}

async function main() {
  const apiDir = path.resolve('apps/api');

  console.log('Starting API server...');
  const apiProc = spawn('node', ['dist/index.js'], {
    cwd: apiDir,
    stdio: 'inherit',
    env: { ...process.env, NODE_ENV: 'production' },
  });

  try {
    await waitForPort(3000, '127.0.0.1', 30000);

    // Health check
    console.log('Running health check...');
    const health = await fetch('http://127.0.0.1:3000/api/health').then((r) => r.json());
    if (!health?.ok) throw new Error('Health check not ok: ' + JSON.stringify(health));

    console.log('✅ API smoke test passed - server starts and responds to health check');
  } finally {
    apiProc.kill('SIGTERM');
  }
}

main().catch((err) => {
  console.error('❌ API smoke test failed:', err?.message || err);
  process.exit(1);
});
