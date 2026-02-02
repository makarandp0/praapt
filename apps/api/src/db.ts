import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';

import { getConfig } from './config.js';
import * as schema from './schema.js';

// Create postgres connection
// Connection pool: max 10 connections (matches previous Knex config), min is default (0).
const client = postgres(getConfig().databaseUrl, { max: 10 });

// Create drizzle instance with schema for full type inference
export const db = drizzle(client, { schema });

// Re-export schema types for convenience
export * from './schema.js';
