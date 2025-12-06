import { defineConfig } from 'drizzle-kit';
import 'dotenv/config';

// Note: Cannot import from ./src/env.js here because drizzle-kit uses CommonJS require.
// The dotenv/config import above loads .env, so process.env.DATABASE_URL is available.
const DATABASE_URL =
  process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/praaptdb';

export default defineConfig({
  schema: './src/schema.ts',
  out: './drizzle',
  dialect: 'postgresql',
  dbCredentials: {
    url: DATABASE_URL,
  },
  verbose: true,
  strict: true,
});
