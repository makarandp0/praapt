#!/usr/bin/env node
import { spawn, execSync } from 'node:child_process';
import { createServer, createConnection } from 'node:net';
import { basename } from 'node:path';

const log = (s) => process.stdout.write(s + '\n');

/**
 * Check if the Postgres database is reachable on the given port.
 */
async function isDbReachable(port = 5433, host = 'localhost') {
  return await new Promise((resolve) => {
    const socket = createConnection({ port, host });
    socket.setTimeout(1000);
    socket.on('connect', () => {
      socket.destroy();
      resolve(true);
    });
    socket.on('timeout', () => {
      socket.destroy();
      resolve(false);
    });
    socket.on('error', () => {
      socket.destroy();
      resolve(false);
    });
  });
}

/**
 * Ensure the database container is running. Start it if not.
 */
async function ensureDatabase(dbPort = 5433) {
  const reachable = await isDbReachable(dbPort);
  if (reachable) {
    log(`Database is already running on port ${dbPort}.`);
    return;
  }

  log(`Database not reachable on port ${dbPort} — starting Docker Compose db service...`);
  try {
    execSync('docker compose up -d db', { stdio: 'inherit' });
  } catch {
    log('Failed to start database. Is Docker running?');
    process.exit(1);
  }

  // Wait for db to become healthy
  log('Waiting for database to be ready...');
  const maxRetries = 30;
  for (let i = 0; i < maxRetries; i++) {
    if (await isDbReachable(dbPort)) {
      log('Database is ready.');
      return;
    }
    await new Promise((r) => setTimeout(r, 1000));
  }
  log('Database did not become ready in time.');
  process.exit(1);
}

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

/**
 * Kill any process using the given port.
 */
function killPort(port) {
  try {
    const pids = execSync(`lsof -ti :${port}`, { encoding: 'utf8' }).trim();
    if (pids) {
      for (const pid of pids.split('\n')) {
        try {
          execSync(`kill ${pid}`, { stdio: 'ignore' });
          log(`Killed process on port ${port} (PID ${pid})`);
        } catch {
          // Process may have already exited
        }
      }
    }
  } catch {
    // No process found on port (lsof returns non-zero)
  }
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
  const dbPort = 5433;

  const apiPort = baseApiPort + offset;
  const webPort = baseWebPort + offset;

  log(`Worktree '${worktree}' → offset ${offset}`);
  log(`  API: http://localhost:${apiPort}`);
  log(`  Web: http://localhost:${webPort}`);
  log('');

  // Ensure database is running before starting API
  await ensureDatabase(dbPort);
  log('');

  // Kill any existing processes on our ports
  killPort(apiPort);
  killPort(webPort);

  const apiUrl = `http://localhost:${apiPort}`;

  log(`Starting API dev server on port ${apiPort}...`);
  const apiChild = run('pnpm', ['--filter', '@praapt/api', 'run', 'dev'], {
    env: { ...process.env, PORT: String(apiPort) },
    name: 'api',
  });

  log(`Starting Web dev server on port ${webPort}...`);
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
