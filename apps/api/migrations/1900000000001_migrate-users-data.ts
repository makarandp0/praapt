import type { MigrationBuilder } from 'node-pg-migrate';

/**
 * Migrate data from legacy `users` table to `face_registrations`.
 * Copies all relevant columns including face_embedding and profile_image_path.
 * Uses ON CONFLICT to skip duplicates (by email), then updates missing fields.
 *
 * This migration only runs if the `users` table exists (production).
 * On fresh/local databases without `users`, this is a no-op.
 */
export async function up(pgm: MigrationBuilder): Promise<void> {
  pgm.sql(`
    DO $$
    BEGIN
      IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'users') THEN
        -- Only migrate if legacy face columns exist on users
        IF EXISTS (
          SELECT 1 FROM information_schema.columns
          WHERE table_name = 'users' AND column_name = 'face_embedding'
        ) THEN
          -- Check if deleted_at column exists (may not in older schemas)
          IF EXISTS (
            SELECT 1 FROM information_schema.columns
            WHERE table_name = 'users' AND column_name = 'deleted_at'
          ) THEN
            INSERT INTO face_registrations (email, name, face_embedding, profile_image_path, face_registered_at, created_at, updated_at)
            SELECT email, name, face_embedding, profile_image_path, face_registered_at, created_at, updated_at
            FROM users
            WHERE deleted_at IS NULL
            ON CONFLICT (email) DO UPDATE SET
              face_embedding = COALESCE(face_registrations.face_embedding, EXCLUDED.face_embedding),
              profile_image_path = COALESCE(face_registrations.profile_image_path, EXCLUDED.profile_image_path),
              face_registered_at = COALESCE(face_registrations.face_registered_at, EXCLUDED.face_registered_at);
          ELSE
            INSERT INTO face_registrations (email, name, face_embedding, profile_image_path, face_registered_at, created_at, updated_at)
            SELECT email, name, face_embedding, profile_image_path, face_registered_at, created_at, updated_at
            FROM users
            ON CONFLICT (email) DO UPDATE SET
              face_embedding = COALESCE(face_registrations.face_embedding, EXCLUDED.face_embedding),
              profile_image_path = COALESCE(face_registrations.profile_image_path, EXCLUDED.profile_image_path),
              face_registered_at = COALESCE(face_registrations.face_registered_at, EXCLUDED.face_registered_at);
          END IF;
        END IF;
      END IF;
    END $$;
  `);
}

export async function down(pgm: MigrationBuilder): Promise<void> {
  // Down migration is a no-op since we can't reliably identify which records came from users
  pgm.sql(`SELECT 1;`);
}
