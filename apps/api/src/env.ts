import { config } from 'dotenv';

// Load environment variables from .env file
config();

export const NODE_ENV = process.env.NODE_ENV || 'development';

export const DEFAULT_DATABASE_URL = 'postgresql://postgres:postgres@localhost:5433/praaptdb';

export const DATABASE_URL = process.env.DATABASE_URL || DEFAULT_DATABASE_URL;
