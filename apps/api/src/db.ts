import dotenv from 'dotenv';
import knex, { Knex } from 'knex';

// Load env from current working directory; index.ts calls config() early.
dotenv.config();

const connectionString = process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/appdb';

export const db: Knex = knex({
  client: 'pg',
  connection: connectionString,
  pool: { min: 0, max: 10 }
});
