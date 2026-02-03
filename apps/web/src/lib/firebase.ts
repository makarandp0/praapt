import { initializeApp, getApps, type FirebaseApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, type Auth } from 'firebase/auth';
import type { FirebaseClientConfig } from '@praapt/shared';

let firebaseApp: FirebaseApp | null = null;
let firebaseAuth: Auth | null = null;
let googleProvider: GoogleAuthProvider | null = null;

/**
 * Initialize Firebase with config from the API.
 * Safe to call multiple times - will only initialize once.
 */
export function initializeFirebaseWithConfig(config: FirebaseClientConfig): FirebaseApp {
  if (firebaseApp) {
    return firebaseApp;
  }

  // Check if already initialized (e.g., by another module)
  if (getApps().length > 0) {
    firebaseApp = getApps()[0];
    return firebaseApp;
  }

  firebaseApp = initializeApp({
    apiKey: config.apiKey,
    authDomain: config.authDomain,
    projectId: config.projectId,
    appId: config.appId,
  });

  return firebaseApp;
}

/**
 * Get Firebase Auth instance.
 * Must call initializeFirebaseWithConfig first.
 */
export function getFirebaseAuth(): Auth {
  if (!firebaseApp) {
    throw new Error('Firebase not initialized. Call initializeFirebaseWithConfig first.');
  }

  if (!firebaseAuth) {
    firebaseAuth = getAuth(firebaseApp);
  }

  return firebaseAuth;
}

/**
 * Get Google Auth Provider for sign-in.
 */
export function getGoogleProvider(): GoogleAuthProvider {
  if (!googleProvider) {
    googleProvider = new GoogleAuthProvider();
    googleProvider.addScope('email');
    googleProvider.addScope('profile');
  }
  return googleProvider;
}

/**
 * Check if Firebase has been initialized.
 */
export function isFirebaseInitialized(): boolean {
  return firebaseApp !== null || getApps().length > 0;
}
