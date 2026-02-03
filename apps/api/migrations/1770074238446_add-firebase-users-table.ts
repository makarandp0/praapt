import type { MigrationBuilder } from 'node-pg-migrate';

export async function up(pgm: MigrationBuilder): Promise<void> {
  // Create users table with Firebase authentication fields
  // Note: If upgrading from old users table, drop it manually first
  pgm.sql(`
    CREATE TABLE users (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      firebase_uid TEXT NOT NULL UNIQUE,
      email TEXT NOT NULL,
      name TEXT,
      provider TEXT,
      photo_url TEXT,
      role TEXT DEFAULT 'unknown',
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    );
  `);

  // Create index for fast lookups by firebase_uid
  pgm.sql(`CREATE INDEX idx_users_firebase_uid ON users(firebase_uid);`);
}

export async function down(pgm: MigrationBuilder): Promise<void> {
  pgm.sql(`DROP TABLE IF EXISTS users CASCADE;`);
}
