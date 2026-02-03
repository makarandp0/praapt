import { useState, useEffect, useCallback } from 'react';
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  signOut as firebaseSignOut,
  type User as FirebaseUser,
} from 'firebase/auth';
import { Contracts, type FirebaseClientConfig } from '@praapt/shared';

import { callContract } from '../lib/contractClient';
import {
  initializeFirebaseWithConfig,
  getFirebaseAuth,
  getGoogleProvider,
  isFirebaseInitialized,
} from '../lib/firebase';

export interface UseFirebaseAuthResult {
  /** Firebase user object (null if not authenticated) */
  firebaseUser: FirebaseUser | null;
  /** Whether auth state is still loading */
  loading: boolean;
  /** Whether Firebase auth is configured and available */
  authEnabled: boolean;
  /** Error message if something went wrong */
  error: string | null;
  /** Sign in with email and password */
  signInWithEmail: (email: string, password: string) => Promise<void>;
  /** Sign up with email and password */
  signUpWithEmail: (email: string, password: string) => Promise<void>;
  /** Sign in with Google popup */
  signInWithGoogle: () => Promise<void>;
  /** Sign out */
  signOut: () => Promise<void>;
  /** Get the current ID token (refreshes if needed) */
  getIdToken: () => Promise<string | null>;
}

/**
 * Hook that manages Firebase authentication state.
 * Fetches config from /api/health and initializes Firebase.
 */
export function useFirebaseAuth(apiBase: string): UseFirebaseAuthResult {
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [authEnabled, setAuthEnabled] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [firebaseConfig, setFirebaseConfig] = useState<FirebaseClientConfig | null>(null);

  // Fetch Firebase config from health endpoint
  useEffect(() => {
    let cancelled = false;

    async function fetchConfig() {
      try {
        const response = await callContract(apiBase, Contracts.getHealth);

        if (cancelled) return;

        if (response.ok && response.auth?.enabled && response.auth.firebase) {
          setFirebaseConfig(response.auth.firebase);
          setAuthEnabled(true);
        } else {
          setAuthEnabled(false);
          setLoading(false);
        }
      } catch (err) {
        if (cancelled) return;
        console.error('Failed to fetch auth config:', err);
        setError('Failed to load authentication configuration');
        setLoading(false);
      }
    }

    fetchConfig();

    return () => {
      cancelled = true;
    };
  }, [apiBase]);

  // Initialize Firebase and set up auth state listener
  useEffect(() => {
    if (!firebaseConfig) return;

    try {
      initializeFirebaseWithConfig(firebaseConfig);
      const auth = getFirebaseAuth();

      const unsubscribe = onAuthStateChanged(auth, (user) => {
        setFirebaseUser(user);
        setLoading(false);
      });

      return () => unsubscribe();
    } catch (err) {
      console.error('Failed to initialize Firebase:', err);
      setError('Failed to initialize authentication');
      setLoading(false);
    }
  }, [firebaseConfig]);

  const signInWithEmail = useCallback(async (email: string, password: string) => {
    if (!isFirebaseInitialized()) {
      throw new Error('Firebase not initialized');
    }

    setError(null);
    try {
      const auth = getFirebaseAuth();
      await signInWithEmailAndPassword(auth, email, password);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Sign in failed';
      setError(message);
      throw err;
    }
  }, []);

  const signUpWithEmail = useCallback(async (email: string, password: string) => {
    if (!isFirebaseInitialized()) {
      throw new Error('Firebase not initialized');
    }

    setError(null);
    try {
      const auth = getFirebaseAuth();
      await createUserWithEmailAndPassword(auth, email, password);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Sign up failed';
      setError(message);
      throw err;
    }
  }, []);

  const signInWithGoogle = useCallback(async () => {
    if (!isFirebaseInitialized()) {
      throw new Error('Firebase not initialized');
    }

    setError(null);
    try {
      const auth = getFirebaseAuth();
      const provider = getGoogleProvider();
      await signInWithPopup(auth, provider);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Google sign in failed';
      setError(message);
      throw err;
    }
  }, []);

  const signOut = useCallback(async () => {
    if (!isFirebaseInitialized()) {
      return;
    }

    setError(null);
    try {
      const auth = getFirebaseAuth();
      await firebaseSignOut(auth);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Sign out failed';
      setError(message);
      throw err;
    }
  }, []);

  const getIdToken = useCallback(async (): Promise<string | null> => {
    if (!firebaseUser) {
      return null;
    }

    try {
      return await firebaseUser.getIdToken();
    } catch (err) {
      console.error('Failed to get ID token:', err);
      return null;
    }
  }, [firebaseUser]);

  return {
    firebaseUser,
    loading,
    authEnabled,
    error,
    signInWithEmail,
    signUpWithEmail,
    signInWithGoogle,
    signOut,
    getIdToken,
  };
}
