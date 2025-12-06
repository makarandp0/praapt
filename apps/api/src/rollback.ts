/**
 * Rollback the last custom migration.
 * Usage: npx tsx src/rollback.ts
 */
import { config } from 'dotenv';
import postgres from 'postgres';

import { rollbackLastMigration } from './custom-migrations.js';

config();

async function main(): Promise<void> {
  const connectionString =
    process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/praaptdb';

  console.log('Connecting to database...');
  const client = postgres(connectionString, { max: 1 });

  try {
    await rollbackLastMigration(client);
  } finally {
    await client.end();
  }
}

main();
