#!/usr/bin/env node
// A local smoke test: ensure DB, migrate, build, start API, hit endpoints.
import { spawn, spawnSync } from 'node:child_process';
import { createConnection } from 'node:net';
import { promisify } from 'node:util';
import fs from 'node:fs';
import path from 'node:path';

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

function run(cmd, args, opts = {}) {
  return new Promise((resolve, reject) => {
    const p = spawn(cmd, args, { stdio: 'inherit', shell: false, ...opts });
    p.on('exit', (code) => (code === 0 ? resolve() : reject(new Error(`${cmd} ${args.join(' ')} exited ${code}`))));
  });
}

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
    } catch (_) {
      await sleep(500);
    }
  }
  throw new Error(`Timeout waiting for ${host}:${port}`);
}

async function ensureDb() {
  // If 5432 not open, try docker compose up -d
  try {
    await waitForPort(5432, '127.0.0.1', 1000);
    return;
  } catch {}
  try {
    console.log('Postgres not detected on :5432, attempting docker compose up -d...');
    spawnSync('docker', ['compose', 'up', '-d'], { stdio: 'inherit' });
  } catch (e) {
    console.warn('Docker compose not available or failed. Continuing, migrations may fail.');
  }
  await waitForPort(5432, '127.0.0.1', 30000);
}

async function main() {
  const apiDir = path.resolve('apps/api');
  const apiEnv = path.join(apiDir, '.env');
  const apiEnvEx = path.join(apiDir, '.env.example');

  // Ensure API .env exists
  if (!fs.existsSync(apiEnv) && fs.existsSync(apiEnvEx)) {
    fs.copyFileSync(apiEnvEx, apiEnv);
    console.log('Created apps/api/.env from example.');
  }

  // Ensure DB
  await ensureDb();

  console.log('Running migrations...');
  await run('npm', ['run', 'migrate']);

  console.log('Running typecheck and lint...');
  await run('npm', ['run', 'typecheck']);
  await run('npm', ['run', 'lint']);

  console.log('Building workspaces...');
  await run('npm', ['run', 'build']);

  console.log('Starting API (prod build)...');
  const apiProc = spawn('node', ['dist/index.js'], { cwd: apiDir, stdio: 'inherit' });

  try {
    await waitForPort(3000, '127.0.0.1', 30000);
    // Health check
    const health = await fetch('http://127.0.0.1:3000/health').then((r) => r.json());
    if (!health?.ok) throw new Error('Health check not ok');

    // Users flow
    const email = `verify_${Date.now()}@example.com`;
    const created = await fetch('http://127.0.0.1:3000/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, name: 'Verify' })
    }).then((r) => r.json());
    if (!created?.id) throw new Error('User create failed');

    const users = await fetch('http://127.0.0.1:3000/users').then((r) => r.json());
    if (!Array.isArray(users) || !users.find((u) => u.email === email)) {
      throw new Error('User not found after creation');
    }

    console.log('Verification succeeded.');
  } finally {
    apiProc.kill('SIGTERM');
  }
}

main().catch((err) => {
  console.error('Verification failed:', err?.message || err);
  process.exit(1);
});

