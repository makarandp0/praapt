/**
 * Production migration runner using Drizzle.
 * Runs pending migrations and exits. Designed for container startup.
 */
import path from 'path';
import { fileURLToPath } from 'url';

import { config } from 'dotenv';
import { drizzle } from 'drizzle-orm/postgres-js';
import { migrate } from 'drizzle-orm/postgres-js/migrator';
import postgres from 'postgres';

import { runCustomMigrations } from './custom-migrations.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

config();

async function runMigrations(): Promise<void> {
  const connectionString =
    process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/praaptdb';

  // drizzle folder is sibling to src/ (or dist/ in production)
  // In dev: apps/api/src/../drizzle = apps/api/drizzle
  // In prod: apps/api/dist/../drizzle = apps/api/drizzle
  const migrationsFolder = path.join(__dirname, '..', 'drizzle');

  console.log('Connecting to database...');
  console.log(`Migrations folder: ${migrationsFolder}`);

  // Use max 1 connection for migrations
  const client = postgres(connectionString, { max: 1 });
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
