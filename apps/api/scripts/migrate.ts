/**
 * Production migration runner.
 * Runs pending migrations and exits. Designed for container startup.
 *
 * Expected to be run from the repo root with migrations at:
 *   apps/api/dist/migrations/
 */
import * as path from 'path';

import knex from 'knex';

async function runMigrations(): Promise<void> {
  const connectionString =
    process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/praaptdb';

  // In production container, cwd is /app and migrations are at apps/api/dist/migrations
  const migrationsDir = path.join(process.cwd(), 'apps', 'api', 'dist', 'migrations');

  console.log('Connecting to database...');
  console.log(`Migrations directory: ${migrationsDir}`);

  const db = knex({
    client: 'pg',
    connection: connectionString,
    pool: { min: 0, max: 2 }, // Small pool for migrations
    migrations: {
      directory: migrationsDir,
      tableName: 'knex_migrations',
    },
  });

  try {
    // Check connection
    await db.raw('SELECT 1');
    console.log('Database connection successful.');

    // Run pending migrations
    const [batch, migrations] = await db.migrate.latest();

    if (migrations.length === 0) {
      console.log('No pending migrations.');
    } else {
      console.log(`Batch ${batch} applied ${migrations.length} migration(s):`);
      migrations.forEach((m: string) => console.log(`  - ${m}`));
    }

    // Show current migration status
    const currentVersion = await db.migrate.currentVersion();
    console.log(`Current schema version: ${currentVersion}`);
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  } finally {
    await db.destroy();
  }
}

runMigrations()
  .then(() => {
    console.log('Migration runner completed successfully.');
    process.exit(0);
  })
  .catch((err) => {
    console.error('Unexpected error:', err);
    process.exit(1);
  });
