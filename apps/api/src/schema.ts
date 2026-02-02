import { pgTable, serial, text, timestamp, jsonb } from 'drizzle-orm/pg-core';

/**
 * Face registrations table schema
 * Stores face embeddings for face-based login.
 * - Basic user info: email, name
 * - Face recognition: embedding vector (512-dim), profile image path
 */
export const faceRegistrations = pgTable('face_registrations', {
  id: serial('id').primaryKey(),
  email: text('email').notNull().unique(),
  name: text('name'),
  notes: text('notes'), // Optional notes field
  // Face recognition fields
  faceEmbedding: jsonb('face_embedding').$type<number[]>(),
  profileImagePath: text('profile_image_path'),
  faceRegisteredAt: timestamp('face_registered_at', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
});

// Infer types from schema for use throughout the app
export type FaceRegistration = typeof faceRegistrations.$inferSelect;
export type NewFaceRegistration = typeof faceRegistrations.$inferInsert;
