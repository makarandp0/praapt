/**
 * Custom migrations runner.
 * Reads TypeScript migrations from src/migrations/ directory.
 * Each migration file must export `up(db)` and `down(db)` functions.
 * Tracks completed migrations in a `custom_migrations` table.
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

import { eq } from 'drizzle-orm';
import { pgTable, text, timestamp } from 'drizzle-orm/pg-core';
import { drizzle, PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';

import * as schema from './schema.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Migration tracking table
const customMigrations = pgTable('custom_migrations', {
  name: text('name').primaryKey(),
  runAt: timestamp('run_at', { withTimezone: true }).defaultNow(),
});

// Migration module interface
type MigrationModule = {
  up: (db: PostgresJsDatabase<typeof schema>) => Promise<void>;
  down: (db: PostgresJsDatabase<typeof schema>) => Promise<void>;
};

/** Type guard to check if a module has the required migration functions */
function isMigrationModule(mod: unknown): mod is MigrationModule {
  return (
    typeof mod === 'object' &&
    mod !== null &&
    'up' in mod &&
    typeof mod.up === 'function' &&
    'down' in mod &&
    typeof mod.down === 'function'
  );
}

/**
 * Load all migration files from the migrations directory.
 * Files must be named with a numeric prefix for ordering (e.g., 001_name.ts)
 */
async function loadMigrations(): Promise<{ name: string; module: MigrationModule }[]> {
  const migrationsDir = path.join(__dirname, 'migrations');

  if (!fs.existsSync(migrationsDir)) {
    console.log(`Migrations directory not found: ${migrationsDir}`);
    return [];
  }

  const files = fs
    .readdirSync(migrationsDir)
    .filter((f) => f.endsWith('.ts') || f.endsWith('.js'))
    .sort(); // Alphabetical sort works with numeric prefixes

  const migrations: { name: string; module: MigrationModule }[] = [];

  for (const file of files) {
    const name = file.replace(/\.(ts|js)$/, '');
    const filePath = path.join(migrationsDir, file);

    try {
      const module: unknown = await import(filePath);

      if (!isMigrationModule(module)) {
        console.warn(`Migration ${name} is missing 'up' or 'down' function, skipping`);
        continue;
      }

      migrations.push({ name, module });
    } catch (error) {
      console.error(`Failed to load migration ${name}:`, error);
      throw error;
    }
  }

  return migrations;
}

export async function runCustomMigrations(client: postgres.Sql): Promise<void> {
  const db = drizzle(client, { schema });

  // Ensure tracking table exists
  await client`
    CREATE TABLE IF NOT EXISTS custom_migrations (
      name TEXT PRIMARY KEY,
      run_at TIMESTAMPTZ DEFAULT NOW()
    )
  `;

  // Load migrations from directory
  const migrations = await loadMigrations();

  if (migrations.length === 0) {
    console.log('No custom migrations found.');
    return;
  }

  // Get already-run migrations
  const completed = await db.select().from(customMigrations);
  const completedNames = new Set(completed.map((m) => m.name));

  // Filter to pending migrations
  const pending = migrations.filter((m) => !completedNames.has(m.name));

  if (pending.length === 0) {
    console.log('No pending custom migrations.');
    return;
  }

  console.log(`Running ${pending.length} custom migration(s)...`);

  for (const { name, module } of pending) {
    console.log(`Running: ${name}`);
    try {
      await module.up(db);
      await db.insert(customMigrations).values({ name });
      console.log(`  ✓ ${name} complete`);
    } catch (error) {
      console.error(`  ✗ ${name} failed:`, error);
      throw error;
    }
  }

  console.log('Custom migrations complete!');
}

/**
 * Rollback the last custom migration.
 * Call with: npx tsx src/custom-migrations.ts rollback
 */
export async function rollbackLastMigration(client: postgres.Sql): Promise<void> {
  const db = drizzle(client, { schema });

  // Get the last completed migration
  const completed = await db.select().from(customMigrations).orderBy(customMigrations.runAt);

  if (completed.length === 0) {
    console.log('No migrations to rollback.');
    return;
  }

  const last = completed[completed.length - 1];
  const migrations = await loadMigrations();
  const migration = migrations.find((m) => m.name === last.name);

  if (!migration) {
    console.error(`Migration file not found for: ${last.name}`);
    return;
  }

  console.log(`Rolling back: ${last.name}`);
  try {
    await migration.module.down(db);
    await db.delete(customMigrations).where(eq(customMigrations.name, last.name));
    console.log(`  ✓ Rollback complete`);
  } catch (error) {
    console.error(`  ✗ Rollback failed:`, error);
    throw error;
  }
}
