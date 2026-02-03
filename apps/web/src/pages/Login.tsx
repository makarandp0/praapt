import { useState, useCallback, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

import { Button } from '../components/ui/button';
import { useAuth } from '../contexts/AuthContext';

type AuthMode = 'signin' | 'signup';

/** Type for location state passed from protected routes */
interface LocationState {
  from?: { pathname: string };
}

export function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const {
    signInWithEmail,
    signUpWithEmail,
    signInWithGoogle,
    loading,
    authEnabled,
    isAuthenticated,
    error,
  } = useAuth();

  // Get the redirect destination from location state (set by ProtectedRoute/RoleProtectedRoute)
  // eslint-disable-next-line @typescript-eslint/consistent-type-assertions -- location.state is typed as unknown by react-router
  const state = location.state as LocationState | null;
  const from = state?.from?.pathname || '/';

  // Redirect if already authenticated
  useEffect(() => {
    if (!loading && isAuthenticated) {
      navigate(from, { replace: true });
    }
  }, [loading, isAuthenticated, navigate, from]);

  const [mode, setMode] = useState<AuthMode>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [localError, setLocalError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setLocalError(null);

      if (!email.trim()) {
        setLocalError('Please enter your email');
        return;
      }

      if (!password) {
        setLocalError('Please enter your password');
        return;
      }

      if (mode === 'signup') {
        if (password.length < 6) {
          setLocalError('Password must be at least 6 characters');
          return;
        }
        if (password !== confirmPassword) {
          setLocalError('Passwords do not match');
          return;
        }
      }

      setIsSubmitting(true);

      try {
        if (mode === 'signin') {
          await signInWithEmail(email, password);
        } else {
          await signUpWithEmail(email, password);
        }
        // On success, navigate to the page they were trying to access (or dashboard)
        navigate(from, { replace: true });
      } catch (err) {
        // Error is handled by the auth hook, but we can show a local message too
        const message = err instanceof Error ? err.message : 'Authentication failed';
        // Firebase error messages are often user-unfriendly, clean them up
        if (message.includes('auth/invalid-credential')) {
          setLocalError('Invalid email or password');
        } else if (message.includes('auth/email-already-in-use')) {
          setLocalError('This email is already registered. Try signing in.');
        } else if (message.includes('auth/weak-password')) {
          setLocalError('Password is too weak. Use at least 6 characters.');
        } else if (message.includes('auth/invalid-email')) {
          setLocalError('Please enter a valid email address');
        } else {
          setLocalError(message);
        }
      } finally {
        setIsSubmitting(false);
      }
    },
    [email, password, confirmPassword, mode, signInWithEmail, signUpWithEmail, navigate, from],
  );

  const handleGoogleSignIn = useCallback(async () => {
    setLocalError(null);
    setIsSubmitting(true);

    try {
      await signInWithGoogle();
      navigate(from, { replace: true });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Google sign in failed';
      if (message.includes('auth/popup-closed-by-user')) {
        setLocalError('Sign in was cancelled');
      } else {
        setLocalError(message);
      }
    } finally {
      setIsSubmitting(false);
    }
  }, [signInWithGoogle, navigate, from]);

  const toggleMode = useCallback(() => {
    setMode((prev) => (prev === 'signin' ? 'signup' : 'signin'));
    setLocalError(null);
    setConfirmPassword('');
  }, []);

  // Show loading state while checking auth
  if (loading) {
    return (
      <div className="max-w-md mx-auto space-y-6">
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading authentication...</p>
        </div>
      </div>
    );
  }

  // Show message if auth is not configured
  if (!authEnabled) {
    return (
      <div className="max-w-md mx-auto space-y-6">
        <div className="text-center py-8">
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <h3 className="text-sm font-semibold text-yellow-900">Authentication Not Configured</h3>
            <p className="text-sm text-yellow-800 mt-1">
              Firebase authentication is not set up for this application.
            </p>
          </div>
        </div>
      </div>
    );
  }

  const displayError = localError || error;

  return (
    <div className="max-w-md mx-auto space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900">
          {mode === 'signin' ? 'Sign In' : 'Create Account'}
        </h2>
        <p className="mt-2 text-sm text-gray-600">
          {mode === 'signin'
            ? 'Sign in to access your account'
            : 'Create a new account to get started'}
        </p>
      </div>

      {/* Error display */}
      {displayError && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3">
          <p className="text-sm text-red-800">{displayError}</p>
        </div>
      )}

      {/* Email/Password Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
            Email
          </label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
            placeholder="you@example.com"
            disabled={isSubmitting}
            autoComplete="email"
          />
        </div>

        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
            Password
          </label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
            placeholder={mode === 'signup' ? 'At least 6 characters' : 'Enter your password'}
            disabled={isSubmitting}
            autoComplete={mode === 'signin' ? 'current-password' : 'new-password'}
          />
        </div>

        {mode === 'signup' && (
          <div>
            <label
              htmlFor="confirmPassword"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Confirm Password
            </label>
            <input
              type="password"
              id="confirmPassword"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
              placeholder="Confirm your password"
              disabled={isSubmitting}
              autoComplete="new-password"
            />
          </div>
        )}

        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? 'Please wait...' : mode === 'signin' ? 'Sign In' : 'Create Account'}
        </Button>
      </form>

      {/* Divider */}
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-300" />
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-2 bg-white text-gray-500">Or continue with</span>
        </div>
      </div>

      {/* Google Sign In */}
      <Button
        type="button"
        variant="outline"
        className="w-full"
        onClick={handleGoogleSignIn}
        disabled={isSubmitting}
      >
        <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
          <path
            fill="currentColor"
            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
          />
          <path
            fill="currentColor"
            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
          />
          <path
            fill="currentColor"
            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
          />
          <path
            fill="currentColor"
            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
          />
        </svg>
        Sign in with Google
      </Button>

      {/* Toggle mode */}
      <p className="text-center text-sm text-gray-600">
        {mode === 'signin' ? "Don't have an account? " : 'Already have an account? '}
        <button
          type="button"
          onClick={toggleMode}
          className="text-blue-600 hover:underline font-medium"
        >
          {mode === 'signin' ? 'Sign up' : 'Sign in'}
        </button>
      </p>
    </div>
  );
}
