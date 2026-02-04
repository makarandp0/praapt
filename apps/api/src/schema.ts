import { pgTable, serial, text, timestamp, jsonb, uuid } from 'drizzle-orm/pg-core';

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

/**
 * Users table schema
 * Stores Firebase-authenticated users with role-based access.
 */
export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  firebaseUid: text('firebase_uid').notNull().unique(),
  email: text('email').notNull(),
  name: text('name'),
  provider: text('provider'),
  photoUrl: text('photo_url'),
  role: text('role').default('unknown'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
});

// Infer types for users table
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;

/**
 * Customers table schema
 * Stores customer data for kiosk/registration flows.
 */
export const customers = pgTable('customers', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull(),
  pin: text('pin').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

// Infer types for customers table
export type Customer = typeof customers.$inferSelect;
export type NewCustomer = typeof customers.$inferInsert;

/**
 * Customer faces table schema
 * Stores face embeddings for customer face recognition.
 */
export const customerFaces = pgTable('customer_faces', {
  id: uuid('id').primaryKey().defaultRandom(),
  customerId: uuid('customer_id')
    .notNull()
    .references(() => customers.id, { onDelete: 'cascade' }),
  faceEmbedding: jsonb('face_embedding').$type<number[]>().notNull(),
  imagePath: text('image_path').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});

// Infer types for customer_faces table
export type CustomerFace = typeof customerFaces.$inferSelect;
export type NewCustomerFace = typeof customerFaces.$inferInsert;
