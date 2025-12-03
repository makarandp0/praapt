#!/usr/bin/env node
import { spawn } from 'node:child_process';
import { createServer } from 'node:net';

const log = (s) => process.stdout.write(s + '\n');

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

async function findFreePort(start, host = '127.0.0.1', max = 20) {
  for (let p = start; p < start + max; p++) {
    if (await isPortFree(p, host)) return p;
  }
  throw new Error(`No free port found starting at ${start}`);
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
  const desiredApiPort = Number(process.env.PORT || 3000);
  const desiredWebPort = Number(process.env.WEB_PORT || 5173);

  const apiFree = await isPortFree(desiredApiPort);
  let apiChild = null;
  let apiUrl = `http://localhost:${desiredApiPort}`;

  if (apiFree) {
    log(`API port ${desiredApiPort} is free — starting API dev server...`);
    apiChild = run('npm', ['--workspace=@praapt/api', 'run', 'dev'], {
      env: { ...process.env, PORT: String(desiredApiPort) },
      name: 'api',
    });
  } else {
    log(`API port ${desiredApiPort} is busy — assuming API is already running at ${apiUrl}.`);
  }

  // For web, if the default port is busy, we'll find a free port and start another dev server.
  const webFree = await isPortFree(desiredWebPort);
  const webPort = webFree ? desiredWebPort : await findFreePort(desiredWebPort + 1);
  if (!webFree) {
    log(`Web port ${desiredWebPort} is busy — starting Web on ${webPort}.`);
  } else {
    log(`Web port ${desiredWebPort} is free — starting Web on ${webPort}.`);
  }

  // Ensure the web gets the correct API URL (if API is on the standard port, it's already correct).
  const webEnv = { ...process.env, VITE_API_URL: `${apiUrl}/api` };
  const webArgs = ['--workspace=@praapt/web', 'run', 'dev', '--', '--port', String(webPort)];
  const webChild = run('npm', webArgs, { env: webEnv, name: 'web' });

  const shutdown = () => {
    log('Shutting down dev processes...');
    if (webChild && !webChild.killed) webChild.kill('SIGINT');
    if (apiChild && !apiChild.killed) apiChild.kill('SIGINT');
  };
  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);
})();
