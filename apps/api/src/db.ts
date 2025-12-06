import { config } from 'dotenv';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';

import * as schema from './schema.js';

// Load env from current working directory; index.ts calls config() early.
config();

const connectionString =
  process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/praaptdb';

// Create postgres connection
const client = postgres(connectionString, { max: 10 });

// Create drizzle instance with schema for full type inference
export const db = drizzle(client, { schema });

// Re-export schema types for convenience
export * from './schema.js';
