import { config as dotenvConfig } from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Load environment variables from .env file at repo root
// Try repo root first (../../..), then current working directory
dotenvConfig({ path: path.resolve(__dirname, '../../../.env') });
dotenvConfig(); // Also try cwd as fallback

export interface Config {
  // Server
  port: number;
  nodeEnv: string;
  commitSha: string;

  // Database
  databaseUrl: string;

  // Face Service
  faceServiceUrl: string;

  // Static Files & CORS
  staticPath: string;
  corsOrigin: string;

  // Storage
  imagesDir: string;

  // Logging
  logLevel: string;

  // Firebase Authentication
  firebaseServiceAccountBase64: string | null;
  firebaseClientApiKey: string | null;
  firebaseClientAppId: string | null;
  firebaseAuthDomain: string | null;
}

let cachedConfig: Config | null = null;

export function getConfig(): Config {
  if (cachedConfig) return cachedConfig;

  const nodeEnv = process.env.NODE_ENV ?? 'development';

  cachedConfig = {
    port: Number(process.env.PORT ?? 3000),
    nodeEnv,
    commitSha: process.env.GIT_COMMIT ?? process.env.RAILWAY_GIT_COMMIT_SHA ?? 'unknown',

    databaseUrl:
      process.env.DATABASE_URL ?? 'postgresql://postgres:postgres@localhost:5433/praaptdb',

    faceServiceUrl: process.env.FACE_SERVICE_URL ?? 'http://localhost:8001',

    staticPath: process.env.STATIC_PATH
      ? path.resolve(process.env.STATIC_PATH)
      : path.join(__dirname, '../../web/dist'),
    corsOrigin: process.env.CORS_ORIGIN ?? '*',

    imagesDir: process.env.IMAGES_DIR
      ? path.resolve(process.env.IMAGES_DIR)
      : path.join(process.cwd(), 'images'),

    logLevel: process.env.LOG_LEVEL ?? (nodeEnv === 'production' ? 'info' : 'debug'),

    // Firebase Authentication
    firebaseServiceAccountBase64: process.env.FIREBASE_SERVICE_ACCOUNT_BASE64 ?? null,
    firebaseClientApiKey: process.env.FIREBASE_CLIENT_API_KEY ?? null,
    firebaseClientAppId: process.env.FIREBASE_CLIENT_APP_ID ?? null,
    firebaseAuthDomain: process.env.FIREBASE_AUTH_DOMAIN ?? null,
  };

  return cachedConfig;
}

/** Check if face service URL is configured */
export function isFaceServiceConfigured(): boolean {
  return !!getConfig().faceServiceUrl;
}

/** Check if Firebase authentication is configured */
export function isFirebaseConfigured(): boolean {
  const config = getConfig();
  return !!(
    config.firebaseServiceAccountBase64 &&
    config.firebaseClientApiKey &&
    config.firebaseClientAppId
  );
}

/** Get config with sensitive values redacted for logging/health endpoints */
export function getRedactedConfig(): Record<string, unknown> {
  const config = getConfig();
  return {
    ...config,
    databaseUrl: '[REDACTED]',
  };
}
