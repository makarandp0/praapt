import type { MigrationBuilder } from 'node-pg-migrate';

export async function up(pgm: MigrationBuilder): Promise<void> {
  // Create reusable trigger function for auto-updating updated_at
  pgm.sql(`
    CREATE OR REPLACE FUNCTION set_updated_at()
    RETURNS TRIGGER AS $$
    BEGIN
      NEW.updated_at = NOW();
      RETURN NEW;
    END;
    $$ LANGUAGE plpgsql;
  `);

  // Apply trigger to existing tables with updated_at
  pgm.sql(`
    CREATE TRIGGER set_updated_at_users
      BEFORE UPDATE ON users
      FOR EACH ROW EXECUTE FUNCTION set_updated_at();
  `);

  pgm.sql(`
    CREATE TRIGGER set_updated_at_face_registrations
      BEFORE UPDATE ON face_registrations
      FOR EACH ROW EXECUTE FUNCTION set_updated_at();
  `);

  // Create customer table
  pgm.sql(`
    CREATE TABLE customer (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      name TEXT NOT NULL,
      pin TEXT NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `);

  // Apply trigger to customer table
  pgm.sql(`
    CREATE TRIGGER set_updated_at_customer
      BEFORE UPDATE ON customer
      FOR EACH ROW EXECUTE FUNCTION set_updated_at();
  `);

  // Create customer_faces table with FK to customer
  pgm.sql(`
    CREATE TABLE customer_faces (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      customer_id UUID NOT NULL REFERENCES customer(id) ON DELETE CASCADE,
      face_embedding JSONB NOT NULL,
      image_path TEXT NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `);

  // Create index for fast lookups by pin
  pgm.sql(`CREATE INDEX idx_customer_pin ON customer(pin);`);

  // Create index for fast lookups by customer_id
  pgm.sql(`CREATE INDEX idx_customer_faces_customer_id ON customer_faces(customer_id);`);
}

export async function down(pgm: MigrationBuilder): Promise<void> {
  pgm.sql(`DROP TABLE IF EXISTS customer_faces CASCADE;`);
  pgm.sql(`DROP TABLE IF EXISTS customer CASCADE;`);

  // Remove triggers from existing tables
  pgm.sql(`DROP TRIGGER IF EXISTS set_updated_at_users ON users;`);
  pgm.sql(`DROP TRIGGER IF EXISTS set_updated_at_face_registrations ON face_registrations;`);

  // Drop the trigger function
  pgm.sql(`DROP FUNCTION IF EXISTS set_updated_at();`);
}
