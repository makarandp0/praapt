import type { MigrationBuilder } from 'node-pg-migrate';

/**
 * Migrate data from legacy `users` table to `face_registrations`.
 * Only copies email, name, created_at, updated_at.
 * Uses ON CONFLICT to skip duplicates (by email).
 */
export async function up(pgm: MigrationBuilder): Promise<void> {
  pgm.sql(`
    INSERT INTO face_registrations (email, name, created_at, updated_at)
    SELECT email, name, created_at, updated_at
    FROM users
    WHERE deleted_at IS NULL
    ON CONFLICT (email) DO NOTHING;
  `);
}

export async function down(pgm: MigrationBuilder): Promise<void> {
  // Delete records that came from users table
  // We can identify them by matching email
  pgm.sql(`
    DELETE FROM face_registrations
    WHERE email IN (SELECT email FROM users WHERE deleted_at IS NULL);
  `);
}
