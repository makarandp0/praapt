import type { MigrationBuilder } from 'node-pg-migrate';

/**
 * Initial schema migration for face_registrations table.
 * Uses IF NOT EXISTS for idempotency - safe to run on both fresh and existing DBs.
 */
export async function up(pgm: MigrationBuilder): Promise<void> {
  pgm.sql(`
    CREATE TABLE IF NOT EXISTS face_registrations (
      id SERIAL PRIMARY KEY,
      email TEXT NOT NULL UNIQUE,
      name TEXT,
      notes TEXT,
      face_embedding JSONB,
      profile_image_path TEXT,
      face_registered_at TIMESTAMP WITH TIME ZONE,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );
  `);
}

export async function down(pgm: MigrationBuilder): Promise<void> {
  pgm.sql(`DROP TABLE IF EXISTS face_registrations;`);
}
