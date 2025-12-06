/**
 * Rollback the last custom migration.
 * Usage: npx tsx src/rollback.ts
 */
import postgres from 'postgres';

import { rollbackLastMigration } from './custom-migrations.js';
import { DATABASE_URL } from './env.js';

async function main(): Promise<void> {
  console.log('Connecting to database...');
  const client = postgres(DATABASE_URL, { max: 1 });

  try {
    await rollbackLastMigration(client);
  } finally {
    await client.end();
  }
}

main();
