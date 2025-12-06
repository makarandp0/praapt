import { pgTable, serial, text, timestamp } from 'drizzle-orm/pg-core';

/**
 * Users table schema - matches the existing migration 0001_init_users.ts
 */
export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  email: text('email').notNull().unique(),
  name: text('name'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
});

// Infer types from schema for use throughout the app
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
