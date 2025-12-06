import { eq } from 'drizzle-orm';
import { PostgresJsDatabase } from 'drizzle-orm/postgres-js';

import * as schema from '../schema.js';

type DB = PostgresJsDatabase<typeof schema>;

export async function up(db: DB): Promise<void> {
  const existing = await db
    .select()
    .from(schema.users)
    .where(eq(schema.users.email, 'makarand@gmail.com'));

  if (existing.length === 0) {
    await db.insert(schema.users).values({
      email: 'makarand@gmail.com',
      name: 'Makarand',
    });
    console.log('  → Created admin user: makarand@gmail.com');
  } else {
    console.log('  → Admin user already exists, skipping');
  }
}

export async function down(db: DB): Promise<void> {
  await db.delete(schema.users).where(eq(schema.users.email, 'makarand@gmail.com'));
  console.log('  → Deleted admin user: makarand@gmail.com');
}
