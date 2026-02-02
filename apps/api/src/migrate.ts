/**
 * Production migration runner using node-pg-migrate.
 * Runs pending migrations and exits. Designed for container startup.
 */
import path from 'path';
import { fileURLToPath } from 'url';

import { runner, type RunnerOption } from 'node-pg-migrate';

import { getConfig } from './config.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function runMigrations(): Promise<void> {
  // migrations folder is sibling to src/ (or dist/ in production)
  const migrationsDir = path.join(__dirname, '..', 'migrations');

  console.log('Connecting to database...');
  console.log(`Migrations folder: ${migrationsDir}`);

  try {
    console.log('Running migrations...');

    const options: RunnerOption = {
      databaseUrl: getConfig().databaseUrl,
      dir: migrationsDir,
      direction: 'up',
      migrationsTable: 'pgmigrations',
      log: (msg: string) => console.log(msg),
    };

    await runner(options);

    console.log('Migrations complete!');
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

runMigrations();
