import type { MigrationBuilder } from 'node-pg-migrate';

/**
 * Migrate data from legacy `users` table to `face_registrations`.
 * Only copies email, name, created_at, updated_at.
 * Uses ON CONFLICT to skip duplicates (by email).
 *
 * This migration only runs if the `users` table exists (production).
 * On fresh/local databases without `users`, this is a no-op.
 */
export async function up(pgm: MigrationBuilder): Promise<void> {
  pgm.sql(`
    DO $$
    BEGIN
      IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'users') THEN
        -- Check if deleted_at column exists (may not in older schemas)
        IF EXISTS (
          SELECT 1 FROM information_schema.columns
          WHERE table_name = 'users' AND column_name = 'deleted_at'
        ) THEN
          INSERT INTO face_registrations (email, name, created_at, updated_at)
          SELECT email, name, created_at, updated_at
          FROM users
          WHERE deleted_at IS NULL
          ON CONFLICT (email) DO NOTHING;
        ELSE
          INSERT INTO face_registrations (email, name, created_at, updated_at)
          SELECT email, name, created_at, updated_at
          FROM users
          ON CONFLICT (email) DO NOTHING;
        END IF;
      END IF;
    END $$;
  `);
}

export async function down(pgm: MigrationBuilder): Promise<void> {
  // Down migration is a no-op since we can't reliably identify which records came from users
  pgm.sql(`SELECT 1;`);
}
