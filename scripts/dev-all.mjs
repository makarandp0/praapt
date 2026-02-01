#!/usr/bin/env node
import { spawn, execSync } from 'node:child_process';
import { createServer } from 'node:net';
import { basename } from 'node:path';

const log = (s) => process.stdout.write(s + '\n');

/**
 * Get the current worktree name (directory name of git root).
 */
function getWorktreeName() {
  try {
    const gitRoot = execSync('git rev-parse --show-toplevel', { encoding: 'utf8' }).trim();
    return basename(gitRoot);
  } catch {
    return basename(process.cwd());
  }
}

/**
 * Calculate port offset from worktree name (deterministic hash).
 * Returns offset in increments of 10 (0, 10, 20, ... 990).
 * Main/master worktrees get offset 0, others get a hash-based offset.
 */
function getPortOffset(worktree = getWorktreeName()) {
  if (['main', 'master', 'praapt'].includes(worktree)) {
    return 0;
  }
  // Simple hash similar to cksum - sum of char codes
  let hash = 0;
  for (const char of worktree) {
    hash = (hash * 31 + char.charCodeAt(0)) >>> 0;
  }
  return (hash % 100) * 10;
}

async function isPortFree(port, host = '127.0.0.1') {
  return await new Promise((resolve) => {
    const srv = createServer()
      .once('error', () => resolve(false))
      .once('listening', () => {
        srv.close(() => resolve(true));
      })
      .listen(port, host);
  });
}

function run(cmd, args, opts = {}) {
  const child = spawn(cmd, args, {
    stdio: ['inherit', 'pipe', 'pipe'],
    shell: process.platform === 'win32',
    ...opts,
  });
  const name = opts.name || cmd;
  const prefix = `[${name}]`;
  child.stdout.on('data', (d) => process.stdout.write(`${prefix} ${d}`));
  child.stderr.on('data', (d) => process.stderr.write(`${prefix} ${d}`));
  child.on('exit', (code, signal) => {
    log(`${prefix} exited ${signal ? `signal ${signal}` : `code ${code}`}`);
  });
  return child;
}

(async () => {
  // Calculate worktree-specific ports
  const worktree = getWorktreeName();
  const offset = getPortOffset(worktree);

  const baseApiPort = 3000;
  const baseWebPort = 5173;

  const apiPort = baseApiPort + offset;
  const webPort = baseWebPort + offset;

  log(`Worktree '${worktree}' → offset ${offset}`);
  log(`  API: http://localhost:${apiPort}`);
  log(`  Web: http://localhost:${webPort}`);
  log('');

  const apiFree = await isPortFree(apiPort);
  let apiChild = null;
  const apiUrl = `http://localhost:${apiPort}`;

  if (apiFree) {
    log(`API port ${apiPort} is free — starting API dev server...`);
    apiChild = run('pnpm', ['--filter', '@praapt/api', 'run', 'dev'], {
      env: { ...process.env, PORT: String(apiPort) },
      name: 'api',
    });
  } else {
    log(`API port ${apiPort} is busy — assuming API is already running at ${apiUrl}.`);
  }

  const webFree = await isPortFree(webPort);
  if (!webFree) {
    log(`Web port ${webPort} is busy — another instance may be running.`);
    process.exit(1);
  }

  log(`Web port ${webPort} is free — starting Web dev server...`);
  const webEnv = { ...process.env, VITE_API_URL: `${apiUrl}/api` };
  const webArgs = ['--filter', '@praapt/web', 'run', 'dev', '--', '--port', String(webPort)];
  const webChild = run('pnpm', webArgs, { env: webEnv, name: 'web' });

  const shutdown = () => {
    log('Shutting down dev processes...');
    if (webChild && !webChild.killed) webChild.kill('SIGINT');
    if (apiChild && !apiChild.killed) apiChild.kill('SIGINT');
  };
  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);
})();
