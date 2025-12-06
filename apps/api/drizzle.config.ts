import { defineConfig } from 'drizzle-kit';
import 'dotenv/config';

import { DATABASE_URL } from './src/env.js';

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
