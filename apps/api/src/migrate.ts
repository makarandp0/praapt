/**
 * Production migration runner using Drizzle.
 * Runs pending migrations and exits. Designed for container startup.
 */
import path from 'path';

import { config } from 'dotenv';
import { drizzle } from 'drizzle-orm/postgres-js';
import { migrate } from 'drizzle-orm/postgres-js/migrator';
import postgres from 'postgres';

config();

async function runMigrations(): Promise<void> {
  const connectionString =
    process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/praaptdb';

  // In production container (cwd=/app), drizzle folder is at apps/api/drizzle
  // In development, it's relative to the api package
  const migrationsFolder =
    process.env.NODE_ENV === 'production'
      ? path.join(process.cwd(), 'apps', 'api', 'drizzle')
      : path.join(process.cwd(), 'drizzle');

  console.log('Connecting to database...');
  console.log(`Migrations folder: ${migrationsFolder}`);

  // Use max 1 connection for migrations
  const client = postgres(connectionString, { max: 1 });
  const db = drizzle(client);

  try {
    console.log('Running migrations...');
    await migrate(db, { migrationsFolder });
    console.log('Migrations complete!');
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  } finally {
    await client.end();
  }
}

runMigrations();
