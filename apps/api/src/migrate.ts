/**
 * Production migration runner using Drizzle.
 * Runs pending migrations and exits. Designed for container startup.
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

import { drizzle } from 'drizzle-orm/postgres-js';
import { migrate } from 'drizzle-orm/postgres-js/migrator';
import postgres from 'postgres';

import { runCustomMigrations } from './custom-migrations.js';
import { DATABASE_URL } from './env.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function runMigrations(): Promise<void> {
  // drizzle folder is sibling to src/ (or dist/ in production)
  // In dev: apps/api/src/../drizzle = apps/api/drizzle
  // In prod: apps/api/dist/../drizzle = apps/api/drizzle
  const migrationsFolder = path.join(__dirname, '..', 'drizzle');

  // Validate migrations folder exists before proceeding
  if (!fs.existsSync(migrationsFolder)) {
    console.error(`Migrations folder not found: ${migrationsFolder}`);
    console.error('Expected drizzle folder at apps/api/drizzle');
    process.exit(1);
  }

  console.log('Connecting to database...');
  console.log(`Migrations folder: ${migrationsFolder}`);

  // Use max 1 connection for migrations
  const client = postgres(DATABASE_URL, { max: 1 });
  const db = drizzle(client);

  try {
    // Run Drizzle schema migrations
    console.log('Running schema migrations...');
    await migrate(db, { migrationsFolder });
    console.log('Schema migrations complete!');

    // Run custom TypeScript migrations
    console.log('Running custom migrations...');
    await runCustomMigrations(client);
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  } finally {
    await client.end();
  }
}

runMigrations();
