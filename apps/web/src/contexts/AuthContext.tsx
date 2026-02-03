import { createContext, useContext, useState, useEffect, useCallback, ReactNode, useMemo } from 'react';
import { Contracts, type User } from '@praapt/shared';

import { useFirebaseAuth } from '../hooks/useFirebaseAuth';
import { callContract } from '../lib/contractClient';

interface AuthContextType {
  /** Current authenticated user from database (null if not authenticated) */
  user: User | null;
  /** Whether auth state is still loading */
  loading: boolean;
  /** Whether Firebase auth is configured and available */
  authEnabled: boolean;
  /** Whether user is authenticated */
  isAuthenticated: boolean;
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

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
  apiBase: string;
}

export function AuthProvider({ children, apiBase }: AuthProviderProps) {
  const firebaseAuth = useFirebaseAuth(apiBase);
  const {
    firebaseUser,
    loading: firebaseLoading,
    authEnabled,
    error: firebaseError,
    signInWithEmail,
    signUpWithEmail,
    signInWithGoogle,
    signOut: firebaseSignOut,
    getIdToken,
  } = firebaseAuth;

  const [user, setUser] = useState<User | null>(null);
  const [fetchingUser, setFetchingUser] = useState(false);
  const [userError, setUserError] = useState<string | null>(null);

  // Fetch user from /api/me when Firebase user changes
  useEffect(() => {
    let cancelled = false;

    async function fetchUser() {
      if (!firebaseUser) {
        setUser(null);
        return;
      }

      setFetchingUser(true);
      setUserError(null);

      try {
        const token = await getIdToken();
        if (!token || cancelled) {
          setFetchingUser(false);
          return;
        }

        const response = await callContract(apiBase, Contracts.getMe, { token });

        if (cancelled) return;

        if (response.ok) {
          setUser(response.user);
        } else {
          setUserError(response.error);
          setUser(null);
        }
      } catch (err) {
        if (cancelled) return;
        console.error('Failed to fetch user:', err);
        setUserError('Failed to load user data');
        setUser(null);
      } finally {
        if (!cancelled) {
          setFetchingUser(false);
        }
      }
    }

    fetchUser();

    return () => {
      cancelled = true;
    };
  }, [apiBase, firebaseUser, getIdToken]);

  const signOut = useCallback(async () => {
    await firebaseSignOut();
    setUser(null);
  }, [firebaseSignOut]);

  const value = useMemo(
    () => ({
      user,
      loading: firebaseLoading || fetchingUser,
      authEnabled,
      isAuthenticated: !!user,
      error: firebaseError || userError,
      signInWithEmail,
      signUpWithEmail,
      signInWithGoogle,
      signOut,
      getIdToken,
    }),
    [
      user,
      firebaseLoading,
      fetchingUser,
      authEnabled,
      firebaseError,
      userError,
      signInWithEmail,
      signUpWithEmail,
      signInWithGoogle,
      signOut,
      getIdToken,
    ],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
