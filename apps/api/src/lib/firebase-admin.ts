import { initializeApp, cert, getApps, type App } from 'firebase-admin/app';
import { getAuth, type Auth } from 'firebase-admin/auth';

import { getConfig, isFirebaseConfigured } from '../config.js';
import { logger } from './logger.js';

let firebaseApp: App | null = null;

interface ServiceAccount {
  project_id: string;
  private_key: string;
  client_email: string;
}

/**
 * Initialize Firebase Admin SDK from base64-encoded service account.
 * Safe to call multiple times - will only initialize once.
 */
export function initializeFirebase(): void {
  if (!isFirebaseConfigured()) {
    logger.info('Firebase not configured - skipping initialization');
    return;
  }

  if (getApps().length > 0) {
    firebaseApp = getApps()[0];
    logger.debug('Firebase Admin already initialized');
    return;
  }

  const config = getConfig();

  try {
    const serviceAccountJson = Buffer.from(
      config.firebaseServiceAccountBase64!,
      'base64',
    ).toString('utf-8');
    // eslint-disable-next-line @typescript-eslint/consistent-type-assertions -- JSON.parse returns unknown, validated by isFirebaseConfigured
    const serviceAccount = JSON.parse(serviceAccountJson) as ServiceAccount;

    firebaseApp = initializeApp({
      credential: cert({
        projectId: serviceAccount.project_id,
        privateKey: serviceAccount.private_key,
        clientEmail: serviceAccount.client_email,
      }),
    });

    logger.info({ projectId: serviceAccount.project_id }, 'Firebase Admin initialized');
  } catch (error) {
    logger.error({ error }, 'Failed to initialize Firebase Admin');
    throw error;
  }
}

/**
 * Get Firebase Auth instance.
 * Throws if Firebase is not initialized.
 */
export function getFirebaseAuth(): Auth {
  if (!firebaseApp) {
    throw new Error('Firebase Admin not initialized. Call initializeFirebase() first.');
  }
  return getAuth(firebaseApp);
}

/**
 * Get Firebase client configuration for frontend initialization.
 * Returns null if Firebase is not configured.
 */
export function getFirebaseClientConfig(): {
  apiKey: string;
  authDomain: string;
  projectId: string;
  appId: string;
} | null {
  const config = getConfig();

  if (!isFirebaseConfigured()) {
    return null;
  }

  // Decode service account to get project ID
  const serviceAccountJson = Buffer.from(
    config.firebaseServiceAccountBase64!,
    'base64',
  ).toString('utf-8');
  // eslint-disable-next-line @typescript-eslint/consistent-type-assertions -- JSON.parse returns unknown, validated by isFirebaseConfigured
  const serviceAccount = JSON.parse(serviceAccountJson) as ServiceAccount;

  return {
    apiKey: config.firebaseClientApiKey!,
    authDomain: config.firebaseAuthDomain ?? `${serviceAccount.project_id}.firebaseapp.com`,
    projectId: serviceAccount.project_id,
    appId: config.firebaseClientAppId!,
  };
}
